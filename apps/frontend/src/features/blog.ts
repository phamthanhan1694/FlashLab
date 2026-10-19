import { tileSizeMarkup, tilePageSize } from '../ui/tile-settings';
import { pageButtons } from '../ui/pagination';
import { ico } from '../ui/icons';
import { createButton } from '../ui/create-button';
import { helpLink } from '../ui/help';
import { esc } from '../core/utils';
import type { Profile } from '@flashlab/shared';
import { askConfirmation, notify, validateForm } from '../ui/feedback';
import { translatePage, translateText, uiLocale } from '../core/i18n';
import { mountMarkdown } from './blog/markdown';
import {
  formatMarkdown,
  markdownTable,
  type MarkdownTool,
  type MarkdownEdit,
} from './blog/editor-markdown';
export { renderMarkdown } from './blog/markdown';
export interface Article {
  created?: number;
  id: string;
  ownerId?: string;
  title: string;
  markdown: string;
  author: string;
  revision: number;
  updated: number;
}
const toolButtons: [string, string, string][] = [
  ['undo', 'Hoàn tác', '↶'],
  ['redo', 'Làm lại', '↷'],
  ['bold', 'In đậm', '<strong>B</strong>'],
  ['italic', 'In nghiêng', '<em>I</em>'],
  ['strike', 'Gạch ngang', '<s>S</s>'],
  ['h1', 'Tiêu đề cấp 1', 'H1'],
  ['h2', 'Tiêu đề cấp 2', 'H2'],
  ['h3', 'Tiêu đề cấp 3', 'H3'],
  ['bullet', 'Danh sách dấu chấm', '•'],
  ['numbered', 'Danh sách đánh số', '1.'],
  ['checklist', 'Danh sách công việc', '☑'],
  ['quote', 'Trích dẫn', '❝'],
  ['code', 'Mã nội dòng', '&lt;/&gt;'],
  ['codeblock', 'Khối mã', '{ }'],
  ['link', 'Chèn liên kết', '↗'],
  ['image', 'Chèn ảnh', '▧'],
  ['table', 'Chèn bảng', '▦'],
  ['mermaid', 'Chèn sơ đồ Mermaid', 'M'],
  ['plantuml', 'Chèn sơ đồ PlantUML', 'UML'],
  ['rule', 'Đường phân cách', '—'],
];
const excerpt = (source: string) =>
  source
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[#*_`~>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 180);
export function initializeBlog(
  profile: Profile,
  personalRequest?: (url: string, options?: RequestInit) => Promise<Response>,
) {
  const personal = !!personalRequest;
  const route = personal ? 'notes' : 'blog';
  const request =
    personalRequest ??
    ((url: string, options?: RequestInit) => fetch(url, options));
  const routeFor = (article: Article, edit = false) =>
    `#/${route}/${encodeURIComponent(article.id)}${edit ? '/edit' : ''}`;
  const nav = personal
    ? document.querySelector('[data-blog-open]')
    : document.querySelector('[data-nav="classes"]');
  const button = document.createElement('button');
  button.className = nav?.className ?? 'btn outline';
  const navLabel = personal ? 'Ghi chú' : 'Bài viết';
  button.innerHTML = ico(personal ? 'pencil' : 'book', 20);
  button.title = navLabel;
  button.setAttribute('aria-label', navLabel);
  button.dataset.blogOpen = route;
  nav?.after(button);
  let articles: Article[] = [];
  let generation = 0;
  let search = '';
  let page = 1;
  const content = () => document.getElementById('content')!;
  const locale = uiLocale;
  const metadata = (article: Article) =>
    `<span data-user-content>${esc(article.author)}</span><span aria-hidden="true">·</span><time data-user-content datetime="${new Date(article.updated).toISOString()}">${new Date(article.updated).toLocaleDateString(locale(), { dateStyle: 'medium' })}</time>`;
  function listEntries() {
    const pageSize = tilePageSize();
    const filtered = articles.filter((article) =>
      `${article.title} ${article.author} ${article.markdown}`
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase().trim()),
    );
    const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
    page = Math.min(page, pages);
    return `<div class="blog-articles">${
      filtered
        .slice((page - 1) * pageSize, page * pageSize)
        .map(
          (article) =>
            `<article class="blog-card"><div class="blog-meta">${metadata(article)}</div><h2><a href="${routeFor(article)}" data-user-content>${esc(article.title)}</a></h2><p class="blog-excerpt" data-user-content>${esc(excerpt(article.markdown))}${article.markdown.length > 180 ? '…' : ''}</p><a class="blog-read-link" href="${routeFor(article)}">${personal ? 'Đọc ghi chú' : 'Đọc bài viết'} <span aria-hidden="true">→</span></a></article>`,
        )
        .join('') ||
      `<div class="empty"><h2>${personal ? 'Chưa có ghi chú phù hợp' : 'Chưa có bài viết phù hợp'}</h2><p>${personal ? 'Viết ghi chú mới hoặc thử từ khóa khác.' : 'Viết bài mới hoặc thử từ khóa khác.'}</p></div>`
    }</div>${pages > 1 ? `<nav class="history-pagination" aria-label="${personal ? 'Phân trang ghi chú' : 'Phân trang bài viết'}"><span data-user-content>${page} / ${pages}</span><div class="header-actions">${pageButtons(page, pages, (number) => `data-blog-page="${number}"`)}</div></nav>` : ''}`;
  }
  function showList() {
    content().innerHTML = `<section class="blog-page"><div class="heading-row page-heading"><div><h1>${personal ? 'Ghi chú cá nhân' : 'Bài viết học tập'}</h1><p class="lead">${personal ? 'Ghi chú lưu riêng theo người dùng, đi kèm bản sao lưu hồ sơ.' : 'Bài viết dùng chung cho mọi người trên máy chủ này.'}</p></div>${createButton(personal ? 'Viết ghi chú' : 'Viết bài', 'data-blog-new')}</div>${tileSizeMarkup()}<div class="blog-list-tools"><label for="blog-search">${personal ? 'Tìm ghi chú' : 'Tìm bài viết'}</label><input id="blog-search" type="search" placeholder="Tìm theo tiêu đề, tác giả hoặc nội dung…" value="${esc(search)}"><span data-user-content>${articles.length}</span></div><div id="blog-entries">${listEntries()}</div></section>`;
    document
      .getElementById('blog-search')!
      .addEventListener('input', (event) => {
        search = (event.target as HTMLInputElement).value;
        page = 1;
        document.getElementById('blog-entries')!.innerHTML = listEntries();
        translatePage();
      });
  }
  document.addEventListener('tile-layout-change', () => {
    if (
      location.hash !== `#/${route}` ||
      !document.getElementById('blog-entries')
    )
      return;
    page = 1;
    document.getElementById('blog-entries')!.innerHTML = listEntries();
    translatePage();
  });
  function showDetail(article: Article) {
    content().innerHTML = `<section class="blog-detail"><a class="btn-ghost blog-back" href="#/${route}">${personal ? '← Tất cả ghi chú' : '← Tất cả bài viết'}</a><article class="blog-reader"><header class="blog-reader-header"><h1 data-user-content>${esc(article.title)}</h1><div class="blog-meta">${metadata(article)}</div><div class="header-actions">${article.ownerId === profile.id ? `<a class="btn outline" href="${routeFor(article, true)}" data-blog-edit="${esc(article.id)}">${personal ? 'Sửa ghi chú' : 'Sửa bài'}</a><button type="button" class="btn danger" data-blog-delete="${esc(article.id)}">${personal ? 'Xóa ghi chú' : 'Xóa bài'}</button>` : ''}<button class="btn outline" data-blog-download="${esc(article.id)}">Tải .md</button></div></header>${!article.ownerId ? '<p class="blog-owner-note">Bài cũ chưa xác định được chủ sở hữu nên đang ở chế độ chỉ đọc.</p>' : ''}<div class="markdown-body blog-reader-body" data-user-content></div></article></section>`;
    mountMarkdown(
      content().querySelector<HTMLElement>('.markdown-body')!,
      article.markdown,
    );
  }
  function edit(article?: Article) {
    const newNoteId = personal ? crypto.randomUUID() : undefined;
    content().innerHTML = `<section class="blog-editor-page"><a class="btn-ghost blog-back" href="${article ? routeFor(article) : `#/${route}`}">← Quay lại</a><div class="heading-row page-heading"><div><h1>${personal ? (article ? 'Sửa ghi chú' : 'Viết ghi chú') : article ? 'Sửa bài viết' : 'Viết bài mới'}</h1><p class="lead">Viết Markdown trực tiếp hoặc dùng thanh công cụ để chèn định dạng.</p></div></div><form id="blog-form" novalidate><div class="blog-editor-metadata"><div class="form-field"><label for="blog-title">Tiêu đề</label><input id="blog-title" required maxlength="200" value="${esc(article?.title ?? '')}" placeholder="${personal ? 'Đặt tên cho ghi chú…' : 'Đặt tên cho bài viết…'}"></div><div class="form-field"><label for="blog-author">Người viết</label><input id="blog-author" required maxlength="60" data-user-content value="${esc(article?.author ?? profile.name)}"></div></div><div class="blog-editor-controls"><div class="header-actions"><button type="button" class="btn outline small" data-blog-toolbar-toggle aria-expanded="true" aria-controls="blog-toolbar">Công cụ định dạng</button><label class="btn outline small blog-file-label" for="blog-file">Nhập file .md<input id="blog-file" type="file" accept=".md,.markdown,text/markdown,text/plain"></label></div><div class="blog-view-switch" role="group" aria-label="Chế độ soạn thảo"><button type="button" data-blog-view="write" aria-pressed="false">Soạn thảo</button><button type="button" data-blog-view="split" aria-pressed="true" data-blog-preview>Chia đôi</button><button type="button" data-blog-view="preview" aria-pressed="false">Xem trước</button></div></div><div class="blog-editor" data-view="split"><div class="blog-source-panel"><div id="blog-toolbar" role="toolbar" aria-label="Định dạng Markdown">${toolButtons.map(([tool, label, visual]) => `<button type="button" data-md-tool="${tool}" title="${label}" aria-label="${label}"><span aria-hidden="true">${visual}</span></button>`).join('')}</div><div id="blog-insert-panel" hidden></div><label class="blog-panel-label" for="blog-markdown">Nội dung Markdown</label><textarea id="blog-markdown" required maxlength="200000" spellcheck="true" placeholder="${personal ? 'Bắt đầu ghi chú…' : 'Bắt đầu viết bài…'}">${esc(article?.markdown ?? '')}</textarea></div><section class="blog-preview-panel" aria-labelledby="blog-preview-title"><div class="blog-panel-label" id="blog-preview-title">Bản xem trước</div><div class="markdown-body" id="blog-preview" data-user-content></div></section></div><p class="blog-editor-help">Mẹo: chọn văn bản rồi bấm công cụ. Ctrl/Cmd+B để in đậm, Ctrl/Cmd+I để in nghiêng. Hỗ trợ bảng, danh sách, checklist, liên kết, ảnh và khối mã.</p>${helpLink('writing')}<div class="blog-editor-footer"><p role="status" id="blog-status"></p><button class="btn primary" type="submit">${article ? 'Lưu thay đổi' : personal ? 'Lưu ghi chú' : 'Đăng bài'}</button></div></form></section>`;
    const form = document.getElementById('blog-form') as HTMLFormElement;
    const textarea = document.getElementById(
      'blog-markdown',
    ) as HTMLTextAreaElement;
    const preview = document.getElementById('blog-preview')!;
    const status = document.getElementById('blog-status')!;
    const editor = form.querySelector<HTMLElement>('.blog-editor')!;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const history: MarkdownEdit[] = [
      { text: textarea.value, start: 0, end: 0 },
    ];
    let historyIndex = 0;
    let restoring = false;
    const updateHistoryButtons = () => {
      for (const tool of ['undo', 'redo']) {
        const control = form.querySelector<HTMLButtonElement>(
          `[data-md-tool="${tool}"]`,
        )!;
        control.disabled =
          tool === 'undo'
            ? historyIndex === 0
            : historyIndex === history.length - 1;
      }
    };
    const restore = (step: number) => {
      const next = historyIndex + step;
      if (next < 0 || next >= history.length) return;
      historyIndex = next;
      restoring = true;
      const value = history[next];
      textarea.value = value.text;
      textarea.focus();
      textarea.setSelectionRange(value.start, value.end);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      restoring = false;
      updateHistoryButtons();
      refresh();
    };
    const refresh = () => {
      if (!form.isConnected) return;
      mountMarkdown(preview, textarea.value);
    };
    const update = (edit: MarkdownEdit) => {
      if (edit.text.length > textarea.maxLength) {
        notify('Nội dung vượt quá 200.000 ký tự.', true);
        return;
      }
      textarea.setRangeText(edit.text, 0, textarea.value.length, 'preserve');
      textarea.focus();
      textarea.setSelectionRange(edit.start, edit.end);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      refresh();
    };
    const insert = (
      insertion: string,
      start = textarea.selectionStart,
      end = textarea.selectionEnd,
    ) =>
      update({
        text:
          textarea.value.slice(0, start) +
          insertion +
          textarea.value.slice(end),
        start,
        end: start + insertion.length,
      });
    const setView = (view: string) => {
      editor.dataset.view = view;
      form
        .querySelectorAll<HTMLElement>('[data-blog-view]')
        .forEach((control) =>
          control.setAttribute(
            'aria-pressed',
            String(control.dataset.blogView === view),
          ),
        );
      refresh();
    };
    textarea.addEventListener('input', () => {
      if (!restoring && history[historyIndex].text !== textarea.value) {
        history.splice(historyIndex + 1);
        history.push({
          text: textarea.value,
          start: textarea.selectionStart,
          end: textarea.selectionEnd,
        });
        if (history.length > 50) history.shift();
        historyIndex = history.length - 1;
      }
      updateHistoryButtons();
      clearTimeout(timer);
      timer = setTimeout(refresh, 150);
    });
    textarea.addEventListener('keydown', (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ['z', 'y'].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
        restore(event.key.toLowerCase() === 'y' || event.shiftKey ? 1 : -1);
        return;
      }
      if (
        (event.ctrlKey || event.metaKey) &&
        ['b', 'i'].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
        update(
          formatMarkdown(
            textarea.value,
            textarea.selectionStart,
            textarea.selectionEnd,
            event.key.toLowerCase() === 'b' ? 'bold' : 'italic',
            translateText('Nội dung'),
          ),
        );
      }
    });
    form
      .querySelectorAll<HTMLElement>('[data-blog-view]')
      .forEach(
        (control) =>
          (control.onclick = () => setView(control.dataset.blogView!)),
      );
    form.querySelector<HTMLElement>('[data-blog-toolbar-toggle]')!.onclick = (
      event,
    ) => {
      const control = event.currentTarget as HTMLElement;
      const toolbar = document.getElementById('blog-toolbar')!;
      toolbar.hidden = !toolbar.hidden;
      control.setAttribute('aria-expanded', String(!toolbar.hidden));
    };
    form.querySelectorAll<HTMLElement>('[data-md-tool]').forEach((control) => {
      control.addEventListener('mousedown', (event) => event.preventDefault());
      control.onclick = () => {
        const tool = control.dataset.mdTool!;
        if (tool === 'undo' || tool === 'redo') {
          restore(tool === 'undo' ? -1 : 1);
          return;
        }
        if (tool === 'mermaid' || tool === 'plantuml') {
          const source =
            tool === 'mermaid'
              ? 'flowchart LR\n  A[Start] --> B[Finish]'
              : '@startuml\nAlice -> Bob: Hello\n@enduml';
          insert(`\n\n\`\`\`${tool}\n${source}\n\`\`\`\n\n`);
          return;
        }
        if (['link', 'image', 'table', 'codeblock'].includes(tool)) {
          showInsert(tool);
          return;
        }
        update(
          formatMarkdown(
            textarea.value,
            textarea.selectionStart,
            textarea.selectionEnd,
            tool as MarkdownTool,
            translateText(tool === 'codeblock' ? 'Mã nguồn' : 'Nội dung'),
          ),
        );
      };
    });
    function showInsert(tool: string) {
      const start = textarea.selectionStart,
        end = textarea.selectionEnd;
      const selected = textarea.value.slice(start, end);
      const panel = document.getElementById('blog-insert-panel')!;
      panel.hidden = false;
      panel.innerHTML =
        tool === 'codeblock'
          ? `<div class="form-field"><label for="blog-code-language">Ngôn ngữ khối mã</label><select id="blog-code-language">${[
              ['', 'Tự nhận diện'],
              ['javascript', 'JavaScript'],
              ['typescript', 'TypeScript'],
              ['python', 'Python'],
              ['java', 'Java'],
              ['c', 'C'],
              ['cpp', 'C++'],
              ['csharp', 'C#'],
              ['xml', 'HTML / XML'],
              ['css', 'CSS'],
              ['json', 'JSON'],
              ['sql', 'SQL'],
              ['bash', 'Shell'],
              ['mermaid', 'Mermaid'],
              ['plantuml', 'PlantUML'],
              ['markdown', 'Markdown'],
              ['text', 'Văn bản thuần'],
            ]
              .map(
                ([value, label]) =>
                  `<option value="${value}">${label}</option>`,
              )
              .join('')}</select></div>`
          : tool === 'table'
            ? '<div class="blog-insert-fields"><div class="form-field"><label for="blog-table-rows">Số dòng nội dung</label><input id="blog-table-rows" type="number" min="1" max="20" value="3"></div><div class="form-field"><label for="blog-table-cols">Số cột</label><input id="blog-table-cols" type="number" min="2" max="10" value="2"></div></div>'
            : `<div class="blog-insert-fields"><div class="form-field"><label for="blog-insert-text">${tool === 'image' ? 'Mô tả ảnh' : 'Văn bản liên kết'}</label><input id="blog-insert-text" value="${esc(selected)}"></div><div class="form-field"><label for="blog-insert-url">${tool === 'image' ? 'Địa chỉ ảnh' : 'Địa chỉ liên kết'}</label><input id="blog-insert-url" type="url" placeholder="https://..."></div></div>`;
      if (tool === 'image')
        panel.innerHTML += `<div class="form-field"><label for="blog-image-file">Hoặc chọn ảnh từ máy</label><input id="blog-image-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><small>PNG, JPEG, WebP hoặc GIF · tối đa ${personal ? '100 KB' : '2 MB'}</small></div>`;
      panel.innerHTML +=
        '<div class="header-actions"><button type="button" class="btn primary small" data-blog-insert-apply>Chèn</button><button type="button" class="btn outline small" data-blog-insert-cancel>Hủy</button></div><p role="status" class="blog-insert-error"></p>';
      panel.querySelector<HTMLElement>('[data-blog-insert-cancel]')!.onclick =
        () => {
          panel.hidden = true;
          panel.replaceChildren();
          textarea.focus();
          textarea.setSelectionRange(start, end);
        };
      panel.querySelector<HTMLElement>('[data-blog-insert-apply]')!.onclick =
        () => {
          const field = (id: string) =>
            (document.getElementById(id) as HTMLInputElement).value;
          let insertion: string;
          if (tool === 'codeblock') {
            const language = field('blog-code-language');
            const code =
              selected ||
              (language === 'mermaid'
                ? 'flowchart LR\n  A[Start] --> B[Finish]'
                : language === 'plantuml'
                  ? '@startuml\nAlice -> Bob: Hello\n@enduml'
                  : translateText('Mã nguồn'));
            const fence = '`'.repeat(
              Math.max(
                3,
                ...Array.from(
                  code.matchAll(/`+/g),
                  (match) => match[0].length + 1,
                ),
              ),
            );
            insertion = `\n\n${fence}${language}\n${code}\n${fence}\n\n`;
          } else if (tool === 'table') {
            const rows = Number(field('blog-table-rows')),
              columns = Number(field('blog-table-cols'));
            if (
              !Number.isInteger(rows) ||
              rows < 1 ||
              rows > 20 ||
              !Number.isInteger(columns) ||
              columns < 2 ||
              columns > 10
            ) {
              panel.querySelector('.blog-insert-error')!.textContent =
                translateText('Chọn 1–20 dòng và 2–10 cột.');
              return;
            }
            insertion = markdownTable(
              rows,
              columns,
              translateText('Cột'),
              translateText('Nội dung'),
            );
          } else {
            const url = field('blog-insert-url').trim();
            const validUrl =
              /^https?:\/\/\S+$/i.test(url) ||
              (tool === 'image' &&
                (/^\/(?!\/)\S+$/.test(url) ||
                  (personal &&
                    /^data:image\/(?:png|jpeg|webp|gif);base64,[a-z0-9+/]+=*$/i.test(
                      url,
                    ))));
            if (!validUrl) {
              panel.querySelector('.blog-insert-error')!.textContent =
                translateText(
                  'Nhập địa chỉ bắt đầu bằng https:// hoặc http://.',
                );
              return;
            }
            const label = (field('blog-insert-text').trim() || url).replace(
              /([\\\[\]])/g,
              '\\$1',
            );
            insertion = `${tool === 'image' ? '!' : ''}[${label}](${url.replace(/\(/g, '%28').replace(/\)/g, '%29')})`;
          }
          insert(insertion, start, end);
          panel.hidden = true;
          panel.replaceChildren();
        };
      const imageFile =
        panel.querySelector<HTMLInputElement>('#blog-image-file');
      if (imageFile)
        imageFile.onchange = async () => {
          const file = imageFile.files?.[0];
          const apply = panel.querySelector<HTMLButtonElement>(
            '[data-blog-insert-apply]',
          )!;
          if (!file) {
            apply.disabled = false;
            return;
          }
          const message =
            panel.querySelector<HTMLElement>('.blog-insert-error')!;
          if (
            file.size > (personal ? 100_000 : 2_000_000) ||
            !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
              file.type,
            )
          ) {
            message.textContent = translateText(
              personal
                ? 'Ảnh trong ghi chú tối đa 100 KB.'
                : 'Chọn ảnh PNG, JPEG, WebP hoặc GIF tối đa 2 MB.',
            );
            apply.disabled = false;
            return;
          }
          apply.disabled = true;
          message.textContent = translateText('Đang tải ảnh…');
          try {
            const data = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => resolve(String(reader.result));
              reader.onerror = () => reject(new Error('Không đọc được ảnh.'));
              reader.readAsDataURL(file);
            });
            const response = personal
              ? new Response(JSON.stringify({ url: data }))
              : await fetch('/api/blog-images', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'X-FlashLab-Profile': profile.id,
                  },
                  body: JSON.stringify({ data }),
                });
            const result = await response.json();
            if (!response.ok)
              throw new Error(result.error || 'Không tải được ảnh.');
            if (!imageFile.isConnected || imageFile.files?.[0] !== file) return;
            (
              panel.querySelector('#blog-insert-url') as HTMLInputElement
            ).value = result.url;
            const description = panel.querySelector(
              '#blog-insert-text',
            ) as HTMLInputElement;
            if (!description.value.trim()) description.value = file.name;
            message.textContent = translateText(
              'Ảnh đã sẵn sàng. Bấm Chèn để thêm vào bài.',
            );
          } catch (error) {
            if (imageFile.isConnected && imageFile.files?.[0] === file)
              message.textContent = translateText(
                error instanceof Error ? error.message : 'Không tải được ảnh.',
              );
          } finally {
            if (imageFile.isConnected && imageFile.files?.[0] === file)
              apply.disabled = false;
          }
        };
      panel.querySelector<HTMLInputElement>('input')?.focus();
      translatePage();
    }
    (document.getElementById('blog-file') as HTMLInputElement).onchange =
      async (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) return;
        if (!/\.(md|markdown)$/i.test(file.name))
          return notify('Chọn file Markdown có đuôi .md hoặc .markdown.', true);
        if (file.size > 200000) return notify('File lớn hơn 200 KB.', true);
        try {
          const text = await file.text();
          if (!form.isConnected) return;
          textarea.value = text.replace(/^\uFEFF/, '');
          textarea.dispatchEvent(new Event('input', { bubbles: true }));
          if (
            !(
              document.getElementById('blog-title') as HTMLInputElement
            ).value.trim()
          )
            (document.getElementById('blog-title') as HTMLInputElement).value =
              file.name.replace(/\.(md|markdown)$/i, '');
          refresh();
        } catch {
          notify('Không đọc được file Markdown.', true);
        }
      };
    form.onsubmit = async (event) => {
      event.preventDefault();
      if (!textarea.value.trim()) setView('write');
      if (!validateForm(form)) return;
      const title = (
        document.getElementById('blog-title') as HTMLInputElement
      ).value.trim();
      const author = (
        document.getElementById('blog-author') as HTMLInputElement
      ).value.trim();
      if (!title || !author || !textarea.value.trim()) {
        status.textContent = translateText(
          'Điền tiêu đề, người viết và nội dung.',
        );
        return;
      }
      const submit = form.querySelector<HTMLButtonElement>('[type="submit"]')!;
      submit.disabled = true;
      status.textContent = translateText(
        personal ? 'Đang lưu ghi chú…' : 'Đang lưu bài viết…',
      );
      try {
        const response = await request(
          article ? `/api/blog/${article.id}` : '/api/blog',
          {
            method: article ? 'PUT' : 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-FlashLab-Profile': profile.id,
            },
            body: JSON.stringify({
              title,
              author,
              id: newNoteId,
              markdown: textarea.value,
              revision: article?.revision,
            }),
          },
        );
        if (!response.ok)
          throw Error(
            (await response.json()).error ?? 'Không lưu được bài viết.',
          );
        const saved = (await response.json()) as Article;
        if (form.isConnected) location.hash = routeFor(saved);
      } catch (error) {
        if (form.isConnected) {
          status.textContent =
            error instanceof Error ? error.message : 'Không lưu được bài viết.';
          submit.disabled = false;
          translatePage();
        }
      }
    };
    updateHistoryButtons();
    refresh();
  }
  const show = async () => {
    const current = ++generation;
    const hash = location.hash;
    const parts = hash.slice(2).split('/');
    button.classList.toggle('active', parts[0] === route);
    if (parts[0] === route) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
    if (parts[0] !== route) return;
    content().innerHTML = `<p>${personal ? 'Đang tải ghi chú…' : 'Đang tải bài viết…'}</p>`;
    try {
      const response = await request('/api/blog');
      if (!response.ok) throw Error('Không tải được bài viết.');
      const loaded = (await response.json()) as Article[];
      if (current !== generation || location.hash !== hash) return;
      articles = loaded;
      if (!parts[1]) showList();
      else if (parts[1] === 'new') edit();
      else {
        const article = articles.find(
          (a) => a.id === decodeURIComponent(parts[1]),
        );
        if (!article)
          content().innerHTML = `<div class="empty"><h1>${personal ? 'Không tìm thấy ghi chú' : 'Không tìm thấy bài viết'}</h1><a class="btn outline" href="#/${route}">Tất cả bài viết</a></div>`;
        else if (parts[2] === 'edit' && article.ownerId === profile.id)
          edit(article);
        else if (parts[2] === 'edit') {
          showDetail(article);
          notify('Chỉ chủ bài viết được sửa hoặc xóa bài.', true);
        } else showDetail(article);
      }
      translatePage();
    } catch (error) {
      if (current === generation && location.hash === hash) {
        content().innerHTML = `<div class="empty"><p>${esc(error instanceof Error ? error.message : 'Không tải được bài viết.')}</p><button class="btn outline" data-blog-retry>Thử lại</button></div>`;
        translatePage();
      }
    }
  };
  document.addEventListener('flashlab-language-change', () => {
    content()
      .querySelectorAll<HTMLTimeElement>('.blog-meta time[datetime]')
      .forEach((time) => {
        time.textContent = new Date(time.dateTime).toLocaleDateString(
          locale(),
          { dateStyle: 'medium' },
        );
      });
  });
  document.addEventListener('click', async (event) => {
    const target = (
      event.target instanceof Element ? event.target : null
    )?.closest<HTMLElement>(
      '[data-blog-open],[data-blog-new],[data-blog-download],[data-blog-page],[data-blog-retry],[data-blog-delete]',
    );
    if (!target) return;
    if (target.hasAttribute('data-blog-open')) {
      if (target !== button) return;
    } else if (location.hash.slice(2).split('/')[0] !== route) return;
    if (target.dataset.blogDelete) {
      const article = articles.find(
        (item) => item.id === target.dataset.blogDelete,
      );
      if (!article || article.ownerId !== profile.id) return;
      if (
        !(await askConfirmation(
          personal
            ? 'Xóa ghi chú cá nhân này?'
            : 'Xóa bài viết này? Nội dung sẽ bị xóa khỏi blog dùng chung.',
          {
            title: personal ? 'Xóa ghi chú?' : 'Xóa bài viết?',
            confirmLabel: personal ? 'Xóa ghi chú' : 'Xóa bài',
            danger: true,
          },
        ))
      )
        return;
      try {
        const response = await request(`/api/blog/${article.id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-FlashLab-Profile': profile.id,
          },
          body: JSON.stringify({ revision: article.revision }),
        });
        if (!response.ok)
          throw Error(
            (await response.json()).error ?? 'Không xóa được bài viết.',
          );
        location.hash = `#/${route}`;
      } catch (error) {
        notify(
          error instanceof Error ? error.message : 'Không xóa được bài viết.',
          true,
        );
      }
      return;
    }
    if (target.hasAttribute('data-blog-retry')) {
      void show();
      return;
    }
    if (target.hasAttribute('data-blog-open')) {
      if (location.hash === `#/${route}`) void show();
      else location.hash = `#/${route}`;
    } else if (target.hasAttribute('data-blog-new'))
      location.hash = `#/${route}/new`;
    else if (target.dataset.blogPage) {
      page = Number(target.dataset.blogPage);
      document.getElementById('blog-entries')!.innerHTML = listEntries();
      translatePage();
    } else {
      const article = articles.find(
        (a) => a.id === target.dataset.blogDownload,
      );
      if (!article) return;
      const url = URL.createObjectURL(
        new Blob([article.markdown], { type: 'text/markdown;charset=utf-8' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `${article.id}.md`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
  });
  window.addEventListener('hashchange', () => void show());
  if (location.hash.split('/')[1] === route) setTimeout(() => void show(), 0);
}
