import { pageButtons } from '../../ui/pagination';
import { ico } from '../../ui/icons';
import { createButton } from '../../ui/create-button';
import { helpLink } from '../../ui/help';
import { askProfileDeletion, downloadProfileBackup } from './backup';
import { fetchRead } from '../../core/http';
import {
  profileAvatar,
  avatarPickerMarkup,
  bindAvatarPicker,
  refreshProfileAvatar,
} from './avatars';
import { readProfileFolder } from './profile-folder';
import {
  profilesSchema,
  profileSchema,
  snapshotSchema,
  type Profile,
} from '@flashlab/shared';
import {
  activateModal,
  askConfirmation,
  notify,
  validateForm,
  showFieldError,
} from '../../ui/feedback';
import { esc } from '../../core/utils';

const SELECTED = 'flashlab.profile';
const CACHE = 'flashlab.profiles';
const fallback: Profile[] = [
  { id: 'default', name: 'Người dùng mặc định', created: 0 },
];
const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* Current session remains usable. */
  }
};
async function request(url: string, options?: RequestInit) {
  const response =
    !options?.method || options.method === 'GET'
      ? await fetchRead(url, 10000)
      : await fetch(url, { ...options, signal: AbortSignal.timeout(10000) });
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? 'Không kết nối được máy chủ. Hãy thử lại.');
  }
  return response.status === 204 ? null : response.json();
}
export async function initializeProfiles(
  beforeSwitch: (finalize?: boolean) => Promise<void | boolean>,
): Promise<Profile> {
  let profiles: Profile[];
  try {
    profiles = profilesSchema.parse(await request('/api/profiles'));
    write(CACHE, JSON.stringify(profiles));
  } catch {
    let raw: unknown;
    try {
      raw = JSON.parse(read(CACHE) ?? 'null');
    } catch {
      raw = null;
    }
    const cached = profilesSchema.safeParse(raw);
    profiles = cached.success ? cached.data : fallback;
  }
  const current = profiles.find((p) => p.id === read(SELECTED)) ?? profiles[0]!;
  write(SELECTED, current.id);
  const button = document.createElement('button');
  button.id = 'profile-button';
  button.type = 'button';
  button.disabled = true;
  button.className = 'profile-button';
  button.innerHTML = `${profileAvatar(current)}<span data-user-content>${esc(current.name)}</span>`;
  button.setAttribute(
    'aria-label',
    `Người dùng: ${current.name}. Đổi hoặc quản lý người dùng`,
  );
  document.querySelector('.topbar-right .avatar')?.replaceWith(button);

  button.title = button.getAttribute('aria-label')!;
  const pendingAvatarWrites = new Set<Promise<void>>();
  function trackAvatarWrite(operation: Promise<void>) {
    pendingAvatarWrites.add(operation);
    void operation.then(
      () => pendingAvatarWrites.delete(operation),
      () => pendingAvatarWrites.delete(operation),
    );
    return operation;
  }
  async function switchTo(profile: Profile, flush = true) {
    button.disabled = true;
    try {
      await Promise.all([...pendingAvatarWrites]);
      if (flush && (await beforeSwitch()) === false) {
        button.disabled = false;
        return false;
      }
    } catch (error) {
      button.disabled = false;
      throw error;
    }
    try {
      localStorage.setItem(SELECTED, profile.id);
    } catch {
      button.disabled = false;
      throw new Error(
        'Không lưu được lựa chọn người dùng. Hãy cho phép bộ nhớ trình duyệt.',
      );
    }
    window.location.hash = '#/';
    window.location.reload();
  }
  function open() {
    const root = document.getElementById('modal-root')!;
    let release: (() => void) | undefined;
    let closeAvatar: (() => void) | undefined;
    const close = () => {
      closeAvatar?.();
      root.replaceChildren();
      release?.();
    };
    let page = 1;
    let query = '';
    let renaming = '';
    let avatarRequest = 0;
    const searchable = (value: string) =>
      value
        .normalize('NFD')
        .replace(/\p{M}/gu, '')
        .replace(/đ/gi, 'd')
        .toLowerCase();
    function draw() {
      const scrollTop = root.querySelector('.profile-modal')?.scrollTop ?? 0;
      closeAvatar?.();
      avatarRequest++;
      const filtered = profiles.filter((p) =>
        searchable(p.name + ' ' + p.id).includes(searchable(query.trim())),
      );
      const pages = Math.max(1, Math.ceil(filtered.length / 5));
      page = Math.max(1, Math.min(page, pages));
      release?.();
      root.innerHTML = `<div class="modal-overlay profile-overlay"><section class="modal profile-modal" role="dialog" aria-modal="true" aria-labelledby="profiles-title"><div class="modal-head"><div><h2 id="profiles-title">Người dùng</h2><p>Chọn hồ sơ để vào dùng, không cần mật khẩu.</p></div><button type="button" class="icon-button" data-profile-close aria-label="Đóng">×</button></div><div class="profile-search form-field"><label for="profile-search">Tìm người dùng</label><input id="profile-search" type="search" autocomplete="off" placeholder="Tìm theo tên hoặc ID…" value="${esc(query)}"></div><div class="profile-list">${
        filtered
          .slice((page - 1) * 5, page * 5)
          .map(
            (p) =>
              `<div class="profile-row ${p.id === current.id ? 'is-current' : ''}"><button type="button" class="profile-avatar-edit" data-profile-avatar-edit="${esc(p.id)}" aria-label="Đổi ảnh đại diện: ${esc(p.name)}" title="Đổi ảnh đại diện">${profileAvatar(p)}</button><div class="profile-name">${renaming === p.id ? `<form class="profile-rename-form form-field" data-profile-rename-form="${esc(p.id)}" novalidate><label for="profile-rename-name">Tên người dùng</label><input id="profile-rename-name" name="name" required maxlength="60" value="${esc(p.name)}"><div class="profile-rename-actions"><button type="submit" class="btn primary small">Lưu lại</button><button type="button" class="btn outline small" data-profile-rename-cancel>Hủy</button></div></form>` : `<div class="profile-name-line"><strong data-user-content>${esc(p.name)}</strong><button type="button" class="icon-button profile-rename-link" data-profile-rename="${esc(p.id)}" aria-label="Đổi tên" title="Đổi tên">${ico('pencil', 16)}</button></div>`}<code class="profile-id">ID: ${esc(p.id)}</code></div><div class="profile-row-actions"><button type="button" class="btn ${p.id === current.id ? 'outline' : 'primary'}" data-profile-select="${p.id}" ${p.id === current.id ? 'disabled' : ''}>${p.id === current.id ? 'Hiện tại' : 'Vào dùng'}</button><button type="button" class="icon-button profile-delete" title="${profiles.length === 1 ? 'Cần giữ ít nhất một người dùng' : 'Xóa người dùng'}" data-profile-delete="${p.id}" aria-label="Xóa ${esc(p.name)}" ${profiles.length === 1 ? 'disabled' : ''}>${ico('trash', 18)}</button></div></div>`,
          )
          .join('') ||
        '<p class="help-note">Không tìm thấy người dùng phù hợp.</p>'
      }</div>${pages > 1 ? `<nav class="history-pagination" aria-label="Phân trang người dùng"><span>Trang ${page} / ${pages}</span><div>${pageButtons(page, pages, (number) => `data-profile-page="${number}"`)}</div></nav>` : ''}<section class="profile-actions-panel"><form novalidate id="profile-create-form"><label for="profile-name">Tên người dùng mới</label><div class="profile-create-row"><div class="form-field"><input id="profile-name" required maxlength="60" autocomplete="off" placeholder="Ví dụ: An, Bình…"></div>${createButton('Thêm người dùng', '', 'submit')}</div></form><div class="profile-import-section"><div><h3>Nhập thư mục người dùng</h3><p>Khôi phục bản sao lưu hoặc tạo người dùng từ thư mục CSV.</p></div><button type="button" class="btn outline" data-profile-folder>${ico('upload', 16)} Nhập thư mục</button></div></section><input type="file" data-profile-folder-input webkitdirectory multiple hidden>${helpLink('backup')}</section></div>${avatarPickerMarkup()}`;
      release = activateModal(
        root.querySelector<HTMLElement>('.modal')!,
        close,
      );
      root.querySelector<HTMLElement>('.profile-modal')!.scrollTop = scrollTop;
      const search = root.querySelector<HTMLInputElement>('#profile-search')!;
      search.addEventListener('input', () => {
        query = search.value;
        const start = search.selectionStart;
        page = 1;
        draw();
        const next = root.querySelector<HTMLInputElement>('#profile-search')!;
        next.focus();
        if (start !== null) next.setSelectionRange(start, start);
      });
      root
        .querySelectorAll<HTMLButtonElement>('[data-profile-rename]')
        .forEach((node) => {
          node.onclick = () => {
            renaming = node.dataset.profileRename!;
            draw();
            root
              .querySelector<HTMLInputElement>('#profile-rename-name')
              ?.select();
          };
        });
      root
        .querySelector('[data-profile-rename-cancel]')
        ?.addEventListener('click', () => {
          renaming = '';
          draw();
        });
      root
        .querySelector<HTMLFormElement>('[data-profile-rename-form]')
        ?.addEventListener('submit', async (event) => {
          event.preventDefault();
          const form = event.currentTarget as HTMLFormElement;
          if (!validateForm(form)) return;
          const field = form.querySelector<HTMLInputElement>('input')!;
          const submit =
            form.querySelector<HTMLButtonElement>('[type=submit]')!;
          submit.disabled = true;
          try {
            const updated = profileSchema.parse(
              await request(`/api/profiles/${form.dataset.profileRenameForm}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: field.value.trim() }),
              }),
            );
            profiles = profiles.map((p) => (p.id === updated.id ? updated : p));
            if (updated.id === current.id) {
              Object.assign(current, updated);
              button.innerHTML = `${profileAvatar(current)}<span data-user-content>${esc(current.name)}</span>`;
              button.setAttribute(
                'aria-label',
                `Người dùng: ${current.name}. Đổi hoặc quản lý người dùng`,
              );
              button.title = button.getAttribute('aria-label')!;
            }
            refreshProfileAvatar(updated);
            write(CACHE, JSON.stringify(profiles));
            renaming = '';
            draw();
            root
              .querySelector<HTMLButtonElement>(
                `[data-profile-rename="${updated.id}"]`,
              )
              ?.focus({ preventScroll: true });
            notify('Đã đổi tên người dùng.');
          } catch (error) {
            showFieldError(
              field,
              error instanceof Error
                ? error.message
                : 'Không đổi được tên người dùng.',
            );
            submit.disabled = false;
          }
        });
      root
        .querySelectorAll<HTMLButtonElement>('[data-profile-avatar-edit]')
        .forEach((node) => {
          node.onclick = async () => {
            const requestId = ++avatarRequest;
            const profile = profiles.find(
              (p) => p.id === node.dataset.profileAvatarEdit,
            )!;
            node.disabled = true;
            try {
              if (profile.id !== current.id) {
                const snapshot = snapshotSchema.parse(
                  await request(`/api/profiles/${profile.id}/state`),
                );
                write(
                  `flashlab.avatar.${profile.id}`,
                  snapshot.data?.preferences?.avatar ?? 'initials',
                );
                refreshProfileAvatar(profile);
              }
              if (!node.isConnected || requestId !== avatarRequest) return;
              closeAvatar?.();
              root.querySelector('.avatar-picker')!.outerHTML =
                avatarPickerMarkup();
              const picker = root.querySelector<HTMLElement>('.avatar-picker')!;
              picker.hidden = false;
              picker.querySelector<HTMLElement>(
                '[data-avatar-owner]',
              )!.textContent = profile.name;
              closeAvatar = bindAvatarPicker(root, profile, (preset) =>
                trackAvatarWrite(
                  (async () => {
                    const snapshot = snapshotSchema.parse(
                      await request(`/api/profiles/${profile.id}/state`),
                    );
                    const data = snapshot.data ?? {
                      version: 2,
                      decks: [],
                      history: {},
                      sessions: [],
                    };
                    await request(`/api/profiles/${profile.id}/state`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        revision: snapshot.revision,
                        data: {
                          ...data,
                          preferences: { ...data.preferences, avatar: preset },
                        },
                      }),
                    });
                  })(),
                ),
              );
              root.querySelector<HTMLInputElement>('#avatar-search')?.focus();
            } catch (error) {
              notify(
                error instanceof Error
                  ? error.message
                  : 'Chưa lưu được ảnh đại diện lên máy chủ.',
                true,
              );
            } finally {
              node.disabled = false;
            }
          };
        });
      root
        .querySelector('[data-profile-close]')
        ?.addEventListener('click', close);
      root
        .querySelector('.modal-overlay')
        ?.addEventListener('click', (event) => {
          if (event.target === event.currentTarget) close();
        });
      root
        .querySelectorAll<HTMLButtonElement>('[data-profile-select]')
        .forEach((node) =>
          node.addEventListener('click', async () => {
            const profile = profiles.find(
              (p) => p.id === node.dataset.profileSelect,
            )!;
            node.disabled = true;
            try {
              if ((await switchTo(profile)) === false) node.disabled = false;
            } catch (error) {
              node.disabled = false;
              notify(
                error instanceof Error
                  ? error.message
                  : 'Không đổi được người dùng.',
                true,
              );
            }
          }),
        );
      root
        .querySelectorAll<HTMLButtonElement>('[data-profile-delete]')
        .forEach((node) =>
          node.addEventListener('click', async () => {
            const profile = profiles.find(
              (p) => p.id === node.dataset.profileDelete,
            )!;
            node.disabled = true;
            const choice = await askProfileDeletion(profile);
            if (!choice) {
              node.disabled = false;
              return;
            }
            try {
              if (choice === 'backup') {
                if (profile.id === current.id) await beforeSwitch(false);
                await downloadProfileBackup(profile);
                if (
                  !(await askConfirmation(
                    'Bản ZIP đã được gửi tới trình duyệt. Hãy kiểm tra file đã lưu xong trước khi tiếp tục xóa người dùng.',
                    {
                      title: 'Bạn đã lưu bản sao lưu?',
                      confirmLabel: 'Đã lưu, xóa người dùng',
                      cancelLabel: 'Giữ người dùng',
                      danger: true,
                    },
                  ))
                ) {
                  node.disabled = false;
                  return;
                }
              }
              if (
                profile.id === current.id &&
                (await beforeSwitch()) === false
              ) {
                node.disabled = false;
                return;
              }
              await request(`/api/profiles/${profile.id}`, {
                method: 'DELETE',
              });
              profiles = profiles.filter((p) => p.id !== profile.id);
              write(CACHE, JSON.stringify(profiles));
              for (const key of [
                profile.id === 'default'
                  ? 'flashlab.server.v1'
                  : `flashlab.server.v1.${profile.id}`,
                profile.id === 'default'
                  ? 'flashlab.html.v2'
                  : `flashlab.html.v2.${profile.id}`,
              ]) {
                try {
                  localStorage.removeItem(key);
                } catch {
                  /* Deleted profiles cannot be reopened through the server. */
                }
              }
              if (profile.id === current.id)
                await switchTo(profiles[0]!, false);
              else {
                draw();
                notify('Đã xóa người dùng.');
              }
            } catch (error) {
              node.disabled = false;
              notify(
                error instanceof Error
                  ? error.message
                  : 'Không xóa được người dùng.',
                true,
              );
            }
          }),
        );
      root
        .querySelectorAll<HTMLButtonElement>('[data-profile-page]')
        .forEach((node) =>
          node.addEventListener('click', () => {
            page = Number(node.dataset.profilePage);
            draw();
          }),
        );
      root
        .querySelector<HTMLAnchorElement>('[data-help-link]')
        ?.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const hash = (event.currentTarget as HTMLAnchorElement).getAttribute(
            'href',
          )!;
          close();
          if (location.hash === hash) {
            const guide = document.getElementById(
              'guide-backup',
            ) as HTMLDetailsElement | null;
            if (guide) {
              guide.open = true;
              guide.scrollIntoView?.({ block: 'start' });
              guide.focus();
            }
          } else location.hash = hash;
        });
      const folderInput = root.querySelector<HTMLInputElement>(
        '[data-profile-folder-input]',
      )!;
      root
        .querySelector('[data-profile-folder]')!
        .addEventListener('click', () => folderInput.click());
      folderInput.addEventListener('change', async () => {
        const files = Array.from(folderInput.files ?? []);
        folderInput.value = '';
        if (!files.length) return;
        try {
          const { profile: imported, data } = await readProfileFolder(files);
          const list = profilesSchema.parse(await request('/api/profiles'));
          const existing = list.find((p) => p.id === imported.id);
          if (
            existing &&
            !(await askConfirmation(
              `Ghi đè học phần và tiến độ của “${existing.name}” bằng thư mục đã chọn? Xuất ZIP trong Cài đặt trước nếu muốn giữ bản hiện có.`,
              {
                title: 'Ghi đè người dùng?',
                confirmLabel: 'Ghi đè',
                danger: true,
              },
            ))
          )
            return;
          if ((await beforeSwitch(imported.id === current.id)) === false)
            return;
          const revision = existing
            ? snapshotSchema.parse(
                await request(`/api/profiles/${imported.id}/state`),
              ).revision
            : null;
          await request(`/api/profiles/${imported.id}/import`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              confirmed: true,
              revision,
              backup: {
                ...data,
                userId: imported.id,
                userName: imported.name,
                userCreated: imported.created,
              },
            }),
          });
          if (imported.id === current.id) {
            window.location.reload();
            return;
          }
          profiles = profilesSchema.parse(await request('/api/profiles'));
          write(CACHE, JSON.stringify(profiles));
          draw();
          notify('Đã nhập thư mục người dùng.');
        } catch (error) {
          notify(
            error instanceof Error ? error.message : 'Nhập thư mục thất bại.',
            true,
          );
        }
      });
      const form = root.querySelector<HTMLFormElement>('#profile-create-form')!;
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        if (!validateForm(form)) return;
        const field = form.querySelector<HTMLInputElement>('#profile-name')!;
        const submit = form.querySelector<HTMLButtonElement>('[type=submit]')!;
        submit.disabled = true;
        try {
          const profile = profileSchema.parse(
            await request('/api/profiles', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ name: field.value.trim() }),
            }),
          );
          profiles.push(profile);
          query = '';
          page = Math.ceil(profiles.length / 5);
          write(CACHE, JSON.stringify(profiles));
          draw();
          notify('Đã thêm người dùng. Bấm “Vào dùng” để mở hồ sơ.');
        } catch (error) {
          showFieldError(
            field,
            error instanceof Error
              ? error.message
              : 'Không thêm được người dùng.',
          );
          submit.disabled = false;
        }
      });
    }
    draw();
  }
  button.addEventListener('click', async () => {
    button.disabled = true;
    try {
      const list = await request('/api/profiles');
      profiles = profilesSchema.parse(list);
      write(CACHE, JSON.stringify(profiles));
      open();
    } catch {
      notify(
        'Chưa kết nối máy chủ. Không thể quản lý người dùng lúc này.',
        true,
      );
    } finally {
      button.disabled = false;
    }
  });
  return current;
}
