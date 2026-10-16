import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterSessionDates } from '../src/features/activity/history';

test('date filters include the complete first and last local calendar days', () => {
  const sessions = [
    { id: 'before', date: new Date(2026, 9, 12, 23, 59).getTime() },
    { id: 'first', date: new Date(2026, 9, 13, 0, 0).getTime() },
    { id: 'last', date: new Date(2026, 9, 15, 23, 59, 59).getTime() },
    { id: 'after', date: new Date(2026, 9, 16, 0, 0).getTime() },
  ];
  assert.deepEqual(
    filterSessionDates(sessions, '2026-10-13', '2026-10-15').map((s) => s.id),
    ['first', 'last'],
  );
  assert.equal(filterSessionDates(sessions).length, 4);
  assert.deepEqual(
    filterSessionDates(sessions, '', '2026-10-12').map((s) => s.id),
    ['before'],
  );
  assert.deepEqual(
    filterSessionDates(sessions, '2026-10-16', '').map((s) => s.id),
    ['after'],
  );
  assert.deepEqual(
    filterSessionDates(sessions, '2027-01-01', '2027-12-31'),
    [],
  );
});
