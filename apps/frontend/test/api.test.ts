import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import type { AppData } from '@flashlab/shared';
import { StateSync } from '../src/core/api';
import { parseDelimited } from '../src/core/csv';

const data: AppData = { version: 2, decks: [], history: {}, sessions: [] };
function setup(t: TestContext, initial?: object) {
  const values = new Map<string, string>();
  if (initial) values.set('flashlab.server.v1', JSON.stringify(initial));
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear() {
      values.clear();
    },
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    key(index) {
      return [...values.keys()][index] ?? null;
    },
  };
  const originalStorage = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage',
  );
  Object.defineProperty(globalThis, 'localStorage', {
    value: storage,
    configurable: true,
  });
  t.after(() => {
    if (originalStorage)
      Object.defineProperty(globalThis, 'localStorage', originalStorage);
    else Reflect.deleteProperty(globalThis, 'localStorage');
  });
  const messages: string[] = [];
  const sync = new StateSync((message) => messages.push(message));
  return { sync, values, messages };
}

test('server data takes precedence over legacy fallback and saves use returned revision', async (t) => {
  const { sync } = setup(t);
  const remote = { ...data, history: { '2026-10-13': 5 } };
  let body: unknown;
  t.mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      if (options?.method === 'PUT') {
        body = JSON.parse(String(options.body));
        return new Response(JSON.stringify({ revision: 8, data: remote }));
      }
      return new Response(JSON.stringify({ revision: 7, data: remote }));
    },
  );
  assert.deepEqual(await sync.initialize(data), remote);
  sync.schedule(remote);
  await sync.flush();
  assert.deepEqual(body, { revision: 7, data: remote });
  assert.equal(sync.hasPending, false);
});

test('offline changes are cached and remain pending until successfully saved', async (t) => {
  const { sync, values } = setup(t);
  const fetch = t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('offline');
  });
  assert.deepEqual(await sync.initialize(data), data);
  assert.equal(sync.hasPending, true);
  assert.equal(JSON.parse(values.get('flashlab.server.v1')!).pending, true);
  fetch.mock.mockImplementation(
    async () => new Response(JSON.stringify({ revision: 1, data })),
  );
  await sync.flush();
  assert.equal(sync.hasPending, false);
});

test('stale pending cache is preserved and never automatically overwrites server', async (t) => {
  const { sync, messages } = setup(t, { revision: 1, pending: true, data });
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return new Response(
      JSON.stringify({
        revision: 2,
        data: { ...data, history: { '2026-10-14': 9 } },
      }),
    );
  });
  assert.deepEqual(await sync.initialize(data), data);
  await sync.flush();
  assert.equal(calls, 1);
  assert.equal(sync.hasPending, true);
  assert.ok(messages.some((message) => message.includes('Xung đột')));
  await sync.useServer();
  assert.equal(sync.hasPending, false);
});

test('a genuine 409 conflict preserves local changes and stops subsequent automatic retries', async (t) => {
  const { sync } = setup(t);
  let calls = 0;
  t.mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      calls++;
      return options?.method === 'PUT'
        ? new Response('{}', { status: 409 })
        : new Response(
            JSON.stringify({
              revision: calls === 1 ? 0 : 1,
              data:
                calls === 1 ? data : { ...data, history: { '2026-10-14': 3 } },
            }),
          );
    },
  );
  await sync.initialize(data);
  sync.schedule({ ...data, history: { '2026-10-14': 7 } });
  await sync.flush();
  await sync.flush();
  assert.equal(calls, 3);
  assert.equal(sync.hasPending, true);
});

test('CSV supports BOM, quoted commas, escaped quotes, multiline and TSV', () => {
  assert.deepEqual(
    parseDelimited(
      '\uFEFFfront,back\r\n"a,b","say ""hi"""\r\n"line\nbreak",answer',
    ),
    [
      ['a,b', 'say "hi"'],
      ['line\nbreak', 'answer'],
    ],
  );
  assert.deepEqual(parseDelimited('term\tdefinition\nType\tKiểu dữ liệu'), [
    ['Type', 'Kiểu dữ liệu'],
  ]);
  assert.throws(() => parseDelimited('front,back\n"unfinished,x'), /nháy kép/);
});

test('custom deck colors accept shorthand HEX and choose readable badge text', async () => {
  const { normalizeHex, badgeStyle, resolveColor } =
    await import('../src/ui/color-picker');
  assert.equal(normalizeHex('F80'), '#ff8800');
  assert.equal(normalizeHex('#12ABcd'), '#12abcd');
  assert.equal(normalizeHex('#abcd'), undefined);
  assert.equal(normalizeHex('red'), undefined);
  assert.equal(resolveColor('purple'), '#8871eb');
  assert.ok(badgeStyle('#000000').includes('color:#ffffff'));
  assert.ok(badgeStyle('#ffffff').includes('color:#111111'));
});

test('profile caches and pending offline changes cannot leak into another profile', async (t) => {
  const { values } = setup(t);
  const idA = '11111111-1111-4111-8111-111111111111';
  const idB = '22222222-2222-4222-8222-222222222222';
  const a = new StateSync(() => {}, idA);
  const b = new StateSync(() => {}, idB);
  const aData = { ...data, history: { '2026-10-13': 4 } };
  t.mock.method(globalThis, 'fetch', async () => {
    throw new Error('offline');
  });
  await a.initialize(aData);
  await b.initialize(data);
  assert.deepEqual(
    JSON.parse(values.get(`flashlab.server.v1.${idA}`)!).data,
    aData,
  );
  assert.deepEqual(
    JSON.parse(values.get(`flashlab.server.v1.${idB}`)!).data,
    data,
  );
  assert.equal(values.has('flashlab.server.v1'), false);
  const requests: string[] = [];
  t.mock.method(
    globalThis,
    'fetch',
    async (url: unknown, options?: RequestInit) => {
      requests.push(String(url));
      const body = JSON.parse(String(options?.body));
      return new Response(JSON.stringify({ revision: 1, data: body.data }));
    },
  );
  await a.flush();
  await b.flush();
  assert.deepEqual(requests, [
    `/api/profiles/${idA}/state`,
    `/api/profiles/${idB}/state`,
  ]);
});

test('an avatar save with a lost response is acknowledged before switching profiles', async (t) => {
  const { sync, values } = setup(t);
  let server: { revision: number; data: AppData } = { revision: 0, data };
  let loseResponse = true;
  t.mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      if (options?.method !== 'PUT')
        return new Response(JSON.stringify(server));
      const payload = JSON.parse(String(options.body));
      if (payload.revision !== server.revision)
        return new Response('{}', { status: 409 });
      server = { revision: server.revision + 1, data: payload.data };
      if (loseResponse) {
        loseResponse = false;
        throw new TypeError('lost acknowledgement');
      }
      return new Response(JSON.stringify(server));
    },
  );
  const loaded = await sync.initialize(data);
  sync.schedule({
    ...loaded,
    preferences: {
      theme: 'system',
      audio: { music: true, effects: true, volume: 0.6, musicVolume: 1 },
      avatar: 'fox',
    },
  });
  await sync.flush();
  assert.equal(sync.hasPending, true);
  await sync.flush();
  assert.equal(sync.hasPending, false);
  assert.equal(server.data.preferences?.avatar, 'fox');
  assert.equal(JSON.parse(values.get('flashlab.server.v1')!).pending, false);
});

test('switch waits for the latest avatar when another save is already in flight', async (t) => {
  const { sync } = setup(t);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  const revisions: number[] = [];
  let stored = data;
  t.mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      if (options?.method !== 'PUT')
        return new Response(JSON.stringify({ revision: 0, data }));
      const payload = JSON.parse(String(options.body));
      revisions.push(payload.revision);
      if (revisions.length === 1) await gate;
      stored = payload.data;
      return new Response(
        JSON.stringify({ revision: payload.revision + 1, data: stored }),
      );
    },
  );
  await sync.initialize(data);
  sync.schedule(data);
  const first = sync.flush();
  sync.schedule({
    ...data,
    preferences: {
      theme: 'system',
      audio: { music: true, effects: true, volume: 0.6, musicVolume: 1 },
      avatar: 'sheep',
    },
  });
  const switching = sync.flush();
  release();
  await Promise.all([first, switching]);
  assert.deepEqual(revisions, [0, 1]);
  assert.equal(stored.preferences?.avatar, 'sheep');
  assert.equal(sync.hasPending, false);
});

test('reopening after a lost save response does not create a false conflict', async (t) => {
  const cached = { ...data, history: { '2026-10-14': 2 } };
  const { sync } = setup(t, { revision: 1, pending: true, data: cached });
  t.mock.method(
    globalThis,
    'fetch',
    async () => new Response(JSON.stringify({ revision: 2, data: cached })),
  );
  assert.deepEqual(await sync.initialize(data), cached);
  assert.equal(sync.hasPending, false);
});

test('a lost earlier write can be confirmed before saving a newer avatar', async (t) => {
  const { sync } = setup(t);
  let server: { revision: number; data: AppData } = { revision: 0, data };
  let first = true;
  t.mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      if (options?.method !== 'PUT')
        return new Response(JSON.stringify(server));
      const payload = JSON.parse(String(options.body));
      if (payload.revision !== server.revision)
        return new Response('{}', { status: 409 });
      server = { revision: server.revision + 1, data: payload.data };
      if (first) {
        first = false;
        throw new TypeError('lost');
      }
      return new Response(JSON.stringify(server));
    },
  );
  await sync.initialize(data);
  const studied = { ...data, history: { '2026-10-14': 3 } };
  sync.schedule(studied);
  await sync.flush();
  sync.schedule({
    ...studied,
    preferences: {
      theme: 'system',
      audio: { music: true, effects: true, volume: 0.6, musicVolume: 1 },
      avatar: 'rabbit',
    },
  });
  await sync.flush();
  assert.equal(sync.hasPending, false);
  assert.equal(server.data.preferences?.avatar, 'rabbit');
  assert.equal(server.data.history['2026-10-14'], 3);
});

test('pending cache merges independent changes using its saved baseline after reload', async (t) => {
  const local = { ...data, history: { '2026-10-14': 2 } };
  const remote = { ...data, history: { '2026-10-15': 3 } };
  const { sync } = setup(t, {
    revision: 1,
    pending: true,
    data: local,
    base: data,
  });
  let saved: AppData | undefined;
  t.mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      if (options?.method === 'PUT') {
        const payload = JSON.parse(String(options.body));
        assert.equal(payload.revision, 2);
        saved = payload.data;
        return new Response(JSON.stringify({ revision: 3, data: saved }));
      }
      return new Response(JSON.stringify({ revision: 2, data: remote }));
    },
  );
  const merged = await sync.initialize(data);
  assert.deepEqual(merged.history, { '2026-10-14': 2, '2026-10-15': 3 });
  await sync.flush();
  assert.deepEqual(saved, merged);
  assert.equal(sync.hasPending, false);
});

test('live conflict combines independent changes and updates the displayed state', async (t) => {
  const { sync } = setup(t);
  let server = { revision: 0, data };
  let displayed: AppData | undefined;
  sync.onReconcile = (value) => {
    displayed = value;
  };
  t.mock.method(
    globalThis,
    'fetch',
    async (_url: unknown, options?: RequestInit) => {
      if (options?.method !== 'PUT')
        return new Response(JSON.stringify(server));
      const payload = JSON.parse(String(options.body));
      if (payload.revision !== server.revision)
        return new Response('{}', { status: 409 });
      server = { revision: server.revision + 1, data: payload.data };
      return new Response(JSON.stringify(server));
    },
  );
  await sync.initialize(data);
  server = { revision: 1, data: { ...data, history: { '2026-10-15': 3 } } };
  sync.schedule({ ...data, history: { '2026-10-14': 2 } });
  await sync.flush();
  assert.deepEqual(server.data.history, { '2026-10-14': 2, '2026-10-15': 3 });
  assert.deepEqual(displayed, server.data);
  assert.equal(sync.hasPending, false);
});

test('failed conflict recovery keeps the pending local copy intact', async (t) => {
  const { sync, values } = setup(t, { revision: 1, pending: true, data });
  const fetch = t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(
        JSON.stringify({
          revision: 2,
          data: { ...data, history: { '2026-10-15': 3 } },
        }),
      ),
  );
  await sync.initialize(data);
  fetch.mock.mockImplementation(
    async () => new Response('{}', { status: 503 }),
  );
  await assert.rejects(sync.useServer(), /Không đọc/);
  assert.equal(sync.hasConflict, true);
  assert.equal(sync.hasPending, true);
  assert.deepEqual(JSON.parse(values.get('flashlab.server.v1')!).data, data);
});
