import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const resources = fileURLToPath(
  new URL('../src-tauri/resources/', import.meta.url),
);
async function launch(directory) {
  const child = spawn(
    process.execPath,
    [join(resources, 'backend.mjs'), resources, directory],
    {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        FLASHLAB_CONFIG: '/should-not-be-read.json',
        STORAGE_DIR: '/should-not-be-used',
      },
    },
  );
  let output = '',
    errors = '';
  child.stdout.on('data', (chunk) => {
    output += chunk;
  });
  child.stderr.on('data', (chunk) => {
    errors += chunk;
  });
  const until = Date.now() + 10000;
  while (Date.now() < until) {
    const ready = output
      .slice(0, output.lastIndexOf('\n') + 1)
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
      .find((line) => line.ready);
    if (ready) return { child, base: ready.ready };
    if (child.exitCode !== null)
      throw Error(errors || `Backend exited ${child.exitCode}`);
    await new Promise((resolve) => setTimeout(resolve, 20));
  }
  child.kill();
  throw Error(`Backend did not start: ${errors}`);
}
async function stop(child) {
  if (child.exitCode !== null) return;
  const exit = once(child, 'exit');
  const timeout = setTimeout(() => child.kill('SIGKILL'), 5000);
  child.stdin.end();
  const [code] = await exit;
  clearTimeout(timeout);
  assert.equal(
    code,
    0,
    'closing the parent stdin shuts down the backend cleanly',
  );
}

test('bundled desktop backend serves assets, saves private profiles, skips occupied ports and stops with its parent', async (t) => {
  await access(join(resources, 'backend.mjs'));
  const directory = await mkdtemp(join(tmpdir(), 'flashlab-desktop-'));
  const blocker = createServer();
  await new Promise((resolve, reject) => {
    blocker.once('error', reject);
    blocker.listen(0, '127.0.0.1', resolve);
  });
  t.after(() => new Promise((resolve) => blocker.close(resolve)));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const template = JSON.parse(
    await readFile(join(resources, 'config.example.json'), 'utf8'),
  );
  template.server.apiPort = blocker.address().port;
  template.storage.directory = 'profiles';
  await writeFile(join(directory, 'config.json'), JSON.stringify(template));
  let running = await launch(directory);
  t.after(async () => {
    if (running.child.exitCode === null) await stop(running.child);
  });
  assert.equal(new URL(running.base).hostname, '127.0.0.1');
  assert.notEqual(Number(new URL(running.base).port), blocker.address().port);
  assert.equal((await fetch(`${running.base}/api/health`)).status, 200);
  assert.match(await (await fetch(running.base)).text(), /FlashLab/);
  for (const asset of [
    '/sounds/drag-drop.wav',
    '/assets/animations/confetti_on_transparent_background.lottie',
  ])
    assert.equal((await fetch(running.base + asset)).status, 200);
  const created = await fetch(`${running.base}/api/profiles`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Desktop test' }),
  });
  assert.equal(created.status, 201);
  const profile = await created.json();
  const state = await fetch(`${running.base}/api/profiles/${profile.id}/state`);
  assert.equal(state.status, 200);
  const snapshot = await state.json();
  snapshot.data.decks.push({
    id: 'desktop-deck',
    title: 'Desktop vocabulary',
    description: '',
    color: '#3b6ded',
    created: 1,
    cards: [
      {
        id: 'desktop-card',
        front: 'bank',
        back: 'ngân hàng',
        partOfSpeech: 'Noun',
        definitions: [{ meaning: 'nghiêng', partOfSpeech: 'Verb' }],
        notes: 'Stored on this device',
      },
    ],
  });
  const saved = await fetch(
    `${running.base}/api/profiles/${profile.id}/state`,
    {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(snapshot),
    },
  );
  assert.equal(saved.status, 200, await saved.text());
  await access(join(directory, 'profiles'));
  await stop(running.child);
  running = await launch(directory);
  const profiles = await (await fetch(`${running.base}/api/profiles`)).json();
  assert.ok(
    profiles.some(
      (item) => item.id === profile.id && item.name === 'Desktop test',
    ),
  );
  const restored = await (
    await fetch(`${running.base}/api/profiles/${profile.id}/state`)
  ).json();
  const card = restored.data.decks.find((deck) => deck.id === 'desktop-deck')
    .cards[0];
  assert.equal(card.front, 'bank');
  assert.deepEqual(card.definitions, [
    { meaning: 'nghiêng', partOfSpeech: 'Verb' },
  ]);
  assert.equal(card.notes, 'Stored on this device');
  await stop(running.child);
});

test('desktop first run creates portable config without reading web settings', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'flashlab-desktop-first-'));
  let child;
  t.after(async () => {
    if (child && child.exitCode === null) await stop(child);
    await rm(directory, { recursive: true, force: true });
  });
  ({ child } = await launch(directory));
  const config = JSON.parse(
    await readFile(join(directory, 'config.json'), 'utf8'),
  );
  assert.equal(config.storage.directory, 'data/profiles');
  await stop(child);
});
