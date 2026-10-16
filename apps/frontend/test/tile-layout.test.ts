import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tilePageCapacity } from '../src/ui/tile-settings';
test('collection pages contain two complete rows for the available width and selected size', () => {
  assert.equal(tilePageCapacity(944, 'medium'), 8);
  assert.equal(tilePageCapacity(944, 'small'), 10);
  assert.equal(tilePageCapacity(944, 'large'), 6);
  assert.equal(tilePageCapacity(500, 'medium'), 4);
  assert.equal(tilePageCapacity(180, 'large'), 2);
  assert.equal(tilePageCapacity(0, 'small'), 2);
});
