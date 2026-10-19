import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { initializeProfiles } from '../src/features/profiles/profiles';

test('profile help closes its modal and navigates to Docs backup instructions', async (t) => {
  const window = new Window({ url: 'http://localhost/' });
  for (const key of [
    'window',
    'document',
    'location',
    'history',
    'localStorage',
    'HTMLElement',
    'HTMLInputElement',
    'HTMLButtonElement',
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
  window.document.body.innerHTML =
    '<div class="app-shell"><div class="topbar-right"><div class="avatar"></div></div></div><div id="modal-root"></div><div id="toast-root"></div>';
  t.mock.method(
    globalThis,
    'fetch',
    async () =>
      new Response(JSON.stringify([{ id: 'default', name: 'An', created: 1 }])),
  );
  await initializeProfiles(async () => {});
  const button = window.document.getElementById(
    'profile-button',
  ) as unknown as HTMLButtonElement;
  button.disabled = false;
  button.click();
  for (
    let i = 0;
    i < 50 && !window.document.querySelector('[data-help-link]');
    i++
  )
    await new Promise((resolve) => setTimeout(resolve, 5));
  const link = window.document.querySelector(
    '[data-help-link]',
  ) as unknown as HTMLAnchorElement;
  assert.ok(link);
  link.click();
  assert.equal(window.location.hash, '#/docs/backup');
  assert.equal(window.document.querySelector('[aria-modal]'), null);
  assert.equal(
    (window.document.querySelector('.app-shell') as unknown as HTMLElement)
      .inert,
    false,
  );
});
