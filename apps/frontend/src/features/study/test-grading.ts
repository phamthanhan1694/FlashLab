import { cardDefinitions, isDefinition, type Card } from '@flashlab/shared';
/** Every supplied answer must be valid and unique; multi-answer questions require every meaning. */
export function gradeTestMeanings(
  card: Pick<Card, 'back' | 'definitions'>,
  answers: string[],
  multiple: boolean,
): boolean {
  const normalize = (text: string) =>
    text.normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
  if (
    !answers.length ||
    answers.some((answer) => !answer.trim() || !isDefinition(card, answer))
  )
    return false;
  const unique = new Set(answers.map(normalize));
  if (unique.size !== answers.length) return false;
  return multiple
    ? unique.size === cardDefinitions(card).length
    : answers.length === 1;
}
