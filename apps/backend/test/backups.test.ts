import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { stateSchema } from '@flashlab/shared';
import { buildApp } from '../src/http/app.js';
import { BACKUP_TYPE } from '../src/storage/backups.js';

const png = Buffer.from('iVBORw0KGgo=', 'base64');
const body = stateSchema.parse({
  version: 2,
  preferences: {
    theme: 'dark',
    language: 'ja',
    avatar: 'owl',
    tileSize: 'large',
    speechRate: 0.8,
    srs: { intervals: [2, 4, 8, 16, 32, 64], retryMinutes: 8 },
    study: {
      timeLimits: {
        flashcards: 0,
        learn: 3661,
        write: 65,
        test: 90,
        match: 120,
        review: 359999,
      },
      orders: { test: 'random' },
      testType: 'mixed',
      testMultipleChoice: true,
      testMultipleWrite: true,
      testCount: 12,
      matchPairs: 8,
    },
    audio: {
      masterVolume: 0.3,
      muted: true,
      music: false,
      effects: true,
      volume: 0.4,
      musicVolume: 0.2,
      sounds: { correct: { volume: 0.7, muted: false } },
    },
  },
  decks: [
    {
      id: 'deck',
      title: '日本語',
      description: 'Đầy đủ thông tin',
      color: '#abcdef',
      created: 1,
      lastOpened: 2,
      cards: [
        {
          id: 'card',
          front: '銀行',
          back: 'ngân hàng',
          definitions: [{ meaning: 'bank', partOfSpeech: 'Noun' }],
          partOfSpeech: 'Noun',
          pronunciation: 'ぎんこう',
          speechLanguage: 'ja-JP',
          notes: 'Ghi chú thẻ',
          image: 'data:image/png;base64,iVBORw0KGgo=',
          level: 3,
          correct: 18,
          wrong: 2,
          last: 10,
          due: 30,
          starred: true,
          remembered: true,
          suspended: true,
          masteryProgress: {
            correct: 4,
            modes: ['learn', 'write', 'test'],
            testCorrect: 1,
            modeCorrect: { learn: 1, write: 2, test: 1 },
          },
        },
      ],
    },
  ],
  classes: [
    {
      id: 'class',
      name: 'Lớp học',
      description: 'Nhóm riêng',
      color: 'mint',
      deckIds: ['deck'],
    },
  ],
  history: { '2026-10-18': 20 },
  sessions: [
    {
      id: 'session',
      deckId: 'deleted-deck',
      deckTitle: 'Tên học phần cũ',
      mode: 'test',
      date: 3,
      durationSeconds: 45,
      completed: true,
      timeLimitSeconds: 90,
      timedOut: false,
      answers: 2,
      correct: 1,
      results: [
        {
          front: 'từ đã xóa',
          correctAnswer: 'đáp án',
          userAnswer: 'đáp án của tôi',
          ok: false,
          assessed: true,
        },
      ],
    },
  ],
  notes: [
    {
      id: '11111111-1111-4111-8111-111111111111',
      ownerId: 'default',
      author: 'Tác giả riêng',
      title: 'Ghi chú riêng',
      markdown: '## Nội dung',
      revision: 2,
      created: 1,
      updated: 4,
    },
  ],
});
async function fixture(t: TestContext) {
  const root = await mkdtemp(join(tmpdir(), 'flashlab-db-backup-test-'));
  const instances: ReturnType<typeof buildApp>[] = [];
  const open = (name: string) => {
    const storageDir = join(root, name);
    const app = buildApp({
      dataFile: join(root, `${name}-legacy.json`),
      storageDir,
    });
    instances.push(app);
    return { app, storageDir };
  };
  t.after(async () => {
    for (const app of instances) await app.close();
    await rm(root, { recursive: true, force: true });
  });
  return { root, open };
}
async function upload(
  app: ReturnType<typeof buildApp>,
  path: string,
  bytes: Buffer,
  headers = {},
) {
  return app.inject({
    method: 'POST',
    url: path,
    headers: { 'content-type': BACKUP_TYPE, ...headers },
    payload: bytes,
  });
}
async function restore(app: ReturnType<typeof buildApp>, bytes: Buffer) {
  const preview = await upload(app, '/api/backups/inspect', bytes);
  assert.equal(preview.statusCode, 200, preview.body);
  const { expectedRevision, hash } = preview.json();
  return upload(app, '/api/backups/restore', bytes, {
    'x-flashlab-confirm': 'restore',
    'x-flashlab-revision': String(expectedRevision),
    'x-flashlab-backup-hash': hash,
  });
}
async function populate(app: ReturnType<typeof buildApp>) {
  const image = await app.inject({
    method: 'POST',
    url: '/api/blog-images',
    headers: { 'x-flashlab-profile': 'default' },
    payload: { data: 'data:image/png;base64,iVBORw0KGgo=' },
  });
  assert.equal(image.statusCode, 201, image.body);
  const url = image.json().url;
  const data = structuredClone(body);
  data.notes![0]!.markdown += `\n![ảnh](${url})`;
  const saved = await app.inject({
    method: 'PUT',
    url: '/api/state',
    payload: { revision: 0, data },
  });
  assert.equal(saved.statusCode, 200, saved.body);
  const post = await app.inject({
    method: 'POST',
    url: '/api/blog',
    headers: { 'x-flashlab-profile': 'default' },
    payload: {
      title: 'Bài viết chung',
      author: 'Tác giả bài viết',
      markdown: `![ảnh](${url})`,
    },
  });
  assert.equal(post.statusCode, 201, post.body);
  return { data, url, post: post.json() };
}

test('full SQLite backup restores every study field, profile metadata, shared articles and binary images after restart', async (t) => {
  const { open } = await fixture(t);
  const source = open('source');
  const content = await populate(source.app);
  const second = (
    await source.app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'Người thứ hai' },
    })
  ).json();
  const originalProfiles = (await source.app.inject('/api/profiles')).json();
  const secondState = (
    await source.app.inject(`/api/profiles/${second.id}/state`)
  ).json();
  const exported = await source.app.inject('/api/backups/database');
  assert.equal(exported.statusCode, 200, exported.body);
  assert.equal(
    exported.rawPayload.subarray(0, 16).toString(),
    'SQLite format 3\0',
  );
  const target = open('target');
  const result = await restore(target.app, exported.rawPayload);
  assert.equal(result.statusCode, 200, result.body);
  assert.deepEqual(
    (await target.app.inject('/api/profiles')).json(),
    originalProfiles,
  );
  assert.deepEqual(
    (await target.app.inject('/api/state')).json().data,
    content.data,
  );
  assert.deepEqual(
    (await target.app.inject(`/api/profiles/${second.id}/state`)).json().data,
    secondState.data,
  );
  const post = (await target.app.inject('/api/blog')).json()[0];
  assert.deepEqual({ ...post, revision: content.post.revision }, content.post);
  assert.deepEqual((await target.app.inject(content.url)).rawPayload, png);
  const recovery = await readFile(
    join(target.storageDir, result.json().recoveryFile),
  );
  assert.equal(
    (await upload(target.app, '/api/backups/inspect', recovery)).statusCode,
    200,
  );
  await target.app.close();
  const restarted = open('target');
  assert.deepEqual(
    (await restarted.app.inject('/api/state')).json().data,
    content.data,
  );
  assert.deepEqual((await restarted.app.inject(content.url)).rawPayload, png);
});

test('profile database contains only that profile, its articles and referenced images; other profiles survive import', async (t) => {
  const { root, open } = await fixture(t);
  const source = open('source');
  const content = await populate(source.app);
  const other = (
    await source.app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'Private user' },
    })
  ).json();
  const extra = await source.app.inject({
    method: 'POST',
    url: '/api/blog-images',
    headers: { 'x-flashlab-profile': other.id },
    payload: { data: 'data:image/png;base64,iVBORw0KGgo=' },
  });
  await source.app.inject({
    method: 'POST',
    url: '/api/blog',
    headers: { 'x-flashlab-profile': other.id },
    payload: { title: 'Other post', markdown: `private-post-${other.id}` },
  });
  const exported = await source.app.inject('/api/profiles/default/database');
  assert.equal(exported.statusCode, 200, exported.body);
  const path = join(root, 'profile.sqlite');
  await writeFile(path, exported.rawPayload);
  const copy = new DatabaseSync(path, { readOnly: true });
  assert.equal(
    copy.prepare('SELECT count(*) count FROM profiles').get()!.count,
    1,
  );
  assert.equal(
    copy.prepare('SELECT count(*) count FROM articles').get()!.count,
    1,
  );
  assert.equal(
    copy.prepare('SELECT count(*) count FROM images').get()!.count,
    1,
  );
  copy.close();
  assert.equal(
    exported.rawPayload.includes(Buffer.from(`private-post-${other.id}`)),
    false,
    'deleted pages do not leak other profiles',
  );
  const target = open('target');
  const kept = (
    await target.app.inject({
      method: 'POST',
      url: '/api/profiles',
      payload: { name: 'Keep me' },
    })
  ).json();
  const before = (
    await target.app.inject(`/api/profiles/${kept.id}/state`)
  ).json();
  const result = await restore(target.app, exported.rawPayload);
  assert.equal(result.statusCode, 200, result.body);
  assert.deepEqual(
    (await target.app.inject(`/api/profiles/${kept.id}/state`)).json(),
    before,
  );
  assert.deepEqual(
    (await target.app.inject('/api/state')).json().data,
    content.data,
  );
  assert.deepEqual((await target.app.inject(content.url)).rawPayload, png);
  assert.equal((await target.app.inject(extra.json().url)).statusCode, 404);
});

test('restore requires preview, exact file and confirmation; concurrent changes reject the restore without data loss', async (t) => {
  const { open } = await fixture(t);
  const { app } = open('source');
  await populate(app);
  const bytes = (await app.inject('/api/backups/database')).rawPayload;
  assert.equal(
    (await upload(app, '/api/backups/restore', bytes)).statusCode,
    400,
  );
  const preview = (await upload(app, '/api/backups/inspect', bytes)).json();
  const headers = {
    'x-flashlab-confirm': 'restore',
    'x-flashlab-revision': String(preview.expectedRevision),
    'x-flashlab-backup-hash': preview.hash,
  };
  assert.equal(
    (
      await upload(
        app,
        '/api/backups/restore',
        Buffer.concat([bytes, Buffer.from('changed')]),
        headers,
      )
    ).statusCode,
    400,
  );
  await app.inject({
    method: 'PUT',
    url: '/api/profiles/default',
    payload: { name: 'Newer name' },
  });
  assert.equal(
    (await upload(app, '/api/backups/restore', bytes, headers)).statusCode,
    409,
  );
  assert.equal(
    (await app.inject('/api/profiles')).json()[0].name,
    'Newer name',
  );
  assert.equal(
    (await upload(app, '/api/backups/inspect', Buffer.from('not sqlite')))
      .statusCode,
    400,
  );
});

test('missing images or unknown study fields reject a backup instead of silently dropping information', async (t) => {
  const { root, open } = await fixture(t);
  const { app } = open('source');
  await populate(app);
  const bytes = (await app.inject('/api/backups/database')).rawPayload;
  const path = join(root, 'broken.sqlite');
  await writeFile(path, bytes);
  let copy = new DatabaseSync(path);
  copy.exec('DELETE FROM images');
  copy.close();
  assert.equal(
    (await upload(app, '/api/backups/inspect', await readFile(path)))
      .statusCode,
    400,
  );
  await writeFile(path, bytes);
  copy = new DatabaseSync(path);
  copy
    .prepare('UPDATE profile_states SET data = ? WHERE profile_id = ?')
    .run(
      JSON.stringify({ ...body, futureField: 'must not disappear' }),
      'default',
    );
  copy.close();
  const rejected = await upload(
    app,
    '/api/backups/inspect',
    await readFile(path),
  );
  assert.equal(rejected.statusCode, 400);
  assert.match(rejected.json().error, /phiên bản/);
});

test('legacy image files are imported into SQLite and included in a standalone backup without deleting originals', async (t) => {
  const { open } = await fixture(t);
  const { app, storageDir } = open('legacy');
  const name = '11111111-1111-4111-8111-111111111111.png';
  const directory = join(storageDir, 'blog', 'images');
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, name), png);
  assert.deepEqual(
    (await app.inject(`/api/blog-images/${name}`)).rawPayload,
    png,
  );
  const exported = await app.inject('/api/backups/database');
  assert.equal(exported.statusCode, 200, exported.body);
  assert.equal(
    (await upload(app, '/api/backups/inspect', exported.rawPayload)).json()
      .images,
    1,
  );
  assert.deepEqual(await readFile(join(directory, name)), png);
});

test('a storage failure halfway through a full restore rolls back every table and retains a recovery database', async (t) => {
  const { open } = await fixture(t);
  const source = open('source');
  await populate(source.app);
  const bytes = (await source.app.inject('/api/backups/database')).rawPayload;
  const target = open('target');
  const before = (await target.app.inject('/api/state')).json();
  const db = new DatabaseSync(join(target.storageDir, 'flashlab.sqlite'));
  db.exec(
    "CREATE TRIGGER simulate_disk_failure BEFORE INSERT ON profile_states BEGIN SELECT RAISE(ABORT, 'simulated failure'); END",
  );
  db.close();
  const response = await restore(target.app, bytes);
  assert.equal(response.statusCode, 500);
  assert.deepEqual((await target.app.inject('/api/state')).json(), before);
  assert.deepEqual((await target.app.inject('/api/blog')).json(), []);
  const { readdir } = await import('node:fs/promises');
  const recovery = await readdir(join(target.storageDir, 'restore-backups'));
  assert.equal(recovery.length, 1);
  assert.equal(
    (await readFile(join(target.storageDir, 'restore-backups', recovery[0]!)))
      .subarray(0, 16)
      .toString(),
    'SQLite format 3\0',
  );
});

test('moving the default database to another storage directory also preserves shared posts and image bytes', async (t) => {
  const { open } = await fixture(t);
  const source = open('storage');
  const target = open('moved');
  const content = await populate(source.app);
  assert.deepEqual(
    (await target.app.inject('/api/state')).json().data,
    content.data,
  );
  assert.deepEqual((await target.app.inject('/api/blog')).json(), [
    content.post,
  ]);
  assert.deepEqual((await target.app.inject(content.url)).rawPayload, png);
});
