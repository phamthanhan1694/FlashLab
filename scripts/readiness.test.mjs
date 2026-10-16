import { test } from 'node:test';
import assert from 'node:assert/strict';
import { probeDevReadiness } from './readiness.mjs';
const api = 'http://127.0.0.1:43001/',
  web = 'http://127.0.0.1:43002/';
test('an API that is still starting never triggers an early Vite proxy request', async () => {
  const calls = [];
  const state = await probeDevReadiness(api, web, async (url) => {
    calls.push(String(url));
    throw new Error('ECONNREFUSED');
  });
  assert.equal(state.ready, false);
  assert.equal(state.stage, 'api');
  assert.deepEqual(calls, [new URL('/api/health', api).href]);
});
test('HTTP failures and invalid health responses also keep frontend probing gated', async () => {
  for (const response of [
    new Response('error', { status: 503 }),
    new Response('<html>Wrong service</html>'),
    Response.json({ status: 'unhealthy' }),
  ]) {
    let calls = 0;
    const state = await probeDevReadiness(api, web, async () => {
      calls++;
      return response;
    });
    assert.equal(state.ready, false);
    assert.equal(state.stage, 'api');
    assert.equal(calls, 1);
  }
});
test('readiness requires a working API and working frontend proxy in that order', async () => {
  const calls = [];
  const state = await probeDevReadiness(api, web, async (url) => {
    calls.push(String(url));
    return Response.json({ status: 'ok' });
  });
  assert.deepEqual(state, { ready: true });
  assert.deepEqual(calls, [
    new URL('/api/health', api).href,
    new URL('/api/health', web).href,
  ]);
  const unavailable = await probeDevReadiness(api, web, async (url) =>
    String(url).startsWith(web)
      ? new Response('', { status: 502 })
      : Response.json({ status: 'ok' }),
  );
  assert.equal(unavailable.ready, false);
  assert.equal(unavailable.stage, 'web');
});
