import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reorderItems } from '../src/core/reorder';
test('reorder preserves entries and hidden positions, supports both directions and does not mutate input', () => {
  const items = ['a', 'b', 'hidden', 'c'].map((id) => ({ id }));
  assert.deepEqual(
    reorderItems(items, 'a', 'c', true).map((x) => x.id),
    ['b', 'hidden', 'c', 'a'],
  );
  assert.deepEqual(
    reorderItems(items, 'c', 'a').map((x) => x.id),
    ['c', 'a', 'b', 'hidden'],
  );
  assert.deepEqual(reorderItems(items, 'a', 'missing'), items);
  assert.deepEqual(
    items.map((x) => x.id),
    ['a', 'b', 'hidden', 'c'],
  );
});
