import {
  downloadProfileBackup,
  downloadFullBackup,
  restoreDatabaseBackup,
} from '../features/profiles/backup';
import type { Profile } from '@flashlab/shared';
import { notify } from './feedback';
import { initializeMcpSettings } from './mcp-settings';

export function initializeSettings(
  profile: Profile,
  flush: () => Promise<void>,
  prepareRestore: () => Promise<void | boolean> = flush,
) {
  initializeMcpSettings(profile, flush);
  const root = document.getElementById('settings') as HTMLDetailsElement;
  const trigger = root.querySelector('summary')!;
  const close = (focus = false) => {
    root.open = false;
    if (focus) trigger.focus();
  };
  trigger.setAttribute('aria-expanded', 'false');
  root.addEventListener('toggle', () =>
    trigger.setAttribute('aria-expanded', String(root.open)),
  );
  document
    .getElementById('settings-close')!
    .addEventListener('click', () => close(true));
  document.addEventListener(
    'click',
    (event) => {
      if (!event.composedPath().includes(root)) close();
    },
    { capture: true },
  );
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && root.open) {
      event.preventDefault();
      close(true);
    }
  });
  root
    .querySelectorAll('[data-help-link]')
    .forEach((link) => link.addEventListener('click', () => close()));
  const button = document.getElementById(
    'settings-export',
  ) as HTMLButtonElement;
  const status = document.getElementById('settings-export-status')!;
  status.textContent = `Học phần, tiến độ và cấu hình của ${profile.name}.`;
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Đang chuẩn bị database…';
    try {
      await flush();
      await downloadProfileBackup(profile);
      status.textContent = 'Đã tải database hồ sơ.';
      notify('Đã sao lưu database hồ sơ.');
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : 'Xuất database thất bại.';
      notify(status.textContent, true);
    } finally {
      button.disabled = false;
    }
  });
  const full = document.getElementById(
    'settings-export-all',
  ) as HTMLButtonElement;
  full?.addEventListener('click', async () => {
    full.disabled = true;
    status.textContent = 'Đang chuẩn bị database…';
    try {
      await flush();
      await downloadFullBackup();
      status.textContent = 'Đã tải database toàn bộ dữ liệu.';
      notify('Đã sao lưu toàn bộ hồ sơ, bài viết và ảnh.');
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : 'Xuất database thất bại.';
      notify(status.textContent, true);
    } finally {
      full.disabled = false;
    }
  });
  const picker = document.getElementById(
    'settings-import-file',
  ) as HTMLInputElement;
  const restore = document.getElementById(
    'settings-import',
  ) as HTMLButtonElement;
  restore?.addEventListener('click', () => picker.click());
  picker?.addEventListener('change', async () => {
    const file = picker.files?.[0];
    picker.value = '';
    if (!file) return;
    restore.disabled = true;
    try {
      await restoreDatabaseBackup(file, prepareRestore);
    } catch (error) {
      status.textContent =
        error instanceof Error
          ? error.message
          : 'Không khôi phục được database.';
      notify(status.textContent, true);
    } finally {
      restore.disabled = false;
    }
  });
}
