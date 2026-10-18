import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { Window, type HTMLButtonElement as HappyButton } from 'happy-dom';
import { IDBFactory } from 'fake-indexeddb';
import { browserCache } from '../src/core/cache';
import {
  downloadProfileBackup,
  downloadFullBackup,
  restoreDatabaseBackup,
} from '../src/features/profiles/backup';

const profile = { id: 'default', name: 'Người dùng', created: 1 };
const header = 'SQLite format 3\0';
async function fixture(t: TestContext) {
  const window = new Window({ url: 'http://localhost/' });
  const descriptors = new Map<string, PropertyDescriptor | undefined>();
  for (const key of [
    'window',
    'document',
    'localStorage',
    'Element',
    'HTMLElement',
    'HTMLButtonElement',
    'HTMLInputElement',
    'MutationObserver',
    'NodeFilter',
  ] as const) {
    descriptors.set(key, Object.getOwnPropertyDescriptor(globalThis, key));
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: key === 'window' ? window : window[key],
    });
  }
  descriptors.set(
    'indexedDB',
    Object.getOwnPropertyDescriptor(globalThis, 'indexedDB'),
  );
  Object.defineProperty(globalThis, 'indexedDB', {
    configurable: true,
    value: new IDBFactory(),
  });
  window.document.body.innerHTML = '<div id="toast-root"></div>';
  let reloads = 0;
  t.mock.method(window.location, 'reload', () => {
    reloads++;
  });
  t.after(async () => {
    await browserCache.close();
    for (const [key, descriptor] of descriptors) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else Reflect.deleteProperty(globalThis, key);
    }
    await window.happyDOM.abort();
  });
  const click = async (action: 'accept' | 'cancel') => {
    for (let attempt = 0; attempt < 100; attempt++) {
      const button = window.document.querySelector<HappyButton>(
        `[data-confirm="${action}"]`,
      );
      if (button) {
        button.click();
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('Missing restore confirmation');
  };
  return { window, click, reloads: () => reloads };
}

test('profile and full downloads use standalone SQLite files and reject ZIP responses', async (t) => {
  const { window } = await fixture(t);
  const downloads: string[] = [];
  t.mock.method(
    window.HTMLAnchorElement.prototype,
    'click',
    function (this: HTMLAnchorElement) {
      downloads.push(this.download);
    },
  );
  t.mock.method(URL, 'createObjectURL', () => 'blob:database-test');
  t.mock.method(URL, 'revokeObjectURL', () => {});
  const urls: string[] = [];
  const fetch = t.mock.method(globalThis, 'fetch', async (url: unknown) => {
    urls.push(String(url));
    return new Response(header, {
      headers: { 'content-type': 'application/vnd.sqlite3' },
    });
  });
  await downloadProfileBackup(profile);
  await downloadFullBackup();
  assert.deepEqual(urls, [
    '/api/profiles/default/database',
    '/api/backups/database',
  ]);
  assert.deepEqual(downloads, [
    'FlashLab-default.sqlite',
    'FlashLab-all.sqlite',
  ]);
  fetch.mock.mockImplementation(async () => new Response('PK\x03\x04'));
  await assert.rejects(downloadProfileBackup(profile), /SQLite/);
  assert.equal(downloads.length, 2);
});

test('restoring previews scope, waits for confirmation, sends the exact preview token and clears stale caches', async (t) => {
  const { click, reloads, window } = await fixture(t);
  const file = new File([header], 'saved.sqlite');
  await browserCache.write('flashlab.server.v1', { pending: true });
  await browserCache.write('flashlab.html.v2', { old: true });
  const calls: string[] = [];
  t.mock.method(
    globalThis,
    'fetch',
    async (url: unknown, options?: RequestInit) => {
      calls.push(String(url));
      assert.equal(options?.body, file);
      const headers = new Headers(options?.headers);
      assert.equal(headers.get('content-type'), 'application/vnd.sqlite3');
      if (String(url).endsWith('/inspect'))
        return Response.json({
          scope: 'all',
          profiles: [profile],
          cards: 12,
          articles: 2,
          images: 3,
          hash: 'hash',
          expectedRevision: 9,
        });
      assert.equal(headers.get('x-flashlab-confirm'), 'restore');
      assert.equal(headers.get('x-flashlab-revision'), '9');
      assert.equal(headers.get('x-flashlab-backup-hash'), 'hash');
      return Response.json({
        profiles: [profile],
        affectedProfileIds: ['default'],
      });
    },
  );
  let prepared = false;
  const pending = restoreDatabaseBackup(file, async () => {
    prepared = true;
  });
  for (
    let i = 0;
    i < 100 && !window.document.querySelector('[data-confirm="accept"]');
    i++
  )
    await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(prepared, true);
  assert.deepEqual(calls, ['/api/backups/inspect']);
  assert.match(window.document.body.textContent, /12 thẻ/);
  await click('accept');
  assert.equal(await pending, true);
  assert.equal(await browserCache.read('flashlab.server.v1'), undefined);
  assert.equal(await browserCache.read('flashlab.html.v2'), undefined);
  assert.equal(reloads(), 1);
});

test('cancelling a restore never uploads it to the restore endpoint or reloads', async (t) => {
  const { click, reloads } = await fixture(t);
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    calls++;
    return Response.json({
      scope: 'profile',
      profiles: [profile],
      cards: 1,
      articles: 0,
      images: 0,
      hash: 'hash',
      expectedRevision: 1,
    });
  });
  const result = restoreDatabaseBackup(
    new File([header], 'saved.sqlite'),
    async () => {},
  );
  await click('cancel');
  assert.equal(await result, false);
  assert.equal(calls, 1);
  assert.equal(reloads(), 0);
});

test('a conflict preserves the pending cache and prevents reloading into partially restored data', async (t) => {
  const { click, reloads } = await fixture(t);
  await browserCache.write('flashlab.server.v1', { pending: true, changes: 3 });
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => {
    if (++calls === 1)
      return Response.json({
        scope: 'profile',
        profiles: [profile],
        cards: 1,
        articles: 0,
        images: 0,
        hash: 'hash',
        expectedRevision: 1,
      });
    return Response.json({ error: 'Dữ liệu vừa thay đổi' }, { status: 409 });
  });
  const result = restoreDatabaseBackup(
    new File([header], 'saved.sqlite'),
    async () => {},
  );
  const rejected = assert.rejects(result, /vừa thay đổi/);
  await click('accept');
  await rejected;
  assert.deepEqual(await browserCache.read('flashlab.server.v1'), {
    pending: true,
    changes: 3,
  });
  assert.equal(reloads(), 0);
});
