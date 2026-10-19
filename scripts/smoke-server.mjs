import { findFreePort } from './config.mjs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdtemp, rm, readFile, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { DatabaseSync } from 'node:sqlite';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

// Exercise the production entry point over real HTTP using isolated runtime data.
test('production server serves frontend assets and persists API data', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'flashlab-http-'));
  const probe = createServer();
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  const occupiedPort = probe.address().port;
  const port = await findFreePort(occupiedPort, '127.0.0.1', 20);
  t.after(() => new Promise((resolve) => probe.close(resolve)));
  const child = spawn(process.execPath, ['scripts/start.mjs'], {
    cwd: new URL('../', import.meta.url),
    env: {
      ...process.env,
      HOST: '127.0.0.1',
      PORT: String(port),
      FLASHLAB_API_PORT: '',
      DATA_FILE: join(directory, 'state.json'),
      STORAGE_DIR: join(directory, 'storage'),
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    output += chunk;
  });
  t.after(async () => {
    if (child.exitCode === null) {
      const closed = once(child, 'exit');
      child.kill('SIGTERM');
      await closed;
    }
    await rm(directory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error(output);
    try {
      ready = (await fetch(`${base}/api/health`)).ok;
    } catch {}
    if (ready) break;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  assert.ok(ready, output);
  assert.notEqual(port, occupiedPort);
  const runtime = await (await fetch(base + '/api/config')).json();
  assert.ok(runtime.study.autoAdvanceSeconds >= 1);
  assert.equal(runtime.storage, undefined);
  assert.equal(runtime.server, undefined);
  const html = await (await fetch(base)).text();
  assert.ok(html.includes('FlashLab'));
  for (const [, asset] of html.matchAll(/(?:src|href)="(\/assets\/[^" ]+)"/g))
    assert.equal((await fetch(base + asset)).status, 200, asset);
  const animationPath =
    '/assets/animations/confetti_on_transparent_background.lottie';
  const animation = await fetch(base + animationPath);
  assert.equal(animation.status, 200);
  assert.deepEqual(
    Buffer.from(await animation.arrayBuffer()),
    await readFile(
      new URL('../apps/frontend/public' + animationPath, import.meta.url),
    ),
  );
  const assets = await readdir(
    new URL('../apps/frontend/dist/assets', import.meta.url),
  );
  const wasmFile = assets.find((file) => file.endsWith('.wasm'));
  assert.ok(wasmFile, 'animation renderer is bundled locally');
  const wasm = await fetch(`${base}/assets/${wasmFile}`);
  assert.equal(wasm.status, 200);
  assert.match(wasm.headers.get('content-type'), /application\/wasm/);
  assert.deepEqual(
    new Uint8Array(await wasm.arrayBuffer()).slice(0, 4),
    new Uint8Array([0, 97, 115, 109]),
  );
  for (const sound of [
    'background.wav',
    'test-background.wav',
    'correct.mp3',
    'incorrect.mp3',
    'completed.mp3',
    'keep-trying.mp3',
    'flip.wav',
    'swipe.wav',
  ]) {
    const response = await fetch(`${base}/sounds/${sound}`, {
      headers: { Range: 'bytes=0-31' },
    });
    assert.equal(response.status, 206, sound);
    assert.match(response.headers.get('content-type'), /audio\//);
    assert.equal((await response.arrayBuffer()).byteLength, 32);
  }

  assert.equal((await fetch(base + '/api/unknown')).status, 404);
  const saved = await fetch(base + '/api/state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      revision: 0,
      data: { version: 2, decks: [], history: {}, sessions: [] },
    }),
  });
  assert.equal(saved.status, 200);
  assert.equal((await (await fetch(base + '/api/state')).json()).revision, 1);
  const profiles = await (await fetch(base + '/api/profiles')).json();
  assert.equal(profiles[0].id, 'default');
  const mcpConfig = await (
    await fetch(base + '/api/profiles/default/mcp-config')
  ).json();
  const mcp = new Client({ name: 'production-http-smoke', version: '1.0.0' });
  try {
    await mcp.connect(
      new StdioClientTransport({
        ...mcpConfig.mcpServers.flashlab,
        cwd: tmpdir(),
        stderr: 'pipe',
      }),
    );
    assert.equal((await mcp.listTools()).tools.length, 6);
    const current = await mcp.callTool({ name: 'get_profile', arguments: {} });
    assert.equal(current.structuredContent.revision, 1);
    assert.equal(current.structuredContent.profile.id, 'default');
  } finally {
    await mcp.close();
  }
  const created = await fetch(base + '/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'HTTP user' }),
  });
  assert.equal(created.status, 201);
  const profile = await created.json();
  const endpoint = `${base}/api/profiles/${profile.id}/state`;
  const personal = await (await fetch(endpoint)).json();
  assert.equal(personal.data.decks.length, 0);
  const settings = {
    theme: 'dark',
    audio: { music: false, effects: true, volume: 0.4, musicVolume: 0.9 },
  };
  const updated = await fetch(endpoint, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      revision: personal.revision,
      data: { ...personal.data, preferences: settings },
    }),
  });
  assert.equal(updated.status, 200);
  const overwrite = await fetch(`${base}/api/profiles/${profile.id}/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      confirmed: true,
      revision: personal.revision + 1,
      backup: {
        ...personal.data,
        preferences: settings,
        userId: profile.id,
        userName: profile.name,
      },
    }),
  });
  assert.equal(overwrite.status, 200);
  const database = new DatabaseSync(
    join(directory, 'storage', 'flashlab.sqlite'),
    { readOnly: true },
  );
  const row = database
    .prepare('SELECT revision, data FROM profile_states WHERE profile_id = ?')
    .get(profile.id);
  database.close();
  const disk = { revision: row.revision, data: JSON.parse(row.data) };
  assert.deepEqual(disk.data.preferences, settings);
  assert.equal(disk.revision, personal.revision + 2);

  assert.deepEqual(
    (await (await fetch(endpoint)).json()).data.preferences,
    settings,
  );
  assert.equal(
    (await (await fetch(base + '/api/state')).json()).data.preferences,
    undefined,
  );
  assert.equal(
    (await fetch(`${base}/api/profiles/${profile.id}`, { method: 'DELETE' }))
      .status,
    204,
  );
  assert.equal((await fetch(endpoint)).status, 404);
});
