import {
  normalizeTerm,
  cardSenses,
  cardSchema,
  type Card,
} from '@flashlab/shared';
import { formatPartOfSpeech } from './parts-of-speech';
export interface ImportConflict {
  index: number;
  existing: Card;
  incoming: Card;
}
export interface ImportChoice {
  action: 'skip' | 'overwrite' | 'merge' | 'edit';
  front?: string;
  back?: string;
  draft?: Card;
  editMode?: 'new' | 'overwrite' | 'merge';
}
export function importConflicts(
  existing: readonly Card[],
  incoming: readonly Card[],
): ImportConflict[] {
  const seen = new Map(
    existing.map((card) => [normalizeTerm(card.front), card]),
  );
  const conflicts: ImportConflict[] = [];
  incoming.forEach((card, index) => {
    const previous = seen.get(normalizeTerm(card.front));
    if (previous) conflicts.push({ index, existing: previous, incoming: card });
    else seen.set(normalizeTerm(card.front), card);
  });
  return conflicts;
}
/** Add meaning/word-class pairs without replacing populated fields or study progress. */
export function mergeImportedCard(existing: Card, incoming: Card): Card {
  const senses = cardSenses(existing).map((sense) => ({ ...sense }));
  for (const sense of cardSenses(incoming)) {
    const part = (value: string) =>
      formatPartOfSpeech(value, 'en').toLocaleLowerCase();
    const previous = senses.find(
      (candidate) =>
        normalizeTerm(candidate.meaning) === normalizeTerm(sense.meaning) &&
        (!candidate.partOfSpeech ||
          !sense.partOfSpeech ||
          part(candidate.partOfSpeech) === part(sense.partOfSpeech)),
    );
    if (previous) {
      if (!previous.partOfSpeech && sense.partOfSpeech)
        previous.partOfSpeech = sense.partOfSpeech;
    } else senses.push({ ...sense });
  }
  if (senses.length > 20)
    throw Error('Bổ sung vượt quá 20 nghĩa của một thẻ. Chưa lưu thay đổi.');
  return cardSchema.parse({
    ...existing,
    back: senses[0].meaning,
    partOfSpeech: senses[0].partOfSpeech,
    definitions: senses.slice(1),
    pronunciation: existing.pronunciation || incoming.pronunciation,
    notes: existing.notes || incoming.notes,
    image: existing.image || incoming.image,
    speechLanguage: existing.speechLanguage || incoming.speechLanguage,
  });
}
export function resolveImportedCards(
  existing: readonly Card[],
  incoming: readonly Card[],
  choices: Map<number, ImportChoice>,
) {
  const result = [...existing];
  const positions = new Map(
    existing.map((card, index) => [normalizeTerm(card.front), index]),
  );
  let added = 0,
    replaced = 0,
    merged = 0,
    skipped = 0;
  incoming.forEach((original, index) => {
    const choice = choices.get(index);
    if (choice?.action === 'skip') {
      skipped++;
      return;
    }
    const card =
      choice?.action === 'edit'
        ? {
            ...original,
            ...choice.draft,
            front: (choice.front ?? choice.draft?.front ?? '').trim(),
            back: (choice.back ?? choice.draft?.back ?? '').trim(),
          }
        : original;
    if (!card.front || !card.back)
      throw Error('Thuật ngữ và nghĩa không được để trống.');
    if (choice?.action === 'edit') {
      const invalid = cardSenses(card).some((sense) => !sense.meaning.trim());
      if (invalid) throw Error('Mỗi định nghĩa phải có nghĩa đi kèm.');
      cardSchema.parse(card);
    }
    const key = normalizeTerm(card.front);
    if (
      choice?.action === 'edit' &&
      choice.editMode &&
      choice.editMode !== 'new'
    ) {
      const originalKey = normalizeTerm(original.front);
      const savedPosition = positions.get(originalKey);
      if (savedPosition === undefined)
        throw Error('Không tìm thấy thẻ trùng để áp dụng bản sửa.');
      const collision = positions.get(key);
      if (collision !== undefined && collision !== savedPosition)
        throw Error(
          'Thuật ngữ sau khi sửa vẫn bị trùng. Hãy sửa lại hoặc chọn bỏ qua.',
        );
      if (choice.editMode === 'merge') {
        if (key !== originalKey)
          throw Error(
            'Bổ sung vào thẻ trùng cần giữ nguyên thuật ngữ. Chọn Tạo thẻ riêng nếu muốn đổi tên.',
          );
        result[savedPosition] = mergeImportedCard(result[savedPosition], card);
        merged++;
      } else {
        result[savedPosition] = {
          ...card,
          id: result[savedPosition].id,
          starred: result[savedPosition].starred,
        };
        positions.delete(originalKey);
        positions.set(key, savedPosition);
        replaced++;
      }
      return;
    }
    const position = positions.get(key);
    if (position !== undefined) {
      if (choice?.action === 'overwrite') {
        result[position] = {
          ...card,
          id: result[position].id,
          starred: result[position].starred,
        };
        replaced++;
      } else if (choice?.action === 'merge') {
        result[position] = mergeImportedCard(result[position], card);
        merged++;
      } else if (choice?.action === 'edit')
        throw Error(
          'Thuật ngữ sau khi sửa vẫn bị trùng. Hãy sửa lại hoặc chọn bỏ qua.',
        );
      else skipped++;
    } else {
      positions.set(key, result.length);
      result.push(card);
      added++;
    }
  });
  return { cards: result, added, replaced, merged, skipped };
}
