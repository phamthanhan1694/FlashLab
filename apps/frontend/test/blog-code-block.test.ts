import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { mountMarkdown } from '../src/features/blog/markdown';
import { codeBlockToolbar } from '../src/features/blog/code-block';

test('code and plain text show language labels and copy exact unescaped source', async (t) => {
  const window = new Window();
  const copied: string[] = [];
  Object.defineProperty(window.navigator, 'clipboard', {
    value: {
      writeText: async (value: string) => {
        copied.push(value);
      },
    },
  });
  for (const key of ['document', 'navigator'] as const) {
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
  const root = window.document.createElement('div');
  window.document.body.append(root);
  mountMarkdown(
    root as unknown as HTMLElement,
    '```java\nclass Example {}\n```\n\n```text\na < b & c\n```',
  );
  assert.deepEqual(
    Array.from(
      root.querySelectorAll('.markdown-code-language'),
      (label) => label.textContent,
    ),
    ['Java', 'Văn bản thuần'],
  );
  for (const button of root.querySelectorAll('button')) {
    await button.onclick!(new window.MouseEvent('click'));
  }
  assert.deepEqual(copied, ['class Example {}\n', 'a < b & c\n']);
  const diagram = codeBlockToolbar('Mermaid', 'flowchart LR\n A --> B\n');
  await diagram.querySelector('button')!.onclick!(
    new window.MouseEvent('click') as unknown as PointerEvent,
  );
  assert.equal(copied.at(-1), 'flowchart LR\n A --> B\n');
});

test('explicit C++, C#, Markdown and text fences keep their correct languages', async (t) => {
  const window = new Window();
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    configurable: true,
    value: window.document,
  });
  t.after(() =>
    descriptor
      ? Object.defineProperty(globalThis, 'document', descriptor)
      : Reflect.deleteProperty(globalThis, 'document'),
  );
  t.after(() => window.happyDOM.abort());
  const root = window.document.createElement('div');
  mountMarkdown(
    root as unknown as HTMLElement,
    '```c++\nint main() { return 0; }\n```\n```c#\nclass Example {}\n```\n```md\n# Heading\n```\n```text\nint main() {}\n```',
  );
  assert.deepEqual(
    Array.from(
      root.querySelectorAll('.markdown-code-language'),
      (node) => node.textContent,
    ),
    ['C++', 'C#', 'Markdown', 'Văn bản thuần'],
  );
  assert.equal(root.querySelectorAll('pre code.hljs').length, 3);
  assert.equal(
    root.querySelectorAll('h1').length,
    0,
    'Markdown inside a code block remains code',
  );
});
