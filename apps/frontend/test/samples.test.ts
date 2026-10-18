import { test } from 'node:test';
import assert from 'node:assert/strict';
import { uniqueStateSchema } from '@flashlab/shared';
import { samples } from '../src/data/samples';

test('sample data can be saved and starts with unstudied vocabulary', () => {
  const data = uniqueStateSchema.parse(samples());
  assert.ok(data.decks.length > 0);
  for (const deck of data.decks) {
    assert.ok(deck.cards.length >= 6);
    for (const card of deck.cards) {
      assert.equal(card.level, 0);
      assert.equal(card.correct, 0);
      assert.equal(card.wrong, 0);
      assert.equal(card.last, 0);
      assert.equal(card.due, 0);
    }
  }
  assert.deepEqual(data.history, {});
  assert.deepEqual(data.sessions, []);
});

test('sample data does not share IDs or mutable state between profiles', () => {
  const first = samples();
  const second = samples();
  const firstIds = new Set(
    first.decks.flatMap((deck) => [
      deck.id,
      ...deck.cards.map((card) => card.id),
    ]),
  );
  for (const deck of second.decks) {
    assert.equal(firstIds.has(deck.id), false);
    for (const card of deck.cards) assert.equal(firstIds.has(card.id), false);
  }
  first.decks[0].cards[0].back = 'changed';
  assert.notEqual(second.decks[0].cards[0].back, 'changed');
});
