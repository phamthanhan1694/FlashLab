import { test } from 'node:test';
import assert from 'node:assert/strict';
import { studyInsights } from '../src/features/activity/study-insights';

test('current streak includes yesterday until today ends and ignores future activity', () => {
  const history = {
    '2026-12-30': 2,
    '2026-12-31': 3,
    '2027-01-01': 4,
    '2027-01-03': 10,
  };
  const result = studyInsights(history, new Date(2027, 0, 2));
  assert.equal(result.current, 3);
  assert.equal(result.longest, 3);
  assert.equal(result.studiedToday, false);
  assert.equal(result.weeklyDays, 3);
  assert.equal(result.weeklyAnswers, 9);
  assert.equal(result.week.at(-1)?.key, '2027-01-02');
  assert.equal(studyInsights(history, new Date(2027, 0, 5)).current, 0);
});

test('longest streak handles leap days, gaps, zero activity and empty history', () => {
  const result = studyInsights(
    {
      '2024-02-28': 1,
      '2024-02-29': 2,
      '2024-03-01': 3,
      '2024-03-02': 0,
      '2024-03-03': 1,
    },
    new Date(2024, 2, 3),
  );
  assert.equal(result.current, 1);
  assert.equal(result.longest, 3);
  assert.equal(result.studiedToday, true);
  assert.equal(studyInsights({}, new Date(2024, 2, 3)).longest, 0);
});
