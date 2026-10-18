import { profilesSchema, type Profile } from '@flashlab/shared';
import { browserCache } from '../../core/cache';
import { fetchRead } from '../../core/http';
import { esc } from '../../core/utils';
import { translatePage } from '../../core/i18n';
import { activateModal, askConfirmation } from '../../ui/feedback';

export type DeletionChoice = 'backup' | 'delete' | null;
export function askProfileDeletion(profile: Profile): Promise<DeletionChoice> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay confirmation-overlay';
    overlay.innerHTML = `<section class="modal confirmation profile-delete-confirmation" role="alertdialog" aria-modal="true" aria-labelledby="profile-delete-title" aria-describedby="profile-delete-message" tabindex="-1"><button type="button" class="icon-button confirmation-close" aria-label="Đóng hộp xác nhận">×</button><span class="eyebrow">SAO LƯU TRƯỚC KHI XÓA</span><h2 id="profile-delete-title">Xóa người dùng?</h2><p id="profile-delete-message">Xóa người dùng “${esc(profile.name)}” cùng toàn bộ học phần, tiến độ và cấu hình? Thao tác này không thể hoàn tác.</p><p>Bạn có muốn tải bản sao lưu SQLite trước khi xóa không?</p><div class="modal-actions"><button type="button" class="btn primary" data-confirm="accept">Sao lưu database rồi xóa</button><button type="button" class="btn danger" data-confirm="skip-backup">Xóa không sao lưu</button><button type="button" class="btn outline" data-confirm="cancel">Hủy bỏ</button></div></section>`;
    document.body.append(overlay);
    translatePage();
    const dialog = overlay.querySelector<HTMLElement>('.confirmation')!;
    let settled = false;
    const finish = (choice: DeletionChoice) => {
      if (settled) return;
      settled = true;
      overlay.remove();
      release();
      resolve(choice);
    };
    const release = activateModal(dialog, () => finish(null));
    overlay.addEventListener('click', (event) => {
      const target = event.target instanceof Element ? event.target : null;
      if (target?.closest('[data-confirm="accept"]')) finish('backup');
      else if (target?.closest('[data-confirm="skip-backup"]'))
        finish('delete');
      else if (
        event.target === overlay ||
        target?.closest('[data-confirm="cancel"],.confirmation-close')
      )
        finish(null);
    });
    dialog.querySelector<HTMLButtonElement>('[data-confirm="cancel"]')?.focus();
  });
}

/** Starts a browser download; the caller must ask the user to verify it before deleting. */
export async function downloadProfileBackup(profile: Profile) {
  return downloadDatabase(
    `/api/profiles/${encodeURIComponent(profile.id)}/database`,
    `FlashLab-${profile.id}.sqlite`,
  );
}

export async function downloadFullBackup() {
  return downloadDatabase('/api/backups/database', 'FlashLab-all.sqlite');
}

async function downloadDatabase(endpoint: string, filename: string) {
  const response = await fetchRead(endpoint, 60_000);
  if (!response.ok)
    throw Error('Không xuất được database. Hãy kiểm tra dữ liệu và thử lại.');
  const blob = await response.blob();
  if ((await blob.slice(0, 16).text()) !== 'SQLite format 3\0')
    throw Error('Bản sao lưu SQLite không hợp lệ. Người dùng chưa bị xóa.');
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

async function databaseRequest(
  endpoint: string,
  file: File,
  headers: Record<string, string> = {},
) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/vnd.sqlite3', ...headers },
    body: file,
    signal: AbortSignal.timeout(60_000),
  });
  const body = await response.json();
  if (!response.ok)
    throw new Error(body.error ?? 'Không khôi phục được database.');
  return body;
}

export async function restoreDatabaseBackup(
  file: File,
  prepare: () => Promise<void | boolean>,
) {
  if (file.size > 100_000_000) throw new Error('Tệp database vượt quá 100 MB.');
  if ((await file.slice(0, 16).text()) !== 'SQLite format 3\0')
    throw new Error('Tệp không phải database SQLite hợp lệ.');
  if ((await prepare()) === false) return false;
  const preview = await databaseRequest('/api/backups/inspect', file);
  const profiles = profilesSchema.parse(preview.profiles);
  if (
    !['profile', 'all'].includes(preview.scope) ||
    !Number.isSafeInteger(preview.expectedRevision) ||
    typeof preview.hash !== 'string'
  )
    throw new Error('Không đọc được thông tin bản sao lưu.');
  const message =
    preview.scope === 'all'
      ? `Thay toàn bộ dữ liệu hiện tại bằng ${profiles.length} hồ sơ, ${preview.cards} thẻ, ${preview.articles} bài viết và ${preview.images} ảnh từ database đã chọn?`
      : `Khôi phục hồ sơ “${profiles[0]!.name}”, gồm ${preview.cards} thẻ, tiến độ, lịch sử, cấu hình, ghi chú và bài viết của hồ sơ? Dữ liệu của hồ sơ cùng ID sẽ được thay thế; hồ sơ khác được giữ lại.`;
  if (
    !(await askConfirmation(
      `${message} Ứng dụng sẽ tự lưu một database dự phòng trước khi thay đổi.`,
      { title: 'Khôi phục database?', confirmLabel: 'Khôi phục', danger: true },
    ))
  )
    return false;
  const restored = await databaseRequest('/api/backups/restore', file, {
    'X-FlashLab-Confirm': 'restore',
    'X-FlashLab-Revision': String(preview.expectedRevision),
    'X-FlashLab-Backup-Hash': preview.hash,
  });
  const current = profilesSchema.parse(restored.profiles);
  for (const id of restored.affectedProfileIds as string[]) {
    for (const key of [
      id === 'default' ? 'flashlab.server.v1' : `flashlab.server.v1.${id}`,
      id === 'default' ? 'flashlab.html.v2' : `flashlab.html.v2.${id}`,
    ]) {
      try {
        await browserCache.remove(key);
      } catch {
        /* The restored backend remains authoritative after reload. */
      }
    }
  }
  try {
    const selected = localStorage.getItem('flashlab.profile');
    localStorage.setItem(
      'flashlab.profile',
      current.find((profile) => profile.id === selected)?.id ?? profiles[0]!.id,
    );
    localStorage.setItem('flashlab.profiles', JSON.stringify(current));
  } catch {
    /* The profile list is fetched again after reload. */
  }
  window.location.reload();
  return true;
}
