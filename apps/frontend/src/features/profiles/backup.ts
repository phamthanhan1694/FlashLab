import type { Profile } from '@flashlab/shared';
import { fetchRead } from '../../core/http';
import { esc } from '../../core/utils';
import { translatePage } from '../../core/i18n';
import { activateModal } from '../../ui/feedback';

export type DeletionChoice = 'backup' | 'delete' | null;
export function askProfileDeletion(profile: Profile): Promise<DeletionChoice> {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay confirmation-overlay';
    overlay.innerHTML = `<section class="modal confirmation profile-delete-confirmation" role="alertdialog" aria-modal="true" aria-labelledby="profile-delete-title" aria-describedby="profile-delete-message" tabindex="-1"><button type="button" class="icon-button confirmation-close" aria-label="Đóng hộp xác nhận">×</button><span class="eyebrow">SAO LƯU TRƯỚC KHI XÓA</span><h2 id="profile-delete-title">Xóa người dùng?</h2><p id="profile-delete-message">Xóa người dùng “${esc(profile.name)}” cùng toàn bộ học phần, tiến độ và cấu hình? Thao tác này không thể hoàn tác.</p><p>Bạn có muốn tải bản sao lưu ZIP trước khi xóa không?</p><div class="modal-actions"><button type="button" class="btn primary" data-confirm="accept">Sao lưu ZIP rồi xóa</button><button type="button" class="btn danger" data-confirm="skip-backup">Xóa không sao lưu</button><button type="button" class="btn outline" data-confirm="cancel">Hủy bỏ</button></div></section>`;
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
  const response = await fetchRead(
    `/api/profiles/${encodeURIComponent(profile.id)}/export`,
  );
  if (!response.ok)
    throw Error('Không xuất được thư mục người dùng. Hãy thử lại.');
  const blob = await response.blob();
  const magic = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  if (magic.length < 4 || magic[0] !== 80 || magic[1] !== 75)
    throw Error('Bản sao lưu ZIP không hợp lệ. Người dùng chưa bị xóa.');
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = `FlashLab-${profile.id}.zip`;
    document.body.append(link);
    link.click();
    link.remove();
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
