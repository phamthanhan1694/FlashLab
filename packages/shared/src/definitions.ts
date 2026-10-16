import type { Card } from './index.js';
const normalized = (text: string) =>
  text.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
export function cardSenses(
  card: Pick<Card, 'back' | 'definitions' | 'partOfSpeech'>,
) {
  return [
    { meaning: card.back, partOfSpeech: card.partOfSpeech ?? '' },
    ...(card.definitions ?? []).map((value) =>
      typeof value === 'string'
        ? { meaning: value, partOfSpeech: card.partOfSpeech ?? '' }
        : { meaning: value.meaning, partOfSpeech: value.partOfSpeech ?? '' },
    ),
  ];
}
export function cardDefinitions(
  card: Pick<Card, 'back' | 'definitions'>,
): string[] {
  const seen = new Set<string>();
  return cardSenses(card)
    .map((sense) => sense.meaning)
    .filter((value) => {
      const key = normalized(value);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
export function isDefinition(
  card: Pick<Card, 'back' | 'definitions'>,
  answer: string,
): boolean {
  return cardDefinitions(card).some(
    (definition) => normalized(definition) === normalized(answer),
  );
}
export function definitionChoices(
  card: Card,
  candidates: Card[],
  random = Math.random,
): string[] {
  const definitions = cardDefinitions(card);
  const answer =
    definitions[Math.floor(random() * definitions.length)] ?? card.back;
  const seen = new Set<string>();
  const others = candidates.flatMap(cardDefinitions).filter((value) => {
    const key = normalized(value);
    if (isDefinition(card, value) || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const shuffled = (values: string[]) => {
    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }
    return values;
  };
  return shuffled([answer, ...shuffled(others).slice(0, 3)]);
}
