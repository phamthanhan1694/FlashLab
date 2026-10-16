import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { initializeProfiles } from '../src/features/profiles/profiles';
import { initializeProfileAvatar } from '../src/features/profiles/avatars';

test('switching users waits for an avatar save on another profile', async (t) => {
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
  const other = '11111111-1111-4111-8111-111111111111';
  const profiles = [
    { id: 'default', name: 'An', created: 1 },
    { id: other, name: 'Bình', created: 2 },
  ];
  const snapshot = {
    revision: 0,
    data: { version: 2, decks: [], history: {}, sessions: [] },
  };
  let finishSave!: (response: Response) => void;
  const pendingSave = new Promise<Response>((resolve) => {
    finishSave = resolve;
  });
  let saving = false;
  t.mock.method(
    globalThis,
    'fetch',
    async (url: string | URL | Request, options?: RequestInit) => {
      if (String(url) === '/api/profiles')
        return new Response(JSON.stringify(profiles));
      assert.equal(String(url), `/api/profiles/${other}/state`);
      if (options?.method === 'PUT') {
        saving = true;
        assert.equal(
          JSON.parse(String(options.body)).data.preferences.avatar,
          'cat',
        );
        return pendingSave;
      }
      return new Response(JSON.stringify(snapshot));
    },
  );
  let switchAttempts = 0;
  const current = await initializeProfiles(async () => {
    switchAttempts++;
    return false;
  });
  initializeProfileAvatar(current, 'owl', async () => {});
  const click = (selector: string) => {
    const button = window.document.querySelector(
      selector,
    ) as unknown as HTMLButtonElement;
    assert.ok(button, selector);
    button.click();
  };
  const waitFor = async (predicate: () => unknown) => {
    for (let i = 0; i < 100; i++) {
      if (predicate()) return;
      await new Promise((resolve) => setTimeout(resolve, 5));
    }
    assert.fail('UI did not reach expected state');
  };
  (
    window.document.getElementById(
      'profile-button',
    ) as unknown as HTMLButtonElement
  ).disabled = false;
  click('#profile-button');
  await waitFor(() =>
    window.document.querySelector('[data-profile-avatar-edit]'),
  );
  click(`[data-profile-avatar-edit="${other}"]`);
  await waitFor(() =>
    window.document.querySelector('[data-avatar-preset="cat"]'),
  );
  const profileDialog = window.document.querySelector('.profile-modal')!;
  assert.equal(
    profileDialog.contains(window.document.querySelector('.avatar-dialog')!),
    false,
  );
  assert.equal(
    window.document.querySelector('.avatar-dialog')?.getAttribute('aria-modal'),
    'true',
  );
  window.document.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  assert.equal(
    (window.document.querySelector('.avatar-picker') as unknown as HTMLElement)
      .hidden,
    true,
  );
  assert.ok(
    window.document.querySelector('.profile-modal'),
    'Escape closes only the avatar popup',
  );
  assert.equal(window.document.body.style.overflow, 'hidden');
  click(`[data-profile-avatar-edit="${other}"]`);
  await waitFor(() =>
    window.document.querySelector('.avatar-dialog[aria-modal="true"]'),
  );
  click('.avatar-picker');
  assert.equal(
    (window.document.querySelector('.avatar-picker') as unknown as HTMLElement)
      .hidden,
    true,
  );
  click(`[data-profile-avatar-edit="${other}"]`);
  await waitFor(() =>
    window.document.querySelector('.avatar-dialog[aria-modal="true"]'),
  );
  click('[data-avatar-preset="cat"]');
  await waitFor(() => saving);
  click(`[data-profile-select="${other}"]`);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(
    switchAttempts,
    0,
    'state flush and switching must wait until the avatar is saved',
  );
  finishSave(new Response(JSON.stringify({ ...snapshot, revision: 1 })));
  await waitFor(() => switchAttempts === 1);
  assert.equal(window.localStorage.getItem('flashlab.profile'), 'default');
  click('[data-profile-close]');
  assert.equal(window.document.querySelector('[aria-modal="true"]'), null);
  assert.equal(window.document.body.style.overflow, '');
  assert.equal(
    (window.document.querySelector('.app-shell') as unknown as HTMLElement)
      .inert,
    false,
  );
});
