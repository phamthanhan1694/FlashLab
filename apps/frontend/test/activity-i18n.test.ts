import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  activityDays,
  activityIntensity,
} from '../src/features/activity/activity';
import { translateText } from '../src/core/i18n';

test('activity calendar aligns full weeks, distinguishes intensity and hides future days', () => {
  const days = activityDays(
    { '2026-10-13': 20, '2026-10-12': 9, '2026-10-11': 1, '2026-10-15': 99 },
    new Date(2026, 9, 13),
  );
  assert.equal(days.length % 7, 0);
  assert.ok(days.length >= 365);
  assert.equal(new Date(`${days[0].key}T12:00:00`).getDay(), 0);
  assert.equal(
    days.find((d) => d.key === '2026-10-13')?.intensity,
    activityIntensity(20),
  );
  assert.equal(
    days.find((d) => d.key === '2026-10-12')?.intensity,
    activityIntensity(9),
  );
  assert.equal(
    days.find((d) => d.key === '2026-10-11')?.intensity,
    activityIntensity(1),
  );
  assert.equal(days.find((d) => d.key === '2026-10-15')?.count, 0);
  assert.equal(days.find((d) => d.key === '2026-10-15')?.future, true);
});
test('English labels translate UI and counters while preserving answer text', () => {
  assert.equal(translateText('Kiểm', 'en'), 'Test');
  assert.equal(translateText('Ôn tập đến hạn', 'en'), 'Due reviews');
  assert.equal(translateText('Due reviews', 'vi'), 'Ôn tập đến hạn');
  assert.equal(translateText('Thẻ ghi nhớ', 'en'), 'Flashcards');
  assert.equal(translateText('2 / 16 câu đã trả lời', 'en'), '2 / 16 answered');
  assert.equal(
    translateText('Đáp án: Thư viện học phần', 'en'),
    'Answer: Thư viện học phần',
  );
  assert.equal(translateText('Kiểm', 'vi'), 'Kiểm');
});

test('annual calendar includes leap day and excludes adjacent-year answers; years begin at creation', async () => {
  const { activityYears } = await import('../src/features/activity/activity');
  const days = activityDays(
    { '2024-02-29': 7, '2023-12-31': 50, '2025-01-01': 50 },
    new Date(2026, 9, 13),
    2024,
  );
  assert.equal(days.filter((day) => !day.outside).length, 366);
  assert.equal(days.find((day) => day.key === '2024-02-29')?.count, 7);
  assert.equal(
    days.reduce((sum, day) => sum + day.count, 0),
    7,
  );
  assert.deepEqual(
    activityYears(new Date(2025, 3, 5).getTime(), new Date(2027, 1, 1)),
    [2025, 2026, 2027],
  );
});

test('month headers have twelve non-overlapping spans and January is not duplicated', async () => {
  const { activityHeatmap } = await import('../src/features/activity/activity');
  for (const year of [2024, 2025, 2026]) {
    const html = activityHeatmap({}, year, new Date(2024, 0, 1).getTime());
    const labels = [
      ...html.matchAll(/grid-column:(\d+) \/ span (\d+)">Tháng (\d+)/g),
    ];
    assert.equal(labels.length, 12);
    assert.deepEqual(
      labels.map((match) => Number(match[3])),
      Array.from({ length: 12 }, (_, i) => i + 1),
    );
    for (let i = 1; i < labels.length; i++)
      assert.equal(
        Number(labels[i - 1][1]) + Number(labels[i - 1][2]),
        Number(labels[i][1]),
      );
  }
});

test('activity color is continuous, monotonic, and stable when new days are added', async () => {
  const { activityHeatmap } = await import('../src/features/activity/activity');
  assert.ok(activityIntensity(20) < activityIntensity(270));
  for (let count = 0; count < 600; count++)
    assert.ok(activityIntensity(count + 1) > activityIntensity(count));
  assert.equal(activityIntensity(0), 0);
  assert.ok(activityIntensity(2700) < 1);
  const history = { '2026-10-13': 20 };
  const before = activityDays(history, new Date(2026, 9, 14)).find(
    (d) => d.key === '2026-10-13',
  )!.intensity;
  const after = activityDays(
    { ...history, '2026-10-14': 270 },
    new Date(2026, 9, 14),
  ).find((d) => d.key === '2026-10-13')!.intensity;
  assert.equal(before, after);
  assert.match(activityHeatmap({}), /activity-gradient/);
});
