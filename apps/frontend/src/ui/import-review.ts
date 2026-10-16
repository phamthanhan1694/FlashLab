import { pageButtons } from './pagination';
import { ico } from './icons';
import { cardSenses, type Card } from '@flashlab/shared';
import {
  importConflicts,
  resolveImportedCards,
  type ImportChoice,
} from '../core/import-plan';
import { esc } from '../core/utils';
import { formatPartOfSpeech, partOptions } from '../core/parts-of-speech';
import { speechLanguages } from '../features/study/pronunciation';
import { translatePage } from '../core/i18n';
import { activateModal } from './feedback';

export async function reviewImportedCards(existing: Card[], incoming: Card[]) {
  const conflicts = importConflicts(existing, incoming);
  const choices = new Map<number, ImportChoice>(
    conflicts.map((item) => [item.index, { action: 'skip' }]),
  );
  if (!conflicts.length)
    return resolveImportedCards(existing, incoming, choices);
  return new Promise<ReturnType<typeof resolveImportedCards> | undefined>(
    (resolve) => {
      const root = document.createElement('div');
      root.className = 'modal-overlay import-review-overlay';
      root.innerHTML = `<section class="modal import-review-modal" role="dialog" aria-modal="true" aria-labelledby="import-review-title">
        <header class="import-review-head"><span class="import-review-icon" aria-hidden="true">${ico('cards', 24)}</span><div><h2 id="import-review-title">So sánh từ trùng</h2><p>Chọn cách xử lý cho từng thẻ trước khi lưu.</p></div><button type="button" class="icon-button" data-import-cancel aria-label="Đóng">${ico('close', 20)}</button></header>
        <div class="import-review-body"><div class="import-review-summary"><span class="import-review-count"><strong data-user-content>${conflicts.length} / ${incoming.length}</strong><span>thẻ nhập bị trùng</span></span><details class="import-review-rules"><summary>Các cách xử lý</summary><p>Từ trùng được bỏ qua mặc định. Ghi đè thay nội dung và đặt lại tiến độ. Bổ sung thêm nghĩa–từ loại mới, điền trường còn trống và giữ tiến độ cùng nội dung đã có.</p></details></div><div data-import-conflicts></div><nav class="history-pagination" aria-label="Phân trang danh sách"><div data-import-pagination></div></nav></div>
        <footer class="import-review-footer"><p class="form-error" data-import-error role="alert"></p><div class="modal-actions"><button type="button" class="btn outline" data-import-cancel>Hủy</button><button type="button" class="btn primary" data-import-confirm>${ico('check', 17)} Xác nhận nhập</button></div></footer></section>`;

      document.body.append(root);
      const dialog = root.querySelector<HTMLElement>('.modal')!;
      let done = false;
      const finish = (
        value: ReturnType<typeof resolveImportedCards> | undefined,
      ) => {
        if (done) return;
        done = true;
        root.remove();
        release();
        resolve(value);
      };
      const release = activateModal(dialog, () => finish(undefined));
      let page = 0;
      let pendingImages = 0;
      const hints: Record<ImportChoice['action'], string> = {
        skip: 'Giữ thẻ hiện có, bỏ qua bản đang nhập.',
        overwrite: 'Thay nội dung thẻ hiện có và đặt lại tiến độ học.',
        merge: 'Chỉ bổ sung nghĩa mới và trường còn trống; giữ tiến độ cũ.',
        edit: 'Sửa nội dung rồi chọn tạo thẻ riêng, ghi đè hoặc bổ sung.',
      };
      const preview = (card: Card) =>
        `<strong class="import-preview-term" data-user-content>${esc(card.front)}</strong><ol class="import-senses">${cardSenses(
          card,
        )
          .map(
            (sense) =>
              `<li><span data-user-content>${sense.partOfSpeech ? `<small class="import-sense-part" data-part-of-speech="${esc(sense.partOfSpeech)}">${esc(formatPartOfSpeech(sense.partOfSpeech))}</small> ` : ''}${esc(sense.meaning)}</span></li>`,
          )
          .join('')}</ol>`;
      const partSelect = (part = '') => {
        const canonical =
          partOptions.find(
            ([value]) =>
              formatPartOfSpeech(value, 'en') ===
              formatPartOfSpeech(part, 'en'),
          )?.[0] ?? part;
        return `<option value="">Chưa chọn</option>${partOptions.map(([value, label]) => `<option value="${value}" ${value === canonical ? 'selected' : ''}>${esc(label)}</option>`).join('')}${canonical && !partOptions.some(([value]) => value === canonical) ? `<option value="${esc(canonical)}" selected data-user-content>${esc(canonical)}</option>` : ''}`;
      };
      const senseFields = (draft: Card) =>
        cardSenses(draft)
          .map(
            (sense, index, all) =>
              `<div class="import-edit-sense" data-import-sense="${index}"><label class="form-field"><span>Từ loại</span><select data-import-part>${partSelect(sense.partOfSpeech)}</select></label><label class="form-field"><span>Nghĩa</span><textarea data-import-meaning ${index === 0 ? 'data-import-back' : ''} maxlength="4000" rows="2">${esc(sense.meaning)}</textarea></label><button type="button" class="icon-button" data-import-remove-sense="${index}" aria-label="Xóa định nghĩa" ${all.length === 1 ? 'disabled' : ''}>${ico('trash', 16)}</button></div>`,
          )
          .join('');
      const draftFor = (index: number) => {
        const choice = choices.get(index)!;
        return (choice.draft ??= structuredClone(incoming[index]));
      };
      const readDraft = (row: HTMLElement) => {
        const index = Number(row.dataset.importIndex),
          choice = choices.get(index)!,
          draft = draftFor(index);
        draft.front = row.querySelector<HTMLInputElement>(
          '[data-import-front]',
        )!.value;
        const senses = [
          ...row.querySelectorAll<HTMLElement>('[data-import-sense]'),
        ].map((sense) => ({
          meaning: sense.querySelector<HTMLTextAreaElement>(
            '[data-import-meaning]',
          )!.value,
          partOfSpeech:
            sense.querySelector<HTMLSelectElement>('[data-import-part]')!.value,
        }));
        draft.back = senses[0]?.meaning ?? '';
        draft.partOfSpeech = senses[0]?.partOfSpeech ?? '';
        draft.definitions = senses.slice(1);
        draft.pronunciation = row.querySelector<HTMLInputElement>(
          '[data-import-pronunciation]',
        )!.value;
        draft.notes = row.querySelector<HTMLTextAreaElement>(
          '[data-import-notes]',
        )!.value;
        draft.speechLanguage = row.querySelector<HTMLSelectElement>(
          '[data-import-language]',
        )!.value as Card['speechLanguage'];
        choice.front = draft.front;
        choice.back = draft.back;
        choice.editMode = row.querySelector<HTMLSelectElement>(
          '[data-import-edit-mode]',
        )!.value as ImportChoice['editMode'];
      };
      const draw = () => {
        const pages = Math.ceil(conflicts.length / 5);
        root.querySelector('[data-import-conflicts]')!.innerHTML = conflicts
          .slice(page * 5, page * 5 + 5)
          .map((item) => {
            const choice = choices.get(item.index)!;
            const draft = draftFor(item.index);
            return `<article class="import-conflict" data-import-index="${item.index}" data-resolution="${choice.action}">
              <div class="import-comparison"><section class="import-preview import-preview-saved"><h3>${ico('check', 15)} <span>Đã có</span></h3>${preview(item.existing)}</section><section class="import-preview import-preview-incoming"><h3>${ico('upload', 15)} <span>Đang nhập</span></h3>${preview(item.incoming)}</section></div>
              <div class="import-resolution"><label class="form-field"><span>Cách xử lý</span><span class="import-select"><select data-import-action><option value="skip" ${choice.action === 'skip' ? 'selected' : ''}>Bỏ qua</option><option value="overwrite" ${choice.action === 'overwrite' ? 'selected' : ''}>Ghi đè</option><option value="merge" ${choice.action === 'merge' ? 'selected' : ''}>Bổ sung nghĩa</option><option value="edit" ${choice.action === 'edit' ? 'selected' : ''}>Sửa trước khi nhập</option></select><span aria-hidden="true">${ico('chevron', 16)}</span></span></label><p class="import-action-hint" data-import-hint>${hints[choice.action]}</p></div>
              <div class="import-edit" ${choice.action === 'edit' ? '' : 'hidden'}>
                <h4>${ico('pencil', 16)} <span>Nội dung sau khi sửa</span></h4>
                <label class="form-field"><span>Lưu bản sửa</span><select data-import-edit-mode><option value="new" ${(choice.editMode ?? 'new') === 'new' ? 'selected' : ''}>Tạo thẻ riêng</option><option value="overwrite" ${choice.editMode === 'overwrite' ? 'selected' : ''}>Ghi đè thẻ trùng</option><option value="merge" ${choice.editMode === 'merge' ? 'selected' : ''}>Bổ sung vào thẻ trùng</option></select></label>
                <p class="help-note">Thẻ riêng cần thuật ngữ mới. Ghi đè đặt lại tiến độ; bổ sung giữ nội dung đã có.</p>
                <label class="form-field"><span>Thuật ngữ</span><input data-import-front maxlength="4000" autocomplete="off" value="${esc(choice.front ?? draft.front)}"></label>
                <section class="import-edit-definitions"><div class="import-edit-section-head"><h5>Định nghĩa</h5><button type="button" class="create-button" data-import-add-sense aria-label="Thêm định nghĩa" ${cardSenses(draft).length >= 20 ? 'disabled' : ''}>+</button></div><div data-import-senses>${senseFields(draft)}</div><a class="section-link" href="#/home/guide/parts" target="_blank" rel="noopener">Tra cứu từ loại tiếng Anh ↗</a></section>
                <div class="import-edit-reading"><label class="form-field"><span>Cách đọc</span><input data-import-pronunciation maxlength="500" value="${esc(draft.pronunciation ?? '')}"></label><label class="form-field"><span>Ngôn ngữ đọc</span><select data-import-language>${speechLanguages.map(([value, label]) => `<option value="${value}" ${(draft.speechLanguage ?? 'en-US') === value ? 'selected' : ''}>${esc(label)}</option>`).join('')}</select></label></div>
                <label class="form-field"><span>Ghi chú</span><textarea data-import-notes maxlength="4000" rows="3">${esc(draft.notes ?? '')}</textarea></label>
                <div class="import-edit-image"><label class="form-field"><span>Ảnh minh họa</span><input type="file" data-import-image-file accept="image/png,image/jpeg,image/webp,image/gif"></label><div data-import-image-preview ${draft.image ? '' : 'hidden'}><img src="${esc(draft.image ?? '')}" alt="Ảnh minh họa"><button type="button" class="btn outline small" data-import-image-remove>Xóa ảnh</button></div></div>
              </div>
            </article>`;
          })
          .join('');
        root
          .querySelectorAll<HTMLElement>('[data-import-index]')
          .forEach((row) => {
            row.querySelector<HTMLSelectElement>(
              '[data-import-action]',
            )!.value = choices.get(Number(row.dataset.importIndex))!.action;
            const draft = draftFor(Number(row.dataset.importIndex));
            row
              .querySelectorAll<HTMLSelectElement>('[data-import-part]')
              .forEach((select, index) => {
                const part = cardSenses(draft)[index].partOfSpeech;
                select.value =
                  partOptions.find(
                    ([value]) =>
                      formatPartOfSpeech(value, 'en') ===
                      formatPartOfSpeech(part, 'en'),
                  )?.[0] ?? part;
              });
            row.querySelector<HTMLSelectElement>(
              '[data-import-language]',
            )!.value = draft.speechLanguage ?? 'en-US';
            row.querySelector<HTMLSelectElement>(
              '[data-import-edit-mode]',
            )!.value =
              choices.get(Number(row.dataset.importIndex))!.editMode ?? 'new';
          });
        root.querySelector('[data-import-pagination]')!.innerHTML =
          pages > 1
            ? pageButtons(
                page + 1,
                pages,
                (number) => `data-import-page="${number}"`,
              )
            : '';
        root.querySelector<HTMLElement>('.history-pagination')!.hidden =
          pages <= 1;
        translatePage();
      };
      root.addEventListener('input', (event) => {
        const target = event.target as HTMLElement,
          row = target.closest<HTMLElement>('[data-import-index]');
        if (
          row &&
          target.closest('.import-edit') &&
          !target.matches('[data-import-image-file]')
        )
          readDraft(row);
      });
      root.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement | HTMLSelectElement,
          row = target.closest<HTMLElement>('[data-import-index]');
        if (!row) return;
        const index = Number(row.dataset.importIndex),
          choice = choices.get(index)!;
        if (target.matches('[data-import-action]')) {
          choice.action = target.value as ImportChoice['action'];
          row.dataset.resolution = choice.action;
          row.querySelector('[data-import-hint]')!.textContent =
            hints[choice.action];
          row.querySelector<HTMLElement>('.import-edit')!.hidden =
            choice.action !== 'edit';
          if (choice.action === 'edit') readDraft(row);
          translatePage();
          return;
        }
        if (target.matches('[data-import-image-file]')) {
          const file = (target as HTMLInputElement).files?.[0];
          if (!file) return;
          if (
            !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
              file.type,
            )
          ) {
            root.querySelector('[data-import-error]')!.textContent =
              'Chọn ảnh PNG, JPEG, WebP hoặc GIF hợp lệ.';
            translatePage();
            return;
          }
          const reader = new FileReader();
          pendingImages++;
          root.querySelector<HTMLButtonElement>(
            '[data-import-confirm]',
          )!.disabled = true;
          reader.onloadend = () => {
            pendingImages--;
            if (!done)
              root.querySelector<HTMLButtonElement>(
                '[data-import-confirm]',
              )!.disabled = pendingImages > 0;
          };
          reader.onerror = () => {
            root.querySelector('[data-import-error]')!.textContent =
              'Không đọc được ảnh. Hãy chọn lại.';
            translatePage();
          };
          reader.onload = () => {
            if (done) return;
            draftFor(index).image = String(reader.result);
            if (row.isConnected) {
              row.querySelector<HTMLImageElement>(
                '[data-import-image-preview] img',
              )!.src = String(reader.result);
              row.querySelector<HTMLElement>(
                '[data-import-image-preview]',
              )!.hidden = false;
            }
          };
          reader.readAsDataURL(file);
          return;
        }
        if (target.closest('.import-edit')) readDraft(row);
      });
      root.addEventListener('click', (event) => {
        const target = (event.target as Element).closest<HTMLElement>(
          '[data-import-add-sense],[data-import-remove-sense],[data-import-image-remove]',
        );
        const row = target?.closest<HTMLElement>('[data-import-index]');
        if (!target || !row) return;
        readDraft(row);
        const index = Number(row.dataset.importIndex),
          draft = draftFor(index);
        if (target.hasAttribute('data-import-image-remove')) {
          draft.image = undefined;
          row.querySelector<HTMLElement>(
            '[data-import-image-preview]',
          )!.hidden = true;
          row.querySelector<HTMLInputElement>(
            '[data-import-image-file]',
          )!.value = '';
          return;
        }
        const senses = cardSenses(draft);
        if (target.hasAttribute('data-import-add-sense')) {
          if (senses.length >= 20) return;
          senses.push({ meaning: '', partOfSpeech: '' });
        } else if (senses.length > 1)
          senses.splice(Number(target.dataset.importRemoveSense), 1);
        draft.back = senses[0].meaning;
        draft.partOfSpeech = senses[0].partOfSpeech;
        draft.definitions = senses.slice(1);
        const choice = choices.get(index)!;
        choice.back = draft.back;
        row.querySelector('[data-import-senses]')!.innerHTML =
          senseFields(draft);
        row.querySelector<HTMLButtonElement>(
          '[data-import-add-sense]',
        )!.disabled = senses.length >= 20;
        translatePage();
        if (target.hasAttribute('data-import-add-sense'))
          row
            .querySelector<HTMLTextAreaElement>(
              '[data-import-sense]:last-child textarea',
            )
            ?.focus({ preventScroll: true });
      });
      root
        .querySelectorAll('[data-import-cancel]')
        .forEach((button) =>
          button.addEventListener('click', () => finish(undefined)),
        );
      root.addEventListener('click', (event) => {
        const button = (event.target as Element).closest<HTMLButtonElement>(
          '[data-import-page]',
        );
        if (!button) return;
        root
          .querySelectorAll<HTMLElement>('[data-import-index]')
          .forEach((row) => {
            if (choices.get(Number(row.dataset.importIndex))?.action === 'edit')
              readDraft(row);
          });
        page = Number(button.dataset.importPage) - 1;
        draw();
      });
      root
        .querySelector('[data-import-confirm]')!
        .addEventListener('click', () => {
          try {
            if (pendingImages) return;
            root
              .querySelectorAll<HTMLElement>('[data-import-index]')
              .forEach((row) => {
                if (
                  choices.get(Number(row.dataset.importIndex))?.action ===
                  'edit'
                )
                  readDraft(row);
              });
            finish(resolveImportedCards(existing, incoming, choices));
          } catch (error) {
            root.querySelector('[data-import-error]')!.textContent = (
              error as Error
            ).message;
            translatePage();
          }
        });
      root.addEventListener('click', (event) => {
        if (event.target === root) finish(undefined);
      });
      draw();
      root.querySelector<HTMLButtonElement>('[data-import-confirm]')!.focus();
    },
  );
}
