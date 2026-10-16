import type { Deck } from '@flashlab/shared';
import { dateKey } from '../../core/utils';

export function reviewSchedule(
  decks: readonly Deck[],
  now = Date.now(),
  days = 14,
) {
  const entries = decks.flatMap((deck) =>
    deck.cards.map((card) => ({ deck, card })),
  );
  const active = entries.filter(({ card }) => !card.suspended);
  const due = active.filter(({ card }) => !card.due || card.due <= now);
  const calendar = Array.from({ length: days }, (_, offset) => {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + offset);
    const start = date.getTime();
    date.setDate(date.getDate() + 1);
    const end = date.getTime();
    return {
      key: dateKey(start),
      start,
      end,
      items: active.filter(({ card }) =>
        offset === 0
          ? !card.due || card.due < end
          : card.due >= start && card.due < end,
      ),
    };
  });
  return {
    entries,
    active,
    due,
    calendar,
    paused: entries.filter(({ card }) => card.suspended),
  };
}
