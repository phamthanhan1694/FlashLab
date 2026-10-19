import { avatarIds } from './avatars.js';
export { avatarCatalog, avatarIds, type AvatarId } from './avatars.js';
import { z } from 'zod';

const timestamp = z.number().finite().nonnegative();
const identifier = z.string().min(1).max(128);
export const cardSchema = z.object({
  id: identifier,
  front: z.string().min(1).max(4000),
  back: z.string().min(1).max(4000),
  definitions: z
    .array(
      z.union([
        z.string().trim().min(1).max(4000),
        z.object({
          meaning: z.string().trim().min(1).max(4000),
          partOfSpeech: z.string().max(120).optional(),
        }),
      ]),
    )
    .max(19)
    .optional(),
  partOfSpeech: z.string().max(120).optional(),
  image: z
    .string()
    .regex(/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/)
    .optional(),
  pronunciation: z.string().max(500).optional(),
  speechLanguage: z
    .enum([
      'en-US',
      'en-GB',
      'zh-CN',
      'zh-TW',
      'ja-JP',
      'ko-KR',
      'vi-VN',
      'fr-FR',
      'de-DE',
      'es-ES',
    ])
    .optional(),
  notes: z.string().max(4000).optional(),
  level: z.number().int().min(0).max(6).default(0),
  masteryProgress: z
    .object({
      correct: z.number().int().nonnegative(),
      modes: z
        .array(z.enum(['flashcards', 'learn', 'write', 'match', 'test']))
        .max(5),
      testCorrect: z.number().int().nonnegative(),
      modeCorrect: z
        .object({
          flashcards: z.number().int().nonnegative().optional(),
          learn: z.number().int().nonnegative().optional(),
          write: z.number().int().nonnegative().optional(),
          match: z.number().int().nonnegative().optional(),
          test: z.number().int().nonnegative().optional(),
        })
        .optional(),
    })
    .optional(),
  correct: z.number().int().nonnegative().default(0),
  wrong: z.number().int().nonnegative().default(0),
  last: timestamp.default(0),
  due: timestamp.default(0),
  starred: z.boolean().default(false),
  remembered: z.boolean().optional(),
  suspended: z.boolean().optional(),
});
const studyColorSchema = z.union([
  z.enum(['purple', 'blue', 'peach', 'mint', 'pink']),
  z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .transform((value) => value.toLowerCase()),
]);
export const deckSchema = z
  .object({
    id: identifier,
    title: z.string().trim().min(1).max(120),
    description: z.string().max(500).default(''),
    color: studyColorSchema.default('purple'),
    created: timestamp,
    lastOpened: timestamp.optional(),
    cards: z.array(cardSchema).max(10000),
  })
  .superRefine((deck, ctx) => {
    if (new Set(deck.cards.map((card) => card.id)).size !== deck.cards.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate card IDs' });
  });
export const modeSchema = z.enum([
  'flashcards',
  'learn',
  'write',
  'test',
  'match',
  'review',
]);
export const sessionResultSchema = z.object({
  front: z.string().max(4000),
  correctAnswer: z.string().max(4000),
  userAnswer: z.string().max(8100).optional(),
  ok: z.boolean(),
  assessed: z.boolean().optional(),
});
export type SessionResult = z.infer<typeof sessionResultSchema>;
export const sessionSchema = z
  .object({
    id: identifier,
    date: timestamp,
    deckId: identifier,
    mode: modeSchema,
    deckTitle: z.string().max(120).optional(),
    durationSeconds: z.number().int().nonnegative().optional(),
    completed: z.boolean().optional(),
    results: z.array(sessionResultSchema).max(100000).optional(),
    answers: z.number().int().nonnegative(),
    correct: z.number().int().nonnegative(),
  })
  .refine((session) => session.correct <= session.answers, 'Invalid score');
export const soundNames = [
  'background',
  'test-background',
  'correct',
  'incorrect',
  'completed',
  'keep-trying',
  'flip',
  'swipe',
  'drag-lift',
  'drag-drop',
] as const;
export const audioPreferencesSchema = z.object({
  masterVolume: z.number().min(0).max(1).optional(),
  muted: z.boolean().optional(),
  sounds: z
    .record(
      z.enum(soundNames),
      z.object({ volume: z.number().min(0).max(1), muted: z.boolean() }),
    )
    .optional(),
  music: z.boolean().default(true),
  effects: z.boolean().default(true),
  volume: z.number().min(0).max(1).default(0.6),
  musicVolume: z.number().min(0).max(1).default(1),
});
export const studyPreferencesSchema = z.object({
  orders: z.record(modeSchema, z.enum(['ordered', 'random'])).optional(),
  testType: z.enum(['mixed', 'mc', 'write']).optional(),
  testMultipleChoice: z.boolean().optional(),
  testMultipleWrite: z.boolean().optional(),
  testCount: z.number().int().min(1).max(100000).optional(),
  matchPairs: z.number().int().min(1).max(100000).optional(),
});
export const srsPreferencesSchema = z.object({
  intervals: z
    .tuple([
      z.number().int().min(1).max(3650),
      z.number().int().min(1).max(3650),
      z.number().int().min(1).max(3650),
      z.number().int().min(1).max(3650),
      z.number().int().min(1).max(3650),
      z.number().int().min(1).max(3650),
    ])
    .refine(
      (days) => days.every((day, i) => i === 0 || day > days[i - 1]),
      'Khoảng cách ôn phải tăng dần.',
    ),
  retryMinutes: z.number().int().min(1).max(10080),
});
export type SrsPreferences = z.infer<typeof srsPreferencesSchema>;
export const defaultSrsPreferences: SrsPreferences = {
  intervals: [1, 3, 7, 14, 30, 60],
  retryMinutes: 5,
};
export const uiLanguages = ['vi', 'en', 'ko', 'zh', 'ja'] as const;
export type UiLanguage = (typeof uiLanguages)[number];
export const preferencesSchema = z.object({
  tileSize: z.enum(['small', 'medium', 'large']).optional(),
  speechRate: z.number().min(0.5).max(1.5).optional(),
  srs: srsPreferencesSchema.optional(),
  avatar: z.enum(avatarIds).optional(),
  language: z.enum(uiLanguages).optional(),
  study: studyPreferencesSchema.optional(),
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  audio: audioPreferencesSchema.default({}),
});
export const publicConfigSchema = z.object({
  study: z.object({
    autoAdvanceSeconds: z.number().int().min(1).max(60),
    completionPercent: z.number().int().min(1).max(100),
    historyPageSize: z.number().int().min(1).max(100),
    testQuestionLimit: z.number().int().min(1).max(100),
    matchPairLimit: z.number().int().min(1).max(30),
  }),
  defaults: preferencesSchema,
});
export type PublicConfig = z.infer<typeof publicConfigSchema>;
export const profileNameSchema = z.string().trim().min(1).max(60);
export const profileIdSchema = z.union([
  z.literal('default'),
  z
    .string()
    .uuid()
    .transform((id) => id.toLowerCase()),
]);
export const profileSchema = z.object({
  id: profileIdSchema,
  name: profileNameSchema,
  created: timestamp,
});
export const profilesSchema = z
  .array(profileSchema)
  .min(1)
  .max(50)
  .superRefine((profiles, ctx) => {
    if (new Set(profiles.map((p) => p.id)).size !== profiles.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate profile IDs' });
    if (
      new Set(profiles.map((p) => normalizeTerm(p.name))).size !==
      profiles.length
    )
      ctx.addIssue({ code: 'custom', message: 'Duplicate profile names' });
  });
export type Profile = z.infer<typeof profileSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type AudioPreferences = z.infer<typeof audioPreferencesSchema>;
export const classSchema = z.object({
  color: studyColorSchema.optional(),
  id: identifier,
  name: z.string().trim().min(1).max(120),
  description: z.string().max(500).default(''),
  deckIds: z
    .array(identifier)
    .max(500)
    .refine(
      (ids) => new Set(ids).size === ids.length,
      'Duplicate class memberships',
    ),
});
export const personalNoteSchema = z.object({
  id: z.string().uuid(),
  ownerId: profileIdSchema,
  author: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(200),
  markdown: z.string().min(1).max(200000),
  revision: z.number().int().positive(),
  created: timestamp,
  updated: timestamp,
});
export type PersonalNote = z.infer<typeof personalNoteSchema>;
export const stateSchema = z
  .object({
    version: z.literal(2),
    preferences: preferencesSchema.optional(),
    notes: z.array(personalNoteSchema).max(500).optional(),
    decks: z.array(deckSchema).max(500),
    classes: z.array(classSchema).max(100).optional(),
    history: z
      .record(
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        z.number().int().nonnegative(),
      )
      .default({}),
    sessions: z.array(sessionSchema).max(100).default([]),
  })
  .superRefine((state, ctx) => {
    if (
      new Set(state.notes?.map((note) => note.id)).size !==
      (state.notes?.length ?? 0)
    )
      ctx.addIssue({ code: 'custom', message: 'Duplicate note IDs' });
    if (
      (state.notes ?? []).reduce(
        (size, note) => size + note.markdown.length,
        0,
      ) > 5000000
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Personal notes exceed the storage limit',
      });
    if (
      new Set(state.classes?.map((group) => group.id)).size !==
      (state.classes?.length ?? 0)
    )
      ctx.addIssue({ code: 'custom', message: 'Duplicate class IDs' });
    const deckIds = new Set(state.decks.map((deck) => deck.id));
    if (
      state.classes?.some((group) =>
        group.deckIds.some((id) => !deckIds.has(id)),
      )
    )
      ctx.addIssue({
        code: 'custom',
        message: 'Class references a missing study set',
      });
    if (new Set(state.decks.map((deck) => deck.id)).size !== state.decks.length)
      ctx.addIssue({ code: 'custom', message: 'Duplicate deck IDs' });
    if (state.decks.reduce((sum, deck) => sum + deck.cards.length, 0) > 100000)
      ctx.addIssue({ code: 'custom', message: 'Too many cards' });
  });
export const snapshotSchema = z.object({
  revision: z.number().int().nonnegative(),
  data: stateSchema.nullable(),
});
export function normalizeTerm(term: string): string {
  return term
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('vi');
}

export function duplicateTerm(
  cards: readonly { front: string }[],
): string | undefined {
  const seen = new Set<string>();
  for (const card of cards) {
    const key = normalizeTerm(card.front);
    if (seen.has(key)) return card.front;
    seen.add(key);
  }
  return undefined;
}

// Reads remain compatible with older backups; new writes must have unique terms.
export const uniqueStateSchema = stateSchema.superRefine((state, ctx) => {
  state.decks.forEach((deck, index) => {
    const duplicate = duplicateTerm(deck.cards);
    if (duplicate !== undefined)
      ctx.addIssue({
        code: 'custom',
        path: ['decks', index, 'cards'],
        message: `Thuật ngữ “${duplicate}” bị trùng trong học phần “${deck.title}”.`,
      });
  });
});
export const backupSchema = z.intersection(
  uniqueStateSchema,
  z.object({
    userId: profileIdSchema.optional(),
    userName: profileNameSchema.optional(),
    userCreated: timestamp.optional(),
  }),
);
export type Backup = z.infer<typeof backupSchema>;
export const importSchema = z.object({
  confirmed: z.literal(true),
  revision: z.number().int().nonnegative().nullable(),
  backup: backupSchema,
});
export const updateSchema = z.object({
  revision: z.number().int().nonnegative(),
  data: uniqueStateSchema,
});
export type Card = z.infer<typeof cardSchema>;
export type Deck = z.infer<typeof deckSchema>;
export type StudyMode = z.infer<typeof modeSchema>;
export type AppData = z.infer<typeof stateSchema>;
export type Snapshot = z.infer<typeof snapshotSchema>;
export { reviewCard, scheduledDue, masteryRequirements } from './review.js';

export {
  cardDefinitions,
  cardSenses,
  isDefinition,
  definitionChoices,
} from './definitions.js';
export { cardsToCsv, cardsToRows } from './csv.js';
