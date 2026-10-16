import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { cardSchema } from '@flashlab/shared';
import { reviewImportedCards } from '../src/ui/import-review';

test('duplicate editor keeps independent multi-sense drafts across pages', async (t) => {
  const window = new Window({ url: 'http://localhost/' });
  for (const key of [
    'window',
    'document',
    'HTMLElement',
    'HTMLInputElement',
    'HTMLButtonElement',
    'HTMLSelectElement',
    'Element',
    'NodeFilter',
    'MutationObserver',
  ] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: key === 'window' ? window : window[key],
    });
    t.after(() =>
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : Reflect.deleteProperty(globalThis, key),
    );
  }
  t.after(() => window.happyDOM.abort());
  const existing = Array.from({ length: 6 }, (_, i) =>
    cardSchema.parse({ id: `old${i}`, front: `term${i}`, back: 'old' }),
  );
  const incoming = existing.map((card, i) =>
    cardSchema.parse({ ...card, id: `new${i}`, back: 'incoming' }),
  );
  const resultPromise = reviewImportedCards(existing, incoming);
  const doc = window.document;
  const change = (selector: string, value: string) => {
    const input = doc.querySelector(selector) as any;
    assert.ok(input, selector);
    input.value = value;
    input.dispatchEvent(new window.Event('change', { bubbles: true }));
  };
  const row = '[data-import-index="0"]';
  change(`${row} [data-import-action]`, 'edit');
  change(`${row} [data-import-edit-mode]`, 'overwrite');
  change(`${row} [data-import-meaning]`, 'first edited meaning');
  change(`${row} [data-import-part]`, 'Noun');
  (doc.querySelector(`${row} [data-import-add-sense]`) as any).click();
  change(
    `${row} [data-import-sense="1"] [data-import-meaning]`,
    'second edited meaning',
  );
  change(`${row} [data-import-sense="1"] [data-import-part]`, 'Verb');
  (doc.querySelector('[data-import-page="2"]') as any).click();
  change('[data-import-index="5"] [data-import-action]', 'edit');
  change('[data-import-index="5"] [data-import-front]', 'separate term');
  (doc.querySelector('[data-import-page="1"]') as any).click();
  assert.equal(
    (
      doc.querySelector(
        `${row} [data-import-sense="1"] [data-import-meaning]`,
      ) as any
    ).value,
    'second edited meaning',
  );
  assert.equal(
    (
      doc.querySelector(
        `${row} [data-import-sense="1"] [data-import-part]`,
      ) as any
    ).value,
    'Verb',
  );
  (doc.querySelector('[data-import-confirm]') as any).click();
  const result = await resultPromise;
  assert.ok(result);
  assert.equal(result.replaced, 1);
  assert.equal(result.added, 1);
  assert.equal(result.cards[0].back, 'first edited meaning');
  assert.deepEqual(result.cards[0].definitions, [
    { meaning: 'second edited meaning', partOfSpeech: 'Verb' },
  ]);
  assert.equal(result.cards[6].front, 'separate term');
  assert.equal(existing[0].back, 'old');
});
