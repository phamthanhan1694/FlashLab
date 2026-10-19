import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { mkdtemp, readFile, writeFile, rm, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';

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

test('packaged desktop MCP uses the selected data folder, works without the app window and preserves full card content', async (t) => {
  const directory = await mkdtemp(
    join(tmpdir(), 'FlashLab MCP desktop tiếng Việt '),
  );
  const running = await launch(directory);
  let client;
  t.after(async () => {
    await client?.close();
    await stop(running.child);
    await rm(directory, { recursive: true, force: true });
  });
  const created = await fetch(`${running.base}/api/profiles`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'MCP desktop' }),
  });
  const profile = await created.json();
  const response = await fetch(
    `${running.base}/api/profiles/${profile.id}/mcp-config?writes=true`,
  );
  assert.equal(response.status, 200);
  const config = await response.json();
  assert.ok(config.mcpServers.flashlab.args.includes('--mcp'));
  assert.ok(config.mcpServers.flashlab.args.includes(directory));
  await stop(running.child);
  const transport = new StdioClientTransport({
    ...config.mcpServers.flashlab,
    cwd: tmpdir(),
    stderr: 'pipe',
    env: {
      ...process.env,
      FLASHLAB_CONFIG: '/ignore-this.json',
      STORAGE_DIR: '/ignore-this-data',
    },
  });
  let errors = '';
  transport.stderr?.on('data', (chunk) => {
    errors += chunk;
  });
  client = new Client({ name: 'desktop-smoke', version: '1.0.0' });
  await client.connect(transport);
  assert.equal((await client.listTools()).tools.length, 12, errors);
  const deckResult = await client.callTool({
    name: 'create_deck',
    arguments: { revision: 1, title: 'Installed MCP' },
  });
  assert.equal(deckResult.isError, undefined, JSON.stringify(deckResult));
  const deck = deckResult.structuredContent.deck;
  const image = 'data:image/png;base64,aGVsbG8=';
  const cards = await client.callTool({
    name: 'add_cards',
    arguments: {
      revision: 2,
      deckId: deck.id,
      cards: [
        {
          front: 'bank',
          back: 'ngân hàng',
          definitions: [{ meaning: 'nghiêng', partOfSpeech: 'Verb' }],
          notes: 'Full content',
          image,
        },
      ],
    },
  });
  assert.equal(cards.isError, undefined, JSON.stringify(cards));
  const full = await client.callTool({
    name: 'get_card',
    arguments: {
      deckId: deck.id,
      cardId: cards.structuredContent.addedCardIds[0],
      includeImage: true,
    },
  });
  assert.equal(full.structuredContent.card.image, image);
  assert.equal(full.structuredContent.card.definitions[0].meaning, 'nghiêng');
  await client.close();
  const db = new DatabaseSync(
    join(directory, 'data', 'profiles', 'flashlab.sqlite'),
    { readOnly: true },
  );
  try {
    const row = db
      .prepare('SELECT revision, data FROM profile_states WHERE profile_id = ?')
      .get(profile.id);
    assert.equal(row.revision, 3);
    assert.equal(JSON.parse(row.data).decks[0].cards[0].notes, 'Full content');
  } finally {
    db.close();
  }
});

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
  const uploaded = await fetch(`${running.base}/api/blog-images`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-flashlab-profile': profile.id,
    },
    body: JSON.stringify({ data: 'data:image/png;base64,iVBORw0KGgo=' }),
  });
  assert.equal(uploaded.status, 201);
  const image = await uploaded.json();
  const post = await fetch(`${running.base}/api/blog`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-flashlab-profile': profile.id,
    },
    body: JSON.stringify({
      title: 'Desktop image backup',
      markdown: `![image](${image.url})`,
    }),
  });
  assert.equal(post.status, 201);
  const backup = await fetch(`${running.base}/api/backups/database`);
  assert.equal(backup.status, 200);
  const backupBytes = Buffer.from(await backup.arrayBuffer());
  assert.equal(backupBytes.subarray(0, 16).toString(), 'SQLite format 3\0');
  const inspected = await fetch(`${running.base}/api/backups/inspect`, {
    method: 'POST',
    headers: { 'content-type': 'application/vnd.sqlite3' },
    body: backupBytes,
  });
  assert.equal(inspected.status, 200);
  const manifest = await inspected.json();
  assert.equal(manifest.profiles.length, 2);
  assert.equal(manifest.cards, 1);
  assert.equal(manifest.articles, 1);
  assert.equal(manifest.images, 1);
  const restoredBackup = await fetch(`${running.base}/api/backups/restore`, {
    method: 'POST',
    headers: {
      'content-type': 'application/vnd.sqlite3',
      'x-flashlab-confirm': 'restore',
      'x-flashlab-revision': String(manifest.expectedRevision),
      'x-flashlab-backup-hash': manifest.hash,
    },
    body: backupBytes,
  });
  assert.equal(restoredBackup.status, 200, await restoredBackup.text());
  await access(join(directory, 'profiles', 'flashlab.sqlite'));
  const database = new DatabaseSync(
    join(directory, 'profiles', 'flashlab.sqlite'),
    { readOnly: true },
  );
  assert.equal(
    database.prepare('SELECT count(*) count FROM profiles').get().count,
    2,
  );
  database.close();
  await stop(running.child);
  running = await launch(directory);
  const profiles = await (await fetch(`${running.base}/api/profiles`)).json();
  assert.deepEqual(
    Buffer.from(await (await fetch(running.base + image.url)).arrayBuffer()),
    Buffer.from('iVBORw0KGgo=', 'base64'),
  );
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
