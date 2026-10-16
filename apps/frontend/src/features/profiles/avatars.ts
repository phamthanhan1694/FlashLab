import { pageButtons } from '../../ui/pagination';
import { catalogAvatarArtwork } from './catalog-artwork';
import { additionalAvatarArtwork } from './avatar-artwork';
import {
  avatarCatalog,
  type Profile,
  type Preferences,
} from '@flashlab/shared';
import { esc } from '../../core/utils';
import { activateModal, notify } from '../../ui/feedback';
type Avatar = NonNullable<Preferences['avatar']>;
export const avatarPresets = avatarCatalog;
const eyes =
  '<circle cx="23" cy="31" r="2.4" fill="#243044"/><circle cx="41" cy="31" r="2.4" fill="#243044"/>';
const artwork: Record<Exclude<Avatar, 'initials'>, string> = {
  ...catalogAvatarArtwork,
  ...additionalAvatarArtwork,
  owl:
    '<circle cx="32" cy="32" r="30" fill="#eee7fb"/><path d="M12 19 15 7 26 17Q32 13 38 17L49 7 52 19V41Q50 55 32 56 14 55 12 41Z" fill="#9b78c2"/><circle cx="23" cy="30" r="12" fill="#fff4dc"/><circle cx="41" cy="30" r="12" fill="#fff4dc"/>' +
    eyes +
    '<path d="m27 39 5 7 5-7" fill="#f2b456"/><path d="M20 51h7m10 0h7" stroke="#6f518e" stroke-width="3" stroke-linecap="round"/>',
  dog:
    '<circle cx="32" cy="32" r="30" fill="#faead5"/><path d="M17 15Q5 12 7 35q2 10 12 5m28-25q12-3 10 20-2 10-12 5" fill="#9f6c4a"/><rect x="14" y="13" width="36" height="42" rx="17" fill="#d9a878"/>' +
    eyes +
    '<ellipse cx="32" cy="42" rx="12" ry="9" fill="#fff0d8"/><path d="M27 37h10q0 7-5 7t-5-7" fill="#44342d"/><path d="M28 47q4 7 8 0" fill="#e78b8c"/>',
  cat:
    '<circle cx="32" cy="32" r="30" fill="#e4effb"/><path d="m13 28 1-19 16 10h4L50 9l1 19v13q-2 15-19 15T13 41Z" fill="#efb96e"/><path d="m17 23 1-8 8 6m12 0 8-6 1 8" fill="#ef8f98"/>' +
    eyes +
    '<path d="m28 40 4 4 4-4" fill="#d36f7e"/><path d="M32 44v4m-6 0q6 4 12 0M8 37l12 2M8 45l12-2m24-4 12-2m-12 6 12 2" fill="none" stroke="#805e3c" stroke-width="2" stroke-linecap="round"/>',
  gull:
    '<circle cx="32" cy="32" r="30" fill="#def1f3"/><path d="M13 41q0-28 19-28t19 28q0 15-19 15T13 41" fill="#fffdf4"/><path d="M13 34q-7 7-5 15l12-5m31-10q7 7 5 15l-12-5" fill="#aebccc"/>' +
    eyes +
    '<path d="m24 39 8-5 12 6-12 6Z" fill="#efb74f"/><path d="M24 52h5m6 0h5" stroke="#df9f38" stroke-width="3" stroke-linecap="round"/>',
  capybara:
    '<circle cx="32" cy="32" r="30" fill="#e8efda"/><circle cx="16" cy="17" r="7" fill="#9b7958"/><circle cx="48" cy="17" r="7" fill="#9b7958"/><rect x="12" y="16" width="40" height="39" rx="16" fill="#b79772"/><rect x="17" y="32" width="30" height="19" rx="9" fill="#cfb490"/><circle cx="22" cy="28" r="2.3" fill="#3e352d"/><circle cx="42" cy="28" r="2.3" fill="#3e352d"/><path d="M27 39h10m-5 0v5m-6 2q6 3 12 0" stroke="#69523f" stroke-width="2" fill="none" stroke-linecap="round"/>',
  whale:
    '<circle cx="32" cy="32" r="30" fill="#dfeefb"/><path d="M43 35q7 1 8-9 6 0 10-7 2 13-8 19-1 16-22 17Q9 55 8 40 7 24 25 24q15 0 18 11" fill="#639ecb"/><path d="M11 43q19 12 39-2-2 12-20 12-13 0-19-10" fill="#b6dcec"/><circle cx="20" cy="36" r="2.2" fill="#243044"/><path d="M13 41q4 4 8 0M29 25V15m0 4q-2-8-8-6m8 5q3-8 8-5" stroke="#367fae" stroke-width="2.5" fill="none" stroke-linecap="round"/><path d="m32 39 8 4-7 5" fill="#397fae"/>',
};
function icon(preset: Avatar, name: string) {
  return preset === 'initials'
    ? esc(name.slice(0, 1).toLocaleUpperCase('vi'))
    : `<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">${artwork[preset]}</svg>`;
}
function readAvatar(profileId: string): Avatar {
  try {
    const value = localStorage.getItem(`flashlab.avatar.${profileId}`);
    return avatarPresets.find((p) => p.id === value)?.id ?? 'initials';
  } catch {
    return 'initials';
  }
}
let active:
  | {
      profile: Profile;
      preset: Avatar;
      change: (preset: Avatar) => void | Promise<void>;
    }
  | undefined;
export function profileAvatar(profile: Profile) {
  const preset =
    active?.profile.id === profile.id ? active.preset : readAvatar(profile.id);
  return `<span class="profile-avatar" data-profile-avatar="${esc(profile.id)}" data-avatar-kind="${preset}">${icon(preset, profile.name)}</span>`;
}
function applyAvatar(profile: Profile, preset: Avatar) {
  try {
    localStorage.setItem(`flashlab.avatar.${profile.id}`, preset);
  } catch {
    /* Server preferences remain authoritative. */
  }
  document
    .querySelectorAll<HTMLElement>('[data-profile-avatar]')
    .forEach((node) => {
      if (node.dataset.profileAvatar === profile.id) {
        node.innerHTML = icon(preset, profile.name);
        node.dataset.avatarKind = preset;
      }
    });
}
export function initializeProfileAvatar(
  profile: Profile,
  preset: Preferences['avatar'],
  change: (preset: Avatar) => void | Promise<void>,
) {
  active = { profile, preset: preset ?? 'initials', change };
  applyAvatar(profile, active.preset);
}
export const avatarPickerMarkup = () =>
  '<div class="avatar-picker modal-overlay" hidden><section class="modal avatar-dialog" role="dialog" aria-label="Chọn ảnh đại diện"><div class="avatar-picker-heading"><h3>Chọn ảnh đại diện</h3><button type="button" class="icon-button" data-avatar-close aria-label="Đóng">×</button></div><p class="help-note" data-avatar-owner data-user-content></p><label class="avatar-search-label" for="avatar-search">Tìm avatar</label><input id="avatar-search" type="search" placeholder="Tên tiếng Việt hoặc tiếng Anh…" autocomplete="off"><div id="avatar-picker-options"></div><p id="avatar-save-status" class="help-note" role="status"></p></section></div>';
export function bindAvatarPicker(
  root: HTMLElement,
  profile: Profile,
  change?: (preset: Avatar) => Promise<void>,
) {
  const mount = root.querySelector<HTMLElement>('#avatar-picker-options');
  if (!mount) return;
  const overlay = root.querySelector<HTMLElement>('.avatar-picker')!;
  const dialog = overlay.querySelector<HTMLElement>('.avatar-dialog')!;
  let release: (() => void) | undefined;
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    overlay.hidden = true;
    dialog.removeAttribute('aria-modal');
    release?.();
  };
  dialog.setAttribute('aria-modal', 'true');
  release = activateModal(dialog, close);
  root.querySelector('[data-avatar-close]')?.addEventListener('click', close);
  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });
  let page = 1;
  let saving = false;
  const search = root.querySelector<HTMLInputElement>('#avatar-search')!;
  const normalize = (text: string) =>
    text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const status = root.querySelector<HTMLElement>('#avatar-save-status')!;
  const render = () => {
    const query = normalize(search.value.trim());
    const choices = avatarPresets.filter((p) =>
      normalize(p.label + ' ' + p.english).includes(query),
    );
    const pages = Math.max(1, Math.ceil(choices.length / 5));
    page = Math.max(1, Math.min(page, pages));
    const selected =
      active?.profile.id === profile.id
        ? active.preset
        : readAvatar(profile.id);
    mount.innerHTML = `<div class="avatar-preset-grid">${choices
      .slice((page - 1) * 5, page * 5)
      .map(
        (p) =>
          `<button type="button" class="avatar-preset" data-avatar-preset="${p.id}" aria-pressed="${selected === p.id}" aria-label="Chọn avatar ${p.label}" title="${esc(p.label + ' · ' + p.english + ' — ' + p.description)}" ${saving ? 'disabled' : ''}><span>${icon(p.id, profile.name)}</span><small>${p.label}</small></button>`,
      )
      .join(
        '',
      )}</div><nav class="avatar-pagination" aria-label="Phân trang avatar">${pageButtons(page, pages, (number) => `data-avatar-page="${number}"`)}</nav>`;
    mount
      .querySelectorAll<HTMLButtonElement>('[data-avatar-page]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          page = Number(button.dataset.avatarPage);
          render();
        }),
      );
    mount
      .querySelectorAll<HTMLButtonElement>('[data-avatar-preset]')
      .forEach((button) =>
        button.addEventListener('click', async () => {
          const preset = button.dataset.avatarPreset as Avatar;
          const isCurrent = active?.profile.id === profile.id;
          const save = isCurrent ? active!.change : change;
          if (!save || saving) return;
          const previous = isCurrent ? active!.preset : readAvatar(profile.id);
          if (isCurrent) active!.preset = preset;
          saving = true;
          applyAvatar(profile, preset);
          status.textContent = 'Đang lưu ảnh đại diện…';
          render();
          try {
            await save(preset);
            status.textContent = 'Đã lưu ảnh đại diện.';
            notify('Đã lưu ảnh đại diện.');
          } catch (error) {
            if (!isCurrent) applyAvatar(profile, previous);
            const message =
              error instanceof Error
                ? error.message
                : 'Chưa lưu được ảnh đại diện lên máy chủ.';
            status.textContent = message;
            notify(message, true);
          } finally {
            saving = false;
            if (mount.isConnected) render();
          }
        }),
      );
  };
  search.addEventListener('input', () => {
    page = 1;
    render();
  });
  render();
  return close;
}

export function refreshProfileAvatar(profile: Profile) {
  applyAvatar(
    profile,
    active?.profile.id === profile.id ? active.preset : readAvatar(profile.id),
  );
}
