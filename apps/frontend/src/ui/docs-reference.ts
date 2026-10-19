import { docCopy as text } from '../core/docs-reference-copy';
import { esc } from '../core/utils';

export const mcpTools = [
  {
    name: 'get_profile',
    description:
      'Read the connected profile, its revision, write permission, deck/card counts and classes. It cannot select or enumerate other profiles.',
    parameters: '{}',
    arguments: {},
    returns:
      '{ revision, profile, allowWrites, deckCount, cardCount, classes }',
  },
  {
    name: 'list_decks',
    description:
      'Find study sets by title or description. Returns metadata and cardCount, without card bodies. An empty query lists all sets.',
    parameters:
      '{ query?: string = "", offset?: integer = 0, limit?: integer = 30 }',
    arguments: { query: 'English', offset: 0, limit: 30 },
    returns: '{ revision, items: [DeckMetadata], total, nextOffset }',
  },
  {
    name: 'get_deck',
    description:
      'Read one study set and cardCount. To read its cards, follow with list_cards.',
    parameters: '{ deckId: string }',
    arguments: { deckId: 'deck-id' },
    returns: '{ revision, deck: DeckMetadata }',
  },
  {
    name: 'list_cards',
    description:
      'Read a set’s cards with all meanings, word classes, pronunciation, notes and learning progress. Does not return original image data.',
    parameters:
      '{ deckId: string, offset?: integer = 0, limit?: integer = 30 }',
    arguments: { deckId: 'deck-id', offset: 0, limit: 30 },
    returns: '{ revision, items: [Card], total, nextOffset }',
  },
  {
    name: 'search_cards',
    description:
      'Search terms, all meanings, pronunciation and notes. deckId is optional; omitting it searches all sets in the connected profile. Each hit includes deckId, deckTitle and card.',
    parameters:
      '{ query: string (1–200), deckId?: string, offset?: integer = 0, limit?: integer = 30 }',
    arguments: { query: 'bank', deckId: 'deck-id', limit: 30 },
    returns:
      '{ revision, items: [{ deckId, deckTitle, card }], total, nextOffset }',
  },
  {
    name: 'get_card',
    description:
      'Read one complete card. includeImage defaults to false; true also returns the original image data URL. Learning fields are included in either case.',
    parameters:
      '{ deckId: string, cardId: string, includeImage?: boolean = false }',
    arguments: { deckId: 'deck-id', cardId: 'card-id', includeImage: true },
    returns: '{ revision, card: Card }',
  },
  {
    name: 'create_deck',
    description:
      'Create an empty set; add cards with add_cards. title is required (1–120 characters), description defaults to empty (maximum 500), color defaults to purple.',
    parameters:
      '{ revision: integer >= 0, title: string, description?: string = "", color?: string = "purple" }',
    arguments: {
      revision: 7,
      title: 'Travel',
      description: 'Travel vocabulary',
      color: 'blue',
    },
    returns: '{ revision, deck: DeckMetadata }',
  },
  {
    name: 'update_deck',
    description:
      'Patch title, description or color. Supply at least one changed field. Cards, progress and class membership are preserved.',
    parameters:
      '{ revision: integer >= 0, deckId: string, changes: { title?: string, description?: string, color?: string } }',
    arguments: {
      revision: 8,
      deckId: 'deck-id',
      changes: { title: 'Travel essentials' },
    },
    returns: '{ revision, deck: DeckMetadata }',
  },
  {
    name: 'delete_deck',
    description:
      'Permanently delete a set and all its cards, and remove class references. Historical sessions remain. Requires confirmed: true after the user agrees.',
    parameters: '{ revision: integer >= 0, deckId: string, confirmed: true }',
    arguments: { revision: 9, deckId: 'deck-id', confirmed: true },
    returns: '{ revision, deletedDeckId, deletedCardCount }',
  },
  {
    name: 'add_cards',
    description:
      'Append 1–100 cards atomically. Every card needs front and back. Normalized duplicate terms reject the entire batch. Successful results return addedCardIds; existing progress is unchanged.',
    parameters:
      '{ revision: integer >= 0, deckId: string, cards: CardContent[1–100] }',
    arguments: {
      revision: 8,
      deckId: 'deck-id',
      cards: [
        {
          front: 'book',
          back: 'sách',
          partOfSpeech: 'Noun',
          definitions: [{ meaning: 'đặt chỗ', partOfSpeech: 'Verb' }],
          pronunciation: '/bʊk/',
          speechLanguage: 'en-GB',
          notes: 'Book a room.',
        },
      ],
    },
    returns: '{ revision, addedCardIds: string[] }',
  },
  {
    name: 'update_card',
    description:
      'Patch card content; omitted fields stay unchanged. null clears optional definitions, word class, pronunciation, speech language, notes or image. ID, level, schedule and learning progress cannot be overwritten.',
    parameters:
      '{ revision: integer >= 0, deckId: string, cardId: string, changes: Partial<CardContent> }',
    arguments: {
      revision: 9,
      deckId: 'deck-id',
      cardId: 'card-id',
      changes: { pronunciation: '/bʊk/', notes: null },
    },
    returns: '{ revision, card: Card }',
  },
  {
    name: 'delete_cards',
    description:
      'Permanently delete 1–100 specified cards in one set. Missing or repeated IDs reject the entire operation. Requires confirmed: true; other cards keep their content and progress.',
    parameters:
      '{ revision: integer >= 0, deckId: string, cardIds: string[1–100], confirmed: true }',
    arguments: {
      revision: 10,
      deckId: 'deck-id',
      cardIds: ['card-id'],
      confirmed: true,
    },
    returns: '{ revision, deletedCardIds: string[] }',
  },
] as const;

const paragraph = (key: string) => '<p>' + esc(text(key)) + '</p>';
const heading = (key: string) => '<h3>' + esc(text(key)) + '</h3>';
const code = (source: string) =>
  '<pre data-user-content>' + esc(source) + '</pre>';
export function mcpReferenceMarkup() {
  return (
    heading('MCP function reference') +
    heading('What is a tool?') +
    paragraph(
      'A tool is a named operation that the AI client calls with JSON arguments. You can ask in natural language; the client discovers tools and sends tools/call. The examples below are tools/call payloads, not HTTP endpoints or shell commands.',
    ) +
    paragraph(
      'IDs in examples are placeholders. Obtain deckId/cardId from read results and revision from the latest result. A successful write returns the new revision; use it for the next write.',
    ) +
    paragraph(
      'Pagination defaults to offset 0 and limit 30; limit accepts 1–100. Continue with nextOffset until it is null. Images are omitted from lists; hasImage indicates availability.',
    ) +
    '<div class="docs-tool-nav">' +
    mcpTools
      .map(
        (tool) =>
          '<a class="section-link" href="#/docs/mcp/' +
          tool.name +
          '"><code data-user-content>' +
          tool.name +
          '</code></a>',
      )
      .join('') +
    '</div>' +
    mcpTools
      .map(
        (tool, index) =>
          '<details id="mcp-tool-' +
          tool.name +
          '" class="docs-tool" tabindex="-1"><summary><code data-user-content>' +
          tool.name +
          '</code><span>' +
          (index < 6 ? 'Chỉ đọc' : esc(text('Write permission required'))) +
          '</span></summary>' +
          paragraph(tool.description) +
          '<h4>' +
          text('Parameters') +
          '</h4>' +
          code(tool.parameters) +
          '<h4>' +
          text('Call example') +
          '</h4>' +
          code(
            JSON.stringify(
              { name: tool.name, arguments: tool.arguments },
              null,
              2,
            ),
          ) +
          '<h4>' +
          text('Returned fields') +
          '</h4>' +
          code(tool.returns) +
          '</details>',
      )
      .join('') +
    heading('Card content and limits') +
    code(
      'DeckMetadata = { id, title, description, color, created, lastOpened?, cardCount }\nCard = CardContent & {\n  id, level, correct, wrong, last, due,\n  remembered?, masteryProgress?, hasImage,\n  image? // get_card(includeImage: true)\n}\nmasteryProgress = { correct, modes, testCorrect, modeCorrect? }',
    ) +
    paragraph(
      'back is the first meaning; definitions contains up to 19 additional meanings, as strings or meaning/partOfSpeech objects. Each meaning may have its own word class. Omit definitions to keep a single meaning.',
    ) +
    code(
      'CardContent = {\n  front: string,\n  back: string,\n  definitions?: (string | { meaning: string, partOfSpeech?: string })[],\n  partOfSpeech?: string,\n  pronunciation?: string,\n  speechLanguage?: "en-US" | "en-GB" | "vi-VN" | "zh-CN" | "zh-TW" | "ja-JP" | "ko-KR" | "fr-FR" | "de-DE" | "es-ES",\n  notes?: string,\n  image?: "data:image/png;base64,...",\n  starred?: boolean,\n  suspended?: boolean\n}',
    ) +
    paragraph(
      'front/back/notes: up to 4000 characters; pronunciation: 500; partOfSpeech: 120. image accepts PNG/JPEG/WebP/GIF base64 data URLs up to 1,000,000 characters. add_cards checks a serialized batch limit of 2,000,000 characters.',
    ) +
    paragraph(
      'Colors accept purple, blue, peach, mint, pink or a six-digit #RRGGBB value. starred and suspended are booleans; suspended cards leave the automatic review queue.',
    ) +
    heading('Safe read–edit workflow') +
    paragraph(
      'Read the target and its revision, review the proposed change, write with that revision, then keep the returned revision. On CONFLICT, read again and compare before retrying. After a lost response, read to check whether the write succeeded before attempting another create/add/delete.',
    ) +
    code(
      'get_profile({}) → revision\nlist_decks({}) → deckId\nlist_cards({deckId, offset: 0, limit: 30}) → cardId, revision\nupdate_card({revision, deckId, cardId, changes: {notes: "Updated"}}) → new revision',
    ) +
    heading('Error codes') +
    paragraph(
      'CONFLICT means stale revision; NOT_FOUND means a missing profile, set or card; INVALID_DATA means invalid content or limits; STORAGE_ERROR means storage access failed. A failed atomic batch makes no partial edits. A read-only connection does not expose write tools.',
    ) +
    heading('Resources and prompts') +
    paragraph(
      'flashlab://guide is a read-only guide resource. The study_set prompt takes deckId and asks the AI to tutor one word at a time without changing recorded progress. AI chat answers do not automatically earn FlashLab points. No tools edit study history, posts, profiles or restore databases.',
    )
  );
}

export function studyRulesMarkup() {
  return (
    heading('Test scoring and multiple answers') +
    paragraph(
      'Each question is worth 1 point: fully correct = 1, otherwise = 0. There is no partial credit per meaning and no negative test score. The displayed percentage is the correct question count divided by total questions, rounded to a whole percent.',
    ) +
    paragraph(
      'Example: 7 fully correct questions out of 10 give 70%. A question with 3 required meanings and only 2 correct meanings gives 0 points for that question. Test points and per-card mastery progress are separate measures.',
    ) +
    paragraph(
      'Multiple choice: select every distinct saved meaning and no incorrect options. Missing one correct option or selecting one extra incorrect option makes the whole question incorrect. Option order does not matter.',
    ) +
    paragraph(
      'Multiple written answers: use one meaning per field, including every distinct meaning exactly once. Extra, duplicate, blank or incorrect fields make the whole question incorrect. Do not combine meanings into a single field with commas or semicolons.',
    ) +
    paragraph(
      'Matching ignores letter case, leading/trailing spaces, repeated whitespace and Unicode composition differences. Accents, spelling and wording must still match. The same meaning saved with different word classes counts once for answer grading.',
    ) +
    paragraph(
      'With multiple answers disabled, any one saved meaning is enough. A word with only one distinct meaning needs one answer even when multiple answers are enabled. Confirm each answer; editing it removes confirmation. Normal submission requires all questions answered and confirmed.',
    ) +
    heading('Unfinished progress and the next review') +
    paragraph(
      'Progress is retained across days and sessions; it does not reset at midnight. Not studying does not automatically lower a level or deduct points. Overdue active cards remain in Due now until studied; suspended cards are excluded.',
    ) +
    paragraph(
      'A correct answer schedules from that answer’s time using the resulting current level, even if the next-level target is not met. Default levels 1–6 use 1, 3, 7, 14, 30 and 60 days; level 0 uses the retry interval (default 5 minutes). An incorrect answer always uses the retry interval.',
    ) +
    paragraph(
      'Example: a level-3 card answered correctly without reaching level 4 is due 7 days later by default, not necessarily tomorrow. Review settings can change intervals; a manual schedule stays until recalculated or the card is answered again.',
    ) +
    paragraph(
      'An incorrect answer deducts one progress point and one credit in that mode, down to zero; a wrong Test answer also deducts one Test credit. Reaching zero clears mode credits. A further wrong answer while already at zero lowers one level, with a floor of zero.',
    ) +
    heading('Time limits and automatic submission') +
    paragraph(
      'Each of the six modes has its own saved time limit per profile. The default is unlimited. Before starting, enable the limit and enter 0–99 hours, 0–59 minutes and 0–59 seconds; the total must be positive.',
    ) +
    paragraph(
      'The countdown starts only after Start. Settings, hidden tabs and other apps do not pause it. At one third remaining, a persistent red warning and countdown appear; the Test toolbar also turns red.',
    ) +
    paragraph(
      'At timeout, Test submits automatically: only confirmed answers are graded; unconfirmed or blank questions are incorrect even if text has been entered. Other modes stop and save recorded attempts; untouched cards are not marked wrong. Finishing early stops the countdown.',
    )
  );
}
