import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fetchRead } from '../src/core/http';

test('read recovers when proxy refuses connections during an API restart', async (t) => {
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    if (calls === 1) throw new TypeError('ECONNREFUSED');
    if (calls === 2) return new Response('', { status: 500 });
    return new Response(JSON.stringify({ revision: 7 }));
  });
  assert.deepEqual(await (await fetchRead('/api/state')).json(), {
    revision: 7,
  });
  assert.equal(calls, 3);
});

test('read does not retry validation or missing-profile responses', async (t) => {
  const mock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('{}', { status: 404 }),
  );
  assert.equal((await fetchRead('/api/profiles/missing/state')).status, 404);
  assert.equal(mock.mock.callCount(), 1);
});

test('persistent server failure returns after a bounded number of attempts', async (t) => {
  const mock = t.mock.method(
    globalThis,
    'fetch',
    async () => new Response('', { status: 503 }),
  );
  assert.equal((await fetchRead('/api/state')).status, 503);
  assert.equal(mock.mock.callCount(), 3);
});
