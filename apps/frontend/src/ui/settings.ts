import { downloadProfileBackup } from '../features/profiles/backup';
import type { Profile } from '@flashlab/shared';
import { notify } from './feedback';

export function initializeSettings(
  profile: Profile,
  flush: () => Promise<void>,
) {
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
    .querySelector('[data-help-link]')
    ?.addEventListener('click', () => close());
  const button = document.getElementById(
    'settings-export',
  ) as HTMLButtonElement;
  const status = document.getElementById('settings-export-status')!;
  status.textContent = `Học phần, tiến độ và cấu hình của ${profile.name}.`;
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = 'Đang chuẩn bị thư mục ZIP…';
    try {
      await flush();
      await downloadProfileBackup(profile);
      status.textContent = 'Đã tải thư mục ZIP.';
      notify('Đã xuất thư mục người dùng thành ZIP.');
    } catch (error) {
      status.textContent =
        error instanceof Error ? error.message : 'Xuất ZIP thất bại.';
      notify(status.textContent, true);
    } finally {
      button.disabled = false;
    }
  });
}
