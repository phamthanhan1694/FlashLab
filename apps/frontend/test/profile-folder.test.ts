import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readProfileFolder } from '../src/features/profiles/profile-folder';

const file = (path: string, text: string): File =>
  ({
    name: path.split('/').at(-1)!,
    webkitRelativePath: path,
    size: new TextEncoder().encode(text).length,
    text: async () => text,
  }) as File;

test('CSV folder creates one user and one deck per CSV with unknown cards', async () => {
  const result = await readProfileFolder([
    file('An/English.csv', 'front,back\nhello,xin chào'),
    file('An/sub/Math.csv', 'front,back\n1+1,2'),
  ]);
  assert.equal(result.profile.name, 'An');
  assert.equal(result.data.decks.length, 2);
  assert.equal(result.data.decks[0].cards[0].remembered, false);
  assert.equal(result.data.decks[0].cards[0].starred, false);
});

test('incomplete user metadata and duplicate CSV terms reject the whole folder', async () => {
  await assert.rejects(
    readProfileFolder([file('An/user.json', '{}')]),
    /state.json/,
  );
  await assert.rejects(
    readProfileFolder([
      file('An/English.csv', 'front,back\nhello,a\n HELLO ,b'),
    ]),
  );
});
