import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cardSchema,
  cardDefinitions,
  cardSenses,
  definitionChoices,
  isDefinition,
  stateSchema,
} from '@flashlab/shared';
import { parseDelimited } from '../src/core/csv';

const card = cardSchema.parse({
  id: '1',
  front: 'bank',
  back: 'ngân hàng',
  definitions: ['bờ sông', '  Ngân hàng  '],
});
test('any individual saved definition is correct, without accepting arbitrary partial matches', () => {
  assert.deepEqual(cardDefinitions(card), ['ngân hàng', 'bờ sông']);
  assert.equal(isDefinition(card, ' BỜ   SÔNG '), true);
  assert.equal(isDefinition(card, 'ngân hàng'), true);
  assert.equal(isDefinition(card, 'bờ'), false);
  assert.equal(isDefinition(card, 'ngân hàng, bờ sông'), false);
});
test('multiple-choice questions show exactly one accepted definition even when other cards share meanings', () => {
  const candidates = [
    card,
    cardSchema.parse({
      id: '2',
      front: 'shore',
      back: 'bờ sông',
      definitions: ['bãi biển'],
    }),
    cardSchema.parse({ id: '3', front: 'house', back: 'nhà' }),
  ];
  for (const random of [() => 0, () => 0.9]) {
    const choices = definitionChoices(card, candidates, random);
    assert.equal(
      choices.filter((choice) => isDefinition(card, choice)).length,
      1,
    );
    assert.ok(choices.length <= 4);
  }
});
test('alternative definitions survive state backups and CSV round trips; old single-definition cards still work', () => {
  const state = stateSchema.parse({
    version: 2,
    decks: [{ id: 'd', title: 'Test', created: 1, cards: [card] }],
  });
  assert.deepEqual(
    stateSchema.parse(JSON.parse(JSON.stringify(state))).decks[0].cards[0]
      .definitions,
    card.definitions,
  );
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  const csv =
    'front,back,definitions\n' +
    [card.front, card.back, JSON.stringify(card.definitions)]
      .map(quote)
      .join(',');
  const row = parseDelimited(csv)[0];
  assert.deepEqual(JSON.parse(row[6]), card.definitions);
  assert.deepEqual(
    cardDefinitions(cardSchema.parse({ id: 'old', front: 'one', back: 'một' })),
    ['một'],
  );
});

test('word classes stay paired with meanings through validation and CSV import', () => {
  const paired = cardSchema.parse({
    id: 'paired',
    front: 'book',
    back: 'sách',
    partOfSpeech: 'Noun',
    definitions: [
      { meaning: 'đặt chỗ', partOfSpeech: 'Verb' },
      { meaning: 'sách', partOfSpeech: 'Verb' },
    ],
  });
  assert.deepEqual(cardSenses(paired), [
    { meaning: 'sách', partOfSpeech: 'Noun' },
    { meaning: 'đặt chỗ', partOfSpeech: 'Verb' },
    { meaning: 'sách', partOfSpeech: 'Verb' },
  ]);
  assert.deepEqual(cardDefinitions(paired), ['sách', 'đặt chỗ']);
  assert.equal(isDefinition(paired, 'đặt chỗ'), true);
  assert.equal(isDefinition(paired, 'Verb'), false);
  const quote = (value: string) => '"' + value.replace(/"/g, '""') + '"';
  const row = parseDelimited(
    'front,back,partOfSpeech,definitions\n' +
      [
        paired.front,
        paired.back,
        paired.partOfSpeech!,
        JSON.stringify(paired.definitions),
      ]
        .map(quote)
        .join(','),
  )[0];
  assert.deepEqual(JSON.parse(row[6]), paired.definitions);
  assert.equal(row[5], 'Noun');
  assert.equal(
    definitionChoices(paired, [paired]).filter((value) =>
      isDefinition(paired, value),
    ).length,
    1,
  );
});

test('canonical CSV preserves every word-class/meaning pair and reading metadata', async () => {
  const { cardsToCsv } = await import('@flashlab/shared');
  const paired = cardSchema.parse({
    id: 'csv-pairs',
    front: 'book',
    back: 'sách',
    partOfSpeech: 'Noun',
    pronunciation: '/bʊk/',
    notes: 'a, note',
    speechLanguage: 'en-GB',
    definitions: [{ meaning: 'đặt chỗ', partOfSpeech: 'Verb' }],
  });
  const row = parseDelimited(cardsToCsv([paired]))[0];
  assert.deepEqual(row.slice(0, 6), [
    'book',
    'sách',
    '/bʊk/',
    'a, note',
    'en-GB',
    'Noun',
  ]);
  assert.deepEqual(JSON.parse(row[6]), [
    { meaning: 'đặt chỗ', partOfSpeech: 'Verb' },
  ]);
  const legacy = cardSchema.parse({ ...paired, definitions: ['quyển sách'] });
  assert.deepEqual(JSON.parse(parseDelimited(cardsToCsv([legacy]))[0][6]), [
    { meaning: 'quyển sách', partOfSpeech: 'Noun' },
  ]);
});
