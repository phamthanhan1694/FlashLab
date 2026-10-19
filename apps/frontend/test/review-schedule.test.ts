import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  cardSchema,
  deckSchema,
  srsPreferencesSchema,
  preferencesSchema,
  scheduledDue,
  reviewCard,
} from '@flashlab/shared';
import { reviewSchedule } from '../src/features/study/review-schedule';

const config = {
  intervals: [2, 4, 8, 16, 32, 64] as [
    number,
    number,
    number,
    number,
    number,
    number,
  ],
  retryMinutes: 10,
};

test('partial progress survives days and schedules a correct answer from its resulting level, while overdue cards stay due', () => {
  const now = new Date(2026, 9, 19, 23, 59).getTime();
  const card = cardSchema.parse({
    id: 'partial',
    front: 'book',
    back: 'sách',
    level: 3,
    masteryProgress: {
      correct: 2,
      modes: ['learn'],
      testCorrect: 0,
      modeCorrect: { learn: 2 },
    },
  });
  const answered = reviewCard(card, true, now, undefined, 'write');
  assert.equal(answered.level, 3);
  assert.equal(answered.masteryProgress?.correct, 3);
  assert.equal(answered.due, now + 7 * 86400000);
  const deck = deckSchema.parse({
    id: 'deck',
    title: 'Partial',
    created: 1,
    cards: [answered],
  });
  const dayAfterDue = answered.due + 86400000;
  assert.equal(reviewSchedule([deck], dayAfterDue).due[0].card.id, 'partial');
  assert.equal(deck.cards[0].masteryProgress?.correct, 3);
});
test('custom SRS intervals affect correct and incorrect answers without dropping metadata', () => {
  const now = new Date(2026, 9, 14, 10).getTime();
  let card = cardSchema.parse({
    id: 'a',
    front: 'book',
    back: 'sách',
    suspended: true,
    partOfSpeech: 'Noun',
  });
  for (const [index, days] of [2, 4, 8, 16, 32, 64, 64].entries()) {
    card = {
      ...card,
      level: Math.min(index + 1, 6),
      masteryProgress: undefined,
    };
    card = reviewCard(card, true, now, config);
    assert.equal(card.due, now + days * 86400000);
    assert.equal(card.suspended, true);
  }
  const wrong = reviewCard(card, false, now, config);
  assert.equal(wrong.due, now + 600000);
  assert.equal(wrong.level, 5);
  assert.equal(wrong.correct, 7);
  assert.equal(wrong.wrong, 1);
  assert.equal(wrong.partOfSpeech, 'Noun');
  assert.equal(scheduledDue({ last: 0, level: 0 }, config), 0);
  assert.equal(preferencesSchema.parse({ srs: config }).srs?.retryMinutes, 10);
  for (const intervals of [
    [1, 1, 3, 4, 5, 6],
    [3, 2, 4, 5, 6, 7],
    [0, 2, 3, 4, 5, 6],
    [1, 2, 3, 4, 5],
    [1, 2.5, 3, 4, 5, 6],
  ])
    assert.equal(
      srsPreferencesSchema.safeParse({ ...config, intervals }).success,
      false,
    );
  assert.equal(
    srsPreferencesSchema.safeParse({ ...config, retryMinutes: 0 }).success,
    false,
  );
});

test('forecast separates due now, later today and upcoming dates and excludes paused cards', () => {
  const now = new Date(2026, 9, 14, 10).getTime();
  const later = new Date(2026, 9, 14, 20).getTime();
  const tomorrow = new Date(2026, 9, 15, 0).getTime();
  const deck = deckSchema.parse({
    id: 'deck',
    title: 'English',
    created: now,
    cards: [
      { id: 'new', front: 'new', back: 'mới' },
      {
        id: 'late',
        front: 'late',
        back: 'trễ',
        last: now - 100000,
        due: now - 1,
      },
      { id: 'later', front: 'later', back: 'sau', last: now, due: later },
      { id: 'next', front: 'next', back: 'kế', last: now, due: tomorrow },
      { id: 'paused', front: 'pause', back: 'dừng', suspended: true },
      {
        id: 'scheduled-new',
        front: 'scheduled',
        back: 'đã lên lịch',
        due: tomorrow,
      },
    ],
  });
  const result = reviewSchedule([deck], now, 14);
  assert.deepEqual(
    result.due.map(({ card }) => card.id),
    ['new', 'late'],
  );
  assert.deepEqual(
    result.calendar[0].items.map(({ card }) => card.id),
    ['new', 'late', 'later'],
  );
  assert.deepEqual(
    result.calendar[1].items.map(({ card }) => card.id),
    ['next', 'scheduled-new'],
  );
  assert.equal(result.paused.length, 1);
  assert.equal(result.calendar.length, 14);
  assert.equal(reviewSchedule([], now).due.length, 0);
});

test('mastery requires escalating practice, all modes and tests at higher levels', () => {
  let card = cardSchema.parse({ id: 'mastery', front: 'a', back: 'b' });
  card = reviewCard(card, true, 1000);
  assert.equal(card.level, 0);
  card = reviewCard(card, true, 2000);
  card = reviewCard(card, true, 3000);
  assert.equal(card.level, 1);
  assert.equal(card.masteryProgress?.correct, 0);
  for (let i = 0; i < 5; i++) card = reviewCard(card, true, 4000);
  assert.equal(card.level, 2);
  for (let i = 0; i < 12; i++) card = reviewCard(card, true, 5000);
  assert.equal(card.level, 2);
  card = reviewCard(card, true, 6000, undefined, 'learn');
  card = reviewCard(card, true, 7000, undefined, 'write');
  assert.equal(card.level, 2);
  card = reviewCard(card, true, 8000, undefined, 'test');
  assert.equal(card.level, 3);
  for (let i = 0; i < 12; i++)
    card = reviewCard(card, true, 9000, undefined, 'test');
  assert.equal(card.level, 3);
  for (const mode of ['learn', 'write', 'match', 'review'] as const)
    card = reviewCard(card, true, 10000, undefined, mode);
  assert.equal(card.level, 4);
  for (let i = 0; i < 18; i++)
    card = reviewCard(card, true, 10001, undefined, 'learn');
  for (const mode of ['flashcards', 'write', 'match', 'test'] as const)
    card = reviewCard(card, true, 10002, undefined, mode);
  assert.equal(card.level, 4, 'level 5 requires two correct test answers');
  card = reviewCard(card, true, 10003, undefined, 'test');
  assert.equal(card.level, 5);
  for (let i = 0; i < 25; i++)
    card = reviewCard(card, true, 10004, undefined, 'learn');
  for (const mode of ['flashcards', 'write', 'match', 'test', 'test'] as const)
    card = reviewCard(card, true, 10005, undefined, mode);
  assert.equal(card.level, 5, 'level 6 requires three correct test answers');
  card = reviewCard(card, true, 10006, undefined, 'test');
  assert.equal(card.level, 6);
  card = reviewCard(card, true, 10007, undefined, 'test');
  assert.equal(card.level, 6);
  const persisted = cardSchema.parse(card);
  assert.deepEqual(persisted.masteryProgress, card.masteryProgress);
  const wrong = reviewCard(card, false, 11000);
  assert.equal(wrong.level, 5);
  assert.equal(wrong.masteryProgress?.correct, 0);
  assert.deepEqual(wrong.masteryProgress?.modes, []);
});

test('per-mode progress counts survive saves, subtract only the current mode and reset on promotion', () => {
  let card = cardSchema.parse({
    id: 'counts',
    front: 'book',
    back: 'sách',
    level: 2,
  });
  card = reviewCard(card, true, 1, undefined, 'learn');
  card = reviewCard(card, true, 2, undefined, 'learn');
  card = reviewCard(card, true, 3, undefined, 'review');
  card = reviewCard(card, true, 4, undefined, 'test');
  assert.deepEqual(cardSchema.parse(card).masteryProgress?.modeCorrect, {
    learn: 2,
    flashcards: 1,
    test: 1,
  });
  assert.equal(
    reviewCard(card, false, 5).masteryProgress?.modeCorrect?.learn ?? 0,
    2,
  );
  for (let i = 0; i < 4; i++)
    card = reviewCard(card, true, 6 + i, undefined, 'write');
  assert.equal(card.level, 3);
  assert.deepEqual(card.masteryProgress?.modeCorrect, {});
});

test('incorrect answers deduct one point, revoke mode credit and lower only one level after zero', () => {
  const original = cardSchema.parse({
    id: 'penalty',
    front: 'a',
    back: 'b',
    level: 3,
    masteryProgress: {
      correct: 3,
      modes: ['learn', 'test'],
      testCorrect: 1,
      modeCorrect: { learn: 2, test: 1 },
    },
  });
  let card = reviewCard(original, false, 1000, undefined, 'test');
  assert.equal(card.level, 3);
  assert.equal(card.masteryProgress?.correct, 2);
  assert.equal(card.masteryProgress?.testCorrect, 0);
  assert.deepEqual(card.masteryProgress?.modes, ['learn']);
  assert.equal(card.masteryProgress?.modeCorrect?.learn, 2);
  assert.equal(card.correct, 0);
  assert.equal(card.wrong, 1);
  assert.equal(card.due, 301000);
  assert.equal(original.masteryProgress?.correct, 3);
  assert.equal(original.masteryProgress?.modeCorrect?.test, 1);
  card = reviewCard(card, false, 2000, undefined, 'learn');
  assert.equal(card.masteryProgress?.correct, 1);
  card = reviewCard(card, false, 3000, undefined, 'learn');
  assert.equal(card.level, 3);
  assert.equal(card.masteryProgress?.correct, 0);
  assert.deepEqual(card.masteryProgress?.modeCorrect, {});
  card = reviewCard(card, false, 4000);
  assert.equal(card.level, 2);
  for (let i = 0; i < 10; i++) card = reviewCard(card, false, 5000 + i);
  assert.equal(card.level, 0);
  assert.equal(card.masteryProgress?.correct, 0);
});

test('legacy mode credits and review alias are decremented without mutating the card', () => {
  const card = cardSchema.parse({
    id: 'old',
    front: 'a',
    back: 'b',
    level: 2,
    masteryProgress: {
      correct: 4,
      modes: ['flashcards', 'test'],
      testCorrect: 2,
    },
  });
  const next = reviewCard(card, false, 1000, undefined, 'review');
  assert.deepEqual(next.masteryProgress?.modes, ['test']);
  assert.equal(next.masteryProgress?.testCorrect, 2);
  assert.equal(next.masteryProgress?.correct, 3);
  assert.deepEqual(card.masteryProgress?.modes, ['flashcards', 'test']);
});
