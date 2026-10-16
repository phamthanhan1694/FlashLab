import { dateKey } from '../../core/utils';

function previousDay(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return dateKey(new Date(year, month - 1, day - 1).getTime());
}

export function studyInsights(
  history: Record<string, number>,
  now = new Date(),
) {
  const today = dateKey(now.getTime());
  const active = Object.keys(history)
    .filter((key) => key <= today && history[key] > 0)
    .sort();
  const days = new Set(active);
  let current = 0;
  let cursor = days.has(today) ? today : previousDay(today);
  while (days.has(cursor)) {
    current++;
    cursor = previousDay(cursor);
  }
  let longest = 0;
  let run = 0;
  let previous = '';
  for (const key of active) {
    run = previousDay(key) === previous ? run + 1 : 1;
    longest = Math.max(longest, run);
    previous = key;
  }
  const week = [];
  cursor = today;
  for (let i = 0; i < 7; i++) {
    week.unshift({ key: cursor, count: history[cursor] || 0 });
    cursor = previousDay(cursor);
  }
  return {
    current,
    longest,
    studiedToday: days.has(today),
    week,
    weeklyDays: week.filter((day) => day.count > 0).length,
    weeklyAnswers: week.reduce((sum, day) => sum + day.count, 0),
  };
}
