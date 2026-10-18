import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Profiles } from '../src/storage/profiles.js';
import { BlogStore } from '../src/storage/blog.js';
import { ConflictError } from '../src/storage/store.js';
import type { AppData } from '@flashlab/shared';

const state: AppData = {
  version: 2,
  decks: [],
  history: { '2026-10-18': 3 },
  sessions: [],
};
async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), 'flashlab-sqlite-'));
  const root = join(directory, 'profiles');
  const legacy = join(directory, 'state.json');
  const connections: Profiles[] = [];
  const open = () => {
    const profiles = new Profiles(legacy, root);
    connections.push(profiles);
    return profiles;
  };
  t.after(async () => {
    for (const profiles of connections) profiles.close();
    await rm(directory, { recursive: true, force: true });
  });
  return { directory, root, legacy, open };
}

test('folder JSON migrates to a real SQLite database once; deleting a user never resurrects its legacy files', async (t) => {
  const { root, open } = await fixture(t);
  const id = '11111111-1111-4111-8111-111111111111';
  const registry = [
    { id: 'default', name: 'Default', created: 1 },
    { id, name: 'Other', created: 2 },
  ];
  await mkdir(join(root, 'default'), { recursive: true });
  await mkdir(join(root, id), { recursive: true });
  const original = JSON.stringify({
    userId: 'default',
    revision: 7,
    data: state,
  });
  await writeFile(join(root, 'profiles.json'), JSON.stringify(registry));
  await writeFile(join(root, 'default', 'state.json'), original);
  await writeFile(
    join(root, id, 'state.json'),
    JSON.stringify({ userId: id, revision: 2, data: state }),
  );
  const profiles = open();
  assert.deepEqual(await profiles.list(), registry);
  assert.equal((await profiles.read('default')).revision, 7);
  await profiles.update('default', 7, { ...state, history: {} });
  await profiles.delete(id);
  profiles.close();
  const bytes = await readFile(join(root, 'flashlab.sqlite'));
  assert.equal(bytes.subarray(0, 16).toString(), 'SQLite format 3\0');
  assert.equal(
    await readFile(join(root, 'default', 'state.json'), 'utf8'),
    original,
  );
  const restarted = open();
  assert.deepEqual(
    (await restarted.list()).map((profile) => profile.id),
    ['default'],
  );
  assert.equal((await restarted.read('default')).revision, 8);
  assert.deepEqual((await restarted.read('default')).data?.history, {});
});

test('one corrupt source rolls back migration; fixing it allows a complete retry', async (t) => {
  const { root, open } = await fixture(t);
  const id = '11111111-1111-4111-8111-111111111111';
  await mkdir(join(root, 'default'), { recursive: true });
  await mkdir(join(root, id), { recursive: true });
  await writeFile(
    join(root, 'profiles.json'),
    JSON.stringify([
      { id: 'default', name: 'Default', created: 1 },
      { id, name: 'Other', created: 2 },
    ]),
  );
  await writeFile(
    join(root, 'default', 'state.json'),
    JSON.stringify({ revision: 4, data: state }),
  );
  await writeFile(join(root, id, 'state.json'), 'broken');
  const profiles = open();
  await assert.rejects(profiles.list());
  assert.equal(
    profiles.database.db.prepare('SELECT count(*) count FROM profiles').get()
      ?.count,
    0,
  );
  assert.equal(profiles.database.migrated('profiles'), false);
  assert.equal(await readFile(join(root, id, 'state.json'), 'utf8'), 'broken');
  await writeFile(
    join(root, id, 'state.json'),
    JSON.stringify({ revision: 3, data: state }),
  );
  assert.equal((await profiles.list()).length, 2);
  assert.equal((await profiles.read('default')).revision, 4);
});

test('revision checks hold across independent SQLite connections and survive reopening', async (t) => {
  const { open } = await fixture(t);
  const first = open();
  const second = open();
  await Promise.all([first.list(), second.list()]);
  const results = await Promise.allSettled([
    first.update('default', 0, state),
    second.update('default', 0, { ...state, history: {} }),
  ]);
  assert.equal(
    results.filter((result) => result.status === 'fulfilled').length,
    1,
  );
  const rejected = results.find((result) => result.status === 'rejected');
  assert.ok(
    rejected?.status === 'rejected' && rejected.reason instanceof ConflictError,
  );
  first.close();
  second.close();
  assert.equal((await open().read('default')).revision, 1);
});

test('legacy blog articles migrate once with ownership/revisions intact and are not resurrected after deletion', async (t) => {
  const { root, open } = await fixture(t);
  const directory = join(root, 'blog');
  await mkdir(directory, { recursive: true });
  const article = {
    id: '11111111-1111-4111-8111-111111111111',
    author: 'Default',
    ownerId: 'default',
    title: 'Old post',
    markdown: '# Hello',
    revision: 3,
    created: 1,
    updated: 2,
  };
  const original = JSON.stringify([article]);
  await writeFile(join(directory, 'index.json'), original);
  const profiles = open();
  await profiles.list();
  const blog = new BlogStore(directory, profiles.database);
  assert.deepEqual(await blog.list(), [article]);
  await assert.rejects(blog.delete(article.id, 'someone-else', 3));
  await assert.rejects(blog.delete(article.id, 'default', 2), ConflictError);
  await blog.delete(article.id, 'default', 3);
  profiles.close();
  assert.deepEqual(await new BlogStore(directory, open().database).list(), []);
  assert.equal(await readFile(join(directory, 'index.json'), 'utf8'), original);
});

test('an unreadable database is rejected without replacing its contents', async (t) => {
  const { root, open } = await fixture(t);
  await mkdir(root, { recursive: true });
  await writeFile(join(root, 'flashlab.sqlite'), 'not-a-database');
  await assert.rejects(open().list());
  assert.equal(
    await readFile(join(root, 'flashlab.sqlite'), 'utf8'),
    'not-a-database',
  );
});
