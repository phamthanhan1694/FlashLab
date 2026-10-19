import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/client';
import { StdioClientTransport } from '@modelcontextprotocol/client/stdio';
import {
  stateSchema,
  type Card,
  type Deck,
  type Snapshot,
} from '@flashlab/shared';
import { Profiles } from '../src/storage/profiles.js';
import { buildApp } from '../src/http/app.js';
import { parseMcpArguments } from '../src/mcp/stdio.js';

const entry = fileURLToPath(new URL('../src/mcp/cli.ts', import.meta.url));
const image = 'data:image/png;base64,aGVsbG8=';
async function fixture(t: TestContext, writes = false, modern = false) {
  const directory = await mkdtemp(join(tmpdir(), 'FlashLab MCP tiếng Việt '));
  const paths = {
    dataFile: join(directory, 'legacy.json'),
    storageDir: join(directory, 'chosen data'),
  };
  const profiles = new Profiles(paths.dataFile, paths.storageDir);
  const profile = await profiles.create('MCP learner');
  const other = await profiles.create('Private learner');
  const state = stateSchema.parse({
    version: 2,
    decks: [
      {
        id: 'deck',
        title: 'English',
        created: 1,
        cards: [
          {
            id: 'card',
            front: 'bank',
            back: 'ngân hàng',
            definitions: [
              { meaning: 'nghiêng', partOfSpeech: 'Verb' },
              'bờ sông',
            ],
            image,
            partOfSpeech: 'Noun',
            pronunciation: '/bæŋk/',
            speechLanguage: 'en-GB',
            notes: 'Preserve this note',
            level: 4,
            correct: 8,
            wrong: 2,
            last: 10,
            due: 20,
            starred: true,
            remembered: true,
            masteryProgress: {
              correct: 8,
              modes: ['flashcards'],
              testCorrect: 2,
            },
          },
        ],
      },
    ],
    classes: [{ id: 'class', name: 'My class', deckIds: ['deck'] }],
    notes: [
      {
        id: 'e962e160-601e-4b13-a57a-baa4dc55c281',
        ownerId: profile.id,
        author: profile.name,
        title: 'Note',
        markdown: 'Important personal note',
        revision: 1,
        created: 1,
        updated: 1,
      },
    ],
    history: { '2026-10-19': 5 },
    sessions: [
      {
        id: 'session',
        deckId: 'deck',
        mode: 'learn',
        date: 1,
        answers: 3,
        correct: 2,
      },
    ],
    preferences: { theme: 'dark' },
  });
  await profiles.update(profile.id, 1, state);
  const launch = {
    command: process.execPath,
    args: [
      '--import',
      import.meta.resolve('tsx'),
      entry,
      '--storage-dir',
      paths.storageDir,
      '--legacy-file',
      paths.dataFile,
    ],
  };
  const transport = new StdioClientTransport({
    ...launch,
    args: [
      ...launch.args,
      '--profile',
      profile.id,
      ...(writes ? ['--allow-writes'] : []),
    ],
    cwd: tmpdir(),
    stderr: 'pipe',
  });
  let errors = '';
  transport.stderr?.on('data', (chunk) => {
    errors += chunk;
  });
  const client = new Client(
    { name: 'flashlab-test', version: '1.0.0' },
    modern ? { versionNegotiation: { mode: 'auto' } } : undefined,
  );
  const cleanup: (() => Promise<unknown>)[] = [];
  t.after(async () => {
    for (const close of cleanup) await close();
    await client.close();
    profiles.close();
    await rm(directory, { recursive: true, force: true });
  });
  await client.connect(transport);
  return {
    client,
    profiles,
    profile,
    other,
    state,
    paths,
    launch,
    cleanup,
    errors: () => errors,
  };
}
async function call<T>(
  client: Client,
  name: string,
  args: Record<string, unknown> = {},
) {
  const response = await client.callTool({ name, arguments: args });
  assert.equal(response.isError, undefined, JSON.stringify(response));
  return response.structuredContent as T;
}

test('real stdio discovery, resources, prompts, pagination and search keep complete card fields scoped to one profile', async (t) => {
  const { client, profile, other } = await fixture(t);
  const tools = await client.listTools();
  assert.equal(tools.tools.length, 6);
  assert.ok(tools.tools.every((tool) => tool.annotations?.readOnlyHint));
  const connected = await call<{
    profile: { id: string };
    allowWrites: boolean;
  }>(client, 'get_profile');
  assert.equal(connected.profile.id, profile.id);
  assert.equal(connected.allowWrites, false);
  const decks = await call<{
    items: { cardCount: number; cards?: Card[] }[];
    total: number;
    nextOffset: number | null;
  }>(client, 'list_decks', { limit: 1 });
  assert.equal(decks.total, 1);
  assert.equal(decks.items[0].cardCount, 1);
  assert.equal(decks.items[0].cards, undefined);
  assert.equal(decks.nextOffset, null);
  const found = await call<{ items: { card: Card & { hasImage: boolean } }[] }>(
    client,
    'search_cards',
    { query: 'NGHIÊNG'.normalize('NFD') },
  );
  assert.equal(found.items.length, 1);
  assert.equal(found.items[0].card.hasImage, true);
  assert.equal(found.items[0].card.image, undefined);
  assert.equal(found.items[0].card.level, 4);
  const full = await call<{ card: Card }>(client, 'get_card', {
    deckId: 'deck',
    cardId: 'card',
    includeImage: true,
  });
  assert.equal(full.card.image, image);
  assert.equal(full.card.definitions?.length, 2);
  assert.equal(full.card.masteryProgress?.correct, 8);
  const injected = await client.callTool({
    name: 'get_profile',
    arguments: { profileId: other.id },
  });
  assert.equal(injected.isError, true);
  const invalid = await client.callTool({
    name: 'list_cards',
    arguments: { deckId: 'deck', limit: 10001 },
  });
  assert.equal(invalid.isError, true);
  await assert.rejects(
    client.callTool({
      name: 'delete_deck',
      arguments: { deckId: 'deck', revision: 2, confirmed: true },
    }),
  );
  const resources = await client.listResources();
  assert.equal(resources.resources[0].uri, 'flashlab://guide');
  const guide = await client.readResource({ uri: 'flashlab://guide' });
  assert.ok(
    'text' in guide.contents[0] && guide.contents[0].text.includes('revision'),
  );
  const prompts = await client.listPrompts();
  assert.equal(prompts.prompts[0].name, 'study_set');
  const prompt = await client.getPrompt({
    name: 'study_set',
    arguments: { deckId: 'deck' },
  });
  assert.ok(JSON.stringify(prompt).includes('list_cards'));
});

test('modern MCP protocol negotiation serves the same tools and structured results', async (t) => {
  const { client, profile } = await fixture(t, false, true);
  assert.equal(client.getProtocolEra(), 'modern');
  assert.equal(client.getNegotiatedProtocolVersion(), '2026-07-28');
  assert.equal((await client.listTools()).tools.length, 6);
  const connected = await call<{ profile: { id: string } }>(
    client,
    'get_profile',
  );
  assert.equal(connected.profile.id, profile.id);
});

test('MCP edits preserve learning data, reject conflicts and invalid batches, and share transactions with the running app', async (t) => {
  const { client, profile, profiles, other, state, paths, cleanup } =
    await fixture(t, true);
  const otherBefore = await profiles.read(other.id);
  const app = buildApp(paths);
  cleanup.push(() => app.close());
  const edited = await call<{ revision: number; card: Card }>(
    client,
    'update_card',
    {
      revision: 2,
      deckId: 'deck',
      cardId: 'card',
      changes: { back: 'ngân hàng thương mại' },
    },
  );
  assert.equal(edited.revision, 3);
  const saved = await profiles.read(profile.id);
  assert.deepEqual(saved.data, {
    ...state,
    decks: [
      {
        ...state.decks[0],
        cards: [{ ...state.decks[0].cards[0], back: 'ngân hàng thương mại' }],
      },
    ],
  });
  const stale = await client.callTool({
    name: 'add_cards',
    arguments: {
      revision: 2,
      deckId: 'deck',
      cards: [{ front: 'one', back: 'một' }],
    },
  });
  assert.equal(stale.isError, true);
  assert.equal((stale.structuredContent as { code: string }).code, 'CONFLICT');
  const duplicate = await client.callTool({
    name: 'add_cards',
    arguments: {
      revision: 3,
      deckId: 'deck',
      cards: [
        { front: 'new', back: 'mới' },
        { front: ' BANK ', back: 'duplicate' },
      ],
    },
  });
  assert.equal(duplicate.isError, true);
  assert.deepEqual(
    await profiles.read(profile.id),
    saved,
    'invalid batches must not partially commit',
  );
  const cleared = await call<{ revision: number }>(client, 'update_card', {
    revision: 3,
    deckId: 'deck',
    cardId: 'card',
    changes: { image: null, notes: null },
  });
  assert.equal(cleared.revision, 4);
  assert.equal(
    (await profiles.read(profile.id)).data?.decks[0].cards[0].image,
    undefined,
  );
  const added = await call<{ revision: number; addedCardIds: string[] }>(
    client,
    'add_cards',
    {
      revision: 4,
      deckId: 'deck',
      cards: [
        {
          front: 'river',
          back: 'sông',
          definitions: ['dòng sông'],
          pronunciation: '/ˈrɪvə/',
        },
        { front: 'one', back: 'một' },
      ],
    },
  );
  assert.equal(added.addedCardIds.length, 2);
  const secondPage = await call<{
    nextOffset: number | null;
    total: number;
    items: Card[];
  }>(client, 'list_cards', { deckId: 'deck', offset: 1, limit: 1 });
  assert.equal(secondPage.nextOffset, 2);
  assert.equal(secondPage.total, 3);
  assert.equal(secondPage.items[0].front, 'river');
  const invalidDelete = await client.callTool({
    name: 'delete_cards',
    arguments: {
      revision: 5,
      deckId: 'deck',
      cardIds: [added.addedCardIds[0], 'missing'],
      confirmed: true,
    },
  });
  assert.equal(invalidDelete.isError, true);
  assert.equal((await profiles.read(profile.id)).revision, 5);
  await call(client, 'delete_cards', {
    revision: 5,
    deckId: 'deck',
    cardIds: added.addedCardIds,
    confirmed: true,
  });
  const renamed = await call<{ revision: number }>(client, 'update_deck', {
    revision: 6,
    deckId: 'deck',
    changes: { title: 'Banking', color: '#AABBCC' },
  });
  assert.equal(renamed.revision, 7);
  const web = await app.inject({
    method: 'GET',
    url: `/api/profiles/${profile.id}/state`,
  });
  const fromWeb = web.json<Snapshot>();
  assert.equal(fromWeb.revision, 7);
  fromWeb.data!.decks[0].description = 'Edited in the app';
  const put = await app.inject({
    method: 'PUT',
    url: `/api/profiles/${profile.id}/state`,
    payload: { revision: 7, data: fromWeb.data },
  });
  assert.equal(put.statusCode, 200);
  const conflicted = await client.callTool({
    name: 'delete_deck',
    arguments: { revision: 7, deckId: 'deck', confirmed: true },
  });
  assert.equal(
    (conflicted.structuredContent as { code: string }).code,
    'CONFLICT',
  );
  const noConfirm = await client.callTool({
    name: 'delete_deck',
    arguments: { revision: 8, deckId: 'deck' },
  });
  assert.equal(noConfirm.isError, true);
  await call(client, 'delete_deck', {
    revision: 8,
    deckId: 'deck',
    confirmed: true,
  });
  const deleted = await profiles.read(profile.id);
  assert.deepEqual(deleted.data?.classes?.[0].deckIds, []);
  assert.deepEqual(deleted.data?.sessions, state.sessions);
  assert.deepEqual(deleted.data?.notes, state.notes);
  const created = await call<{ revision: number; deck: Deck }>(
    client,
    'create_deck',
    { revision: 9, title: 'New vocabulary' },
  );
  assert.equal(created.revision, 10);
  assert.ok(created.deck.id);
  assert.deepEqual(await profiles.read(other.id), otherBefore);
});

test('connection configuration uses actual paths, profile scope and opt-in writes; invalid launch arguments fail closed', async (t) => {
  const { paths, launch, profile, profiles, cleanup } = await fixture(t);
  const app = buildApp({ ...paths, mcpLaunch: launch });
  cleanup.push(() => app.close());
  const readOnly = (
    await app.inject(`/api/profiles/${profile.id}/mcp-config`)
  ).json();
  assert.equal(readOnly.mcpServers.flashlab.command, process.execPath);
  assert.deepEqual(readOnly.mcpServers.flashlab.args, [
    ...launch.args,
    '--profile',
    profile.id,
  ]);
  const write = (
    await app.inject(`/api/profiles/${profile.id}/mcp-config?writes=true`)
  ).json();
  assert.equal(write.mcpServers.flashlab.args.at(-1), '--allow-writes');
  assert.equal(
    (await app.inject(`/api/profiles/${profile.id}/mcp-config?writes=yes`))
      .statusCode,
    400,
  );
  const unknown = '0ccdfbfd-1d50-4f71-a170-25b1db89fb4c';
  assert.equal(
    (await app.inject(`/api/profiles/${unknown}/mcp-config`)).statusCode,
    404,
  );
  const client = new Client({ name: 'unknown-profile', version: '1.0.0' });
  const transport = new StdioClientTransport({
    ...launch,
    args: [...launch.args, '--profile', unknown],
    stderr: 'pipe',
  });
  cleanup.push(() => client.close());
  await assert.rejects(client.connect(transport));
  assert.ok(!(await profiles.list()).some((item) => item.id === unknown));
  assert.throws(() => parseMcpArguments([]), /--profile/);
  assert.throws(() =>
    parseMcpArguments(['--profile', 'default', '--allow-writes=false']),
  );
  assert.throws(() =>
    parseMcpArguments(['--profile', 'default', '--storage-dir', 'relative']),
  );
  assert.throws(() => parseMcpArguments(['--profile', 'default', '--unknown']));
});
