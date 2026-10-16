import { test } from 'node:test';
import assert from 'node:assert/strict';
import { personalNoteRequests } from '../src/features/blog/personal-notes';
import { stateSchema, type PersonalNote } from '@flashlab/shared';

const profile = { id: 'default', name: 'An', created: 1 };
const id = '11111111-1111-4111-8111-111111111111';
const write = (method: string, body: object) => ({
  method,
  body: JSON.stringify(body),
});

test('personal notes save in profile state, survive backup parsing, and never call the shared blog API', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => {
    throw Error('Personal content must not be sent to shared APIs');
  });
  let notes: PersonalNote[] = [];
  const request = personalNoteRequests(
    profile,
    () => notes,
    async (next) => {
      notes = next;
    },
  );
  const created = await request(
    '/api/blog',
    write('POST', {
      id,
      title: 'Private',
      markdown: '# My note\n```c++\nint main() {}\n```',
    }),
  );
  assert.equal(created.status, 200);
  assert.equal(notes[0].ownerId, profile.id);
  const backup = stateSchema.parse(
    JSON.parse(JSON.stringify({ version: 2, decks: [], notes })),
  );
  assert.deepEqual(backup.notes, notes);
  const other = personalNoteRequests(
    { id: '22222222-2222-4222-8222-222222222222', name: 'B', created: 1 },
    () => [],
    async () => {},
  );
  assert.deepEqual(await (await other('/api/blog')).json(), []);
  const conflict = await request(
    `/api/blog/${id}`,
    write('PUT', { title: 'Stale', markdown: 'Overwrite', revision: 0 }),
  );
  assert.equal(conflict.status, 409);
  assert.equal(notes[0].title, 'Private');
  assert.equal(
    (await request(`/api/blog/${id}`, write('DELETE', { revision: 0 }))).status,
    409,
  );
  assert.equal(
    (await request(`/api/blog/${id}`, write('DELETE', { revision: 1 }))).status,
    204,
  );
  assert.equal(notes.length, 0);
});

test('retrying an offline creation reuses its ID without duplicating the note', async () => {
  let notes: PersonalNote[] = [];
  let offline = true;
  const request = personalNoteRequests(
    profile,
    () => notes,
    async (next) => {
      notes = next;
      if (offline) throw Error('Offline, saved in browser');
    },
  );
  const body = { id, title: 'Draft', markdown: 'Keep me' };
  assert.equal((await request('/api/blog', write('POST', body))).status, 503);
  assert.equal(notes.length, 1);
  offline = false;
  assert.equal((await request('/api/blog', write('POST', body))).status, 200);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].markdown, 'Keep me');
});

test('personal note author can be edited without changing the owning profile and survives backup', async () => {
  let notes: PersonalNote[] = [];
  const request = personalNoteRequests(
    profile,
    () => notes,
    async (next) => {
      notes = next;
    },
  );
  await request(
    '/api/blog',
    write('POST', { id, title: 'Note', markdown: 'Text', author: 'Pen name' }),
  );
  assert.equal(notes[0].author, 'Pen name');
  const updated = await request(
    `/api/blog/${id}`,
    write('PUT', {
      revision: 1,
      title: 'Note',
      markdown: 'Text',
      author: 'New name',
      ownerId: 'another-profile',
    }),
  );
  assert.equal(updated.status, 200);
  assert.equal(notes[0].author, 'New name');
  assert.equal(notes[0].ownerId, profile.id);
  assert.equal(
    stateSchema.parse({ version: 2, decks: [], notes }).notes?.[0].author,
    'New name',
  );
});
