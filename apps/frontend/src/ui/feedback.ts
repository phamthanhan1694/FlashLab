import { translatePage } from '../core/i18n';
import { ico } from './icons';
import { esc } from '../core/utils';

/** Keep keyboard navigation inside the topmost modal and return focus on close. */
export function activateModal(dialog: HTMLElement, onEscape: () => void) {
  const previous =
    document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
  const shell = document.querySelector<HTMLElement>('.app-shell');
  const wasInert = shell?.inert ?? false;
  const overflow = document.body.style.overflow;
  if (shell) shell.inert = true;
  document.body.style.overflow = 'hidden';
  const controls = () => [
    ...dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not([type="hidden"]):not(:disabled), textarea:not(:disabled), select:not(:disabled), [tabindex="0"]',
    ),
  ];
  const keydown = (event: KeyboardEvent) => {
    const dialogs = document.querySelectorAll('[aria-modal="true"]');
    if (dialogs[dialogs.length - 1] !== dialog) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      onEscape();
    } else if (event.key === 'Tab') {
      const items = controls();
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) {
        event.preventDefault();
        dialog.focus();
        return;
      }
      if (
        !dialog.contains(document.activeElement) ||
        (event.shiftKey && document.activeElement === first)
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  };
  document.addEventListener('keydown', keydown, true);
  return () => {
    document.removeEventListener('keydown', keydown, true);
    if (shell) shell.inert = wasInert;
    document.body.style.overflow = overflow;
    if (previous?.isConnected) previous.focus({ preventScroll: true });
  };
}

let confirming = false;
export function askConfirmation(
  message: string,
  options: {
    title: string;
    confirmLabel: string;
    cancelLabel?: string;
    danger?: boolean;
  },
): Promise<boolean> {
  if (confirming) return Promise.resolve(false);
  confirming = true;
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay confirmation-overlay';
    overlay.innerHTML = `<section class="modal confirmation" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-message" tabindex="-1">
      <div class="confirmation-icon ${options.danger ? 'danger' : ''}">${ico(options.danger ? 'trash' : 'upload', 26)}</div>
      <button type="button" class="icon-button confirmation-close" aria-label="Đóng hộp xác nhận">${ico('close', 20)}</button>
      <span class="eyebrow">${options.danger ? 'KIỂM TRA TRƯỚC KHI TIẾP TỤC' : 'XÁC NHẬN THAO TÁC'}</span>
      <h2 id="confirmation-title">${esc(options.title)}</h2>
      <p id="confirmation-message">${esc(message)}</p>
      <div class="modal-actions"><button type="button" class="btn outline" data-confirm="cancel">${esc(options.cancelLabel ?? 'Hủy bỏ')}</button><button type="button" class="btn ${options.danger ? 'destructive' : 'primary'}" data-confirm="accept">${esc(options.confirmLabel)}</button></div>
    </section>`;
    document.body.appendChild(overlay);
    translatePage();
    const dialog = overlay.querySelector<HTMLElement>('.confirmation')!;
    let settled = false;
    const finish = (accepted: boolean) => {
      if (settled) return;
      settled = true;
      overlay.remove();
      release();
      confirming = false;
      resolve(accepted);
    };
    const release = activateModal(dialog, () => finish(false));
    overlay.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[data-confirm="accept"]')) finish(true);
      else if (
        event.target === overlay ||
        target?.closest('[data-confirm="cancel"], .confirmation-close')
      )
        finish(false);
    });
    dialog.querySelector<HTMLButtonElement>('[data-confirm="cancel"]')?.focus();
  });
}

export function notify(message: string, error = false) {
  const root = document.getElementById('toast-root');
  if (!root) return;
  while (root.children.length >= 3) root.firstElementChild?.remove();
  const node = document.createElement('div');
  node.className = `toast${error ? ' error' : ''}`;
  node.setAttribute('role', error ? 'alert' : 'status');
  node.innerHTML = `<span class="toast-icon">${ico(error ? 'close' : 'check', 20)}</span><div class="toast-content"><strong>${error ? 'Chưa thực hiện được' : 'Hoàn tất'}</strong><p>${esc(message)}</p></div><button type="button" class="icon-button toast-close" aria-label="Đóng thông báo">${ico('close', 17)}</button>`;
  root.appendChild(node);
  translatePage();
  let timer: ReturnType<typeof setTimeout>;
  const dismiss = () => {
    clearTimeout(timer);
    node.remove();
  };
  node.querySelector('button')?.addEventListener('click', dismiss);
  timer = setTimeout(dismiss, error ? 6000 : 4000);
}

function clearFieldError(field: HTMLInputElement | HTMLTextAreaElement) {
  field.removeAttribute('aria-invalid');
  const errorId = `${field.id}-error`;
  document.getElementById(errorId)?.remove();
  const descriptions = (field.getAttribute('aria-describedby') ?? '')
    .split(' ')
    .filter((id) => id && id !== errorId);
  if (descriptions.length)
    field.setAttribute('aria-describedby', descriptions.join(' '));
  else field.removeAttribute('aria-describedby');
}

export function showFieldError(
  field: HTMLInputElement | HTMLTextAreaElement,
  message: string,
) {
  clearFieldError(field);
  const error = document.createElement('p');
  error.id = `${field.id}-error`;
  error.className = 'field-error';
  error.textContent = message;
  field.setAttribute('aria-invalid', 'true');
  field.setAttribute(
    'aria-describedby',
    [field.getAttribute('aria-describedby'), error.id]
      .filter(Boolean)
      .join(' '),
  );
  field.insertAdjacentElement('afterend', error);
  translatePage();
  field.focus();
}

export function validateForm(form: HTMLFormElement): boolean {
  let first: HTMLInputElement | HTMLTextAreaElement | undefined;
  for (const field of form.querySelectorAll<
    HTMLInputElement | HTMLTextAreaElement
  >('input:not([type="hidden"]), textarea')) {
    clearFieldError(field);
    if (field.disabled || ['radio', 'checkbox'].includes(field.type)) continue;
    const name =
      field.labels?.[0]?.textContent
        ?.replace(/\s*\*\s*$/, '')
        .trim()
        .toLocaleLowerCase('vi') || 'nội dung';
    const message =
      field.required && !field.value.trim()
        ? `Vui lòng nhập ${name}.`
        : field.maxLength >= 0 && field.value.length > field.maxLength
          ? `Tối đa ${field.maxLength.toLocaleString('vi-VN')} ký tự.`
          : '';
    if (!message) continue;
    showFieldError(field, message);
    first ??= field;
  }
  first?.focus();
  return !first;
}

export function installFormFeedback() {
  document.addEventListener(
    'input',
    (event) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      )
        clearFieldError(event.target);
    },
    true,
  );
}
