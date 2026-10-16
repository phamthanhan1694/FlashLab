import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Window } from 'happy-dom';
import { renderMarkdown } from '../src/features/blog/markdown';
import {
  formatMarkdown,
  markdownTable,
} from '../src/features/blog/editor-markdown';

test('GFM renders aligned tables, nested lists, task lists, references and code correctly', async (t) => {
  const browser = new Window();
  t.after(() => browser.happyDOM.abort());
  const html = renderMarkdown(
    `# Lesson

| Word | Meaning |
| :--- | ---: |
| **book** | sách |
| a \\| b | hai lựa chọn |

3. first
4. second
   - nested

- [x] learned
- [ ] review

> A quote
>
> **Strong** and *italic*, ~~old~~, \`a*b\`.

[Reference][docs] and https://example.com.

[docs]: https://example.com/docs

![Image](https://example.com/image.png)

---

\`\`\`js
const html = '<script>unsafe</script>';
\`\`\`
`,
  );
  browser.document.body.innerHTML = html;
  const root = browser.document.body;
  assert.equal(root.querySelectorAll('table tbody tr').length, 2);
  assert.equal(
    root.querySelector('th:last-child')?.getAttribute('align'),
    'right',
  );
  assert.equal(root.querySelector('td strong')?.textContent, 'book');
  assert.equal(
    root.querySelectorAll('tbody tr')[1].querySelector('td')?.textContent,
    'a | b',
  );
  assert.equal(root.querySelector('ol')?.getAttribute('start'), '3');
  assert.ok(root.querySelector('ol li ul li'));
  assert.equal(
    root.querySelectorAll('input[type=checkbox][disabled]').length,
    2,
  );
  assert.equal(root.querySelectorAll('input[checked]').length, 1);
  assert.equal(root.querySelector('del')?.textContent, 'old');
  assert.equal(root.querySelector('blockquote code')?.textContent, 'a*b');
  assert.equal(
    root.querySelector('a')?.getAttribute('href'),
    'https://example.com/docs',
  );
  assert.ok(root.querySelector('img[src="https://example.com/image.png"]'));
  assert.ok(root.querySelector('hr'));
  assert.ok(
    root
      .querySelector('pre code.language-js')
      ?.textContent?.includes('<script>unsafe</script>'),
  );
});

test('Markdown sanitization removes executable markup, unsafe URLs and application IDs', async (t) => {
  const browser = new Window();
  t.after(() => browser.happyDOM.abort());
  const html = renderMarkdown(
    '<script>alert(1)</script>\n\n<img src="x" onerror="alert(1)"><a href="javascript:alert(1)" id="content">Bad</a><iframe src="https://example.com"></iframe>\n\n[Bad](javascript:alert%281%29)\n\n<form><button>Publish</button></form>',
  );
  browser.document.body.innerHTML = html;
  assert.equal(
    browser.document.querySelector('script,iframe,form,button,[onerror],[id]'),
    null,
  );
  assert.ok(!html.includes('javascript:'));
});

test('formatting tools wrap and toggle selections without losing surrounding text', () => {
  const bold = formatMarkdown('hello world!', 6, 11, 'bold');
  assert.equal(bold.text, 'hello **world**!');
  assert.equal(bold.text.slice(bold.start, bold.end), 'world');
  assert.equal(
    formatMarkdown(bold.text, bold.start, bold.end, 'bold').text,
    'hello world!',
  );
  assert.equal(formatMarkdown('word', 0, 4, 'italic').text, '*word*');
  assert.equal(formatMarkdown('word', 0, 4, 'strike').text, '~~word~~');
  assert.equal(
    formatMarkdown('one\ntwo\nend', 0, 8, 'numbered').text,
    '1. one\n2. two\nend',
  );
  assert.equal(
    formatMarkdown('one\ntwo', 0, 7, 'checklist').text,
    '- [ ] one\n- [ ] two',
  );
  assert.equal(formatMarkdown('## Heading', 3, 10, 'h3').text, '### Heading');
  assert.equal(formatMarkdown('\nword', 0, 0, 'h2').text, '## \nword');
  assert.equal(formatMarkdown('', 0, 0, 'bold', 'Content').text, '**Content**');
  assert.ok(
    formatMarkdown('code', 0, 4, 'codeblock').text.includes('```\ncode\n```'),
  );
});

test('table tool creates the requested header and body dimensions', async (t) => {
  const browser = new Window();
  t.after(() => browser.happyDOM.abort());
  browser.document.body.innerHTML = renderMarkdown(markdownTable(3, 4));
  assert.equal(browser.document.querySelectorAll('th').length, 4);
  assert.equal(browser.document.querySelectorAll('tbody tr').length, 3);
});

test('Markdown renders URL, relative and embedded raster images without unsafe image sources', async (t) => {
  const browser = new Window();
  t.after(() => browser.happyDOM.abort());
  browser.document.body.innerHTML = renderMarkdown(
    '![Photo](https://example.com/photo.png)\n\n![Relative](images/photo.png)\n\n![Uploaded](/api/blog-images/example.png)\n\n![Embedded](data:image/png;base64,YQ==)\n\n<img src="javascript:alert(1)" onerror="alert(1)">\n<img src="data:image/svg+xml;base64,PHN2Zz4=">',
  );
  const images = browser.document.querySelectorAll('img');
  assert.equal(images[0].getAttribute('src'), 'https://example.com/photo.png');
  assert.equal(images[1].getAttribute('src'), './images/photo.png');
  assert.equal(images[2].getAttribute('src'), '/api/blog-images/example.png');
  assert.equal(images[3].getAttribute('src'), 'data:image/png;base64,YQ==');
  assert.equal(images[4].hasAttribute('src'), false);
  assert.equal(images[4].hasAttribute('onerror'), false);
  assert.equal(images[5].hasAttribute('src'), false);
});
