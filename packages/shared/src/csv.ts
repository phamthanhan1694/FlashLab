import type { Card } from './index.js';
import { cardSenses } from './definitions.js';
/** One row per card, with all meaning/word-class pairs in one definition field. */
export function cardsToRows(cards: readonly Card[]): string[][] {
  return [
    ['front', 'definition', 'pronunciation', 'notes', 'image'],
    ...cards.map((card) => [
      card.front,
      cardSenses(card).length === 1 &&
      !card.partOfSpeech &&
      !/[|]|::|^\[/.test(card.back)
        ? card.back
        : JSON.stringify(cardSenses(card)),
      card.speechLanguage
        ? JSON.stringify({
            text: card.pronunciation ?? '',
            language: card.speechLanguage,
          })
        : (card.pronunciation ?? ''),
      card.notes ?? '',
      card.image ?? '',
    ]),
  ];
}
export function cardsToCsv(cards: readonly Card[]): string {
  const [header, ...rows] = cardsToRows(cards);
  const quote = (value: string) => `"${value.replace(/"/g, '""')}"`;
  return (
    '\uFEFF' +
    [header!.join(','), ...rows.map((row) => row.map(quote).join(','))].join(
      '\r\n',
    ) +
    '\r\n'
  );
}
