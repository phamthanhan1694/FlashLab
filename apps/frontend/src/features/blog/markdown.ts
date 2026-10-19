import { codeBlockToolbar } from './code-block';
import hljs from 'highlight.js/lib/common';
import { mountDiagram } from './diagrams';
import { translateText } from '../../core/i18n';
import { Marked } from 'marked';
import xss from 'xss';
// js-xss exposes these helpers on its CommonJS default export.
const { FilterXSS, escapeAttrValue } = xss as unknown as typeof import('xss');

const markdown = new Marked({ gfm: true, breaks: false, async: false });
const sanitizer = new FilterXSS({
  whiteList: {
    h1: [],
    h2: [],
    h3: [],
    h4: [],
    h5: [],
    h6: [],
    p: [],
    br: [],
    hr: [],
    strong: [],
    b: [],
    em: [],
    i: [],
    del: [],
    s: [],
    blockquote: [],
    ul: [],
    ol: ['start'],
    li: [],
    pre: [],
    code: ['class'],
    a: ['href', 'title'],
    img: ['src', 'alt', 'title', 'width', 'height'],
    table: [],
    caption: [],
    thead: [],
    tbody: [],
    tfoot: [],
    tr: [],
    th: ['align', 'colspan', 'rowspan'],
    td: ['align', 'colspan', 'rowspan'],
    dl: [],
    dt: [],
    dd: [],
    kbd: [],
    samp: [],
    sub: [],
    sup: [],
    mark: [],
    details: ['open'],
    summary: [],
    input: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style', 'iframe', 'object', 'embed'],
  css: false,
  onTag(tag, html, options) {
    // Task boxes are always inert, including boxes supplied through raw HTML.
    if (tag === 'input')
      return options.isClosing
        ? ''
        : `<input type="checkbox" disabled${/\schecked(?:\s|=|\/?>)/i.test(html) ? ' checked' : ''}>`;
  },
  onTagAttr(tag, name, value) {
    // Keep relative Markdown image paths; reject URI schemes other than HTTP(S)
    // and embedded raster images. The sanitizer still escapes attribute values.
    if (tag === 'img' && name === 'src') {
      const url = value.trim();
      if (
        !url ||
        /[\u0000-\u0020\u007f]/.test(url) ||
        /^(?:javascript|vbscript|file|blob):/i.test(url)
      )
        return '';
      if (
        /^[a-z][a-z0-9+.-]*:/i.test(url) &&
        !/^https?:\/\//i.test(url) &&
        !/^data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+/]+=*$/i.test(url)
      )
        return '';
      // Prefix bare relative paths so the default URL sanitizer accepts them.
      if (!/^(?:[a-z][a-z0-9+.-]*:|\/|\.|#)/i.test(url))
        return `src="${escapeAttrValue('./' + url)}"`;
    }
    if (tag === 'code' && name === 'class')
      return /^language-[a-z0-9_+#.-]+$/i.test(value) ? `class="${value}"` : '';
  },
});
export function renderMarkdown(source: string): string {
  return sanitizer.process(
    markdown.parse(source.replace(/^[\u200B-\u200F\uFEFF]+/, ''), {
      async: false,
    }),
  );
}

export function mountMarkdown(root: HTMLElement, source: string) {
  root.setAttribute('data-user-content', '');
  root.innerHTML = renderMarkdown(source);
  root.querySelectorAll('table').forEach((table) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'markdown-table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.dataset.markdownUiLabelSource = 'Bảng nội dung';
    wrapper.setAttribute('aria-label', translateText('Bảng nội dung'));
    table.before(wrapper);
    wrapper.append(table);
  });
  root.querySelectorAll('a[href]').forEach((link) => {
    if (/^(https?:|mailto:)/i.test(link.getAttribute('href') ?? '')) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
    }
  });
  root.querySelectorAll<HTMLElement>('pre > code').forEach((code) => {
    const pre = code.parentElement as HTMLPreElement;
    let language =
      Array.from(code.classList)
        .find((value) => value.startsWith('language-'))
        ?.slice(9)
        .toLowerCase() ?? '';
    language =
      (
        {
          'c++': 'cpp',
          'c#': 'csharp',
          md: 'markdown',
          plain: 'plaintext',
        } as Record<string, string>
      )[language] ?? language;
    // Unlabelled fences containing a diagram should still render as a diagram.
    if (!language) {
      const diagramSource = (code.textContent ?? '').trimStart();
      if (
        /^(?:%%[^\n]*\n\s*)*(?:flowchart|graph)\s+(?:TB|TD|BT|RL|LR)\b|^(?:sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|gantt|pie|mindmap|timeline|gitGraph|journey|quadrantChart|xychart-beta|block-beta|packet-beta|architecture-beta|kanban)\b/.test(
          diagramSource,
        )
      )
        language = 'mermaid';
      else if (/^@startuml\b/.test(diagramSource)) language = 'plantuml';
    }
    if (['mermaid', 'plantuml', 'puml', 'uml'].includes(language)) {
      mountDiagram(pre, code, language === 'mermaid' ? 'mermaid' : 'plantuml');
      return;
    }
    const originalSource = code.textContent ?? '';
    let displayedLanguage = language || 'text';
    if (language !== 'text' && language !== 'plaintext' && language !== 'txt') {
      const source = code.textContent ?? '';
      const highlighted =
        language && hljs.getLanguage(language)
          ? hljs.highlight(source, { language, ignoreIllegals: true })
          : language
            ? { value: code.innerHTML, language }
            : hljs.highlightAuto(source);
      if (!language) displayedLanguage = highlighted.language ?? 'text';
      code.innerHTML = highlighted.value;
      code.classList.add('hljs');
    }
    pre.classList.add('highlighted-code');
    const block = document.createElement('div');
    block.className = 'markdown-code-block';
    pre.replaceWith(block);
    block.append(
      codeBlockToolbar(
        hljs.getLanguage(displayedLanguage)?.name ?? displayedLanguage,
        originalSource,
      ),
      pre,
    );
  });
  root.querySelectorAll('img').forEach((image) => {
    image.loading = 'lazy';
    image.decoding = 'async';
  });
}
