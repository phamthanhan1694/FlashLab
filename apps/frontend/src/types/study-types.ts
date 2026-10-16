import type { StudyMode, SessionResult } from '@flashlab/shared';
export interface Item {
  deckId: string;
  cardId: string;
  tries: number;
}
export interface Study {
  started: boolean;
  results?: SessionResult[];
  remembered: Record<string, boolean>;
  flashRated: string[];
  deckId: string;
  mode: StudyMode;
  pool: Item[];
  queue: Item[];
  index: number;
  writeResponses?: Record<
    number,
    { answer: string; feedback?: { ok: boolean } }
  >;
  testAnswers: string[];
  testMultiAnswers?: Record<number, string[]>;
  testConfirmed?: boolean[];
  flipped: boolean;
  feedback: { ok: boolean; selected?: number } | null;
  choices: string[] | null;
  correct: number;
  answers: number;
  saved: boolean;
  finished: boolean;
  matchChosen: string[];
  matchSolved: number[];
  matchWrong: string[];
  matchWrongTimer: boolean;
  startTime: number;
  endTime: number;
  pairs: Item[];
  tiles: { uid: string; pair: number; kind: string; text: string }[];
  questions: {
    item: Item;
    type: string;
    choices: string[];
    multiple?: boolean;
  }[];
  testResults?: {
    front: string;
    correctAnswer: string;
    userAnswer: string;
    ok: boolean;
  }[];
}
export interface UIState {
  classId?: string | null;
  page: string;
  deckId: string | null;
  mode: string | null;
  study: Study | null;
  filter: string;
  deckFilter: string;
}
