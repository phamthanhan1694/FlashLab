import {
  defaultSrsPreferences,
  type Card,
  type StudyMode,
  type SrsPreferences,
} from './index.js';

export function scheduledDue(
  card: Pick<Card, 'last' | 'level'>,
  settings: SrsPreferences = defaultSrsPreferences,
): number {
  if (!card.last) return 0;
  return (
    card.last +
    (card.level === 0
      ? settings.retryMinutes * 60000
      : settings.intervals[card.level - 1] * 86400000)
  );
}

export function masteryRequirements(level: number) {
  const target = Math.min(level + 1, 6);
  return {
    correct: [3, 5, 8, 12, 18, 25][target - 1]!,
    modes: (target >= 4
      ? ['flashcards', 'learn', 'write', 'match', 'test']
      : target >= 3
        ? ['learn', 'write', 'test']
        : []) as Array<'flashcards' | 'learn' | 'write' | 'match' | 'test'>,
    testCorrect: [0, 0, 1, 1, 2, 3][target - 1]!,
  };
}

/** Progress is earned separately at each level; review counts as flashcards. */
export function reviewCard(
  card: Card,
  correct: boolean,
  now = Date.now(),
  settings: SrsPreferences = defaultSrsPreferences,
  mode: StudyMode = 'review',
): Card {
  const progress: NonNullable<Card['masteryProgress']> = {
    ...(card.masteryProgress ?? { correct: 0, modes: [], testCorrect: 0 }),
    modes: [...(card.masteryProgress?.modes ?? [])],
    modeCorrect: { ...card.masteryProgress?.modeCorrect },
  };
  let level = card.level;
  if (!correct) {
    const category = mode === 'review' ? 'flashcards' : mode;
    if (progress.correct === 0) {
      level = Math.max(0, level - 1);
      progress.modes = [];
      progress.testCorrect = 0;
      progress.modeCorrect = {};
    } else {
      progress.correct--;
      const count =
        progress.modeCorrect?.[category] ??
        (category === 'test'
          ? progress.testCorrect
          : progress.modes.includes(category)
            ? 1
            : 0);
      progress.modeCorrect![category] = Math.max(0, count - 1);
      if (!progress.modeCorrect![category])
        progress.modes = progress.modes.filter((value) => value !== category);
      if (category === 'test')
        progress.testCorrect = Math.max(0, progress.testCorrect - 1);
      if (progress.correct === 0) {
        progress.modes = [];
        progress.testCorrect = 0;
        progress.modeCorrect = {};
      }
    }
  }
  if (correct && level < 6) {
    const category = mode === 'review' ? 'flashcards' : mode;
    progress.modeCorrect = { ...progress.modeCorrect };
    progress.modeCorrect[category] =
      (progress.modeCorrect[category] ??
        (category === 'test'
          ? progress.testCorrect
          : progress.modes.includes(category)
            ? 1
            : 0)) + 1;
    progress.correct++;
    if (!progress.modes.includes(category)) progress.modes.push(category);
    if (mode === 'test') progress.testCorrect++;
    const required = masteryRequirements(level);
    if (
      progress.correct >= required.correct &&
      progress.testCorrect >= required.testCorrect &&
      required.modes.every((value) => progress.modes.includes(value))
    ) {
      level++;
      progress.correct = 0;
      progress.modes = [];
      progress.testCorrect = 0;
      progress.modeCorrect = {};
    }
  }
  const next: Card = {
    ...card,
    level,
    masteryProgress: progress,
    last: now,
    correct: card.correct + (correct ? 1 : 0),
    wrong: card.wrong + (correct ? 0 : 1),
  };
  return {
    ...next,
    due: correct
      ? scheduledDue(next, settings)
      : now + settings.retryMinutes * 60000,
  };
}
