import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardSchema } from '@flashlab/shared';
import {
  importConflicts,
  resolveImportedCards,
  type ImportChoice,
} from '../src/core/import-plan';
const card = (id: string, front: string, back = 'meaning') =>
  cardSchema.parse({ id, front, back });
test('detect duplicates against saved cards and within a batch using normalized terms', () => {
  const existing = [card('old', 'Bank')];
  const incoming = [card('a', ' bank '), card('b', 'new'), card('c', 'NEW')];
  assert.deepEqual(
    importConflicts(existing, incoming).map((item) => item.index),
    [0, 2],
  );
  const choices = new Map<number, ImportChoice>([
    [0, { action: 'skip' }],
    [2, { action: 'skip' }],
  ]);
  const result = resolveImportedCards(existing, incoming, choices);
  assert.equal(result.added, 1);
  assert.equal(result.skipped, 2);
  assert.equal(result.cards.length, 2);
  assert.equal(existing.length, 1);
});
test('overwriting retains identity and star while replacing meanings and resetting study progress', () => {
  const existing = [
    cardSchema.parse({
      ...card('old', 'Bank'),
      level: 4,
      correct: 20,
      starred: true,
    }),
  ];
  const incoming = [
    cardSchema.parse({
      ...card('new', 'bank', 'ngân hàng'),
      partOfSpeech: 'Noun',
      definitions: [{ meaning: 'nghiêng', partOfSpeech: 'Verb' }],
    }),
  ];
  const result = resolveImportedCards(
    existing,
    incoming,
    new Map([[0, { action: 'overwrite' }]]),
  );
  assert.equal(result.cards[0].id, 'old');
  assert.equal(result.cards[0].starred, true);
  assert.equal(result.cards[0].level, 0);
  assert.deepEqual(result.cards[0].definitions, incoming[0].definitions);
  assert.equal(result.replaced, 1);
  assert.equal(existing[0].level, 4);
});
test('editing a duplicate adds a distinct card; unresolved collisions and blanks do not mutate stored cards', () => {
  const existing = [card('old', 'bank')],
    incoming = [card('new', 'Bank')];
  const result = resolveImportedCards(
    existing,
    incoming,
    new Map([[0, { action: 'edit', front: 'shore', back: 'bờ sông' }]]),
  );
  assert.equal(result.added, 1);
  assert.equal(result.cards[1].front, 'shore');
  assert.throws(
    () =>
      resolveImportedCards(
        existing,
        incoming,
        new Map([[0, { action: 'edit', front: 'BANK', back: 'new' }]]),
      ),
    /bị trùng/,
  );
  assert.throws(
    () =>
      resolveImportedCards(
        existing,
        incoming,
        new Map([[0, { action: 'edit', front: ' ', back: 'new' }]]),
      ),
    /để trống/,
  );
  assert.equal(existing.length, 1);
  assert.equal(existing[0].back, 'meaning');
});

test('merging pairs preserves saved progress and populated fields, canonicalizes POS aliases, and keeps distinct word classes', () => {
  const old = cardSchema.parse({
    ...card('old', 'Bank', 'ngân hàng'),
    partOfSpeech: 'Noun',
    level: 4,
    correct: 20,
    remembered: true,
    starred: true,
    due: 12345,
    notes: 'Keep this',
    masteryProgress: { correct: 3, modes: ['write'], testCorrect: 0 },
    definitions: [{ meaning: 'bờ sông', partOfSpeech: 'Noun' }],
  });
  const incoming = cardSchema.parse({
    ...card('new', ' bank ', 'NGÂN HÀNG'),
    partOfSpeech: 'n.',
    pronunciation: '/bæŋk/',
    notes: 'New note',
    definitions: [
      { meaning: 'bờ sông', partOfSpeech: 'n.' },
      { meaning: 'nghiêng', partOfSpeech: 'v.' },
      { meaning: 'ngân hàng', partOfSpeech: 'v.' },
    ],
  });
  const merged = resolveImportedCards(
    [old],
    [incoming],
    new Map([[0, { action: 'merge' }]]),
  );
  assert.equal(merged.cards.length, 1);
  assert.equal(merged.merged, 1);
  const result = merged.cards[0];
  assert.equal(result.id, old.id);
  assert.equal(result.front, old.front);
  assert.equal(result.level, 4);
  assert.equal(result.correct, 20);
  assert.equal(result.due, 12345);
  assert.equal(result.remembered, true);
  assert.equal(result.starred, true);
  assert.deepEqual(result.masteryProgress, old.masteryProgress);
  assert.equal(result.notes, 'Keep this');
  assert.equal(result.pronunciation, '/bæŋk/');
  assert.equal(result.definitions?.length, 3);
  assert.equal(old.definitions?.length, 1);
});
test('repeated terms in one import can merge into a single new card', () => {
  const result = resolveImportedCards(
    [],
    [card('a', 'book', 'sách'), card('b', 'BOOK', 'đặt chỗ')],
    new Map([[1, { action: 'merge' }]]),
  );
  assert.equal(result.added, 1);
  assert.equal(result.merged, 1);
  assert.equal(result.cards.length, 1);
  assert.equal(result.cards[0].definitions?.length, 1);
});
test('merge capacity failures leave saved cards unchanged', () => {
  const old = cardSchema.parse({
    ...card('old', 'word'),
    definitions: Array.from({ length: 19 }, (_, i) => 'meaning ' + i),
  });
  assert.throws(
    () =>
      resolveImportedCards(
        [old],
        [card('new', 'word', 'extra')],
        new Map([[0, { action: 'merge' }]]),
      ),
    /20 nghĩa/,
  );
  assert.equal(old.definitions?.length, 19);
});

test('edited duplicates save all sense pairs and metadata while choosing overwrite or merge', () => {
  const old = cardSchema.parse({
    ...card('old', 'bank'),
    level: 3,
    starred: true,
  });
  const original = card('incoming', 'bank');
  const draft = cardSchema.parse({
    ...original,
    back: 'ngân hàng',
    partOfSpeech: 'Noun',
    definitions: [{ meaning: 'nghiêng', partOfSpeech: 'Verb' }],
    pronunciation: '/bæŋk/',
    notes: 'edited',
    speechLanguage: 'en-GB',
  });
  const overwritten = resolveImportedCards(
    [old],
    [original],
    new Map([[0, { action: 'edit', draft, editMode: 'overwrite' }]]),
  );
  assert.equal(overwritten.replaced, 1);
  assert.equal(overwritten.cards[0].id, 'old');
  assert.equal(overwritten.cards[0].level, 0);
  assert.equal(overwritten.cards[0].starred, true);
  assert.deepEqual(overwritten.cards[0].definitions, draft.definitions);
  assert.equal(overwritten.cards[0].notes, 'edited');
  assert.equal(overwritten.cards[0].speechLanguage, 'en-GB');
  const merged = resolveImportedCards(
    [old],
    [original],
    new Map([[0, { action: 'edit', draft, editMode: 'merge' }]]),
  );
  assert.equal(merged.merged, 1);
  assert.equal(merged.cards[0].level, 3);
  assert.equal(merged.cards[0].definitions?.length, 2);
  assert.equal(old.back, 'meaning');
  assert.equal(original.definitions, undefined);
});
test('edited overwrite checks renamed collisions and validates every meaning before saving', () => {
  const old = card('old', 'bank'),
    original = card('incoming', 'bank');
  assert.throws(
    () =>
      resolveImportedCards(
        [old, card('other', 'book')],
        [original],
        new Map([
          [
            0,
            {
              action: 'edit',
              draft: { ...original, front: 'book' },
              editMode: 'overwrite',
            },
          ],
        ]),
      ),
    /bị trùng/,
  );
  assert.throws(
    () =>
      resolveImportedCards(
        [old],
        [original],
        new Map([
          [
            0,
            {
              action: 'edit',
              draft: {
                ...original,
                definitions: [{ meaning: ' ', partOfSpeech: 'Verb' }],
              },
              editMode: 'overwrite',
            },
          ],
        ]),
      ),
    /Mỗi định nghĩa/,
  );
  const result = resolveImportedCards(
    [old],
    [original, card('next', 'shore')],
    new Map([
      [
        0,
        {
          action: 'edit',
          draft: { ...original, front: 'shore' },
          editMode: 'overwrite',
        },
      ],
      [1, { action: 'merge' }],
    ]),
  );
  assert.equal(result.cards.length, 1);
  assert.equal(result.cards[0].front, 'shore');
  assert.equal(result.merged, 1);
});
