import { test, type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window, type HTMLSelectElement as HappySelect } from 'happy-dom';
import { initializeLanguage, translateText, uiLocale } from '../src/core/i18n';
import { renderHelpCenter, focusHelpTopic, helpLink } from '../src/ui/help';
import { localeMessages } from '../src/core/locales';
import { uiLanguages } from '@flashlab/shared';
import { mcpTools } from '../src/ui/docs-reference';

async function page(t: TestContext, route = '#/docs/mcp') {
  const window = new Window({ url: `http://localhost/${route}` });
  for (const key of [
    'document',
    'location',
    'NodeFilter',
    'MutationObserver',
    'HTMLElement',
  ] as const) {
    const previous = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, {
      configurable: true,
      value: window[key],
    });
    t.after(() =>
      previous
        ? Object.defineProperty(globalThis, key, previous)
        : Reflect.deleteProperty(globalThis, key),
    );
  }
  const html = await readFile(
    new URL('../index.html', import.meta.url),
    'utf8',
  );
  window.document.write(html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ''));
  t.after(() => window.happyDOM.abort());
  window.document.querySelector('#content')!.innerHTML = renderHelpCenter();
  return window;
}

test('English settings and all Docs sections translate multiline HTML, accessible names and later updates without modifying vocabulary', async (t) => {
  const window = await page(t);
  const speech = window.document.querySelector('.speech-settings p')!;
  const originalSpeech = speech.textContent;
  const user = window.document.createElement('p');
  user.dataset.userContent = '';
  user.textContent = 'Học phần, ghi chú và từ tiếng Việt của tôi';
  window.document.body.append(user);
  initializeLanguage('en', () => {});
  assert.match(speech.textContent, /Default: 0\.75×/);
  assert.equal(window.document.title, 'FlashLab — Study your way');
  assert.equal(user.textContent, 'Học phần, ghi chú và từ tiếng Việt của tôi');
  const remaining = new Set<string>();
  const vietnamese =
    /[ăâđêôơưàáảãạằắẳẵặầấẩẫậèéẻẽẹềếểễệìíỉĩịòóỏõọồốổỗộờớởỡợùúủũụừứửữựỳýỷỹỵ]/iu;
  const walker = window.document.createTreeWalker(
    window.document.body,
    window.NodeFilter.SHOW_TEXT,
  );
  let node;
  while ((node = walker.nextNode())) {
    if (
      node.parentElement?.closest(
        '[data-user-content],script,style,textarea,pre,code',
      )
    )
      continue;
    const text = node.textContent?.trim() ?? '';
    if (vietnamese.test(text)) remaining.add(text);
  }
  for (const el of window.document.querySelectorAll(
    '[title],[aria-label],[placeholder],[alt]',
  )) {
    if (el.closest('[data-user-content],script,style,pre,code')) continue;
    for (const name of ['title', 'aria-label', 'placeholder', 'alt']) {
      const text = el.getAttribute(name) ?? '';
      if (vietnamese.test(text)) remaining.add(`${name}: ${text}`);
    }
  }
  assert.deepEqual([...remaining], [], 'English UI contains untranslated copy');
  const later = window.document.createElement('p');
  later.textContent = 'Đang chuẩn bị\n    cấu hình MCP…';
  window.document.body.append(later);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(later.textContent, 'Preparing MCP configuration…');
  const select = window.document.querySelector<HappySelect>(
    '#interface-language',
  )!;
  select.value = 'vi';
  select.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(speech.textContent.trim(), originalSpeech.trim());
  assert.equal(user.textContent, 'Học phần, ghi chú và từ tiếng Việt của tôi');
  assert.ok(
    window.document
      .querySelector('pre[data-user-content]')!
      .textContent.includes('book,n.::sách'),
  );
});

test('Docs has icon navigation, direct MCP sections and working contextual links', async (t) => {
  const window = await page(t);
  assert.equal(
    window.document.querySelector('#nav-docs')?.getAttribute('data-nav'),
    'docs',
  );
  assert.equal(
    window.document.querySelector('#docs-page h1')?.textContent,
    'Docs',
  );
  assert.equal(window.document.querySelectorAll('.docs-toc a').length, 6);
  assert.equal(window.document.querySelectorAll('.guide-icon svg').length, 6);
  assert.ok(
    window.document.querySelector('a[href="#/docs/mcp"][aria-current]'),
  );
  focusHelpTopic();
  const mcp = window.document.querySelector('#guide-mcp')!;
  assert.ok(mcp.hasAttribute('open'));
  assert.equal(window.document.activeElement, mcp);
  assert.ok(mcp.textContent.includes('mcp_servers.flashlab'));
  assert.ok(mcp.textContent.includes('create_deck'));
  assert.ok(mcp.textContent.includes('stdio'));
  assert.match(helpLink('import'), /href="#\/docs\/import"/);
  assert.match(helpLink('backup'), /<svg/);
});

test('MCP reference includes all function signatures, examples and direct function navigation', async (t) => {
  const window = await page(t, '#/docs/mcp/update_card');
  assert.equal(
    window.document
      .querySelector('#nav-docs [data-icon]')
      ?.getAttribute('data-icon'),
    'document',
  );
  assert.equal(mcpTools.length, 12);
  for (const tool of mcpTools) {
    const section = window.document.getElementById('mcp-tool-' + tool.name)!;
    assert.ok(section);
    const samples = section.querySelectorAll('pre');
    assert.equal(samples.length, 3);
    assert.deepEqual(JSON.parse(samples[1].textContent), {
      name: tool.name,
      arguments: tool.arguments,
    });
    assert.ok(samples[2].textContent.includes('revision'));
  }
  focusHelpTopic();
  assert.ok(window.document.querySelector('#guide-mcp[open]'));
  assert.ok(window.document.querySelector('#mcp-tool-update_card[open]'));
  assert.equal(window.document.activeElement?.id, 'mcp-tool-update_card');
  assert.ok(
    window.document
      .querySelector('#guide-study')!
      .textContent.includes('Không chia điểm theo từng nghĩa'),
  );
  assert.ok(
    window.document
      .querySelector('#guide-study')!
      .textContent.includes('không đặt lại lúc nửa đêm'),
  );
});

test('exact translations take precedence over generic insertion labels and whitespace does not affect counts', () => {
  assert.equal(
    translateText('Trang 2 / 5 ·\n  42 mục', 'en'),
    'Page 2 / 5 · 42 items',
  );
  assert.equal(translateText('Chèn khối mã', 'en'), 'Insert code block');
  assert.equal(
    translateText('Đáp án: Tên  riêng\nvà nghĩa khác', 'en'),
    'Answer: Tên  riêng\nvà nghĩa khác',
  );
});

test('five native language choices switch settings, Docs and live content without changing user data or examples', async (t) => {
  const window = await page(t);
  const select = window.document.querySelector<HappySelect>(
    '#interface-language',
  )!;
  assert.deepEqual(
    Array.from(select.options, (option) => option.value),
    [...uiLanguages],
  );
  const nativeNames = Array.from(select.options, (option) =>
    option.textContent.trim(),
  );
  assert.deepEqual(nativeNames, [
    'Tiếng Việt',
    'English',
    '한국어',
    '中文（简体）',
    '日本語',
  ]);
  const examples = Array.from(
    window.document.querySelectorAll('[data-user-content]'),
    (node) => node.textContent,
  );
  const saved: string[] = [];
  initializeLanguage('ko', (value) => saved.push(value));
  const checks = {
    ko: ['읽기 속도', 'AI 연결', /[\uac00-\ud7a3]/u],
    zh: ['朗读速度', 'AI', /[\u4e00-\u9fff]/u],
    ja: ['読み上げ速度', 'AI', /[\u3040-\u30ff]/u],
  } as const;
  for (const language of ['ko', 'zh', 'ja', 'en', 'vi', 'ja'] as const) {
    select.value = language;
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(window.document.documentElement.lang, language);
    assert.equal(select.value, language);
    assert.equal(
      window.document
        .querySelector('.speech-settings')!
        .textContent.includes(translateText('Tốc độ đọc', language)),
      true,
    );
    if (language === 'ko' || language === 'zh' || language === 'ja') {
      assert.ok(
        window.document
          .querySelector('#guide-mcp')!
          .textContent.match(checks[language][2]),
      );
      assert.ok(
        window.document
          .querySelector('.speech-settings')!
          .textContent.includes(checks[language][0]),
      );
      assert.ok(
        !window.document
          .querySelector('.speech-settings')!
          .textContent.includes('Default:'),
      );
      const later = window.document.createElement('p');
      later.textContent = 'Đang chuẩn bị\n cấu hình MCP…';
      window.document.body.append(later);
      await new Promise((resolve) => setTimeout(resolve, 0));
      assert.equal(
        later.textContent,
        translateText('Đang chuẩn bị cấu hình MCP…', language),
      );
      later.remove();
      assert.equal(
        translateText('Đáp án: Tên  riêng\nvà nghĩa khác', language).endsWith(
          'Tên  riêng\nvà nghĩa khác',
        ),
        true,
      );
    }
    assert.deepEqual(
      Array.from(select.options, (option) => option.textContent.trim()),
      nativeNames,
    );
    assert.deepEqual(
      Array.from(
        window.document.querySelectorAll('[data-user-content]'),
        (node) => node.textContent,
      ),
      examples,
    );
  }
  assert.deepEqual(saved, ['ko', 'zh', 'ja', 'en', 'vi', 'ja']);
});

test('every locale message retains its interpolation tokens', () => {
  const tokens = (text: string) => (text.match(/\{\{\d+\}\}/g) ?? []).sort();
  for (const [english, localized] of Object.entries(localeMessages)) {
    assert.equal(localized.length, 3);
    for (const text of localized) {
      assert.ok(text.trim(), english);
      assert.deepEqual(tokens(text), tokens(english), english);
    }
  }
  for (const target of ['ko', 'zh', 'ja'] as const) {
    assert.doesNotMatch(translateText('Tháng 12', target), /undefined|Dec/);
    assert.doesNotMatch(
      translateText('CÂU 3 · TỰ LUẬN', target),
      /QUESTION|undefined/,
    );
    assert.doesNotMatch(
      translateText('Âm lượng Nhạc nền', target),
      /Volume:|undefined|Nhạc nền/,
    );
    assert.match(translateText('Trang 2 / 5 ·\n 42 mục', target), /2.*5.*42/);
  }
});

test('pretranslated live labels and generated timestamps follow later language changes', async (t) => {
  const window = await page(t);
  const select = window.document.querySelector<HappySelect>(
    '#interface-language',
  )!;
  initializeLanguage('ko', () => {});
  const live = window.document.createElement('p');
  live.textContent = translateText('Đang lưu bài viết…', 'ko');
  const time = window.document.createElement('time');
  time.dataset.userContent = '';
  time.dataset.uiDate = '';
  time.dateTime = '2026-10-19T08:05:00Z';
  window.document.body.append(live, time);
  await new Promise((resolve) => setTimeout(resolve, 0));
  for (const language of ['ja', 'zh', 'en', 'vi'] as const) {
    select.value = language;
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(
      live.textContent,
      translateText('Đang lưu bài viết…', language),
    );
    assert.equal(
      time.textContent,
      new Date(time.dateTime).toLocaleString(uiLocale()),
    );
  }
});
