import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window, type HTMLDetailsElement } from 'happy-dom';
import { initializeHelp, renderHelpCenter } from '../src/ui/help';

test('storage guide reads current configured directory on every visit and never retains an obsolete path on failure', async (t) => {
  const window = new Window({ url: 'http://localhost/#/home/guide/backup' });
  for (const key of ['document', 'location'] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: window[key],
    });
    t.after(() =>
      descriptor
        ? Object.defineProperty(globalThis, key, descriptor)
        : Reflect.deleteProperty(globalThis, key),
    );
  }
  t.after(() => window.happyDOM.abort());
  let directory = '/configured/first-user-drive';
  let unavailable = false;
  t.mock.method(globalThis, 'fetch', async (url: string | URL | Request) => {
    assert.equal(String(url), '/api/storage');
    return unavailable
      ? new Response('{}', { status: 403 })
      : new Response(JSON.stringify({ directory }));
  });
  window.document.body.innerHTML = renderHelpCenter();
  await initializeHelp();
  assert.equal(
    window.document.querySelector('[data-help-storage-path]')?.textContent,
    directory,
  );
  directory = '/different/configuration/storage';
  window.document.body.innerHTML = renderHelpCenter();
  await initializeHelp();
  assert.equal(
    window.document.querySelector('[data-help-storage-path]')?.textContent,
    directory,
  );
  assert.ok(!renderHelpCenter().includes('/configured/first-user-drive'));
  unavailable = true;
  await initializeHelp();
  assert.equal(
    window.document.querySelector('[data-help-storage-path]')?.textContent,
    '—',
  );
  assert.ok(!renderHelpCenter().includes(directory));
});

test('word-class guide links open both parent and exact nested section', async (t) => {
  const { focusHelpTopic } = await import('../src/ui/help');
  const browser = new Window({ url: 'http://localhost/#/home/guide/parts' });
  for (const key of ['document', 'location'] as const) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: browser[key],
    });
    t.after(() =>
      previous
        ? Object.defineProperty(globalThis, key, previous)
        : Reflect.deleteProperty(globalThis, key),
    );
  }
  t.after(() => browser.happyDOM.abort());
  browser.document.body.innerHTML = renderHelpCenter();
  focusHelpTopic();
  assert.equal(
    browser.document.querySelector<HTMLDetailsElement>('#guide-study')!.open,
    true,
  );
  assert.equal(
    browser.document.querySelector<HTMLDetailsElement>('#guide-parts')!.open,
    true,
  );
  assert.equal(browser.document.activeElement?.id, 'guide-parts');
});

test('updated import guide instructions have English translations', async (t) => {
  const { importGuideMarkup } = await import('../src/ui/help');
  const { translateText } = await import('../src/core/i18n');
  const browser = new Window();
  t.after(() => browser.happyDOM.abort());
  browser.document.body.innerHTML = importGuideMarkup(true);
  for (const node of browser.document.querySelectorAll('p,h3,summary')) {
    const content = node.cloneNode(true) as typeof node;
    content
      .querySelectorAll('[aria-hidden]')
      .forEach((element) => element.remove());
    const text = content.textContent.trim();
    assert.notEqual(
      translateText(text, 'en'),
      text,
      `English translation for ${text.slice(0, 50)}`,
    );
  }
});
