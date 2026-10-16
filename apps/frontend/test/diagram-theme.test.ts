import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { mountDiagram } from '../src/features/blog/diagrams';

const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

test('mounted diagrams redraw on theme changes and discard stale render results', async (t) => {
  const window = new Window();
  for (const key of ['document', 'MutationObserver'] as const) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: window[key],
    });
    t.after(() =>
      original
        ? Object.defineProperty(globalThis, key, original)
        : Reflect.deleteProperty(globalThis, key),
    );
  }
  t.after(() => window.happyDOM.abort());
  const images: Blob[] = [];
  t.mock.method(URL, 'createObjectURL', (blob: Blob) => {
    images.push(blob);
    return `blob:test-${images.length}`;
  });
  t.mock.method(URL, 'revokeObjectURL', () => {});
  window.document.documentElement.dataset.theme = 'light';
  window.document.body.innerHTML =
    '<pre><code>flowchart LR\n A --> B</code></pre>';
  const requests: { dark: boolean; resolve: (svg: string) => void }[] = [];
  mountDiagram(
    window.document.querySelector('pre')! as unknown as HTMLPreElement,
    window.document.querySelector('code')! as unknown as HTMLElement,
    'mermaid',
    async (_language, _source, dark) =>
      new Promise((resolve) => requests.push({ dark: !!dark, resolve })),
  );
  assert.equal(requests[0].dark, false);
  window.document.documentElement.dataset.theme = 'dark';
  await settle();
  assert.equal(requests[1].dark, true);
  assert.equal(
    window.document
      .querySelector('.markdown-diagram-output')
      ?.getAttribute('data-diagram-theme'),
    'dark',
  );
  requests[1].resolve('<svg><text fill="#edf2fa">Dark label</text></svg>');
  await settle();
  requests[0].resolve('<svg><text fill="black">Stale light label</text></svg>');
  await settle();
  assert.equal(images.length, 1);
  assert.ok((await images[0].text()).includes('Dark label'));
  window.document.documentElement.dataset.theme = 'light';
  await settle();
  assert.equal(requests[2].dark, false);
  requests[2].resolve('<svg>Light again</svg>');
  await settle();
  assert.equal(images.length, 2);
  assert.equal(
    window.document
      .querySelector('.markdown-diagram-output')
      ?.getAttribute('data-diagram-theme'),
    'light',
  );
  window.document.body.replaceChildren();
  await settle();
  window.document.documentElement.dataset.theme = 'dark';
  await settle();
  assert.equal(
    requests.length,
    3,
    'removed diagrams stop reacting to theme changes',
  );
});
