import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesMemoryFilter } from '../src/features/study/memory-filter';
test('memory selection distinguishes explicit remembered marks, including older unmarked cards', () => {
  const cards = [{ remembered: true }, { remembered: false }, {}];
  assert.equal(
    cards.filter((card) => matchesMemoryFilter(card, 'all')).length,
    3,
  );
  assert.deepEqual(
    cards.filter((card) => matchesMemoryFilter(card, 'remembered')),
    [cards[0]],
  );
  assert.deepEqual(
    cards.filter((card) => matchesMemoryFilter(card, 'unremembered')),
    [cards[1], cards[2]],
  );
  assert.equal(matchesMemoryFilter(undefined, 'all'), false);
});
