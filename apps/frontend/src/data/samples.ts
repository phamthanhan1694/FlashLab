import { cardSchema, type AppData } from '@flashlab/shared';
import { id } from '../core/utils';

const vocabulary = [
  ['hello', 'xin chào', '/həˈləʊ/'],
  ['book', 'sách', '/bʊk/'],
  ['school', 'trường học', '/skuːl/'],
  ['friend', 'bạn bè', '/frend/'],
  ['family', 'gia đình', '/ˈfæməli/'],
  ['learn', 'học', '/lɜːn/'],
  ['read', 'đọc', '/riːd/'],
  ['write', 'viết', '/raɪt/'],
] as const;

export function samples(): AppData {
  return {
    version: 2,
    decks: [
      {
        id: id(),
        title: 'Tiếng Anh cơ bản',
        description: 'Học phần mẫu để làm quen với FlashLab.',
        color: 'purple',
        created: Date.now(),
        cards: vocabulary.map(([front, back, pronunciation]) =>
          cardSchema.parse({
            id: id(),
            front,
            back,
            pronunciation,
            speechLanguage: 'en-GB',
          }),
        ),
      },
    ],
    history: {},
    sessions: [],
  };
}
