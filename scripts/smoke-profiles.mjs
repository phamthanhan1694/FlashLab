import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';

async function waitFor(check, label) {
  for (let i = 0; i < 500; i++) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Timed out: ${label}`);
}

test('profiles UI: create, switch, separate preferences, confirm deletion and restore existing user', async (t) => {
  const html = await readFile(
    new URL('../apps/frontend/dist/index.html', import.meta.url),
    'utf8',
  );
  const asset = html.match(/src="([^"]+\.js)"/)[1];
  const bundle = await readFile(
    new URL(`../apps/frontend/dist${asset}`, import.meta.url),
    'utf8',
  );
  const windows = [];
  t.after(async () => {
    for (const window of windows) await window.happyDOM.abort();
  });
  const newId = '11111111-1111-4111-8111-111111111111';
  let profiles = [{ id: 'default', name: 'Người dùng mặc định', created: 1 }];
  const snapshots = new Map([
    [
      'default',
      {
        revision: 2,
        data: {
          version: 2,
          decks: [
            {
              id: 'old-deck',
              title: 'Học phần cũ',
              description: '',
              color: 'blue',
              created: 1,
              cards: [],
            },
          ],
          history: {},
          sessions: [],
          preferences: {
            theme: 'dark',
            audio: {
              music: false,
              effects: true,
              volume: 0.2,
              musicVolume: 0.7,
            },
          },
        },
      },
    ],
  ]);
  const storage = new Map();
  let exports = 0;
  let exportFailure = false;
  const operations = [];
  const downloads = [];
  async function boot() {
    const window = new Window({
      url: 'http://localhost:5173/',
      settings: {
        enableJavaScriptEvaluation: true,
        disableCSSFileLoading: true,
        disableJavaScriptFileLoading: true,
      },
    });
    windows.push(window);
    window.document.write(html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ''));
    for (const [key, value] of storage) window.localStorage.setItem(key, value);
    window.structuredClone = structuredClone;
    window.AbortSignal = AbortSignal;
    window.scrollTo = () => {};
    window.URL.createObjectURL = () => 'blob:backup-test';
    window.URL.revokeObjectURL = () => {};
    window.HTMLAnchorElement.prototype.click = function () {
      downloads.push(this.download);
    };
    window.alert =
      window.confirm =
      window.prompt =
        () => {
          throw new Error('Native dialogs forbidden');
        };
    window.Audio = function () {
      return {
        src: '',
        paused: true,
        currentTime: 0,
        volume: 1,
        play() {
          this.paused = false;
          return Promise.resolve();
        },
        pause() {
          this.paused = true;
        },
      };
    };
    let reloads = 0;
    window.location.reload = () => {
      reloads++;
    };
    const response = (value, status = 200) =>
      new Response(status === 204 ? null : JSON.stringify(value), { status });
    window.fetch = async (url, options) => {
      const path = String(url);
      const method = options?.method ?? 'GET';
      if (path === '/api/storage')
        return response({ directory: '/tmp/profile-storage' });
      if (path === '/api/profiles') {
        if (method === 'GET') return response(profiles);
        const name = JSON.parse(options.body).name;
        if (profiles.some((p) => p.name.toLowerCase() === name.toLowerCase()))
          return response({ error: 'Tên người dùng đã tồn tại.' }, 409);
        const profile = { id: newId, name, created: 2 };
        profiles.push(profile);
        snapshots.set(newId, {
          revision: 1,
          data: { version: 2, decks: [], history: {}, sessions: [] },
        });
        return response(profile, 201);
      }
      if (method === 'PUT' && /^\/api\/profiles\/[^/]+$/.test(path)) {
        const id = path.split('/').at(-1);
        const name = JSON.parse(options.body).name;
        if (
          profiles.some(
            (p) => p.id !== id && p.name.toLowerCase() === name.toLowerCase(),
          )
        )
          return response(
            { error: 'Tên người dùng đã tồn tại với ID khác.' },
            409,
          );
        const profile = profiles.find((p) => p.id === id);
        Object.assign(profile, { name });
        return response(profile);
      }
      if (method === 'DELETE') {
        operations.push('delete:' + path.split('/').at(-1));
        const id = path.split('/').at(-1);
        profiles = profiles.filter((p) => p.id !== id);
        snapshots.delete(id);
        return response(null, 204);
      }
      const id = path === '/api/state' ? 'default' : path.split('/')[3];
      if (!snapshots.has(id))
        return response({ error: 'Missing profile' }, 404);
      const snapshot = snapshots.get(id);
      if (path.endsWith('/export')) {
        exports++;
        operations.push('export:' + id);
        if (exportFailure) return response({ error: 'Export failed' }, 500);
        return new Response(new Uint8Array([80, 75, 3, 4]), {
          headers: { 'Content-Type': 'application/zip' },
        });
      }
      if (method === 'POST' && path.endsWith('/import')) {
        const payload = JSON.parse(options.body);
        assert.equal(payload.confirmed, true);
        assert.equal(payload.revision, snapshot.revision);
        const { userId, userName, userCreated, ...data } = payload.backup;
        snapshots.set(id, { revision: snapshot.revision + 1, data });
        return response({
          profile: profiles.find((p) => p.id === id),
          snapshot: snapshots.get(id),
        });
      }

      if (method === 'PUT') {
        const payload = JSON.parse(options.body);
        if (payload.revision !== snapshot.revision)
          return response({ error: 'Conflict' }, 409);
        snapshots.set(id, {
          revision: snapshot.revision + 1,
          data: payload.data,
        });
      }
      return response(snapshots.get(id));
    };
    window.eval(bundle.replace(/export\{[^}]+\};?\s*$/, ''));
    const document = window.document;
    const click = (selector) => {
      const node = document.querySelector(selector);
      assert.ok(node, selector);
      node.click();
    };
    const submit = () =>
      document
        .querySelector('#profile-create-form')
        .dispatchEvent(
          new window.Event('submit', { bubbles: true, cancelable: true }),
        );
    const capture = () => {
      storage.clear();
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        storage.set(key, window.localStorage.getItem(key));
      }
    };
    await waitFor(
      () => document.querySelector('#profile-button:not(:disabled)'),
      'profile initialized',
    );
    return { window, document, click, submit, capture, reloads: () => reloads };
  }

  let app = await boot();
  assert.equal(app.document.documentElement.dataset.theme, 'dark');
  assert.equal(
    app.document
      .querySelector('[data-sound-mute="background"]')
      .getAttribute('aria-pressed'),
    'true',
  );
  assert.match(
    app.document.querySelector('.recent-decks').textContent,
    /Học phần cũ/,
  );
  app.click('#profile-button');
  await waitFor(
    () => app.document.querySelector('.avatar-picker'),
    'avatar picker',
  );
  app.click('[data-profile-avatar-edit="default"]');
  app.click('[data-avatar-preset="owl"]');
  await waitFor(
    () => snapshots.get('default').data.preferences.avatar === 'owl',
    'default avatar saved',
  );
  await waitFor(
    () => app.document.querySelector('#profile-create-form'),
    'profile manager',
  );
  assert.match(
    app.document.querySelector('.profile-id').textContent,
    /ID: default/,
  );
  assert.equal(
    app.document.querySelector('[data-profile-delete="default"]').disabled,
    true,
  );
  app.submit();
  assert.equal(
    app.document.getElementById('profile-name').getAttribute('aria-invalid'),
    'true',
  );
  app.document.getElementById('profile-name').value = 'An';
  app.submit();
  await waitFor(
    () => app.document.querySelector(`[data-profile-select="${newId}"]`),
    'new profile',
  );

  const beforeRenameRevision = snapshots.get(newId).revision;
  app.click(`[data-profile-rename="${newId}"]`);
  app.document.getElementById('profile-rename-name').value = 'Bình';
  app.document
    .querySelector('[data-profile-rename-form]')
    .dispatchEvent(
      new app.window.Event('submit', { bubbles: true, cancelable: true }),
    );
  await waitFor(
    () =>
      app.document.querySelector(`[data-profile-rename="${newId}"]`) &&
      profiles.find((p) => p.id === newId).name === 'Bình',
    'profile renamed',
  );
  assert.equal(
    snapshots.get(newId).revision,
    beforeRenameRevision,
    'rename keeps learning state unchanged',
  );
  const searchUsers = (text) => {
    const input = app.document.getElementById('profile-search');
    input.value = text;
    input.dispatchEvent(new app.window.Event('input', { bubbles: true }));
  };
  searchUsers('binh');
  assert.equal(app.document.querySelectorAll('.profile-row').length, 1);
  assert.ok(app.document.querySelector(`[data-profile-select="${newId}"]`));
  searchUsers('missing-user');
  assert.equal(app.document.querySelectorAll('.profile-row').length, 0);
  searchUsers('default');
  assert.ok(app.document.querySelector('[data-profile-select="default"]'));
  searchUsers('');
  app.click('[data-profile-rename="default"]');
  app.document.getElementById('profile-rename-name').value = 'Mặc định mới';
  app.document
    .querySelector('[data-profile-rename-form]')
    .dispatchEvent(
      new app.window.Event('submit', { bubbles: true, cancelable: true }),
    );
  await waitFor(
    () =>
      app.document
        .getElementById('profile-button')
        .textContent.includes('Mặc định mới'),
    'current profile name updated in toolbar',
  );
  await waitFor(
    () => app.document.querySelector('[data-profile-rename="default"]'),
    'rename form closed',
  );

  app.click(`[data-profile-rename="${newId}"]`);
  app.document.getElementById('profile-rename-name').value = 'An';
  app.document
    .querySelector('[data-profile-rename-form]')
    .dispatchEvent(
      new app.window.Event('submit', { bubbles: true, cancelable: true }),
    );
  await waitFor(
    () =>
      app.document.querySelector(`[data-profile-rename="${newId}"]`) &&
      profiles.find((p) => p.id === newId).name === 'An',
    'rename restored for fixtures',
  );
  app.click(`[data-profile-avatar-edit="${newId}"]`);
  await waitFor(
    () =>
      !app.document.querySelector('.avatar-picker').hidden &&
      app.document.querySelector('[data-avatar-owner]').textContent === 'An',
    'avatar picker for another user',
  );
  app.click('[data-avatar-preset="cat"]');
  await waitFor(
    () => snapshots.get(newId).data.preferences?.avatar === 'cat',
    'other user avatar saved',
  );
  await waitFor(
    () =>
      app.document.getElementById('avatar-save-status').textContent ===
      'Đã lưu ảnh đại diện.',
    'other avatar save acknowledged',
  );
  assert.equal(
    snapshots.get('default').data.preferences.avatar,
    'owl',
    'another user avatar does not change current preferences',
  );
  app.click('[data-avatar-close]');
  assert.equal(app.document.querySelector('.avatar-picker').hidden, true);
  let zipBlob;
  app.window.URL.createObjectURL = (blob) => {
    zipBlob = blob;
    return 'blob:profile-test';
  };
  app.window.URL.revokeObjectURL = () => {};
  app.window.HTMLAnchorElement.prototype.click = () => {};
  assert.equal(app.document.querySelector('[data-profile-export]'), null);
  app.click('[data-profile-close]');
  app.click('#settings > summary');
  app.click('#settings-export');
  await waitFor(() => zipBlob, 'ZIP download');
  assert.equal(exports, 1);
  assert.equal(zipBlob.type, 'application/zip');
  app.click('#settings-close');
  app.click('#profile-button');
  await waitFor(
    () => app.document.querySelector('#profile-create-form'),
    'profile manager after ZIP export',
  );
  const folderInput = app.document.querySelector('[data-profile-folder-input]');
  const folderFile = (name, value) => {
    const file = new app.window.File([JSON.stringify(value)], name);
    Object.defineProperty(file, 'webkitRelativePath', {
      value: `${newId}/${name}`,
    });
    return file;
  };
  const importedData = {
    version: 2,
    decks: [],
    history: { '2026-10-13': 4 },
    sessions: [],
  };
  Object.defineProperty(folderInput, 'files', {
    configurable: true,
    value: [
      folderFile(
        'user.json',
        profiles.find((p) => p.id === newId),
      ),
      folderFile('state.json', { revision: 1, data: importedData }),
    ],
  });
  folderInput.dispatchEvent(new app.window.Event('change', { bubbles: true }));
  await waitFor(
    () => app.document.querySelector('[data-confirm="accept"]'),
    'folder overwrite confirmation',
  );
  app.click('[data-confirm="cancel"]');
  assert.deepEqual(snapshots.get(newId).data.history, {});
  folderInput.dispatchEvent(new app.window.Event('change', { bubbles: true }));
  await waitFor(
    () => app.document.querySelector('[data-confirm="accept"]'),
    'folder overwrite retry',
  );
  app.click('[data-confirm="accept"]');
  await waitFor(
    () => snapshots.get(newId).data.history['2026-10-13'] === 4,
    'folder imported',
  );
  await waitFor(
    () => app.document.querySelector('#profile-create-form'),
    'profile redraw after folder import',
  );
  app.document.getElementById('profile-name').value = 'An';
  app.submit();
  await waitFor(
    () =>
      app.document
        .getElementById('profile-name-error')
        ?.textContent.includes('đã tồn tại'),
    'duplicate profile feedback',
  );
  app.click(`[data-profile-select="${newId}"]`);
  await waitFor(() => app.reloads() === 1, 'switch reload');
  app.capture();
  await app.window.happyDOM.abort();

  app = await boot();
  assert.match(app.document.getElementById('profile-button').textContent, /An/);
  assert.equal(
    app.document.querySelector('#profile-button [data-avatar-kind]').dataset
      .avatarKind,
    'initials',
  );
  assert.equal(
    app.document
      .querySelector('.recent-decks')
      .textContent.includes('Học phần cũ'),
    false,
  );
  assert.equal(
    app.document
      .querySelector('[data-sound-mute="background"]')
      .getAttribute('aria-pressed'),
    'false',
  );
  app.click('.theme-options [data-theme="light"]');
  const music = app.document.getElementById('sound-background-volume');
  music.value = '25';
  music.dispatchEvent(new app.window.Event('input', { bubbles: true }));
  await waitFor(
    () =>
      snapshots.get(newId).data.preferences?.audio.sounds?.background
        ?.volume === 0.25,
    'per-profile settings saved',
  );
  assert.equal(snapshots.get('default').data.preferences.theme, 'dark');
  assert.equal(
    snapshots.get('default').data.preferences.audio.musicVolume,
    0.7,
  );
  app.click('#profile-button');
  await waitFor(
    () => app.document.querySelector('[data-profile-select="default"]'),
    'switch manager',
  );
  app.click(`[data-profile-avatar-edit="${newId}"]`);
  app.click('[data-avatar-page="2"]');
  app.click('[data-avatar-preset="fox"]');
  assert.equal(
    app.document.getElementById('avatar-save-status').textContent,
    'Đang lưu ảnh đại diện…',
  );
  app.click('[data-profile-select="default"]');
  await waitFor(() => app.reloads() === 1, 'back to default');
  assert.equal(snapshots.get(newId).data.preferences.avatar, 'fox');
  app.capture();
  await app.window.happyDOM.abort();

  app = await boot();
  assert.equal(
    app.document.querySelector('#profile-button [data-avatar-kind]').dataset
      .avatarKind,
    'owl',
  );
  assert.equal(app.document.documentElement.dataset.theme, 'dark');
  assert.equal(
    app.document.getElementById('sound-background-volume').value,
    '70',
  );
  assert.match(
    app.document.querySelector('.recent-decks').textContent,
    /Học phần cũ/,
  );
  app.click('#profile-button');
  await waitFor(
    () => app.document.querySelector(`[data-profile-select="${newId}"]`),
    'choose personal profile again',
  );
  app.click(`[data-profile-select="${newId}"]`);
  await waitFor(() => app.reloads() === 1, 'personal again');
  app.capture();
  await app.window.happyDOM.abort();

  app = await boot();
  assert.equal(app.document.documentElement.dataset.theme, 'light');
  assert.equal(
    app.document.getElementById('sound-background-volume').value,
    '25',
  );
  app.click('#profile-button');
  await waitFor(
    () => app.document.querySelector(`[data-profile-delete="${newId}"]`),
    'delete manager',
  );
  app.click(`[data-profile-delete="${newId}"]`);
  assert.ok(app.document.querySelector('[role="alertdialog"]'));
  app.click('[data-confirm="cancel"]');
  await waitFor(
    () =>
      !app.document.querySelector(`[data-profile-delete="${newId}"]`).disabled,
    'cancel deletion',
  );
  assert.equal(profiles.length, 2);
  exportFailure = true;
  app.click(`[data-profile-delete="${newId}"]`);
  app.click('[data-confirm="accept"]');
  await waitFor(
    () =>
      !app.document.querySelector(`[data-profile-delete="${newId}"]`).disabled,
    'failed backup keeps user',
  );
  assert.equal(profiles.length, 2);
  assert.ok(!operations.includes('delete:' + newId));
  exportFailure = false;
  app.click(`[data-profile-delete="${newId}"]`);
  app.click('[data-confirm="accept"]');
  await waitFor(
    () =>
      app.document.querySelector('#confirmation-title')?.textContent ===
      'Bạn đã lưu bản sao lưu?',
    'backup saved confirmation',
  );
  assert.equal(profiles.length, 2, 'backup download alone does not delete');
  assert.ok(downloads.includes(`FlashLab-${newId}.zip`));
  app.click('[data-confirm="cancel"]');
  await waitFor(
    () =>
      !app.document.querySelector(`[data-profile-delete="${newId}"]`).disabled,
    'keep user after backup',
  );
  assert.equal(profiles.length, 2);
  app.click(`[data-profile-delete="${newId}"]`);
  app.click('[data-confirm="accept"]');
  await waitFor(
    () =>
      app.document.querySelector('#confirmation-title')?.textContent ===
      'Bạn đã lưu bản sao lưu?',
    'backup confirmation retry',
  );
  app.click('[data-confirm="accept"]');
  await waitFor(() => app.reloads() === 1, 'delete active profile switches');
  const deletedAt = operations.indexOf('delete:' + newId);
  assert.ok(
    deletedAt > 0 && operations[deletedAt - 1] === 'export:' + newId,
    'backup precedes deletion',
  );
  assert.equal(profiles.length, 1);
  assert.equal(snapshots.has(newId), false);
  assert.equal(
    app.window.localStorage.getItem(`flashlab.server.v1.${newId}`),
    null,
  );
  assert.equal(app.window.localStorage.getItem('flashlab.profile'), 'default');
  assert.equal(snapshots.get('default').data.decks[0].title, 'Học phần cũ');
  app.capture();
  await app.window.happyDOM.abort();
  app = await boot();
  app.click('#profile-button');
  await waitFor(
    () => app.document.getElementById('profile-name'),
    'manager for skip-backup deletion',
  );
  app.document.getElementById('profile-name').value = 'Temporary user';
  app.submit('#profile-create-form');
  await waitFor(
    () => app.document.querySelector(`[data-profile-delete="${newId}"]`),
    'new user to delete without backup',
  );
  const exportsBeforeSkip = exports;
  app.click(`[data-profile-delete="${newId}"]`);
  app.click('[data-confirm="skip-backup"]');
  await waitFor(() => profiles.length === 1, 'delete without backup');
  assert.equal(exports, exportsBeforeSkip);
  assert.equal(app.reloads(), 0, 'deleting another user keeps current profile');
});
