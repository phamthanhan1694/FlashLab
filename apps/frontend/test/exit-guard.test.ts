import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window, type HTMLButtonElement } from 'happy-dom';
import { installStudyExitGuard } from '../src/features/study/exit-guard';

test('navigation guard preserves an active session on cancel, guards unload, and leaves once on approval', async (t) => {
  let cleanup = () => {};
  t.after(() => cleanup());
  const browser = new Window({ url: 'http://localhost/#/study/deck/test' });
  await browser.happyDOM.waitUntilComplete();
  for (const key of [
    'window',
    'document',
    'location',
    'history',
    'HTMLElement',
    'Element',
    'NodeFilter',
  ] as const) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: key === 'window' ? browser : browser[key],
    });
    t.after(() =>
      previous
        ? Object.defineProperty(globalThis, key, previous)
        : Reflect.deleteProperty(globalThis, key),
    );
  }
  t.after(() => browser.happyDOM.abort());
  browser.document.body.innerHTML =
    '<div class="app-shell"><input value="draft"></div>';
  let active: { mode: string } | null = { mode: 'test' };
  let leaves = 0;
  const guard = installStudyExitGuard({
    active: () => active,
    leave: () => {
      leaves++;
      active = null;
    },
  });
  cleanup = () => guard.dispose();
  const flush = async () => {
    await browser.happyDOM.waitUntilComplete();
  };
  let routeRenders = 0;
  browser.addEventListener('hashchange', () => routeRenders++);
  const unload = new browser.Event('beforeunload', { cancelable: true });
  browser.dispatchEvent(unload);
  assert.equal(unload.defaultPrevented, true);
  browser.location.hash = '#/blog';
  await flush();
  assert.equal(browser.location.hash, '#/study/deck/test');
  assert.equal(routeRenders, 0);
  browser.document
    .querySelector<HTMLButtonElement>('[data-confirm="cancel"]')!
    .click();
  await flush();
  assert.equal(leaves, 0);
  assert.equal(browser.document.querySelector('input')!.value, 'draft');
  browser.location.hash = '#/library';
  await flush();
  browser.document
    .querySelector<HTMLButtonElement>('[data-confirm="accept"]')!
    .click();
  await flush();
  assert.equal(leaves, 1);
  assert.equal(browser.location.hash, '#/library');
  assert.equal(routeRenders, 1);
  const completedUnload = new browser.Event('beforeunload', {
    cancelable: true,
  });
  browser.dispatchEvent(completedUnload);
  assert.equal(completedUnload.defaultPrevented, false);
  browser.location.hash = '#/';
  await flush();
  assert.equal(browser.document.querySelector('[role="alertdialog"]'), null);
  guard.dispose();
  let routed = 0;
  const ownedRouter = installStudyExitGuard({
    active: () => active,
    leave: () => {
      leaves++;
      active = null;
    },
    navigate: () => {
      routed++;
      active = browser.location.hash.startsWith('#/study/')
        ? { mode: 'learn' }
        : null;
    },
  });
  cleanup = () => ownedRouter.dispose();
  browser.location.hash = '#/study/deck/learn';
  await flush();
  assert.equal(routed, 1, 'entry routes after checking the old session');
  assert.equal(
    browser.document.querySelector('[role="alertdialog"]'),
    null,
    'no confirmation when entering',
  );
  assert.ok(active);
  browser.location.hash = '#/deck/deck';
  await flush();
  assert.equal(
    routed,
    1,
    'exit has not changed the session before confirmation',
  );
  assert.equal(browser.location.hash, '#/study/deck/learn');
  browser.document
    .querySelector<HTMLButtonElement>('[data-confirm="cancel"]')!
    .click();
  await flush();
  assert.ok(active, 'cancelling keeps the active session');
  browser.location.hash = '#/deck/deck';
  await flush();
  browser.document
    .querySelector<HTMLButtonElement>('[data-confirm="accept"]')!
    .click();
  await flush();
  assert.equal(routed, 2);
  assert.equal(active, null);
  assert.equal(browser.location.hash, '#/deck/deck');
});
