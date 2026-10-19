import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { type AppData, stateSchema, reviewCard } from '@flashlab/shared';
import { buildApp as createApp } from '../src/http/app.js';
import { DatabaseSync } from 'node:sqlite';

const instances = new Map<string, ReturnType<typeof createApp>[]>();
function buildApp(options: Parameters<typeof createApp>[0]) {
  const app = createApp(options);
  instances.set(options.dataFile, [
    ...(instances.get(options.dataFile) ?? []),
    app,
  ]);
  return app;
}
function queryStorage(root: string, sql: string, id: string) {
  const db = new DatabaseSync(join(root, 'flashlab.sqlite'), {
    readOnly: true,
  });
  try {
    return db.prepare(sql).get(id);
  } finally {
    db.close();
  }
}
function storedState(root: string, id: string) {
  const row = queryStorage(
    root,
    'SELECT profile_id, revision, data FROM profile_states WHERE profile_id = ?',
    id,
  );
  assert.ok(row);
  return {
    userId: row.profile_id,
    revision: row.revision,
    data: row.data === null ? null : JSON.parse(String(row.data)),
  };
}

const state: AppData = {
  version: 2,
  decks: [
    {
      id: 'deck-1',
      title: 'TypeScript',
      description: '',
      color: 'blue',
      created: 1,
      cards: [
        {
          id: 'card-1',
          front: 'Type',
          back: 'Kiểu dữ liệu',
          level: 0,
          correct: 0,
          wrong: 0,
          last: 0,
          due: 0,
          starred: false,
        },
      ],
    },
  ],
  history: {},
  sessions: [],
};

async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), 'flashlab-test-'));
  const dataFile = join(directory, 'state.json');
  const app = buildApp({ dataFile });
  t.after(async () => {
    for (const instance of instances.get(dataFile) ?? [])
      await instance.close();
    instances.delete(dataFile);
    await rm(directory, { recursive: true, force: true });
  });
  return { app, dataFile };
}

test('fresh store, save, and persistence after restart', async (t) => {
  const { app, dataFile } = await fixture(t);
  assert.equal((await app.inject('/api/health')).statusCode, 200);
  const initial = await app.inject('/api/state');
  assert.deepEqual(initial.json(), { revision: 0, data: null });
  assert.equal(initial.headers['cache-control'], 'no-store');
  const saved = await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: { revision: 0, data: state },
  });
  assert.equal(saved.statusCode, 200);
  const restarted = buildApp({ dataFile });
  t.after(() => restarted.close());
  assert.deepEqual((await restarted.inject('/api/state')).json(), {
    revision: 1,
    data: state,
  });
});

test('stale revisions cannot overwrite saved data', async (t) => {
  const { app } = await fixture(t);
  const put = (title: string) =>
    app.inject({
      method: 'PUT',
      url: '/api/state',
      payload: {
        revision: 0,
        data: { ...state, decks: [{ ...state.decks[0], title }] },
      },
    });
  assert.equal((await put('First')).statusCode, 200);
  assert.equal((await put('Stale')).statusCode, 409);
  assert.equal(
    (await app.inject('/api/state')).json().data.decks[0].title,
    'First',
  );
});

test('concurrent writes: exactly one wins; rejected writes do not block the queue', async (t) => {
  const { app } = await fixture(t);
  const payload = { revision: 0, data: state };
  const responses = await Promise.all(
    Array.from({ length: 5 }, () =>
      app.inject({ method: 'PUT', url: '/api/state', payload }),
    ),
  );
  assert.equal(
    responses.filter((response) => response.statusCode === 200).length,
    1,
  );
  assert.equal(
    responses.filter((response) => response.statusCode === 409).length,
    4,
  );
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { ...payload, revision: 1 },
      })
    ).statusCode,
    200,
  );
});

test('invalid and duplicate IDs are rejected without modifying disk', async (t) => {
  const { app } = await fixture(t);
  for (const data of [
    {},
    { ...state, decks: [state.decks[0], state.decks[0]] },
    { ...state, history: { invalid: 1 } },
  ]) {
    assert.equal(
      (
        await app.inject({
          method: 'PUT',
          url: '/api/state',
          payload: { revision: 0, data },
        })
      ).statusCode,
      400,
    );
  }
  assert.deepEqual((await app.inject('/api/state')).json(), {
    revision: 0,
    data: null,
  });
});

test('corrupt files remain intact and internal error details stay private', async (t) => {
  const { app, dataFile } = await fixture(t);
  await writeFile(dataFile, 'corrupt-data');
  const response = await app.inject('/api/state');
  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.json(), { error: 'Internal server error' });
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { revision: 0, data: state },
      })
    ).statusCode,
    500,
  );
  assert.equal(await readFile(dataFile, 'utf8'), 'corrupt-data');
});

test('cross-site writes and oversized requests are rejected', async (t) => {
  const { app } = await fixture(t);
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        headers: { 'sec-fetch-site': 'cross-site' },
        payload: { revision: 0, data: state },
      })
    ).statusCode,
    403,
  );
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { text: 'x'.repeat(20_000_001) },
      })
    ).statusCode,
    413,
  );
});

test('shared schema rejects invalid scores and duplicate cards', () => {
  assert.equal(
    stateSchema.safeParse({
      ...state,
      decks: [
        {
          ...state.decks[0],
          cards: [state.decks[0]!.cards[0], state.decks[0]!.cards[0]],
        },
      ],
    }).success,
    false,
  );
  assert.equal(
    stateSchema.safeParse({
      ...state,
      sessions: [
        {
          id: 's',
          date: 1,
          deckId: 'deck-1',
          mode: 'test',
          answers: 1,
          correct: 2,
        },
      ],
    }).success,
    false,
  );
});

test('SRS schedules 1/3/7/14/30/60 days, caps levels, and retries wrong cards after five minutes', () => {
  let card = state.decks[0]!.cards[0]!;
  const now = 1000;
  for (const [index, days] of [1, 3, 7, 14, 30, 60, 60].entries()) {
    card = {
      ...card,
      level: Math.min(index + 1, 6),
      masteryProgress: undefined,
    };
    card = reviewCard(card, true, now);
    assert.equal(card.due, now + days * 86400000);
  }
  assert.equal(card.level, 6);
  assert.equal(card.correct, 7);
  const retry = reviewCard(card, false, now);
  assert.equal(retry.level, 5);
  assert.equal(retry.due, now + 300000);
  assert.equal(retry.wrong, 1);
  assert.equal(card.level, 6);
});

test('custom HEX colors persist through the API; legacy named colors still work', async (t) => {
  const { app } = await fixture(t);
  const custom = { ...state, decks: [{ ...state.decks[0], color: '#12ABcd' }] };
  const result = await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: { revision: 0, data: custom },
  });
  assert.equal(result.statusCode, 200);
  assert.equal(result.json().data.decks[0].color, '#12abcd');
  assert.equal(stateSchema.safeParse(state).success, true);
  assert.equal(
    stateSchema.safeParse({
      ...state,
      decks: [{ ...state.decks[0], color: 'url(javascript:bad)' }],
    }).success,
    false,
  );
});

test('duplicate terms are rejected per deck with normalized case, whitespace and Unicode', async (t) => {
  const { app } = await fixture(t);
  const deck = state.decks[0]!;
  const card = deck.cards[0]!;
  for (const terms of [
    ['Type', '  TYPE  '],
    ['hai từ', 'HAI   TỪ'],
    ['café', 'cafe\u0301'],
  ]) {
    const response = await app.inject({
      method: 'PUT',
      url: '/api/state',
      payload: {
        revision: 0,
        data: {
          ...state,
          decks: [
            {
              ...deck,
              cards: [
                { ...card, front: terms[0] },
                { ...card, id: 'second', front: terms[1] },
              ],
            },
          ],
        },
      },
    });
    assert.equal(response.statusCode, 400);
  }
  const unchanged = await app.inject({ method: 'GET', url: '/api/state' });
  assert.equal(unchanged.json().revision, 0);
  const response = await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: {
      revision: 0,
      data: { ...state, decks: [deck, { ...deck, id: 'another-deck' }] },
    },
  });
  assert.equal(response.statusCode, 200);
});

test('profiles preserve legacy data and isolate state, preferences and revisions after restart', async (t) => {
  const { app, dataFile } = await fixture(t);
  await writeFile(dataFile, JSON.stringify({ revision: 7, data: state }));
  const initial = await app.inject('/api/profiles');
  assert.equal(initial.statusCode, 200);
  assert.equal(initial.json()[0].id, 'default');
  assert.deepEqual((await app.inject('/api/state')).json(), {
    revision: 7,
    data: state,
  });
  const created = await app.inject({
    method: 'POST',
    url: '/api/profiles',
    payload: { name: '  An  ' },
  });
  assert.equal(created.statusCode, 201);
  const profile = created.json();
  assert.equal(profile.name, 'An');
  const endpoint = `/api/profiles/${profile.id}/state`;
  const empty = (await app.inject(endpoint)).json();
  assert.equal(empty.data.decks.length, 0);
  const personal = {
    ...state,
    preferences: {
      theme: 'dark',
      audio: { music: false, effects: true, volume: 0.3, musicVolume: 0.8 },
    },
  };
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: endpoint,
        payload: { revision: empty.revision, data: personal },
      })
    ).statusCode,
    200,
  );
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: endpoint,
        payload: { revision: empty.revision, data: personal },
      })
    ).statusCode,
    409,
  );
  assert.deepEqual((await app.inject('/api/state')).json(), {
    revision: 7,
    data: state,
  });
  const restarted = buildApp({ dataFile });
  t.after(() => restarted.close());
  assert.equal((await restarted.inject('/api/profiles')).json().length, 2);
  assert.deepEqual((await restarted.inject(endpoint)).json().data, personal);
  assert.equal(
    (await app.inject({ method: 'DELETE', url: `/api/profiles/${profile.id}` }))
      .statusCode,
    204,
  );
  assert.equal((await app.inject(endpoint)).statusCode, 404);
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: endpoint,
        payload: { revision: 2, data: personal },
      })
    ).statusCode,
    404,
  );
  assert.deepEqual((await app.inject('/api/state')).json(), {
    revision: 7,
    data: state,
  });
  assert.equal(
    (await app.inject({ method: 'DELETE', url: '/api/profiles/default' }))
      .statusCode,
    400,
  );
});

test('profile names, preferences and cross-site mutations are validated', async (t) => {
  const { app } = await fixture(t);
  for (const name of ['', '   ', 'x'.repeat(61)])
    assert.equal(
      (
        await app.inject({
          method: 'POST',
          url: '/api/profiles',
          payload: { name },
        })
      ).statusCode,
      400,
    );
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/api/profiles',
        payload: { name: 'Café An' },
      })
    ).statusCode,
    201,
  );
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/api/profiles',
        payload: { name: '  CAFE\u0301   AN ' },
      })
    ).statusCode,
    409,
  );
  for (const method of ['POST', 'DELETE'] as const) {
    assert.equal(
      (
        await app.inject({
          method,
          url: method === 'POST' ? '/api/profiles' : '/api/profiles/default',
          headers: { 'sec-fetch-site': 'cross-site' },
          ...(method === 'POST' ? { payload: { name: 'Blocked' } } : {}),
        })
      ).statusCode,
      403,
    );
  }
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: {
          revision: 0,
          data: { ...state, preferences: { theme: 'bad' } },
        },
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (await app.inject('/api/profiles/not-a-profile/state')).statusCode,
    404,
  );
});

test('concurrent creation cannot introduce duplicate profiles; deletion cannot resurrect data', async (t) => {
  const { app } = await fixture(t);
  const created = await Promise.all(
    [1, 2].map(() =>
      app.inject({
        method: 'POST',
        url: '/api/profiles',
        payload: { name: 'An' },
      }),
    ),
  );
  assert.deepEqual(created.map((r) => r.statusCode).sort(), [201, 409]);
  const profile = created.find((r) => r.statusCode === 201)!.json();
  await Promise.all([
    app.inject({ method: 'DELETE', url: `/api/profiles/${profile.id}` }),
    app.inject({
      method: 'PUT',
      url: `/api/profiles/${profile.id}/state`,
      payload: { revision: 1, data: state },
    }),
  ]);
  assert.equal(
    (await app.inject(`/api/profiles/${profile.id}/state`)).statusCode,
    404,
  );
  assert.equal((await app.inject('/api/profiles')).json().length, 1);
});

test('configured SQLite storage migrates legacy users without deleting originals', async (t) => {
  const { dataFile } = await fixture(t);
  const { dirname } = await import('node:path');
  const { mkdir } = await import('node:fs/promises');
  const storageDir = join(dirname(dataFile), 'custom-storage-drive');
  const id = '11111111-1111-4111-8111-111111111111';
  const legacy = { revision: 4, data: state };
  await writeFile(dataFile, JSON.stringify(legacy));
  await mkdir(`${dataFile}.profiles`);
  await writeFile(
    `${dataFile}.profiles/${id}.json`,
    JSON.stringify({ revision: 3, data: { ...state, decks: [] } }),
  );
  await writeFile(
    `${dataFile}.profiles.json`,
    JSON.stringify([
      { id: 'default', name: 'Mặc định', created: 1 },
      { id, name: 'An', created: 2 },
    ]),
  );
  const app = buildApp({ dataFile, storageDir });
  t.after(() => app.close());
  assert.equal((await app.inject('/api/profiles')).json().length, 2);
  assert.equal((await app.inject('/api/storage')).json().directory, storageDir);
  const disk = storedState(storageDir, 'default');
  assert.equal(disk.userId, 'default');
  assert.deepEqual(disk.data, state);
  assert.equal(disk.revision, 4);
  assert.equal(
    queryStorage(storageDir, 'SELECT id FROM profiles WHERE id = ?', id)?.id,
    id,
  );
  assert.equal(storedState(storageDir, id).revision, 3);
  assert.deepEqual(JSON.parse(await readFile(dataFile, 'utf8')), legacy);
  const created = await app.inject({
    method: 'POST',
    url: '/api/profiles',
    payload: { name: 'Bình' },
  });
  assert.equal(created.statusCode, 201);
  const newId = created.json().id;
  assert.notEqual(newId, id);
  assert.equal(storedState(storageDir, newId).userId, newId);
  const restarted = buildApp({ dataFile, storageDir });
  t.after(() => restarted.close());
  assert.deepEqual((await restarted.inject('/api/state')).json(), legacy);
});

test('disk restore requires confirmation, checks IDs/revisions and preserves other users', async (t) => {
  const { app, dataFile } = await fixture(t);
  const { dirname } = await import('node:path');
  const storageDir = join(dirname(dataFile), 'storage');
  const created = (
    await app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'An' },
    })
  ).json();
  const endpoint = `/api/profiles/${created.id}/import`;
  const backup = { ...state, userId: created.id, userName: 'An' };
  const initial = storedState(storageDir, created.id);
  for (const confirmed of [false, undefined]) {
    assert.equal(
      (
        await app.inject({
          method: 'POST',
          url: endpoint,
          payload: { confirmed, revision: 1, backup },
        })
      ).statusCode,
      400,
    );
  }
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: endpoint,
        payload: {
          confirmed: true,
          revision: 1,
          backup: { ...backup, userId: 'default' },
        },
      })
    ).statusCode,
    400,
  );
  assert.deepEqual(storedState(storageDir, created.id), initial);
  const beforeDefault = (await app.inject('/api/state')).json();
  const saved = await app.inject({
    method: 'POST',
    url: endpoint,
    payload: { confirmed: true, revision: 1, backup },
  });
  assert.equal(saved.statusCode, 200);
  const disk = storedState(storageDir, created.id);
  assert.equal(disk.userId, created.id);
  assert.deepEqual(disk.data, state);
  assert.equal(disk.revision, 2);
  assert.deepEqual((await app.inject('/api/state')).json(), beforeDefault);
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: endpoint,
        payload: { confirmed: true, revision: 1, backup },
      })
    ).statusCode,
    409,
  );
  const id = '22222222-2222-4222-8222-222222222222';
  const restored = await app.inject({
    method: 'POST',
    url: `/api/profiles/${id}/import`,
    payload: {
      confirmed: true,
      revision: null,
      backup: { ...state, userId: id, userName: 'Bình' },
    },
  });
  assert.equal(restored.statusCode, 200);
  assert.equal(restored.json().profile.id, id);
  assert.equal(
    queryStorage(storageDir, 'SELECT name FROM profiles WHERE id = ?', id)
      ?.name,
    'Bình',
  );
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: `/api/profiles/${id}/import`,
        payload: {
          confirmed: true,
          revision: null,
          backup: { ...state, userId: id, userName: 'Bình' },
        },
      })
    ).statusCode,
    409,
  );
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: `/api/profiles/${id}/import`,
        payload: {
          confirmed: true,
          revision: 1,
          backup: { ...state, userId: '../../outside', userName: 'Bình' },
        },
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (await app.inject({ method: 'DELETE', url: `/api/profiles/${id}` }))
      .statusCode,
    204,
  );
  await assert.rejects(readFile(join(storageDir, id, 'state.json')), {
    code: 'ENOENT',
  });
  assert.equal(
    queryStorage(
      storageDir,
      'SELECT profile_id FROM profile_states WHERE profile_id = ?',
      id,
    ),
    undefined,
  );
});

test('moving default storage to another disk copies current progress instead of stale legacy data', async (t) => {
  const { app, dataFile } = await fixture(t);
  const { dirname } = await import('node:path');
  await writeFile(
    dataFile,
    JSON.stringify({ revision: 1, data: { ...state, decks: [] } }),
  );
  await app.inject('/api/profiles');
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { revision: 1, data: state },
      })
    ).statusCode,
    200,
  );
  const storageDir = join(dirname(dataFile), 'mounted-disk');
  const moved = buildApp({ dataFile, storageDir });
  t.after(() => moved.close());
  assert.deepEqual((await moved.inject('/api/state')).json(), {
    revision: 2,
    data: state,
  });
  assert.equal(
    storedState(join(dirname(dataFile), 'storage'), 'default').revision,
    2,
  );
});

test('UUID case cannot create duplicate IDs or distinct user folders', async (t) => {
  const { app } = await fixture(t);
  const upper = 'AAAAAAAA-AAAA-4AAA-8AAA-AAAAAAAAAAAA';
  const backup = { ...state, userId: upper, userName: 'Canonical' };
  const created = await app.inject({
    method: 'POST',
    url: `/api/profiles/${upper}/import`,
    payload: { confirmed: true, revision: null, backup },
  });
  assert.equal(created.statusCode, 200);
  assert.equal(created.json().profile.id, upper.toLowerCase());
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: `/api/profiles/${upper.toLowerCase()}/import`,
        payload: { confirmed: true, revision: null, backup },
      })
    ).statusCode,
    409,
  );
  assert.equal((await app.inject('/api/profiles')).json().length, 2);
});

test('CSV exports reflect SQLite edits, deletion and restores without writing mirrors on each save', async (t) => {
  const { unzipSync, strFromU8 } = await import('fflate');
  const { app, dataFile } = await fixture(t);
  const data = structuredClone(state);
  data.decks[0].id = '../../outside';
  data.decks[0].cards[0].front = 'Thuật ngữ, "trích dẫn"';
  data.decks[0].cards[0].back = 'Dòng một\nDòng hai';
  const save = (revision: number, value: AppData) =>
    app.inject({
      method: 'PUT',
      url: '/api/state',
      payload: { revision, data: value },
    });
  const archive = async (source = app) => {
    const response = await source.inject('/api/profiles/default/export');
    assert.equal(response.statusCode, 200);
    return unzipSync(response.rawPayload);
  };
  assert.equal((await save(0, data)).statusCode, 200);
  let files = await archive();
  const index = JSON.parse(strFromU8(files['default/materials/index.json']));
  assert.equal(index.userId, 'default');
  assert.equal(index.decks[0].title, 'TypeScript');
  assert.equal(index.decks[0].file, 'deck-1.csv');
  assert.deepEqual(
    [...files['default/materials/deck-1.csv'].subarray(0, 3)],
    [239, 187, 191],
  );
  assert.equal(
    strFromU8(files['default/materials/deck-1.csv']),
    'front,definition,pronunciation,notes,image\r\n"Thuật ngữ, ""trích dẫn""","Dòng một\nDòng hai","","",""\r\n',
  );
  assert.equal(
    Object.keys(files).some((key) => key.includes('../')),
    false,
  );
  data.decks[0].cards[0].back = 'Đã sửa';
  assert.equal((await save(1, data)).statusCode, 200);
  assert.match(
    strFromU8((await archive())['default/materials/deck-1.csv']),
    /Đã sửa/,
  );
  assert.equal((await save(2, { ...data, decks: [] })).statusCode, 200);
  files = await archive();
  assert.equal(files['default/materials/deck-1.csv'], undefined);
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/api/profiles/default/import',
        payload: {
          confirmed: true,
          revision: 3,
          backup: { ...data, userId: 'default', userName: 'Mặc định' },
        },
      })
    ).statusCode,
    200,
  );
  const restarted = buildApp({ dataFile });
  assert.match(
    strFromU8((await archive(restarted))['default/materials/deck-1.csv']),
    /Đã sửa/,
  );
  assert.equal((await restarted.inject('/api/state')).json().revision, 4);
  await assert.rejects(
    readFile(join(dataFile, '..', 'storage', 'default', 'state.json')),
    { code: 'ENOENT' },
  );
});
test('user ZIP contains portable folder, CSV and remembered/starred progress and can restore', async (t) => {
  const { unzipSync, strFromU8 } = await import('fflate');
  const { app } = await fixture(t);
  const data = structuredClone(state);
  data.decks[0].cards[0].remembered = true;
  data.decks[0].cards[0].starred = true;
  await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: { revision: 0, data },
  });
  const response = await app.inject('/api/profiles/default/export');
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'application/zip');
  const files = unzipSync(response.rawPayload);
  const profile = JSON.parse(strFromU8(files['default/user.json']));
  const snapshot = JSON.parse(strFromU8(files['default/state.json']));
  assert.deepEqual(snapshot.data, data);
  assert.match(
    strFromU8(files['default/materials/deck-1.csv']),
    /Type.*Kiểu dữ liệu/,
  );
  const restored = await app.inject({
    method: 'POST',
    url: '/api/profiles/default/import',
    payload: {
      confirmed: true,
      revision: 1,
      backup: { ...snapshot.data, userId: profile.id, userName: profile.name },
    },
  });
  assert.equal(restored.statusCode, 200);
  assert.equal(
    restored.json().snapshot.data.decks[0].cards[0].remembered,
    true,
  );
  const missing = await app.inject(
    '/api/profiles/11111111-1111-4111-8111-111111111111/export',
  );
  assert.equal(missing.statusCode, 404);
});

test('master and eight sound mixer preferences persist without changing legacy defaults', async (t) => {
  const { app } = await fixture(t);
  const { soundNames, preferencesSchema } = await import('@flashlab/shared');
  const data = structuredClone(state);
  data.preferences = preferencesSchema.parse({
    audio: {
      masterVolume: 0.5,
      muted: true,
      sounds: Object.fromEntries(
        soundNames.map((name, index) => [
          name,
          { volume: index / 10, muted: index === 2 },
        ]),
      ),
    },
  });
  const saved = await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: { revision: 0, data },
  });
  assert.equal(saved.statusCode, 200);
  assert.deepEqual(
    (await app.inject('/api/state')).json().data.preferences.audio,
    data.preferences.audio,
  );
  assert.equal(preferencesSchema.parse({}).audio.musicVolume, 1);
  assert.equal(
    preferencesSchema.safeParse({
      audio: { sounds: { correct: { volume: 2, muted: false } } },
    }).success,
    false,
  );
});

test('language, per-mode orders, test types and matching count persist per user', async (t) => {
  const { app, dataFile } = await fixture(t);
  const data = structuredClone(state);
  const { preferencesSchema } = await import('@flashlab/shared');
  data.preferences = preferencesSchema.parse({
    language: 'en',
    study: {
      orders: { flashcards: 'ordered', learn: 'random', test: 'ordered' },
      testType: 'mixed',
      testCount: 16,
      matchPairs: 8,
    },
  });
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { revision: 0, data },
      })
    ).statusCode,
    200,
  );
  assert.deepEqual(
    (await app.inject('/api/state')).json().data.preferences,
    data.preferences,
  );
  assert.equal(
    preferencesSchema.safeParse({ study: { matchPairs: 100001 } }).success,
    false,
  );
  assert.equal(
    preferencesSchema.safeParse({ study: { testType: 'unknown' } }).success,
    false,
  );
  assert.equal(preferencesSchema.safeParse({ language: 'fr' }).success, false);
  let revision = 1;
  for (const language of ['vi', 'en', 'ko', 'zh', 'ja'] as const) {
    data.preferences!.language = language;
    const saved = await app.inject({
      method: 'PUT',
      url: '/api/state',
      payload: { revision, data },
    });
    assert.equal(saved.statusCode, 200, language);
    revision = saved.json().revision;
    assert.equal(
      (await app.inject('/api/state')).json().data.preferences.language,
      language,
    );
  }
  await app.close();
  const reopened = buildApp({ dataFile });
  assert.equal(
    (await reopened.inject('/api/state')).json().data.preferences.language,
    'ja',
  );
});

test('classes persist in user snapshots and ZIP; dangling or duplicate memberships are rejected', async (t) => {
  const { app } = await fixture(t);
  const { unzipSync, strFromU8 } = await import('fflate');
  const data = structuredClone(state);
  data.classes = [
    {
      id: 'class-1',
      name: 'Lớp tiếng Anh',
      description: '',
      deckIds: ['deck-1'],
    },
  ];
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { revision: 0, data },
      })
    ).statusCode,
    200,
  );
  assert.deepEqual(
    (await app.inject('/api/state')).json().data.classes,
    data.classes,
  );
  const archive = unzipSync(
    (await app.inject('/api/profiles/default/export')).rawPayload,
  );
  assert.deepEqual(
    JSON.parse(strFromU8(archive['default/state.json'])).data.classes,
    data.classes,
  );
  for (const deckIds of [['missing-deck'], ['deck-1', 'deck-1']]) {
    const invalid = structuredClone(data);
    invalid.classes![0].deckIds = deckIds;
    assert.equal(
      (
        await app.inject({
          method: 'PUT',
          url: '/api/state',
          payload: { revision: 1, data: invalid },
        })
      ).statusCode,
      400,
    );
  }
});

test('restoring a new profile preserves the original creation date for the annual activity calendar', async (t) => {
  const { app } = await fixture(t);
  const userId = '55555555-5555-4555-8555-555555555555';
  const userCreated = new Date(2025, 0, 3).getTime();
  const result = await app.inject({
    method: 'POST',
    url: `/api/profiles/${userId}/import`,
    payload: {
      confirmed: true,
      revision: null,
      backup: { ...state, userId, userName: 'Restored user', userCreated },
    },
  });
  assert.equal(result.statusCode, 200);
  assert.equal(result.json().profile.created, userCreated);
});

test('session answer snapshots persist after restart even when their deck is removed', async (t) => {
  const { app, dataFile } = await fixture(t);
  const data = structuredClone(state);
  data.decks = [];
  data.sessions = [
    {
      id: 'saved-test',
      date: 100,
      deckId: 'deck-1',
      deckTitle: 'Original title',
      mode: 'test',
      answers: 2,
      correct: 1,
      durationSeconds: 42,
      completed: true,
      results: [
        {
          front: 'Type',
          correctAnswer: 'Kiểu dữ liệu',
          userAnswer: 'Kiểu dữ liệu',
          ok: true,
        },
        {
          front: 'Interface',
          correctAnswer: 'Giao diện',
          userAnswer: 'wrong',
          ok: false,
        },
      ],
    },
  ];
  const saved = await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: { revision: 0, data },
  });
  assert.equal(saved.statusCode, 200);
  const restarted = buildApp({ dataFile });
  t.after(() => restarted.close());
  assert.deepEqual(
    (await restarted.inject('/api/state')).json().data.sessions,
    data.sessions,
  );
});

test('blog is shared, persists Markdown, and rejects stale edits', async (t) => {
  const { app, dataFile } = await fixture(t);
  const body = {
    title: 'Bài học',
    markdown: '# Hello\n**world**',
    author: 'An',
  };
  const created = await app.inject({
    method: 'POST',
    url: '/api/blog',
    headers: { 'x-flashlab-profile': 'default' },
    payload: body,
  });
  assert.equal(created.statusCode, 201);
  const article = created.json();
  const profile = await app.inject({
    method: 'POST',
    url: '/api/profiles',
    payload: { name: 'Other' },
  });
  assert.equal(profile.statusCode, 201);
  assert.equal(article.ownerId, 'default');
  assert.equal(
    article.author,
    body.author,
    'display author is editable independently of ownership',
  );
  for (const method of ['PUT', 'DELETE'] as const) {
    const forbidden = await app.inject({
      method,
      url: `/api/blog/${article.id}`,
      headers: { 'x-flashlab-profile': profile.json().id },
      payload: { ...body, ownerId: 'default', revision: article.revision },
    });
    assert.equal(forbidden.statusCode, 403);
  }
  assert.equal(
    (await app.inject({ method: 'POST', url: '/api/blog', payload: body }))
      .statusCode,
    401,
  );

  assert.equal((await app.inject('/api/blog')).json()[0].id, article.id);
  assert.equal(
    JSON.parse(
      String(
        queryStorage(
          join(dataFile, '..', 'storage'),
          'SELECT document FROM articles WHERE id = ?',
          article.id,
        )?.document,
      ),
    ).markdown,
    body.markdown,
  );
  const edited = await app.inject({
    method: 'PUT',
    url: `/api/blog/${article.id}`,
    headers: { 'x-flashlab-profile': 'default' },
    payload: {
      ...body,
      author: 'New display author',
      markdown: 'Updated',
      revision: article.revision,
    },
  });
  assert.equal(edited.statusCode, 200);
  assert.equal(edited.json().author, 'New display author');
  assert.equal(edited.json().ownerId, 'default');
  const stale = await app.inject({
    method: 'PUT',
    url: `/api/blog/${article.id}`,
    headers: { 'x-flashlab-profile': 'default' },
    payload: { ...body, revision: article.revision },
  });
  assert.equal(stale.statusCode, 409);
  const restart = buildApp({ dataFile });
  t.after(() => restart.close());
  assert.equal(
    (await restart.inject('/api/blog')).json()[0].markdown,
    'Updated',
  );
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/api/blog',
        payload: { ...body, markdown: '' },
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (
      await app.inject({
        method: 'POST',
        url: '/api/blog',
        headers: { 'sec-fetch-site': 'cross-site' },
        payload: body,
      })
    ).statusCode,
    403,
  );
  const staleDelete = await app.inject({
    method: 'DELETE',
    url: `/api/blog/${article.id}`,
    headers: { 'x-flashlab-profile': 'default' },
    payload: { revision: 1 },
  });
  assert.equal(staleDelete.statusCode, 409);
  const deleted = await app.inject({
    method: 'DELETE',
    url: `/api/blog/${article.id}`,
    headers: { 'x-flashlab-profile': 'default' },
    payload: { revision: edited.json().revision },
  });
  assert.equal(deleted.statusCode, 204);
  assert.equal((await app.inject('/api/blog')).json().length, 0);
  await assert.rejects(
    readFile(
      join(dataFile, '..', 'storage', 'blog', `${article.id}.md`),
      'utf8',
    ),
    { code: 'ENOENT' },
  );
});

test('SRS configuration and paused cards persist per profile and reject invalid intervals', async (t) => {
  const { app, dataFile } = await fixture(t);
  const configured = structuredClone(state);
  configured.preferences = {
    theme: 'system',
    audio: { music: true, effects: true, volume: 0.6, musicVolume: 1 },
    srs: { intervals: [2, 4, 8, 16, 32, 64], retryMinutes: 10 },
  };
  configured.decks[0].cards[0].suspended = true;
  const saved = await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: { revision: 0, data: configured },
  });
  assert.equal(saved.statusCode, 200);
  const profile = (
    await app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'Independent' },
    })
  ).json();
  assert.equal(
    (await app.inject(`/api/profiles/${profile.id}/state`)).json().data
      .preferences?.srs,
    undefined,
  );
  const invalid = structuredClone(configured);
  invalid.preferences!.srs!.intervals = [1, 1, 3, 4, 5, 6];
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { revision: 1, data: invalid },
      })
    ).statusCode,
    400,
  );
  const restarted = buildApp({ dataFile });
  t.after(() => restarted.close());
  const restored = (await restarted.inject('/api/state')).json().data;
  assert.deepEqual(restored.preferences.srs, configured.preferences.srs);
  assert.equal(restored.decks[0].cards[0].suspended, true);
});

test('shared blog images persist with correct MIME and reject invalid uploads', async (t) => {
  const { app, dataFile } = await fixture(t);
  await app.inject('/api/profiles');
  const data =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aDRsAAAAASUVORK5CYII=';
  const upload = (payload: { data: string }, authenticated = true) =>
    app.inject({
      method: 'POST',
      url: '/api/blog-images',
      headers: authenticated ? { 'X-FlashLab-Profile': 'default' } : {},
      payload,
    });
  assert.equal((await upload({ data }, false)).statusCode, 401);
  const created = await upload({ data });
  assert.equal(created.statusCode, 201);
  const url = created.json().url;
  const response = await app.inject(url);
  assert.equal(response.statusCode, 200);
  assert.equal(response.headers['content-type'], 'image/png');
  assert.deepEqual(
    response.rawPayload,
    Buffer.from(data.split(',')[1], 'base64'),
  );
  const restarted = buildApp({ dataFile });
  t.after(() => restarted.close());
  assert.equal((await restarted.inject(url)).statusCode, 200);
  assert.equal(
    (await upload({ data: 'data:image/png;base64,PHNjcmlwdD4=' })).statusCode,
    400,
  );
  assert.equal(
    (await upload({ data: 'data:image/svg+xml;base64,PHN2Zz4=' })).statusCode,
    400,
  );
  const large = Buffer.alloc(2_000_001);
  Buffer.from(data.split(',')[1], 'base64').copy(large);
  assert.equal(
    (
      await upload({
        data: 'data:image/png;base64,' + large.toString('base64'),
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (await app.inject('/api/blog-images/unknown.png')).statusCode,
    404,
  );
});

test('personal notes persist in profile state and ZIP without appearing in shared posts', async (t) => {
  const { app } = await fixture(t);
  const { unzipSync, strFromU8 } = await import('fflate');
  const note = {
    id: '11111111-1111-4111-8111-111111111111',
    ownerId: 'default',
    author: 'An',
    title: 'Private note',
    markdown: '# Personal\n```c++\nint main() {}\n```',
    revision: 1,
    created: 1,
    updated: 1,
  };
  const data = { ...state, notes: [note] };
  const saved = await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: { revision: 0, data },
  });
  assert.equal(saved.statusCode, 200);
  assert.deepEqual((await app.inject('/api/state')).json().data.notes, [note]);
  assert.deepEqual((await app.inject('/api/blog')).json(), []);
  const archive = unzipSync(
    (await app.inject('/api/profiles/default/export')).rawPayload,
  );
  assert.deepEqual(
    JSON.parse(strFromU8(archive['default/state.json'])).data.notes,
    [note],
  );
  const restored = await app.inject({
    method: 'POST',
    url: '/api/profiles/default/import',
    payload: {
      confirmed: true,
      revision: 1,
      backup: { ...data, userId: 'default', userName: 'Restored' },
    },
  });
  assert.equal(restored.statusCode, 200);
  assert.deepEqual((await app.inject('/api/state')).json().data.notes, [note]);
  const created = (
    await app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'Other user' },
    })
  ).json();
  assert.equal(
    (await app.inject(`/api/profiles/${created.id}/state`)).json().data?.notes
      ?.length ?? 0,
    0,
  );
});

test('multiple meanings persist on one card and invalid additions do not overwrite the saved state', async (t) => {
  const { app } = await fixture(t);
  const data = structuredClone(state);
  data.decks[0].cards[0].definitions = [
    'Một kiểu dữ liệu khác',
    { meaning: 'An alternate meaning', partOfSpeech: 'Verb' },
  ];
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { revision: 0, data },
      })
    ).statusCode,
    200,
  );
  const stored = (await app.inject('/api/state')).json().data;
  assert.equal(stored.decks[0].cards.length, 1);
  assert.deepEqual(
    stored.decks[0].cards[0].definitions,
    data.decks[0].cards[0].definitions,
  );
  const invalid = structuredClone(data);
  invalid.decks[0].cards[0].definitions = Array.from(
    { length: 20 },
    (_, i) => `Meaning ${i}`,
  );
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/state',
        payload: { revision: 1, data: invalid },
      })
    ).statusCode,
    400,
  );
  assert.deepEqual((await app.inject('/api/state')).json().data, stored);
});

test('rename keeps profile ID, learning revision and backups, rejects duplicate names and persists after restart', async (t) => {
  const { app, dataFile } = await fixture(t);
  await app.inject('/api/profiles');
  const initial = (await app.inject('/api/profiles/default/state')).json();
  await app.inject({
    method: 'PUT',
    url: '/api/profiles/default/state',
    payload: { revision: initial.revision, data: state },
  });
  const before = (await app.inject('/api/profiles/default/state')).json();
  const rename = await app.inject({
    method: 'PUT',
    url: '/api/profiles/default',
    payload: { name: '  Bình  ' },
  });
  assert.equal(rename.statusCode, 200);
  assert.equal(rename.json().id, 'default');
  assert.equal(rename.json().name, 'Bình');
  assert.deepEqual(
    (await app.inject('/api/profiles/default/state')).json(),
    before,
  );
  const storage = (await app.inject('/api/storage')).json().directory;
  assert.equal(
    queryStorage(storage, 'SELECT name FROM profiles WHERE id = ?', 'default')
      ?.name,
    'Bình',
  );
  const other = (
    await app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'An' },
    })
  ).json();
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: `/api/profiles/${other.id}`,
        payload: { name: 'BÌNH' },
      })
    ).statusCode,
    409,
  );
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/profiles/default',
        payload: { name: ' ' },
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (
      await app.inject({
        method: 'PUT',
        url: '/api/profiles/default',
        headers: { 'sec-fetch-site': 'cross-site' },
        payload: { name: 'Elsewhere' },
      })
    ).statusCode,
    403,
  );
  const restarted = buildApp({ dataFile });
  t.after(() => restarted.close());
  assert.equal(
    (await restarted.inject('/api/profiles'))
      .json()
      .find((profile: { id: string }) => profile.id === 'default').name,
    'Bình',
  );
  const { unzipSync, strFromU8 } = await import('fflate');
  const archive = await restarted.inject('/api/profiles/default/export');
  assert.equal(
    JSON.parse(strFromU8(unzipSync(archive.rawPayload)['default/user.json']!))
      .name,
    'Bình',
  );
});
