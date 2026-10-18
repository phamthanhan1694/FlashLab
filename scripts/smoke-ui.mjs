import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { Window } from 'happy-dom';
import { IDBFactory } from 'fake-indexeddb';
import { zipSync, strToU8 } from 'fflate';

async function waitFor(condition, label) {
  const until = Date.now() + 8000;
  while (Date.now() < until) {
    if (condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`Timed out: ${label}`);
}

test('production frontend: initialize, create deck/card, render all study modes and save an answer', async (t) => {
  const window = new Window({
    url: 'http://localhost:5173',
    settings: {
      enableJavaScriptEvaluation: true,
      disableCSSFileLoading: true,
      disableJavaScriptFileLoading: true,
    },
  });
  t.after(() => window.happyDOM.abort());
  Object.defineProperty(window, 'indexedDB', {
    value: new IDBFactory(),
    configurable: true,
  });
  const html = await readFile(
    new URL('../apps/frontend/dist/index.html', import.meta.url),
    'utf8',
  );
  const asset = html.match(/src="([^"]+\.js)"/)[1];
  window.document.write(html.replace(/<script[^>]*>[\s\S]*?<\/script>/g, ''));
  window.structuredClone = structuredClone;
  window.AbortSignal = AbortSignal;
  window.confirm =
    window.alert =
    window.prompt =
      () => {
        throw new Error('Native browser dialogs must never be used');
      };
  const scrollCalls = [];
  window.scrollTo = (options) => scrollCalls.push({ top: options.top });
  window.HTMLElement.prototype.scrollIntoView = function () {
    scrollCalls.push({ id: this.id, open: this.open });
  };
  const spoken = [];
  Object.defineProperty(window, 'speechSynthesis', {
    configurable: true,
    value: {
      cancel() {},
      getVoices() {
        return [];
      },
      speak(utterance) {
        spoken.push({
          text: utterance.text,
          lang: utterance.lang,
          rate: utterance.rate,
        });
      },
    },
  });
  window.SpeechSynthesisUtterance = function (text) {
    this.text = text;
  };
  const audioClips = [];
  window.Audio = function (src = '') {
    const audio = {
      src,
      paused: true,
      currentTime: 0,
      volume: 1,
      loop: false,
      play() {
        this.paused = false;
        this.plays = (this.plays ?? 0) + 1;
        return Promise.resolve();
      },
      pause() {
        this.paused = true;
      },
    };
    audioClips.push(audio);
    return audio;
  };

  let snapshot = { revision: 0, data: null };
  let blogArticles = [];
  window.fetch = async (_url, options) => {
    if (String(_url).startsWith('/api/blog')) {
      if (options?.method === 'POST') {
        const body = JSON.parse(options.body);
        blogArticles = [
          {
            ...body,
            ownerId: options.headers['X-FlashLab-Profile'],
            author: 'Người dùng mặc định',
            id: 'article-1',
            revision: 1,
            updated: Date.now(),
          },
          ...blogArticles,
        ];
        return new Response(JSON.stringify(blogArticles[0]));
      }
      if (options?.method === 'DELETE') {
        blogArticles = blogArticles.filter(
          (article) => !String(_url).endsWith('/' + article.id),
        );
        return new Response(null, { status: 204 });
      }
      if (options?.method === 'PUT') {
        const body = JSON.parse(options.body);
        blogArticles[0] = {
          ...blogArticles[0],
          ...body,
          revision: blogArticles[0].revision + 1,
        };
        return new Response(JSON.stringify(blogArticles[0]));
      }
      return new Response(JSON.stringify(blogArticles));
    }
    if (_url === '/api/profiles')
      return new Response(
        JSON.stringify([
          { id: 'default', name: 'Người dùng mặc định', created: 1 },
        ]),
      );
    if (_url === '/api/storage')
      return new Response(
        JSON.stringify({ directory: '/tmp/flashlab-storage' }),
      );
    if (String(_url).endsWith('/import')) {
      const payload = JSON.parse(options.body);
      assert.equal(payload.confirmed, true);
      assert.equal(payload.revision, snapshot.revision);
      assert.equal(payload.backup.userId, 'default');
      const { userId, userName, ...data } = payload.backup;
      snapshot = { revision: snapshot.revision + 1, data };
      return new Response(
        JSON.stringify({
          profile: { id: 'default', name: 'Người dùng mặc định', created: 1 },
          snapshot,
        }),
      );
    }

    if (options?.method === 'PUT') {
      const payload = JSON.parse(options.body);
      assert.equal(payload.revision, snapshot.revision);
      snapshot = { revision: snapshot.revision + 1, data: payload.data };
    }
    return new Response(JSON.stringify(snapshot));
  };
  window.localStorage.setItem('flashlab.theme', 'dark');
  // Vite may export shared helpers from the entry chunk; this harness evaluates the entry as a script.
  const entryBundle = await readFile(
    new URL(`../apps/frontend/dist${asset}`, import.meta.url),
    'utf8',
  );
  window.eval(entryBundle.replace(/export\{[^}]+\};?\s*$/, ''));
  const document = window.document;
  const click = (selector) => {
    const target = document.querySelector(selector);
    assert.ok(target, `Missing control ${selector}`);
    target.click();
  };
  const submit = (selector) =>
    document
      .querySelector(selector)
      .dispatchEvent(
        new window.Event('submit', { bubbles: true, cancelable: true }),
      );
  const exitStudy = async () => {
    click('[data-action="study-exit"]');
    await waitFor(
      () =>
        document.querySelector('[data-confirm="accept"]') ||
        !document.querySelector('.study-area'),
      'study exit choice',
    );
    if (
      document.querySelector(
        '.test-all-questions, #write-form, .match-grid, .flip-card, [data-choice]',
      )
    )
      assert.ok(
        document.querySelector('[data-confirm="accept"]'),
        'unfinished study asks before exit',
      );
    if (document.querySelector('[data-confirm="accept"]'))
      click('[data-confirm="accept"]');
    await waitFor(
      () => !document.querySelector('.study-area'),
      'study exit complete',
    );
  };
  const completeTest = () => {
    for (const panel of document.querySelectorAll(
      '.test-all-questions .test-question',
    )) {
      const field = panel.querySelector('input');
      if (field.type === 'radio') field.checked = true;
      else field.value = 'Test answer';
      field.dispatchEvent(new window.Event('input', { bubbles: true }));
      panel.querySelector('[data-test-confirm]').click();
    }
  };
  let checkedSetupCancel = false;
  const startStudy = async (mode, options = {}) => {
    click(`[data-mode="${mode}"]`);
    assert.equal(
      document.querySelector('[role="alertdialog"]'),
      null,
      'entering setup does not ask to leave',
    );
    await waitFor(
      () =>
        document.querySelector('#study-setup-form') ||
        document.querySelector('.study-area .empty'),
      `${mode} setup`,
    );
    if (document.querySelector('#study-setup-form')) {
      assert.ok(
        document.querySelector(
          '#modal-root [role="dialog"][aria-modal="true"] #study-setup-form',
        ),
      );
      assert.equal(
        document
          .getElementById('content')
          .contains(document.getElementById('study-setup-form')),
        false,
      );
      assert.equal(document.querySelector('.app-shell').inert, true);
      if (!checkedSetupCancel) {
        checkedSetupCancel = true;
        const background = document.getElementById('content').innerHTML;
        const route = window.location.hash;
        click('[data-action="study-setup-cancel"]');
        assert.equal(document.querySelector('#study-setup-form'), null);
        assert.equal(document.querySelector('.app-shell').inert, false);
        assert.equal(document.getElementById('content').innerHTML, background);
        assert.equal(window.location.hash, route);
        click(`[data-mode="${mode}"]`);
        await waitFor(
          () => document.getElementById('study-setup-form'),
          'reopen setup dialog',
        );
      }

      assert.equal(
        document.querySelector('.flip-card,#test-form,[data-tile]'),
        null,
        'setup appears before study starts',
      );
      const count = document.getElementById('setup-count');
      const memoryFilter = document.getElementById('setup-memory-filter');
      assert.equal(
        document.querySelector('#study-setup-form .form-field select').id,
        'setup-memory-filter',
      );
      const allCount = Number(count.max);
      memoryFilter.value = 'remembered';
      memoryFilter.dispatchEvent(new window.Event('change', { bubbles: true }));
      const rememberedCount = Number(count.max);
      assert.equal(
        document.querySelector('#study-setup-form [type="submit"]').disabled,
        rememberedCount === 0,
      );
      memoryFilter.value = 'unremembered';
      memoryFilter.dispatchEvent(new window.Event('change', { bubbles: true }));
      assert.equal(rememberedCount + Number(count.max), allCount);
      memoryFilter.value = 'all';
      memoryFilter.dispatchEvent(new window.Event('change', { bubbles: true }));
      assert.equal(
        count.value,
        count.max,
        'each session defaults to the maximum',
      );
      if (options.memoryFilter) {
        memoryFilter.value = options.memoryFilter;
        memoryFilter.dispatchEvent(
          new window.Event('change', { bubbles: true }),
        );
      }
      if (options.count !== undefined) count.value = String(options.count);
      if (mode === 'match')
        assert.equal(
          document.getElementById('setup-order'),
          null,
          'matching always uses random order',
        );
      if (options.order)
        document.getElementById('setup-order').value = options.order;
      if (options.type)
        document.getElementById('setup-test-type').value = options.type;
      if (mode === 'test') {
        document.getElementById('setup-multiple-choice').checked =
          !!options.multipleChoice;
        document.getElementById('setup-multiple-write').checked =
          !!options.multipleWrite;
      }
      submit('#study-setup-form');
      await waitFor(
        () => document.querySelector('.study-area'),
        'study entered',
      );
      assert.equal(
        document.querySelector('[role="alertdialog"]'),
        null,
        'starting a session does not ask to leave',
      );
    }
    await waitFor(
      () =>
        document.querySelector('.study-area') &&
        !document.querySelector('#study-setup-form'),
      `${mode} started`,
    );
  };
  await waitFor(() => document.querySelector('.welcome'), 'home');
  assert.deepEqual(
    Array.from(document.querySelectorAll('.side-nav [data-nav]')).map(
      (node) => node.dataset.nav,
    ),
    ['home', 'library', 'classes', 'review'],
  );
  click('#profile-button');
  await waitFor(
    () => document.querySelector('.avatar-picker'),
    'avatar picker',
  );
  assert.equal(document.querySelector('.avatar-picker').hidden, true);
  click('[data-profile-avatar-edit="default"]');
  assert.equal(document.querySelector('.avatar-picker').hidden, false);
  assert.equal(document.querySelectorAll('[data-avatar-preset]').length, 5);
  click('[data-avatar-preset="owl"]');
  assert.equal(
    document.querySelector('#profile-button [data-avatar-kind]').dataset
      .avatarKind,
    'owl',
  );
  assert.equal(document.querySelector('.topbar-location'), null);
  assert.ok(document.querySelector('#profile-button svg'));
  await waitFor(
    () => snapshot.data?.preferences?.avatar === 'owl',
    'avatar persisted',
  );
  await waitFor(
    () =>
      document.getElementById('avatar-save-status').textContent ===
      'Đã lưu ảnh đại diện.',
    'avatar save acknowledged',
  );
  click('[data-avatar-page="2"]');
  assert.equal(document.querySelectorAll('[data-avatar-preset]').length, 5);
  click('[data-avatar-preset="whale"]');
  await waitFor(
    () => snapshot.data?.preferences?.avatar === 'whale',
    'second avatar page persisted',
  );
  await waitFor(
    () =>
      document.getElementById('avatar-save-status').textContent ===
      'Đã lưu ảnh đại diện.',
    'second avatar acknowledged',
  );
  const animalIds = new Set([
    'initials',
    'owl',
    'dog',
    'cat',
    'gull',
    'capybara',
    'whale',
  ]);
  document
    .querySelectorAll('[data-avatar-preset]')
    .forEach((choice) => animalIds.add(choice.dataset.avatarPreset));
  for (let page = 3; page <= 30; page++) {
    click(`[data-avatar-page="${page}"]`);
    const choices = Array.from(
      document.querySelectorAll('[data-avatar-preset]'),
    );
    assert.ok(choices.length <= 5);
    for (const choice of choices) {
      animalIds.add(choice.dataset.avatarPreset);
      assert.ok(choice.querySelector('svg'));
      assert.equal(choice.innerHTML.includes('undefined'), false);
    }
  }
  assert.equal(animalIds.size, 149);
  const sheepSearch = document.getElementById('avatar-search');
  sheepSearch.value = 'Sheep';
  sheepSearch.dispatchEvent(new window.Event('input', { bubbles: true }));
  click('[data-avatar-preset="sheep"]');
  await waitFor(
    () =>
      document.getElementById('avatar-save-status').textContent ===
        'Đã lưu ảnh đại diện.' &&
      snapshot.data?.preferences?.avatar === 'sheep',
    'new animal saved',
  );

  const avatarSearch = document.getElementById('avatar-search');
  avatarSearch.value = 'Oriental Shorthair';
  avatarSearch.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(document.querySelectorAll('[data-avatar-preset]').length, 1);
  click('[data-avatar-preset="oriental-shorthair"]');
  await waitFor(
    () =>
      snapshot.data?.preferences?.avatar === 'oriental-shorthair' &&
      document.getElementById('avatar-save-status').textContent ===
        'Đã lưu ảnh đại diện.',
    'new breed saved',
  );
  assert.ok(document.querySelector('#profile-button svg'));
  click('[data-profile-close]');

  assert.equal(document.documentElement.dataset.theme, 'dark');
  assert.equal(
    document
      .querySelector('.theme-options [data-theme="dark"]')
      .getAttribute('aria-pressed'),
    'true',
  );
  click('.theme-options [data-theme="dark"]');
  assert.equal(window.localStorage.getItem('flashlab.theme'), 'dark');
  click('.theme-options [data-theme="light"]');
  assert.equal(document.documentElement.dataset.theme, 'light');
  click('.theme-options [data-theme="system"]');
  assert.equal(
    document
      .querySelector('.theme-options [data-theme="system"]')
      .getAttribute('aria-pressed'),
    'true',
  );
  assert.equal(
    document.documentElement.dataset.theme,
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light',
  );
  click('.theme-options [data-theme="light"]');
  assert.equal(document.querySelectorAll('[data-sound]').length, 10);
  assert.equal(document.documentElement.dataset.tileSize, 'medium');
  assert.equal(document.querySelector('#settings [data-tile-size]'), null);

  assert.equal(document.querySelectorAll('[data-sound-preview]').length, 10);
  assert.equal(document.querySelector('[data-action="sync-retry"]'), null);
  assert.equal(document.querySelector('[data-action="sync-server"]'), null);
  assert.ok(document.querySelector('#settings > summary svg'));
  click('#settings > summary');
  assert.equal(document.getElementById('settings').open, true);
  click('.sound-mixer > summary');
  assert.equal(document.querySelector('.sound-mixer').open, true);
  const masterVolume = document.getElementById('audio-master-volume');
  masterVolume.value = '50';
  masterVolume.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(audioClips[0].volume, 0.5);
  const correctVolume = document.getElementById('sound-correct-volume');
  correctVolume.value = '80';
  correctVolume.dispatchEvent(new window.Event('input', { bubbles: true }));
  click('[data-sound-preview="correct"]');
  assert.equal(audioClips.at(-1).volume, 0.4);
  click('[data-sound-preview="incorrect"]');
  assert.equal(audioClips.at(-1).volume, 0.3);
  const soundCount = audioClips.length;
  const musicPlays = audioClips[0].plays;
  click('[data-sound-preview="incorrect"]');
  assert.equal(
    audioClips.length,
    soundCount,
    'stop does not create another audio',
  );
  assert.equal(audioClips.at(-1).paused, true);
  assert.equal(audioClips[0].paused, true);
  assert.equal(
    audioClips[0].plays,
    musicPlays,
    'stop does not restart background music',
  );
  assert.equal(document.getElementById('settings').open, true);
  click('#audio-transport');
  await waitFor(() => !audioClips[0].paused, 'explicit music resume');
  click('[data-sound-preview="incorrect"]');

  document
    .querySelector('#audio-master-mute svg')
    .dispatchEvent(
      new window.MouseEvent('click', { bubbles: true, composed: true }),
    );
  assert.equal(document.getElementById('settings').open, true);
  assert.equal(audioClips[0].paused, true);
  assert.equal(audioClips.at(-1).paused, true);
  assert.equal(
    document.querySelectorAll('[data-sound-preview]:disabled').length,
    10,
  );
  click('#audio-master-mute');
  assert.equal(document.getElementById('sound-correct-volume').value, '80');
  click('[data-sound-mute="background"]');
  assert.equal(audioClips[0].paused, true);
  assert.equal(
    document.querySelector('[data-sound-preview="correct"]').disabled,
    false,
  );
  click('[data-sound-mute="background"]');
  masterVolume.value = '100';
  masterVolume.dispatchEvent(new window.Event('input', { bubbles: true }));
  correctVolume.value = '60';
  correctVolume.dispatchEvent(new window.Event('input', { bubbles: true }));
  await waitFor(
    () => snapshot.data?.preferences?.audio.sounds?.correct?.volume === 0.6,
    'sound mixer persisted',
  );
  assert.equal(snapshot.data.preferences.audio.masterVolume, 1);
  click('#audio-transport');
  const stoppedPlays = audioClips[0].plays;
  assert.equal(audioClips[0].paused, true);
  correctVolume.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(audioClips[0].plays, stoppedPlays);
  assert.equal(audioClips[0].paused, true);
  assert.equal(document.getElementById('settings').open, true);
  click('#audio-transport');
  await waitFor(() => !audioClips[0].paused, 'resume after transport stop');

  document.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  assert.equal(document.getElementById('settings').open, false);
  assert.equal(
    document.activeElement,
    document.querySelector('#settings > summary'),
  );
  assert.equal(document.querySelector('[data-action="backup"]'), null);
  assert.equal(document.querySelector('[data-action="import-backup"]'), null);
  assert.ok(document.querySelector('.activity-grid'));
  const yearPicker = document.getElementById('activity-year');
  assert.equal(yearPicker.value, String(new Date().getFullYear()));
  yearPicker.value = yearPicker.options[0].value;
  yearPicker.dispatchEvent(new window.Event('change', { bubbles: true }));
  const dayCell = document.querySelector('[data-activity-date]');
  dayCell.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }));
  assert.equal(document.getElementById('activity-tooltip').hidden, false);
  assert.ok(
    document
      .getElementById('activity-tooltip')
      .textContent.includes(dayCell.dataset.activityDate),
  );
  dayCell.dispatchEvent(new window.MouseEvent('mouseout', { bubbles: true }));
  assert.equal(document.getElementById('activity-tooltip').hidden, true);
  assert.equal(document.getElementById('sidebar-toggle'), null);
  assert.equal(document.getElementById('sidebar-resizer'), null);
  assert.ok(document.querySelectorAll('.recent-deck').length <= 5);

  assert.ok(
    document.querySelectorAll('.activity-grid .activity-day').length >= 365,
  );
  click('[data-language="en"]');
  assert.equal(document.documentElement.lang, 'en');
  assert.equal(
    document.querySelector('#nav-library').textContent.trim(),
    'Study sets',
  );
  assert.equal(
    document.querySelector('.welcome h1').textContent.trim(),
    'Learn better every day ✦',
  );
  assert.equal(document.querySelector('[data-nav="stats"]'), null);
  assert.ok(document.querySelector('#history-heading'));
  assert.equal(document.querySelectorAll('.stats-grid').length, 1);
  assert.equal(document.querySelectorAll('.activity-panel').length, 1);
  assert.equal(document.querySelectorAll('.activity-months span').length, 12);
  window.location.hash = '#/stats';
  await waitFor(
    () => window.location.hash === '#/' && document.querySelector('.welcome'),
    'legacy statistics route opens overview',
  );
  assert.equal(
    document.querySelector('#history-heading').textContent,
    'Recent sessions',
  );
  click('[data-language="vi"]');
  assert.equal(
    document.querySelector('#history-heading').textContent,
    'Phiên học gần đây',
  );
  click('[data-nav="home"]');
  await waitFor(
    () => document.querySelector('.welcome'),
    'Vietnamese overview',
  );

  click('[data-action="create-deck"]');
  assert.equal(document.getElementById('modal-form').noValidate, true);
  submit('#modal-form');
  assert.equal(
    document.getElementById('deck-title').getAttribute('aria-invalid'),
    'true',
  );
  assert.ok(
    document
      .querySelector('.field-error')
      .textContent.includes('Vui lòng nhập'),
  );
  assert.equal(document.activeElement.id, 'deck-title');
  document.getElementById('deck-title').value = 'Smoke deck';
  document
    .getElementById('deck-title')
    .dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(
    document.getElementById('deck-title').hasAttribute('aria-invalid'),
    false,
  );
  const colorHex = document.getElementById('deck-color-hex');
  assert.equal(document.querySelectorAll('.color-option > span').length, 5);
  assert.ok(
    document.querySelector('.color-option > span').style.backgroundColor,
  );
  assert.equal(document.querySelector('.color-custom').open, false);
  click('[data-color="#61c6a1"]');
  assert.equal(colorHex.value, '#61c6a1');
  assert.equal(
    document.querySelector('.color-custom').open,
    false,
    'preset selection keeps custom controls collapsed',
  );
  click('.color-custom > summary');
  assert.equal(document.querySelector('.color-custom').open, true);
  colorHex.value = '#oops';
  colorHex.dispatchEvent(new window.Event('input', { bubbles: true }));
  document.querySelector('.color-custom').open = false;
  submit('#modal-form');
  assert.equal(
    document.querySelector('.color-custom').open,
    true,
    'invalid custom color opens its controls',
  );
  assert.equal(colorHex.getAttribute('aria-invalid'), 'true');
  assert.ok(document.getElementById('modal-form'));
  const hue = document.getElementById('color-hue');
  hue.value = '240';
  hue.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.match(colorHex.value, /^#[0-9a-f]{6}$/);
  colorHex.value = '#123ABC';
  colorHex.dispatchEvent(new window.Event('input', { bubbles: true }));
  submit('#modal-form');
  await waitFor(
    () => document.querySelector('[data-action="add-card"]'),
    'new deck',
  );
  click('[data-action="add-card"]');
  submit('#modal-form');
  assert.equal(
    document.querySelectorAll('#modal-form [aria-invalid="true"]').length,
    2,
  );
  document.getElementById('card-front').value = 'TypeScript';
  document.getElementById('card-back').value = 'Typed JavaScript';
  document.getElementById('card-pronunciation').value = '/taɪp/';
  document.getElementById('card-notes').value = 'Example note';
  const part = document.getElementById('card-part');
  part.value = 'Noun';
  click('[data-language="en"]');
  assert.equal(
    document.getElementById('modal-title').textContent,
    'Add flashcard',
  );
  assert.equal(part.selectedOptions[0].textContent, 'Noun (n.)');
  assert.equal(
    part.querySelector('optgroup').label,
    '8 traditional parts of speech',
  );
  assert.equal(
    document.querySelector('label[for="card-part"]').textContent,
    'Part of speech Optional',
  );
  assert.equal(
    document.querySelector('.card-image-picker strong').textContent,
    'Choose an image',
  );
  assert.equal(
    document.querySelector('#card-speech-language option[value="en-US"]')
      .textContent,
    'English (US)',
  );
  assert.equal(
    document.getElementById('card-front').placeholder,
    'Word or question',
  );
  assert.equal(document.getElementById('card-front').value, 'TypeScript');
  click('[data-language="vi"]');
  assert.equal(part.selectedOptions[0].textContent, 'Danh từ (n.)');
  assert.equal(part.querySelector('optgroup').label, '8 từ loại truyền thống');
  assert.equal(
    document.querySelector('.card-image-picker strong').textContent,
    'Chọn ảnh minh họa',
  );
  assert.equal(part.value, 'Noun');
  assert.equal(document.getElementById('card-notes').value, 'Example note');

  const language = document.getElementById('card-speech-language');
  for (const code of ['zh-CN', 'ja-JP', 'ko-KR']) {
    language.value = code;
    language.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(document.getElementById('card-ipa').hidden, false);
    assert.ok(document.querySelectorAll('#card-ipa [data-ipa]').length > 10);
    assert.ok(document.getElementById('card-pronunciation').placeholder);
  }
  language.value = 'zh-CN';
  language.dispatchEvent(new window.Event('change', { bubbles: true }));
  const pinyin = document.getElementById('card-pronunciation');
  pinyin.value = 'n hǎo';
  pinyin.setSelectionRange(1, 1);
  click('[data-ipa="ǐ"]');
  assert.equal(pinyin.value, 'nǐ hǎo');
  pinyin.value = '/taɪp/';
  language.value = 'en-US';
  language.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(document.getElementById('card-ipa').hidden, false);
  const ipa = document.getElementById('card-pronunciation');
  ipa.setSelectionRange(1, 1);
  click('[data-ipa="ə"]');
  assert.equal(ipa.value, '/ətaɪp/');
  submit('#modal-form');
  assert.ok(
    document.getElementById('card-results').textContent.includes('TypeScript'),
  );
  const listSpeaker = document.querySelector('.card-list-row [data-speak]');
  assert.equal(listSpeaker.dataset.speak, 'TypeScript');
  assert.ok(listSpeaker.closest('.card-actions'));
  assert.ok(listSpeaker.nextElementSibling.hasAttribute('data-star'));
  listSpeaker.click();
  assert.deepEqual(spoken.at(-1), {
    text: 'TypeScript',
    lang: 'en-US',
    rate: 0.75,
  });
  const speechRate = document.getElementById('speech-rate');
  assert.equal(speechRate.value, '0.75');
  speechRate.value = '0.6';
  speechRate.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(document.getElementById('speech-rate-value').value, '0.60×');
  click('.speech-settings [data-speak]');
  assert.equal(spoken.at(-1).rate, 0.6);
  listSpeaker.click();
  assert.equal(spoken.at(-1).rate, 0.6);
  await waitFor(
    () => snapshot.data.preferences.speechRate === 0.6,
    'speech rate saved to current profile',
  );
  assert.equal(document.querySelectorAll('.card-list-row').length, 1);
  click('[data-action="add-card"]');
  document.getElementById('card-front').value = '  TYPESCRIPT  ';
  document.getElementById('card-back').value = 'Another definition';
  submit('#modal-form');
  await waitFor(
    () => document.querySelector('.import-review-modal'),
    'manual duplicate comparison',
  );
  assert.ok(
    document.querySelector('[data-import-action] option[value="merge"]'),
  );
  click('[data-import-cancel]');
  await waitFor(
    () => !document.querySelector('.import-review-modal'),
    'manual duplicate cancel keeps draft',
  );
  assert.equal(document.getElementById('card-front').value, '  TYPESCRIPT  ');
  assert.equal(document.querySelectorAll('.card-list-row').length, 1);
  document.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  click('[data-delete-card]');
  assert.ok(document.querySelector('[role="alertdialog"]'));
  assert.equal(document.activeElement.dataset.confirm, 'cancel');
  document.querySelector('[data-confirm="accept"]').focus();
  document.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.ok(document.activeElement.classList.contains('confirmation-close'));
  document.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(document.activeElement.dataset.confirm, 'accept');
  document.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  assert.equal(document.querySelector('[role="alertdialog"]'), null);
  assert.equal(document.querySelectorAll('.card-list-row').length, 1);
  for (const mode of [
    'flashcards',
    'learn',
    'write',
    'test',
    'match',
    'review',
  ]) {
    await startStudy(mode);
    if (mode === 'flashcards') {
      assert.ok(audioClips[0].src.endsWith('/background.wav'));
      assert.equal(
        audioClips[0].paused,
        false,
        'music starts during the start-study click',
      );
      assert.equal(audioClips[0].volume, 1);
    }

    await waitFor(() => document.querySelector('.study-area'), `${mode} page`);
    assert.match(
      document.querySelector('[data-study-time]').textContent,
      /^\d+:\d{2}$/,
    );
    const masteryBadge = document.querySelector(
      '.study-area [data-card-level]',
    );
    if (
      mode !== 'match' &&
      mode !== 'test' &&
      (mode !== 'review' || document.querySelector('.flip-card'))
    ) {
      assert.ok(masteryBadge, `${mode} shows each term's memory level`);
      assert.match(masteryBadge.textContent, /[0-6]\/6/);
      click('.study-area [data-mastery-info]');
      assert.ok(
        document.querySelector('.mastery-popover'),
        'mastery info overlays the page',
      );
      assert.equal(
        document
          .querySelector('.study-area [data-mastery-info]')
          .getAttribute('aria-expanded'),
        'true',
      );
      document.body.click();
      assert.equal(
        document.querySelector('.mastery-popover'),
        null,
        'outside click dismisses mastery info',
      );
      const masteryDetails = masteryBadge.closest('.mastery-details');
      assert.ok(masteryDetails, `${mode} provides expandable mastery details`);
      if (Number(masteryBadge.dataset.cardLevel) < 6) {
        assert.equal(
          masteryDetails.querySelectorAll('.mastery-breakdown li').length,
          5,
        );
        assert.match(
          masteryDetails.querySelector('.mastery-breakdown').textContent,
          /Tiến độ lên cấp|Progress toward level/,
        );
      }
    }
    if (mode === 'test') {
      assert.equal(masteryBadge, null, 'test questions omit mastery badges');
      assert.equal(
        document.querySelector('.study-area [data-mastery-info]'),
        null,
      );
    }
    if (mode === 'flashcards') {
      assert.equal(
        document.querySelector(
          '.flip-face:not(.flip-back) [data-part-of-speech]',
        ),
        null,
      );
      assert.ok(document.querySelector('.flip-back [data-part-of-speech]'));
      const front = document.querySelector(
        '.flip-face .flip-answer',
      ).textContent;
      await waitFor(
        () =>
          snapshot.data.decks
            .flatMap((deck) => deck.cards)
            .some((card) => card.front === front),
        'displayed flashcard saved before checking its level',
      );
      const storedCard = snapshot.data.decks
        .flatMap((deck) => deck.cards)
        .find((card) => card.front === front);
      assert.equal(Number(masteryBadge.dataset.cardLevel), storedCard.level);
      assert.equal(
        document
          .querySelector('.flash-card-tools')
          .firstElementChild.classList.contains('memory-toggle'),
        true,
      );
      assert.equal(
        document.querySelector('.flash-card-tools [data-speak]'),
        null,
      );
      assert.ok(document.querySelector('.answer-controls [data-speak]'));
      assert.equal(
        document.querySelector('.answer-controls [data-speak]')
          .nextElementSibling.dataset.outcome,
        'false',
      );
      const beforeSpeech = document.querySelector('.flip-card').className;
      click('.answer-controls [data-speak]');
      assert.equal(
        document.querySelector('.flip-card').className,
        beforeSpeech,
      );
      assert.equal(
        spoken.at(-1).text,
        document.querySelector('.flip-face .flip-answer').textContent,
      );
      const speechCount = spoken.length;
      document.querySelector('.flash-speak').focus();
      document.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: '3',
          bubbles: true,
          cancelable: true,
        }),
      );
      assert.equal(spoken.length, speechCount + 1);
      assert.equal(
        document.querySelector('.flip-card').className,
        beforeSpeech,
      );
      assert.match(
        document.querySelector('.keyboard-hint').textContent,
        /3.*Nghe/,
      );
      document.dispatchEvent(
        new window.KeyboardEvent('keydown', {
          key: '3',
          ctrlKey: true,
          bubbles: true,
        }),
      );
      assert.equal(spoken.length, speechCount + 1);
      document.querySelector('.flash-speak').blur();
      click('[data-action="flip"]');
      assert.ok(document.querySelector('.flip-card.flipped'));
      assert.equal(document.querySelector('[data-remembered]').checked, false);
      click('[data-study-star]');
      assert.equal(
        document
          .querySelector('[data-study-star]')
          .getAttribute('aria-pressed'),
        'true',
      );
      click('[data-study-edit]');
      const editingCardId = document.getElementById('card-id').value;
      const editingDeckId = document.getElementById('card-deck-id').value;
      document.getElementById('card-notes').value = 'Edited during flashcards';
      submit('#modal-form');
      assert.ok(
        document.querySelector('.flip-card.flipped'),
        'editing keeps the flipped face',
      );
      assert.equal(
        document
          .querySelector('[data-study-star]')
          .getAttribute('aria-pressed'),
        'true',
      );
      assert.match(
        document.querySelector('.flash-notes').textContent,
        /Edited during flashcards/,
      );
      await waitFor(
        () =>
          snapshot.data.decks
            .find((deck) => deck.id === editingDeckId)
            ?.cards.find((card) => card.id === editingCardId)?.notes ===
          'Edited during flashcards',
        'flashcard edits saved',
      );
      const remembered = document.querySelector('[data-remembered]');
      remembered.checked = true;
      remembered.dispatchEvent(new window.Event('change', { bubbles: true }));
      click('[data-action="next"]');
      assert.equal(document.querySelector('.result-score').textContent, '100%');
      assert.match(
        document.querySelector('.result-time').textContent,
        /\d+:\d{2}/,
      );
      assert.ok(
        snapshot.data.sessions.every((session) => session.durationSeconds >= 0),
      );
      assert.match(
        document.querySelector('.result-banner').textContent,
        /1 từ đã nhớ.*0 từ chưa nhớ/,
      );
      assert.ok(
        document.querySelector('.study-top [data-action="study-exit"]'),
      );
      click('[data-action="retry-study"]');
      assert.ok(document.querySelector('#modal-root #study-setup-form'));
      assert.ok(document.querySelector('#content .result-banner'));
      document.dispatchEvent(
        new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );
      assert.equal(document.querySelector('#study-setup-form'), null);
      assert.ok(document.querySelector('#content .result-banner'));
      assert.equal(document.querySelector('.app-shell').inert, false);
    }
    if (mode === 'match') {
      assert.equal(document.querySelectorAll('[data-tile]').length, 2);
      assert.equal(
        document.querySelector('.match-grid [data-card-level]'),
        null,
      );
      assert.equal(
        document.querySelector('.match-grid [data-mastery-info]'),
        null,
      );
    }
    await exitStudy();
    await waitFor(
      () => document.querySelector('[data-mode="flashcards"]'),
      'deck after study exit',
    );
  }
  await startStudy('write');
  await waitFor(() => document.getElementById('write-input'), 'write answer');
  submit('#write-form');
  assert.equal(
    document.getElementById('write-input').getAttribute('aria-invalid'),
    'true',
  );
  document.getElementById('write-input').value = 'Typed JavaScript';
  submit('#write-form');
  assert.ok(
    document.querySelector('.feedback').textContent.includes('Chính xác'),
  );
  click('[data-action="question-next"]');
  assert.ok(document.querySelector('.result-banner'));
  assert.ok(document.querySelector('.completion-confetti canvas'));
  await waitFor(
    () =>
      snapshot.data?.decks.find((deck) => deck.title === 'Smoke deck')?.cards[0]
        ?.correct === 2,
    'API save',
  );
  assert.equal(
    snapshot.data.decks.find((deck) => deck.title === 'Smoke deck').cards[0]
      .level,
    0,
  );
  assert.equal(
    snapshot.data.decks.find((deck) => deck.title === 'Smoke deck').color,
    '#123abc',
  );
  let exportedBlob;
  window.URL.createObjectURL = (blob) => {
    exportedBlob = blob;
    return 'blob:flashlab-test';
  };
  window.URL.revokeObjectURL = () => {};
  const nativeAnchorClick = window.HTMLAnchorElement.prototype.click;
  window.HTMLAnchorElement.prototype.click = function () {
    if (!this.hasAttribute('download')) nativeAnchorClick.call(this);
  };
  click('[data-nav="library"]');
  await waitFor(
    () => document.querySelector('[data-deck]'),
    'library after study',
  );
  click(
    '[data-deck="' +
      snapshot.data.decks.find((deck) => deck.title === 'Smoke deck').id +
      '"]',
  );
  await waitFor(
    () => document.querySelector('[data-delete-card]'),
    'restored deck',
  );
  click('[data-delete-card]');
  click('[data-confirm="accept"]');
  await waitFor(
    () => !document.querySelector('.card-list-row'),
    'confirmed delete',
  );
  await waitFor(
    () =>
      snapshot.data.decks.find((deck) => deck.title === 'Smoke deck').cards
        .length === 0,
    'deleted card persisted',
  );
  const csvPicker = document.getElementById('csv-file');
  Object.defineProperty(csvPicker, 'files', {
    configurable: true,
    value: [
      new window.File(['front,back\nCSV term,CSV answer'], 'cards.csv', {
        type: 'text/csv',
      }),
    ],
  });
  csvPicker.dispatchEvent(new window.Event('change', { bubbles: true }));
  await waitFor(() => document.querySelector('.card-list-row'), 'CSV imported');
  csvPicker.dispatchEvent(new window.Event('change', { bubbles: true }));
  await waitFor(
    () => document.querySelector('.import-review-modal'),
    'duplicate CSV comparison',
  );
  assert.match(
    document.querySelector('.import-comparison').textContent,
    /CSV term/,
  );
  click('[data-import-confirm]');
  await waitFor(
    () => !document.querySelector('.import-review-modal'),
    'skip duplicate CSV',
  );
  await waitFor(
    () =>
      [...document.querySelectorAll('.toast')].some((node) =>
        /Bỏ qua 1|Skipped 1/.test(node.textContent),
      ),
    'duplicate skip committed',
  );
  assert.equal(document.querySelector('[role="alertdialog"]'), null);
  assert.equal(document.querySelectorAll('.card-list-row').length, 1);

  document.dispatchEvent(new window.Event('pointerdown', { bubbles: true }));
  click('[data-action="add-card"]');
  document.getElementById('card-front').value = 'Second term';
  document.getElementById('card-back').value = 'Second answer';
  submit('#modal-form');

  click('[data-nav="review"]');
  await waitFor(() => document.querySelector('.due-card-row'), 'due card list');
  assert.ok(document.querySelectorAll('.due-card-row').length <= 5);
  while (
    !Array.from(document.querySelectorAll('.due-card-row strong')).some(
      (node) => node.textContent === 'CSV term',
    )
  ) {
    const currentPage = Number(
      document.querySelector('.due-cards [data-due-page][aria-current="page"]')
        ?.dataset.duePage || 1,
    );
    const next = document.querySelector(
      `.due-cards [data-due-page="${currentPage + 1}"]`,
    );
    assert.ok(next && !next.disabled, 'due card is listed on a page');
    next.click();
  }
  const dueRow = Array.from(document.querySelectorAll('.due-card-row')).find(
    (row) => row.querySelector('strong').textContent === 'CSV term',
  );
  assert.equal(
    dueRow.querySelector('.due-card-content > p').textContent,
    'CSV answer',
  );
  assert.match(
    dueRow.querySelector('.due-card-source').textContent,
    /Smoke deck/,
  );
  dueRow.querySelector('[data-deck]').click();
  await waitFor(
    () => document.querySelector('[data-mode="flashcards"]'),
    'set from due card',
  );
  await startStudy('flashcards');
  await waitFor(
    () => document.querySelector('.flip-card'),
    'flash transitions',
  );
  click('[data-action="next"]');
  assert.ok(document.querySelector('.card-enter-next'));
  click('[data-action="prev"]');
  assert.ok(document.querySelector('.card-enter-prev'));
  click('[data-action="flip"]');
  assert.ok(
    audioClips.some((clip) => clip.src.endsWith('/flip.wav') && clip.plays),
  );
  assert.ok(
    audioClips.some((clip) => clip.src.endsWith('/swipe.wav') && clip.plays),
  );
  assert.ok(
    audioClips.some(
      (clip) =>
        clip.src.endsWith('/background.wav') && clip.loop && !clip.paused,
    ),
  );
  let memory = document.querySelector('[data-remembered]');
  memory.checked = true;
  memory.dispatchEvent(new window.Event('change', { bubbles: true }));
  memory = document.querySelector('[data-remembered]');
  memory.checked = false;
  memory.dispatchEvent(new window.Event('change', { bubbles: true }));
  click('[data-action="next"]');
  click('[data-action="next"]');
  assert.equal(document.querySelector('.result-score').textContent, '0%');
  assert.match(
    document.querySelector('.result-banner').textContent,
    /0 từ đã nhớ.*2 từ chưa nhớ/,
  );
  await exitStudy();
  await waitFor(
    () => document.querySelector('[data-mode="match"]'),
    'deck for match score',
  );
  await startStudy('match');
  await waitFor(
    () => document.querySelector('[data-tile="a0"]'),
    'match score',
  );
  click('[data-tile="a0"]');
  click('[data-tile="b1"]');
  await waitFor(
    () => !document.querySelector('[data-tile="a0"]').disabled,
    'wrong match clears',
  );
  assert.match(
    document.querySelector('.match-toolbar').textContent,
    /0\/1 lượt/,
  );
  click('[data-tile="a0"]');
  click('[data-tile="b0"]');
  click('[data-tile="a1"]');
  click('[data-tile="b1"]');
  assert.equal(document.querySelector('.result-score').textContent, '67%');
  assert.equal(document.querySelector('.completion-confetti'), null);
  assert.ok(
    audioClips.some(
      (clip) => clip.src.endsWith('/incorrect.mp3') && clip.plays,
    ),
  );
  assert.ok(
    audioClips.some((clip) => clip.src.endsWith('/correct.mp3') && clip.plays),
  );
  assert.ok(
    audioClips.some(
      (clip) => clip.src.endsWith('/keep-trying.mp3') && clip.plays,
    ),
  );
  await exitStudy();
  await waitFor(
    () => document.querySelector('[data-mode="test"]'),
    'deck for test countdown',
  );
  click('[data-action="add-card"]');
  document.getElementById('card-front').value = 'Third term';
  document.getElementById('card-back').value = 'Third answer';
  submit('#modal-form');
  await startStudy('test');
  await waitFor(() => document.querySelector('#test-form'), 'test countdown');
  assert.ok(audioClips[0].src.endsWith('/test-background.wav'));
  assert.equal(audioClips[0].paused, false);

  assert.equal(document.querySelectorAll('[data-test-jump]').length, 3);
  assert.equal(document.querySelector('#auto-next'), null);
  click('[data-action="test-submit"]');
  assert.equal(document.getElementById('test-submit-error').hidden, false);
  assert.match(
    document.getElementById('test-submit-error').textContent,
    /1, 2, 3/,
  );
  assert.equal(document.querySelector('.result-score'), null);
  click('[data-language="en"]');
  assert.match(
    document.getElementById('test-submit-error').textContent,
    /Cannot submit yet/,
  );
  click('[data-language="vi"]');

  click('[data-test-confirm="0"]');
  assert.equal(
    document
      .querySelector('[data-test-confirm="0"]')
      .getAttribute('aria-pressed'),
    'false',
  );
  const answers = {
    'CSV term': 'CSV answer',
    'Second term': 'Second answer',
    'Third term': 'Third answer',
  };
  assert.equal(
    document.querySelectorAll('.test-all-questions .test-question').length,
    3,
  );
  for (const panel of document.querySelectorAll(
    '.test-all-questions .test-question',
  )) {
    const answer =
      answers[panel.querySelector('.test-question-title').textContent];
    const written = panel.querySelector('.test-input');
    if (written) {
      written.value = answer;
      written.dispatchEvent(new window.Event('input', { bubbles: true }));
    } else {
      const radio = Array.from(panel.querySelectorAll('.test-option'))
        .find((node) => node.textContent === answer)
        .querySelector('input');
      radio.checked = true;
      radio.dispatchEvent(new window.Event('input', { bubbles: true }));
    }
    panel.querySelector('[data-test-confirm]').click();
  }
  click('[data-test-confirm="0"]');
  assert.equal(document.querySelectorAll('.test-jump.answered').length, 2);
  click('[data-action="test-submit"]');
  assert.match(
    document.getElementById('test-submit-error').textContent,
    /câu: 1\./,
  );
  click('[data-test-confirm="0"]');
  const edited = document.querySelector('#test-question-1 input');
  const originalAnswer = edited.value;
  edited.value = originalAnswer + ' edited';
  edited.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(
    document
      .querySelector('[data-test-confirm="1"]')
      .getAttribute('aria-pressed'),
    'false',
  );
  edited.value = originalAnswer;
  edited.dispatchEvent(new window.Event('input', { bubbles: true }));
  click('[data-test-confirm="1"]');
  assert.equal(document.querySelectorAll('.test-jump.answered').length, 3);
  const testHash = window.location.hash;
  const draftAnswer = document.querySelector('#test-question-1 input').value;
  click('[data-action="study-exit"]');
  await waitFor(
    () => document.querySelector('[data-confirm="cancel"]'),
    'test exit confirmation',
  );
  assert.equal(window.location.hash, testHash);
  click('[data-confirm="cancel"]');
  assert.equal(
    document.querySelector('#test-question-1 input').value,
    draftAnswer,
  );
  assert.equal(document.querySelectorAll('.test-jump.answered').length, 3);
  const unload = new window.Event('beforeunload', { cancelable: true });
  window.dispatchEvent(unload);
  assert.equal(unload.defaultPrevented, true);
  click('[data-blog-open]');
  await waitFor(
    () => document.querySelector('[data-confirm="cancel"]'),
    'blog exit confirmation',
  );
  click('[data-confirm="cancel"]');
  assert.ok(document.querySelector('#test-form'));
  assert.equal(document.querySelector('[data-blog-new]'), null);
  window.location.hash = '#/library';
  await waitFor(
    () => document.querySelector('[data-confirm="cancel"]'),
    'direct route exit confirmation',
  );
  document.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
  );
  assert.equal(window.location.hash, testHash);
  assert.ok(document.querySelector('#test-form'));

  click('[data-test-jump="0"]');
  assert.ok(document.querySelector('input[type="radio"]:checked'));
  click('[data-action="test-submit"]');
  assert.equal(document.querySelector('.result-score').textContent, '100%');
  assert.ok(document.querySelector('.completion-confetti canvas'));
  assert.equal(document.querySelector('details.result-review').open, false);
  assert.ok(
    audioClips.some(
      (clip) => clip.src.endsWith('/completed.mp3') && clip.plays,
    ),
  );
  assert.ok(audioClips[0].src.endsWith('/background.wav'));
  assert.equal(audioClips[0].paused, false);
  await exitStudy();
  await waitFor(
    () => document.querySelector('[data-mode="learn"]'),
    'deck for learn countdown',
  );

  for (const type of ['mc', 'write']) {
    await startStudy('test', { count: 2, order: 'ordered', type });
    await waitFor(() => document.getElementById('test-form'), `${type} test`);
    assert.equal(document.querySelectorAll('[data-test-jump]').length, 2);
    assert.equal(
      document.querySelector('.test-question-title').textContent,
      'CSV term',
    );
    assert.equal(!!document.querySelector('.test-input'), type === 'write');
    click('[data-test-jump="1"]');
    assert.equal(!!document.querySelector('.test-input'), type === 'write');
    completeTest();
    click('[data-action="test-submit"]');
    await exitStudy();
    await waitFor(
      () => document.querySelector('[data-mode="test"]'),
      'deck after single type test',
    );
  }
  await startStudy('write', { count: 2, order: 'ordered' });
  const firstWriteTerm = document.querySelector('.question-text').textContent;
  const draft = document.getElementById('write-input');
  draft.value = 'Draft one';
  draft.dispatchEvent(new window.Event('input', { bubbles: true }));
  draft.dispatchEvent(
    new window.KeyboardEvent('keydown', {
      key: '2',
      altKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  const secondWriteTerm = document.querySelector('.question-text').textContent;
  assert.notEqual(secondWriteTerm, firstWriteTerm);
  document.getElementById('write-input').value = 'Draft two';
  document
    .getElementById('write-input')
    .dispatchEvent(new window.Event('input', { bubbles: true }));
  document.getElementById('write-input').dispatchEvent(
    new window.KeyboardEvent('keydown', {
      key: '1',
      altKey: true,
      bubbles: true,
      cancelable: true,
    }),
  );
  assert.equal(document.getElementById('write-input').value, 'Draft one');
  document.getElementById('write-input').value =
    snapshot.data.decks[0].cards.find(
      (card) => card.front === firstWriteTerm,
    ).back;
  submit('#write-form');
  assert.ok(document.querySelector('.feedback:not(.bad)'));
  click('[data-action="write-next"]');
  assert.equal(document.getElementById('write-input').value, 'Draft two');
  document.getElementById('write-input').value =
    snapshot.data.decks[0].cards.find(
      (card) => card.front === secondWriteTerm,
    ).back;
  submit('#write-form');
  click('[data-action="write-prev"]');
  assert.equal(document.getElementById('write-input').disabled, true);
  assert.ok(document.querySelector('.feedback:not(.bad)'));
  click('[data-action="write-next"]');
  click('[data-action="question-next"]');
  await waitFor(
    () => document.querySelector('.result-score'),
    'write navigation completion',
  );
  assert.equal(document.querySelector('.result-score').textContent, '100%');
  await exitStudy();
  for (const type of ['write', 'mc']) {
    await startStudy('test', {
      count: 1,
      order: 'ordered',
      type,
      multipleWrite: true,
      multipleChoice: true,
    });
    const panel = document.querySelector('.test-question');
    assert.equal(document.querySelectorAll('.test-question').length, 1);
    const front = panel.querySelector('.test-question-title').textContent;
    const card = snapshot.data.decks[0].cards.find(
      (card) => card.front === front,
    );
    const meanings = [
      card.back,
      ...(card.definitions ?? []).map((sense) =>
        typeof sense === 'string' ? sense : sense.meaning,
      ),
    ];
    if (type === 'write') {
      assert.ok(panel.querySelector('[data-test-add-answer]'));
      panel.querySelector('[data-test-add-answer]').click();
      assert.equal(panel.querySelectorAll('.test-input').length, 2);
      panel.querySelector('[data-test-remove-answer]').click();
      const field = panel.querySelector('.test-input');
      field.value = card.back;
      field.dispatchEvent(new window.Event('input', { bubbles: true }));
    } else {
      assert.ok(panel.querySelector('input[type="checkbox"]'));
      assert.equal(panel.querySelector('input[type="radio"]'), null);
      for (const option of panel.querySelectorAll('.test-option'))
        if (meanings.includes(option.querySelector('span').textContent)) {
          const field = option.querySelector('input');
          field.checked = true;
          field.dispatchEvent(new window.Event('input', { bubbles: true }));
        }
    }
    panel.querySelector('[data-test-confirm]').click();
    click('[data-action="test-submit"]');
    await waitFor(
      () => document.querySelector('.result-score'),
      'one-question multiple-answer test result',
    );
    assert.equal(document.querySelector('.result-score').textContent, '100%');
    await exitStudy();
  }
  await startStudy('match', { count: 1 });
  await waitFor(
    () => document.querySelector('[data-tile]'),
    'match pair count',
  );
  assert.equal(document.querySelectorAll('[data-tile]').length, 2);
  click('[data-tile="a0"]');
  click('[data-tile="b0"]');
  assert.equal(document.querySelector('.result-score').textContent, '100%');
  await exitStudy();
  await waitFor(
    () => document.querySelector('[data-mode="learn"]'),
    'deck after one pair match',
  );
  await startStudy('learn');
  await waitFor(
    () => document.querySelector('[data-choice]'),
    'learn countdown',
  );
  const learnedTerm = document.querySelector('.question-text').textContent;
  click('[data-choice="0"]');
  assert.equal(
    document.getElementById('auto-next').getAttribute('role'),
    'progressbar',
  );
  assert.ok(document.querySelector('.auto-next-fill'));
  assert.equal(document.getElementById('auto-next').textContent, '');
  await waitFor(
    () => document.querySelector('.question-text')?.textContent !== learnedTerm,
    'automatic next learn question',
  );
  await exitStudy();
  await waitFor(
    () => document.querySelector('[data-action="delete-deck"]'),
    'deck after countdowns',
  );

  Object.defineProperty(csvPicker, 'files', {
    configurable: true,
    value: [
      new window.File(
        [
          'front,back\n' +
            Array.from(
              { length: 23 },
              (_, i) => `Page term ${i},Page answer ${i}`,
            ).join('\n'),
        ],
        'pages.csv',
      ),
    ],
  });
  csvPicker.dispatchEvent(new window.Event('change', { bubbles: true }));
  await waitFor(
    () => document.querySelectorAll('.card-list-row').length === 5,
    'first card page',
  );
  click('[data-card-page="2"]');
  assert.equal(document.querySelectorAll('.card-list-row').length, 5);
  assert.equal(document.querySelector('.card-num').textContent, '06');
  for (let page = 3; page <= 6; page++) click(`[data-card-page="${page}"]`);
  assert.equal(document.querySelectorAll('.card-list-row').length, 1);
  assert.equal(document.querySelector('.card-num').textContent, '26');
  const search = document.getElementById('card-search');
  search.value = 'Page term 22';
  search.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(document.querySelectorAll('.card-list-row').length, 1);

  assert.equal(document.querySelector('.card-num').textContent, '01');
  await startStudy('test', { count: 16, order: 'ordered', type: 'mixed' });
  await waitFor(
    () => document.querySelector('.test-layout'),
    'sixteen-question test',
  );
  assert.equal(
    document.querySelectorAll('.test-question-grid button').length,
    16,
  );
  assert.equal(
    document.querySelector('[data-list-scope="test-questions"]'),
    null,
  );
  click('[data-test-jump="15"]');
  assert.equal(
    document.querySelectorAll('.test-all-questions .test-question').length,
    16,
  );
  click('[data-language="en"]');
  assert.equal(
    document.querySelector('.test-sidebar h2').textContent,
    'Questions',
  );
  assert.equal(
    document.querySelector('#test-question-15 .test-question-title')
      .textContent,
    'Page term 12',
  );
  assert.equal(
    document.querySelector('[data-action="test-submit"]').textContent,
    'Submit test',
  );
  click('[data-language="vi"]');
  assert.equal(
    document.querySelector('.test-sidebar h2').textContent,
    'Danh sách câu hỏi',
  );
  completeTest();
  click('[data-action="test-submit"]');
  assert.equal(
    document.querySelectorAll('.result-review .review-row').length,
    5,
  );
  click('[data-list-scope="test-results"][data-list-page="2"]');
  assert.equal(
    document.querySelectorAll('.result-review .review-row').length,
    5,
  );
  assert.equal(document.querySelector('.result-review').open, true);
  assert.match(
    document.querySelector('.result-review .review-row strong').textContent,
    /^6\./,
  );
  await waitFor(
    () =>
      snapshot.data.sessions.some((session) => session.results?.length === 16),
    'answer details persisted',
  );
  await exitStudy();
  await waitFor(
    () => document.querySelector('[data-action="delete-deck"]'),
    'deck after sixteen questions',
  );

  click('[data-nav="classes"]');
  await waitFor(
    () => document.querySelector('[data-action="create-class"]'),
    'classes page',
  );
  click('[data-action="create-class"]');
  document.getElementById('class-name').value = 'Lớp thử';
  assert.equal(document.querySelector('.color-custom').open, false);
  click('.color-custom > summary');
  const classColor = document.getElementById('deck-color-hex');
  classColor.value = '#13579b';
  classColor.dispatchEvent(new window.Event('input', { bubbles: true }));

  const classSetSelector = `[data-class-deck][value="${snapshot.data.decks.find((deck) => deck.title === 'Smoke deck').id}"]`;
  document.querySelector(classSetSelector).checked = true;
  const classSearch = document.getElementById('class-set-search');
  classSearch.value = 'no such set';
  classSearch.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(
    document.querySelector(classSetSelector).closest('[data-class-search]')
      .hidden,
    true,
  );
  assert.equal(document.querySelector(classSetSelector).checked, true);
  assert.equal(document.getElementById('class-search-empty').hidden, false);
  classSearch.value = 'Smoke';
  classSearch.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(
    document.querySelector(classSetSelector).closest('[data-class-search]')
      .hidden,
    false,
  );
  assert.equal(document.querySelector(classSetSelector).checked, true);
  submit('#modal-form');
  await waitFor(
    () => document.querySelector('[data-action="edit-class"]'),
    'class detail',
  );
  assert.ok(document.querySelector('[data-deck]'));
  await waitFor(() => snapshot.data.classes?.length === 1, 'class persisted');
  assert.equal(snapshot.data.classes[0].deckIds.length, 1);
  assert.equal(snapshot.data.classes[0].color, '#13579b');
  click('[data-action="edit-class"]');
  assert.equal(document.getElementById('deck-color-hex').value, '#13579b');
  document.querySelector(classSetSelector).checked = false;
  submit('#modal-form');
  await waitFor(
    () =>
      document.querySelector('[data-action="edit-class"]') &&
      !document.querySelector('#modal-form'),
    'membership removed',
  );
  assert.match(
    document.getElementById('content').textContent,
    /Lớp học chưa có học phần/,
  );
  click('[data-action="edit-class"]');
  document.querySelector(classSetSelector).checked = true;
  submit('#modal-form');
  await waitFor(
    () =>
      document.querySelector('[data-deck]') &&
      !document.querySelector('#modal-form'),
    'membership restored',
  );
  click('[data-action="delete-class"]');
  click('[data-confirm="accept"]');
  await waitFor(
    () => document.querySelector('[data-action="create-class"]'),
    'class deleted',
  );
  assert.ok(snapshot.data.decks.some((deck) => deck.title === 'Smoke deck'));
  click('[data-nav="library"]');
  await waitFor(
    () => document.querySelector('.deck-card'),
    'library after class',
  );
  click('.deck-card');
  await waitFor(
    () => document.querySelector('[data-action="delete-deck"]'),
    'deck after class',
  );
  click('[data-action="delete-deck"]');
  click('[data-confirm="cancel"]');
  assert.ok(document.querySelector('[data-action="delete-deck"]'));
  click('[data-action="delete-deck"]');
  click('[data-confirm="accept"]');
  await waitFor(
    () => !snapshot.data.decks.some((deck) => deck.title === 'Smoke deck'),
    'deck delete persisted',
  );
  assert.equal(document.querySelector('[data-action="sync-server"]'), null);

  click('[data-nav="home"]');
  await waitFor(
    () => document.getElementById('history-filter-form'),
    'history date filters',
  );
  const changeDates = (from, to) => {
    document.getElementById('history-from').value = from;
    document.getElementById('history-to').value = to;
    submit('#history-filter-form');
  };
  assert.equal(
    document.querySelectorAll('.home-recent-grid > section').length,
    2,
  );
  assert.ok(document.querySelectorAll('.history-item').length <= 5);
  const longSession = snapshot.data.sessions.find(
    (session) => session.results?.length === 16,
  );
  let historyPageAttempts = 0;
  while (!document.querySelector(`[data-session="${longSession.id}"]`)) {
    assert.ok(
      ++historyPageAttempts <= 25,
      'session history pagination advances',
    );
    const currentPage = Number(
      document.querySelector('[data-list-scope="history"][aria-current="page"]')
        ?.dataset.listPage || 1,
    );
    const next = document.querySelector(
      `[data-list-scope="history"][data-list-page="${currentPage + 1}"]`,
    );
    assert.ok(next && !next.disabled);
    next.click();
  }
  click(`[data-session="${longSession.id}"]`);
  assert.equal(
    document.querySelectorAll('.session-result-list .review-row').length,
    5,
  );
  assert.match(
    document.querySelector('.session-detail-modal').textContent,
    /Smoke deck/,
  );
  click('[data-list-scope="session-detail"][data-list-page="2"]');
  assert.match(
    document.querySelector('.session-result-list strong').textContent,
    /^6\./,
  );
  click('[data-list-scope="session-detail"][data-list-page="3"]');
  click('[data-list-scope="session-detail"][data-list-page="4"]');
  assert.equal(
    document.querySelectorAll('.session-result-list .review-row').length,
    1,
  );
  const savedSessionCount = snapshot.data.sessions.length;
  const savedCards = JSON.stringify(snapshot.data.decks);
  const savedActivity = JSON.stringify(snapshot.data.history);
  click(`.session-detail-modal [data-delete-session="${longSession.id}"]`);
  assert.ok(document.querySelector('[role="alertdialog"]'));
  click('[data-confirm="cancel"]');
  assert.ok(document.querySelector('.session-detail-modal'));
  assert.equal(snapshot.data.sessions.length, savedSessionCount);
  click(`.session-detail-modal [data-delete-session="${longSession.id}"]`);
  click('[data-confirm="accept"]');
  await waitFor(
    () => !document.querySelector('.session-detail-modal'),
    'deleted session details close',
  );
  await waitFor(
    () => snapshot.data.sessions.length === savedSessionCount - 1,
    'session deletion persisted',
  );
  assert.ok(
    !snapshot.data.sessions.some((session) => session.id === longSession.id),
  );
  assert.equal(
    JSON.stringify(snapshot.data.decks),
    savedCards,
    'deleting history keeps card progress and due dates',
  );
  assert.equal(
    JSON.stringify(snapshot.data.history),
    savedActivity,
    'deleting history keeps activity statistics',
  );
  const rowDelete = document.querySelector('.history-delete');
  const rowSessionId = rowDelete.dataset.deleteSession;
  rowDelete.click();
  assert.equal(
    document.querySelector('.session-detail-modal'),
    null,
    'row delete does not open session details',
  );
  click('[data-confirm="accept"]');
  await waitFor(
    () =>
      !snapshot.data.sessions.some((session) => session.id === rowSessionId),
    'row deletion persisted',
  );

  assert.ok(document.querySelectorAll('.history-item').length > 0);
  changeDates('9999-12-31', '9999-12-31');
  assert.equal(document.querySelectorAll('.history-item').length, 0);
  assert.match(
    document.getElementById('history-entries').textContent,
    /Không có phiên học trong khoảng ngày đã chọn/,
  );
  changeDates('2026-10-13', '2025-01-01');
  assert.equal(
    document.getElementById('history-to').getAttribute('aria-invalid'),
    'true',
  );
  click('[data-action="history-clear"]');
  assert.equal(document.getElementById('history-from').value, '');
  assert.ok(document.querySelectorAll('.history-item').length > 0);
  click('[data-language="en"]');
  assert.equal(
    document.querySelector('label[for="history-from"]').textContent,
    'From date',
  );
  click('[data-language="vi"]');
  const notification = document.querySelector('.toast');
  assert.ok(notification.querySelector('.toast-icon'));
  notification.querySelector('.toast-close').click();
  assert.equal(notification.isConnected, false);
  for (let i = 0; i < 12; i++) {
    click('[data-nav="home"]');
    await waitFor(
      () => document.querySelector('.welcome'),
      'overview before new set',
    );
    click('[data-action="create-deck"]');
    document.getElementById('deck-title').value = `Pagination set ${i}`;
    submit('#modal-form');
    await waitFor(
      () =>
        document.querySelector('.deck-hero h1')?.textContent ===
        `Pagination set ${i}`,
      'new pagination set',
    );
  }
  click('[data-nav="home"]');
  await waitFor(() => document.querySelector('.recent-decks'), 'recent sets');
  assert.equal(document.querySelectorAll('.recent-deck').length, 5);
  assert.equal(
    document.querySelector('[data-list-scope="recent-decks"]'),
    null,
  );
  await waitFor(
    () =>
      /Đã đồng bộ|Synced/.test(
        document.getElementById('sync-status').textContent,
      ),
    'recent sets synchronized',
  );
  const recentIds = [...snapshot.data.decks]
    .sort((a, b) => (b.lastOpened ?? b.created) - (a.lastOpened ?? a.created))
    .slice(0, 5)
    .map((deck) => deck.id);
  assert.deepEqual(
    [...document.querySelectorAll('.recent-deck')].map(
      (button) => button.dataset.deck,
    ),
    recentIds,
  );
  assert.equal(document.querySelectorAll('.stat-line').length, 5);
  click('[data-list-scope="progress"][data-list-page="2"]');
  assert.ok(document.querySelectorAll('.stat-line').length <= 5);
  click('[data-nav="library"]');
  await waitFor(() => document.querySelector('#library-grid'), 'paged library');
  assert.equal(document.querySelectorAll('#library-grid .deck-card').length, 8);
  for (const size of ['small', 'large', 'medium']) {
    const select = document.querySelector('select[data-tile-size]');
    select.value = size;
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(document.documentElement.dataset.tileSize, size);
    await waitFor(
      () => snapshot.data.preferences.tileSize === size,
      'collection tile size persisted',
    );
  }
  assert.equal(document.querySelectorAll('#library-grid .deck-card').length, 8);
  click('[data-list-scope="library"][data-list-page="2"]');
  assert.equal(
    document
      .querySelector('[data-list-scope="library"][aria-current="page"]')
      .textContent.trim(),
    '2',
  );
  assert.ok(
    Array.from(
      document.querySelectorAll('.page-number[data-list-scope="library"]'),
    ).every((button) => /^\d+$/.test(button.textContent.trim())),
  );

  const libraryPager = document
    .querySelector('[data-list-scope="library"]')
    .closest('nav');
  assert.equal(libraryPager.querySelectorAll('.page-arrow').length, 2);
  click('.page-arrow[data-list-scope="library"][data-list-page="1"]');
  assert.equal(
    document.querySelector('[data-list-scope="library"][aria-current="page"]')
      .dataset.listPage,
    '1',
  );
  click('.page-arrow[data-list-scope="library"][data-list-page="2"]');
  assert.equal(
    document.querySelector('[data-list-scope="library"][aria-current="page"]')
      .dataset.listPage,
    '2',
  );
  const librarySearch = document.getElementById('library-search');
  librarySearch.value = 'Pagination set 5';
  librarySearch.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(document.querySelectorAll('#library-grid .deck-card').length, 1);
  assert.equal(document.querySelector('[data-list-scope="library"]'), null);
  click('[data-nav="classes"]');
  await waitFor(
    () => document.querySelector('[data-action="create-class"]'),
    'classes for paged selector',
  );
  click('[data-action="create-class"]');
  document.getElementById('class-name').value = 'Across pages';
  const firstMember = document.querySelector(
    '[data-class-search]:not([hidden]) input',
  );
  firstMember.checked = true;
  const firstMemberId = firstMember.value;
  click('[data-list-scope="class-members"][data-list-page="2"]');
  assert.ok(
    document.querySelectorAll('[data-class-search]:not([hidden])').length <= 5,
  );
  const secondMember = document.querySelector(
    '[data-class-search]:not([hidden]) input',
  );
  secondMember.checked = true;
  click('[data-list-scope="class-members"][data-list-page="1"]');
  assert.equal(
    document.querySelector(`[data-class-deck][value="${firstMemberId}"]`)
      .checked,
    true,
  );
  submit('#modal-form');
  await waitFor(
    () =>
      snapshot.data.classes?.some(
        (group) => group.name === 'Across pages' && group.deckIds.length === 2,
      ),
    'cross-page selection persisted',
  );
  click('[data-nav="review"]');
  await waitFor(
    () => document.querySelector('[data-study-all="review"]'),
    'all due review',
  );
  click('[data-study-all="review"]');
  await waitFor(
    () => document.getElementById('study-setup-form'),
    'all review setup',
  );
  document.getElementById('setup-count').value = '2';
  submit('#study-setup-form');
  await waitFor(
    () => document.querySelector('.memory-toggle'),
    'review memory status',
  );
  assert.ok(document.querySelector('[data-study-star]'));
  assert.ok(document.querySelector('.flash-speak'));
  const reviewMemory = document.querySelector('[data-remembered]');
  reviewMemory.checked = true;
  reviewMemory.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.match(document.querySelector('.memory-toggle').textContent, /đã nhớ/);
  click('[data-study-edit]');
  const reviewEditDeck = document.getElementById('card-deck-id').value;
  const reviewEditCard = document.getElementById('card-id').value;
  assert.notEqual(reviewEditDeck, 'all');
  document.getElementById('card-notes').value = 'Edited during all-deck review';
  submit('#modal-form');
  assert.equal(
    document.querySelector('[data-remembered]').checked,
    true,
    'editing keeps the review rating',
  );
  assert.match(
    document.querySelector('.flash-notes').textContent,
    /Edited during all-deck review/,
  );
  await waitFor(
    () =>
      snapshot.data.decks
        .find((deck) => deck.id === reviewEditDeck)
        ?.cards.find((card) => card.id === reviewEditCard)?.notes ===
      'Edited during all-deck review',
    'review edits saved to the original deck',
  );

  click('[data-action="next"]');
  click('[data-action="prev"]');
  assert.equal(document.querySelector('[data-remembered]').checked, true);
  document.activeElement?.blur();
  document.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: '2', bubbles: true }),
  );
  document.activeElement?.blur();
  document.dispatchEvent(
    new window.KeyboardEvent('keydown', { key: '1', bubbles: true }),
  );
  assert.equal(document.querySelector('.result-score').textContent, '50%');
  await waitFor(
    () =>
      snapshot.data.sessions.some(
        (session) =>
          session.deckId === 'all' &&
          session.mode === 'review' &&
          session.correct === 1 &&
          session.results?.length === 2,
      ),
    'all-review memory and answers saved',
  );
  click('[data-nav="review"]');
  await waitFor(() => document.getElementById('srs-days'), 'review schedule');
  assert.equal(document.querySelectorAll('.srs-day').length, 14);
  click('[data-language="en"]');
  assert.equal(
    document.querySelector('.srs-panel h2').textContent,
    'Review schedule & card management',
  );
  assert.equal(document.querySelector('.srs-day > span').textContent, 'Today');
  click('[data-language="vi"]');

  const range = document.getElementById('srs-days');
  range.value = '30';
  range.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(document.querySelectorAll('.srs-day').length, 30);
  click('[data-action="srs-settings"]');
  document.getElementById('srs-interval-1').value = '1';
  submit('#modal-form');
  assert.equal(document.getElementById('srs-config-error').hidden, false);
  const intervals = [2, 4, 8, 16, 32, 64];
  intervals.forEach((days, i) => {
    document.getElementById(`srs-interval-${i}`).value = String(days);
  });
  document.getElementById('srs-retry').value = '10';
  submit('#modal-form');
  await waitFor(
    () => snapshot.data.preferences?.srs?.retryMinutes === 10,
    'SRS configuration persisted',
  );
  assert.deepEqual(snapshot.data.preferences.srs.intervals, intervals);
  click('[data-srs-date="all"]');
  const editSchedule = document.querySelector('[data-srs-edit]');
  const managedId = editSchedule.dataset.srsEdit;
  const managedDeck = editSchedule.dataset.srsDeck;
  const getManaged = () =>
    snapshot.data.decks
      .find((deck) => deck.id === managedDeck)
      .cards.find((card) => card.id === managedId);
  const before = { ...getManaged() };
  editSchedule.click();
  const future = new Date();
  future.setDate(future.getDate() + 2);
  future.setHours(12, 0, 0, 0);
  const dayKey = `${future.getFullYear()}-${String(future.getMonth() + 1).padStart(2, '0')}-${String(future.getDate()).padStart(2, '0')}`;
  document.getElementById('srs-card-due').value = dayKey + 'T12:00';
  submit('#modal-form');
  await waitFor(
    () => getManaged().due === future.getTime(),
    'manual due date persisted',
  );
  assert.equal(getManaged().correct, before.correct);
  assert.equal(getManaged().wrong, before.wrong);
  click(`[data-srs-date="${dayKey}"]`);
  assert.ok(document.querySelector(`[data-srs-edit="${managedId}"]`));
  click(`[data-srs-pause="${managedId}"]`);
  await waitFor(
    () => getManaged().suspended === true,
    'paused review persisted',
  );
  assert.equal(document.querySelector(`[data-srs-edit="${managedId}"]`), null);
  click('[data-srs-date="paused"]');
  assert.ok(document.querySelector(`[data-srs-edit="${managedId}"]`));
  click(`[data-srs-pause="${managedId}"]`);
  await waitFor(
    () => getManaged().suspended === false,
    'resumed review persisted',
  );
  click('[data-action="srs-settings"]');
  document.getElementById('srs-recalculate').checked = true;
  submit('#modal-form');
  await waitFor(
    () =>
      snapshot.data.decks.every((deck) =>
        deck.cards.every(
          (card) =>
            !card.last ||
            card.suspended ||
            card.due ===
              card.last +
                (card.level === 0
                  ? 600000
                  : intervals[card.level - 1] * 86400000),
        ),
      ),
    'recalculated review dates',
  );
  click('[data-blog-open]');
  await waitFor(() => document.querySelector('[data-blog-new]'), 'shared blog');
  click('[data-blog-new]');
  await waitFor(
    () => document.getElementById('blog-markdown'),
    'Markdown editor',
  );
  document.getElementById('blog-title').value = 'Grammar notes';
  assert.equal(
    document.getElementById('blog-author').value,
    'Người dùng mặc định',
  );
  assert.equal(document.getElementById('blog-author').readOnly, false);
  const markdownInput = document.getElementById('blog-markdown');
  markdownInput.value = '# Parts of speech\n\nNoun';
  markdownInput.dispatchEvent(new window.Event('input', { bubbles: true }));
  markdownInput.setSelectionRange(
    markdownInput.value.length - 4,
    markdownInput.value.length,
  );
  click('[data-md-tool="bold"]');
  assert.ok(markdownInput.value.endsWith('**Noun**'));
  assert.equal(
    document.querySelector('#blog-preview strong').textContent,
    'Noun',
  );
  click('[data-md-tool="undo"]');
  assert.ok(markdownInput.value.endsWith('Noun'));
  assert.ok(!markdownInput.value.endsWith('**Noun**'));
  click('[data-md-tool="redo"]');
  assert.ok(markdownInput.value.endsWith('**Noun**'));
  markdownInput.setSelectionRange(
    markdownInput.value.length,
    markdownInput.value.length,
  );
  click('[data-md-tool="table"]');
  document.getElementById('blog-table-rows').value = '2';
  document.getElementById('blog-table-cols').value = '3';
  click('[data-blog-insert-apply]');
  assert.equal(document.querySelectorAll('#blog-preview table th').length, 3);
  assert.equal(document.querySelectorAll('#blog-preview tbody tr').length, 2);
  assert.ok(document.querySelector('#blog-preview .markdown-table-scroll'));
  click('[data-blog-toolbar-toggle]');
  assert.equal(document.getElementById('blog-toolbar').hidden, true);
  click('[data-blog-toolbar-toggle]');
  assert.equal(document.getElementById('blog-toolbar').hidden, false);
  click('[data-blog-view="preview"]');
  assert.equal(document.querySelector('.blog-editor').dataset.view, 'preview');
  click('[data-blog-view="write"]');
  markdownInput.setSelectionRange(
    markdownInput.value.length,
    markdownInput.value.length,
  );
  click('[data-md-tool="link"]');
  document.getElementById('blog-insert-url').value = 'javascript:alert(1)';
  click('[data-blog-insert-apply]');
  assert.ok(document.querySelector('.blog-insert-error').textContent);
  document.getElementById('blog-insert-url').value = 'https://example.com';
  document.getElementById('blog-insert-text').value = 'Reference';
  click('[data-blog-insert-apply]');
  assert.ok(markdownInput.value.includes('[Reference](https://example.com)'));
  markdownInput.value += '\n\n```javascript\nconst answer = 42;\n```';
  markdownInput.dispatchEvent(new window.Event('input', { bubbles: true }));

  click('[data-blog-preview]');
  assert.equal(
    document.querySelector('#blog-preview h1').textContent,
    'Parts of speech',
  );
  assert.ok(document.querySelector('#blog-preview .hljs-keyword'));
  click('[data-language="en"]');
  assert.equal(
    document.querySelector('[data-md-tool="bold"]').getAttribute('title'),
    'Bold',
  );
  assert.equal(
    document.querySelector('[data-blog-view="write"]').textContent,
    'Write',
  );
  assert.equal(
    document.querySelector('#blog-preview strong').textContent,
    'Noun',
  );
  click('[data-language="vi"]');
  submit('#blog-form');
  await waitFor(
    () => document.querySelector('[data-blog-edit]'),
    'published blog detail',
  );
  assert.equal(
    document.querySelector('.blog-reader .markdown-body strong').textContent,
    'Noun',
  );
  assert.equal(document.querySelectorAll('.blog-reader table th').length, 3);
  assert.equal(
    document.querySelector('.blog-reader .markdown-body a').getAttribute('rel'),
    'noopener noreferrer',
  );
  const detailHash = window.location.hash;
  click('[data-blog-open]');
  await waitFor(
    () => document.querySelector('.blog-card'),
    'collapsed blog list',
  );
  assert.equal(document.querySelector('.markdown-body'), null);
  assert.equal(document.querySelectorAll('.blog-card').length, 1);
  assert.ok(document.querySelector('.blog-page [data-tile-size]'));
  for (const size of ['small', 'medium']) {
    const select = document.querySelector('.blog-page [data-tile-size]');
    select.value = size;
    select.dispatchEvent(new window.Event('change', { bubbles: true }));
    assert.equal(document.querySelectorAll('.blog-card').length, 1);
    assert.equal(document.documentElement.dataset.tileSize, size);
  }

  assert.equal(
    document.querySelector('.blog-card h2').textContent,
    'Grammar notes',
  );
  const searchBlog = document.getElementById('blog-search');
  searchBlog.value = 'not found';
  searchBlog.dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.equal(document.querySelector('.blog-card'), null);
  searchBlog.value = '';
  searchBlog.dispatchEvent(new window.Event('input', { bubbles: true }));
  window.location.hash = document
    .querySelector('.blog-read-link')
    .getAttribute('href');
  await waitFor(
    () => document.querySelector('[data-blog-edit]'),
    'open article detail',
  );
  assert.equal(window.location.hash, detailHash);
  window.location.hash = document
    .querySelector('[data-blog-edit]')
    .getAttribute('href');
  await waitFor(
    () => document.getElementById('blog-markdown'),
    'edit existing Markdown',
  );
  assert.ok(
    document
      .getElementById('blog-markdown')
      .value.includes('| Cột 1 | Cột 2 | Cột 3 |'),
  );
  document.getElementById('blog-author').value = 'Edited author';
  document.getElementById('blog-markdown').value = '# Updated';
  submit('#blog-form');
  await waitFor(
    () =>
      document.querySelector('.blog-reader .markdown-body h1')?.textContent ===
      'Updated',
    'edited blog detail',
  );
  assert.match(
    document.querySelector('.blog-reader .blog-meta').textContent,
    /Edited author/,
  );
  click('[data-nav="home"]');
  await waitFor(() => !document.querySelector('.blog-reader'), 'exit blog');
  window.location.hash = detailHash;
  await waitFor(
    () =>
      document.querySelector('.blog-reader .markdown-body h1')?.textContent ===
      'Updated',
    'article deep link',
  );
  click('[data-blog-open]');
  await waitFor(
    () => document.querySelector('.blog-card'),
    'shared blog reload',
  );
  assert.equal(document.querySelector('.markdown-body'), null);
  window.location.hash = detailHash;
  await waitFor(
    () => document.querySelector('[data-blog-delete]'),
    'owner deletion control',
  );
  click('[data-blog-delete]');
  click('[data-confirm="cancel"]');
  assert.equal(blogArticles.length, 1);
  click('[data-blog-delete]');
  click('[data-confirm="accept"]');
  await waitFor(
    () =>
      blogArticles.length === 0 && document.querySelector('[data-blog-new]'),
    'owner post deletion',
  );
  click('[data-blog-open="notes"]');
  await waitFor(
    () =>
      window.location.hash === '#/notes' &&
      document.querySelector('.blog-page h1')?.textContent ===
        'Ghi chú cá nhân',
    'personal notes list',
  );
  assert.match(document.querySelector('.blog-page h1').textContent, /Ghi chú/);
  click('[data-blog-new]');
  await waitFor(
    () => document.getElementById('blog-markdown'),
    'personal note editor',
  );
  document.getElementById('blog-title').value = 'Private study note';
  document.getElementById('blog-markdown').value =
    '# Private heading\n\n```c++\nint main() { return 0; }\n```';
  submit('#blog-form');
  await waitFor(
    () =>
      document.querySelector('.blog-reader h1')?.textContent ===
      'Private study note',
    'personal note saved and rendered',
  );
  assert.equal(snapshot.data.notes.length, 1);
  assert.equal(blogArticles.length, 0, 'personal note is not a shared post');
  assert.equal(
    document.querySelector('.markdown-code-language').textContent,
    'C++',
  );
  const noteId = snapshot.data.notes[0].id;
  window.location.hash = `#/notes/${noteId}/edit`;
  await waitFor(
    () => document.getElementById('blog-markdown'),
    'edit personal note',
  );
  assert.ok(
    document.getElementById('blog-markdown').value.includes('int main'),
  );
  document.getElementById('blog-title').value = 'Updated personal note';
  submit('#blog-form');
  await waitFor(
    () =>
      document.querySelector('.blog-reader h1')?.textContent ===
      'Updated personal note',
    'personal note edited',
  );
  assert.equal(snapshot.data.notes.length, 1);
  assert.equal(snapshot.data.notes[0].revision, 2);
  click('[data-blog-open="blog"]');
  await waitFor(
    () =>
      window.location.hash === '#/blog' &&
      document.querySelector('.blog-page h1')?.textContent ===
        'Bài viết học tập',
    'shared posts still separate',
  );
  assert.equal(document.querySelector('.blog-card'), null);
  click('[data-blog-open="notes"]');
  await waitFor(
    () => document.querySelector('.blog-card'),
    'personal note reopened',
  );
  assert.equal(
    document.querySelector('.blog-card h2').textContent,
    'Updated personal note',
  );
  window.location.hash = `#/notes/${noteId}`;
  await waitFor(
    () => document.querySelector('[data-blog-delete]'),
    'delete personal note',
  );
  click('[data-blog-delete]');
  click('[data-confirm="accept"]');
  await waitFor(
    () =>
      snapshot.data.notes.length === 0 &&
      document.querySelector('[data-blog-new]'),
    'personal note deleted',
  );

  window.location.hash = `#/deck/${snapshot.data.decks[0].id}`;
  await waitFor(
    () => document.querySelector('[data-action="import-guide"]'),
    'deck import guide',
  );
  click('[data-action="import-guide"]');
  await waitFor(
    () => document.querySelector('#guide-import[open]'),
    'import help on overview',
  );
  assert.ok(
    document
      .querySelector('#guide-import pre')
      .textContent.includes('book,n.::sách|v.::đặt chỗ,/bʊk/'),
  );
  assert.ok(document.querySelector('#guide-backup'));
  assert.equal(document.querySelector('.mastery-note'), null);
  assert.deepEqual(
    scrollCalls.at(-1),
    { id: 'guide-import', open: true },
    'guide scrolling must not be overridden by page-top scrolling',
  );
  click('.progress-panel [data-help-link]');
  await waitFor(
    () => document.querySelector('#guide-study[open]'),
    'mastery guide opened',
  );
  assert.deepEqual(scrollCalls.at(-1), { id: 'guide-study', open: true });
  document.querySelector('#guide-study').open = false;
  click('.progress-panel [data-help-link]');
  assert.ok(
    document.querySelector('#guide-study[open]'),
    'clicking the same link reopens its guide',
  );
  assert.deepEqual(scrollCalls.at(-1), { id: 'guide-study', open: true });
  for (const button of document.querySelectorAll('.create-button')) {
    assert.ok(button.getAttribute('aria-label'));
    assert.equal(button.textContent.trim(), '');
  }
  window.location.hash = `#/deck/${snapshot.data.decks[0].id}`;
  await waitFor(
    () => document.querySelector('[data-action="import-text"]'),
    'return to import',
  );
  click('[data-action="import-text"]');
  document.getElementById('bulk-text').value =
    'Comma import,định nghĩa,Noun,/test/,"ghi chú, có phẩy",nghĩa hai|nghĩa ba';
  submit('#modal-form');
  await waitFor(
    () =>
      snapshot.data.decks[0].cards.some(
        (card) => card.front === 'Comma import',
      ),
    'comma-separated text imported',
  );
  const imported = snapshot.data.decks[0].cards.find(
    (card) => card.front === 'Comma import',
  );
  assert.equal(imported.back, 'định nghĩa');
  assert.equal(imported.partOfSpeech, 'Noun');
  assert.equal(imported.pronunciation, '/test/');
  assert.equal(imported.notes, 'ghi chú, có phẩy');
  assert.deepEqual(imported.definitions, ['nghĩa hai', 'nghĩa ba']);
  click('#profile-button');
  await waitFor(
    () => document.querySelector('#modal-root [data-help-link]'),
    'profile help link',
  );
  click('#modal-root [data-help-link]');
  await waitFor(
    () => document.querySelector('#guide-backup[open]'),
    'backup help on overview',
  );
  assert.equal(document.querySelector('#modal-root [aria-modal]'), null);
  assert.equal(document.querySelector('.app-shell').inert, false);
  window.location.hash = `#/deck/${snapshot.data.decks[0].id}`;
  await waitFor(
    () => document.querySelector('[data-action="add-card"]'),
    'deck for multiple meanings',
  );
  click('[data-action="add-card"]');
  document.getElementById('card-front').value = 'Multiple definition term';
  document.getElementById('card-back').value = 'Primary meaning';
  document.getElementById('card-part').value = 'Noun';
  click('[data-add-definition]');
  document.querySelector('[data-definition]').value = 'Alternative meaning';
  document.querySelector('[data-definition-part]').value = 'Verb';
  submit('#modal-form');
  await waitFor(
    () =>
      snapshot.data.decks[0].cards.some(
        (card) => card.front === 'Multiple definition term',
      ),
    'multiple definitions saved',
  );
  const multi = snapshot.data.decks[0].cards.find(
    (card) => card.front === 'Multiple definition term',
  );
  assert.deepEqual(multi.definitions, [
    { meaning: 'Alternative meaning', partOfSpeech: 'Verb' },
  ]);
  assert.equal(multi.partOfSpeech, 'Noun');
  document.getElementById('card-search').value = 'Multiple definition term';
  document
    .getElementById('card-search')
    .dispatchEvent(new window.Event('input', { bubbles: true }));
  assert.match(
    document.querySelector('.card-definition').textContent,
    /Primary meaning.*Alternative meaning/s,
  );
  click('[data-edit-card]');
  assert.equal(
    document.querySelector('[data-definition]').value,
    'Alternative meaning',
  );
  const partsHelp = document.querySelector('.card-parts-help a');
  assert.equal(partsHelp.getAttribute('href'), '#/home/guide/parts');
  assert.equal(partsHelp.target, '_blank');
  assert.equal(partsHelp.rel, 'noopener');
  assert.equal(document.querySelector('[data-definition-part]').value, 'Verb');
  assert.equal(document.getElementById('card-part').value, 'Noun');
  click('[data-action="close-modal"]');
  for (const [action, mime] of [
    ['export-csv', 'text/csv'],
    ['export-text', 'text/plain'],
    [
      'export-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  ]) {
    document.querySelector('.deck-export-menu').open = true;
    click(`[data-action="${action}"]`);
    assert.ok(exportedBlob.type.startsWith(mime));
    assert.equal(document.querySelector('.deck-export-menu').open, false);
    if (action !== 'export-excel') {
      const exported = await exportedBlob.text();
      assert.match(exported, /front,definition,pronunciation,notes,image/);
      assert.match(exported, /Alternative meaning/);
    } else {
      assert.ok(exportedBlob.size > 0);
    }
  }
  await startStudy('write', { order: 'ordered' });
  await waitFor(
    () => document.getElementById('write-input'),
    'write multi-definition quiz',
  );
  for (
    let attempts = 0;
    attempts < snapshot.data.decks[0].cards.length;
    attempts++
  ) {
    const term = document.querySelector('.question-text').textContent;
    const current = snapshot.data.decks[0].cards.find(
      (card) => card.front === term,
    );
    document.getElementById('write-input').value =
      term === 'Multiple definition term'
        ? 'Alternative meaning'
        : current.back;
    submit('#write-form');
    assert.ok(document.querySelector('.feedback:not(.bad)'));
    if (term === 'Multiple definition term') break;
    click('[data-action="question-next"]');
  }
  await exitStudy();
  const originalRandom = window.Math.random;
  window.Math.random = () => 0.999999;
  await startStudy('learn', { order: 'ordered' });
  for (
    let attempts = 0;
    attempts < snapshot.data.decks[0].cards.length;
    attempts++
  ) {
    const term = document.querySelector('.question-text').textContent;
    const current = snapshot.data.decks[0].cards.find(
      (card) => card.front === term,
    );
    const meanings = [
      current.back,
      ...(current.definitions ?? []).map((value) =>
        typeof value === 'string' ? value : value.meaning,
      ),
    ];
    const choices = [...document.querySelectorAll('[data-choice]')];
    const correct = choices.find((button) =>
      meanings.includes(button.querySelector('span:last-child').textContent),
    );
    const expected = correct.querySelector('span:last-child').textContent;
    if (term === 'Multiple definition term') {
      assert.equal(
        expected,
        'Alternative meaning',
        'quiz deliberately asks the alternative meaning',
      );
      const wrong = choices.find(
        (button) =>
          !meanings.includes(
            button.querySelector('span:last-child').textContent,
          ),
      );
      assert.ok(wrong);
      wrong.click();
      assert.equal(
        document.querySelector('.feedback small').textContent,
        'Đáp án: Alternative meaning',
      );
      break;
    }
    correct.click();
    click('[data-action="question-next"]');
  }
  window.Math.random = originalRandom;
  await exitStudy();
  for (const type of ['mc', 'write']) {
    await startStudy('test', {
      type,
      order: 'ordered',
      multipleChoice: true,
      multipleWrite: true,
    });
    let sawMultiple = false;
    for (const panel of document.querySelectorAll('.test-question')) {
      const front = panel.querySelector('.test-question-title').textContent;
      const current = snapshot.data.decks[0].cards.find(
        (card) => card.front === front,
      );
      const meanings = [
        ...new Set([
          current.back,
          ...(current.definitions ?? []).map((sense) =>
            typeof sense === 'string' ? sense : sense.meaning,
          ),
        ]),
      ];
      if (type === 'mc') {
        const options = [...panel.querySelectorAll('.test-option')];
        const correct = options.filter((option) =>
          meanings.includes(option.querySelector('span').textContent),
        );
        if (meanings.length > 1) {
          sawMultiple = true;
          assert.ok(
            panel
              .querySelector('.question-label')
              .textContent.includes('CÂU NHIỀU LỰA CHỌN'),
          );
          assert.equal(correct.length, meanings.length);
          assert.equal(correct[0].querySelector('input').type, 'checkbox');
        }
        for (const option of correct) {
          const input = option.querySelector('input');
          input.checked = true;
          input.dispatchEvent(new window.Event('input', { bubbles: true }));
        }
      } else {
        if (meanings.length > 1) {
          sawMultiple = true;
          panel.querySelector('[data-test-add-answer]').click();
          panel.querySelector('[data-test-remove-answer]').click();
          assert.equal(panel.querySelectorAll('.test-input').length, 1);
          for (let i = 1; i < meanings.length; i++)
            panel.querySelector('[data-test-add-answer]').click();
        }
        [...panel.querySelectorAll('.test-input')].forEach((input, index) => {
          input.value = meanings[index];
          input.dispatchEvent(new window.Event('input', { bubbles: true }));
        });
      }
      panel.querySelector('[data-test-confirm]').click();
      assert.equal(
        panel.querySelector('[data-test-confirm]').getAttribute('aria-pressed'),
        'true',
      );
      if (type === 'mc' && meanings.length > 1) {
        const option = [...panel.querySelectorAll('.test-option')].find(
          (option) =>
            meanings.includes(option.querySelector('span').textContent),
        );
        const input = option.querySelector('input');
        input.checked = false;
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
        assert.equal(
          panel
            .querySelector('[data-test-confirm]')
            .getAttribute('aria-pressed'),
          'false',
        );
        input.checked = true;
        input.dispatchEvent(new window.Event('input', { bubbles: true }));
        panel.querySelector('[data-test-confirm]').click();
      }
    }
    assert.ok(sawMultiple);
    click('[data-action="test-submit"]');
    await waitFor(
      () => document.querySelector('.result-score'),
      'multi-answer results',
    );
    assert.equal(document.querySelector('.result-score').textContent, '100%');
    let results = document.querySelector('.result-review');
    results.open = true;
    while (!results.textContent.includes('Multiple definition term')) {
      const page = Number(
        document.querySelector(
          '[data-list-scope="test-results"][aria-current="page"]',
        ).dataset.listPage,
      );
      click(`[data-list-scope="test-results"][data-list-page="${page + 1}"]`);
      results = document.querySelector('.result-review');
      results.open = true;
    }
    assert.ok(results.textContent.includes('Primary meaning'));
    assert.ok(results.textContent.includes('Alternative meaning'));
    await exitStudy();
  }

  await waitFor(
    () =>
      /Đã đồng bộ|Synced/.test(
        document.getElementById('sync-status').textContent,
      ),
    'study progress synchronized before merge',
  );
  const mergeBase = structuredClone(
    snapshot.data.decks[0].cards.find(
      (card) => card.front === 'Multiple definition term',
    ),
  );
  const mergeCount = snapshot.data.decks[0].cards.length;
  click('[data-action="add-card"]');
  document.getElementById('card-front').value = 'Multiple definition term';
  document.getElementById('card-back').value = 'Merged manual meaning';
  document.getElementById('card-part').value = 'Verb';
  submit('#modal-form');
  await waitFor(
    () => document.querySelector('.import-review-modal'),
    'merge manual duplicate',
  );
  let mergeAction = document.querySelector('[data-import-action]');
  mergeAction.value = 'merge';
  mergeAction.dispatchEvent(new window.Event('change', { bubbles: true }));
  click('[data-import-confirm]');
  await waitFor(
    () => !document.querySelector('#modal-form'),
    'manual merge saved',
  );
  await waitFor(
    () =>
      snapshot.data.decks[0].cards
        .find((card) => card.id === mergeBase.id)
        .definitions?.some(
          (sense) => sense.meaning === 'Merged manual meaning',
        ),
    'new manual meaning persisted',
  );
  let mergedCard = snapshot.data.decks[0].cards.find(
    (card) => card.id === mergeBase.id,
  );
  assert.equal(snapshot.data.decks[0].cards.length, mergeCount);
  assert.equal(mergedCard.level, mergeBase.level);
  assert.equal(mergedCard.correct, mergeBase.correct);
  assert.equal(mergedCard.due, mergeBase.due);
  click('[data-action="import-text"]');
  document.getElementById('bulk-text').value =
    'Multiple definition term,v.::Merged manual meaning|n.::Bulk meaning,,,';
  submit('#modal-form');
  await waitFor(
    () => document.querySelector('.import-review-modal'),
    'merge text duplicate',
  );
  mergeAction = document.querySelector('[data-import-action]');
  mergeAction.value = 'merge';
  mergeAction.dispatchEvent(new window.Event('change', { bubbles: true }));
  click('[data-import-confirm]');
  await waitFor(
    () => !document.querySelector('#modal-form'),
    'text merge saved',
  );
  await waitFor(
    () =>
      snapshot.data.decks[0].cards
        .find((card) => card.id === mergeBase.id)
        .definitions?.some((sense) => sense.meaning === 'Bulk meaning'),
    'new imported meaning persisted',
  );
  mergedCard = snapshot.data.decks[0].cards.find(
    (card) => card.id === mergeBase.id,
  );
  assert.equal(snapshot.data.decks[0].cards.length, mergeCount);
  assert.equal(
    mergedCard.definitions.filter(
      (sense) => sense.meaning === 'Merged manual meaning',
    ).length,
    1,
  );
  assert.equal(mergedCard.level, mergeBase.level);
  // Every entry point must expose the complete duplicate editor and persist its edits.
  for (const source of ['csv', 'xlsx', 'manual']) {
    const term = 'Multiple definition term';
    const countBefore = snapshot.data.decks[0].cards.length;
    if (source === 'manual') {
      click('[data-action="add-card"]');
      document.getElementById('card-front').value = term;
      document.getElementById('card-back').value = 'Incoming manual meaning';
      submit('#modal-form');
    } else {
      const rows = [
        ['front', 'definition', 'pronunciation', 'notes', 'image'],
        [term, 'n.::Incoming noun|v.::Incoming verb', '', '', ''],
      ];
      const content =
        source === 'csv'
          ? rows.map((row) => row.join(',')).join('\n')
          : zipSync({
              'xl/worksheets/sheet1.xml': strToU8(
                '<worksheet><sheetData>' +
                  rows
                    .map(
                      (row, i) =>
                        `<row>${row.map((value, j) => `<c r="${String.fromCharCode(65 + j)}${i + 1}" t="inlineStr"><is><t>${value}</t></is></c>`).join('')}</row>`,
                    )
                    .join('') +
                  '</sheetData></worksheet>',
              ),
            });
      const picker = document.getElementById('csv-file');
      Object.defineProperty(picker, 'files', {
        configurable: true,
        value: [new window.File([content], `duplicates.${source}`)],
      });
      picker.dispatchEvent(new window.Event('change', { bubbles: true }));
    }
    await waitFor(
      () => document.querySelector('.import-review-modal'),
      `${source} duplicate review`,
    );
    const change = (selector, value) => {
      const input = document.querySelector(selector);
      assert.ok(input, `${source}: ${selector}`);
      input.value = value;
      input.dispatchEvent(new window.Event('change', { bubbles: true }));
    };
    change('[data-import-action]', 'edit');
    change('[data-import-edit-mode]', 'merge');
    change(
      '[data-import-sense="0"] [data-import-meaning]',
      `${source} edited noun`,
    );
    change('[data-import-sense="0"] [data-import-part]', 'Noun');
    click('[data-import-add-sense]');
    const lastSense =
      document.querySelectorAll('[data-import-sense]').length - 1;
    change(
      `[data-import-sense="${lastSense}"] [data-import-meaning]`,
      `${source} edited verb`,
    );
    change(`[data-import-sense="${lastSense}"] [data-import-part]`, 'Verb');
    change('[data-import-notes]', `${source} edited notes`);
    click('[data-import-confirm]');
    await waitFor(
      () => !document.querySelector('.import-review-modal'),
      `${source} edited duplicate closed`,
    );
    if (source === 'manual')
      await waitFor(
        () => !document.querySelector('#modal-form'),
        'manual editor closed',
      );
    await waitFor(
      () =>
        snapshot.data.decks[0].cards
          .find((card) => card.id === mergeBase.id)
          ?.definitions?.some(
            (sense) => sense.meaning === `${source} edited verb`,
          ),
      `${source} edited pairs saved`,
    );
    const saved = snapshot.data.decks[0].cards.find(
      (card) => card.id === mergeBase.id,
    );
    assert.equal(snapshot.data.decks[0].cards.length, countBefore);
    assert.ok(
      saved.definitions.some(
        (sense) =>
          sense.meaning === `${source} edited noun` &&
          sense.partOfSpeech === 'Noun',
      ),
    );
    assert.ok(
      saved.definitions.some(
        (sense) =>
          sense.meaning === `${source} edited verb` &&
          sense.partOfSpeech === 'Verb',
      ),
    );
    assert.equal(saved.level, mergeBase.level);
  }
  click('[data-nav="library"]');
  await waitFor(
    () => document.getElementById('library-search'),
    'vocabulary search in library',
  );
  const vocabularyLibrarySearch = document.getElementById('library-search');
  vocabularyLibrarySearch.value = 'Multiple definition term';
  vocabularyLibrarySearch.dispatchEvent(
    new window.Event('input', { bubbles: true }),
  );
  assert.match(
    document.querySelector('#vocabulary-results').textContent,
    /Multiple definition term/,
  );
  click('#vocabulary-results [data-deck]');
  await waitFor(
    () => document.getElementById('card-search'),
    'deck from vocabulary match',
  );
  click('[data-action="import-text"]');
  document.getElementById('bulk-text').value =
    'Multiple definition term,Replacement meaning,Noun\nFresh batch term,Fresh meaning';
  submit('#modal-form');
  await waitFor(
    () => document.querySelector('.import-review-modal'),
    'review duplicate batch',
  );
  const action = document.querySelector('[data-import-action]');
  action.value = 'overwrite';
  action.dispatchEvent(new window.Event('change', { bubbles: true }));
  click('[data-import-confirm]');
  await waitFor(
    () => !document.querySelector('#modal-form'),
    'batch import complete',
  );
  await waitFor(
    () =>
      snapshot.data.decks[0].cards.some(
        (card) => card.front === 'Fresh batch term',
      ),
    'nonduplicate batch item saved',
  );
  const replaced = snapshot.data.decks[0].cards.find(
    (card) => card.front === 'Multiple definition term',
  );
  assert.equal(replaced.back, 'Replacement meaning');
  assert.equal(replaced.id, multi.id);
  assert.equal(replaced.level, 0);
  click('[data-action="import-text"]');
  document.getElementById('bulk-text').value =
    'Multiple definition term,Edited meaning';
  submit('#modal-form');
  await waitFor(
    () => document.querySelector('.import-review-modal'),
    'edit duplicate import',
  );
  const editAction = document.querySelector('[data-import-action]');
  editAction.value = 'edit';
  editAction.dispatchEvent(new window.Event('change', { bubbles: true }));
  const renamed = document.querySelector('[data-import-front]');
  renamed.value = 'Renamed imported term';
  renamed.dispatchEvent(new window.Event('input', { bubbles: true }));
  click('[data-import-confirm]');
  await waitFor(
    () => !document.querySelector('#modal-form'),
    'renamed import complete',
  );
  await waitFor(
    () =>
      snapshot.data.decks[0].cards.some(
        (card) => card.front === 'Renamed imported term',
      ),
    'renamed duplicate saved',
  );
  await startStudy('flashcards', { order: 'ordered', count: 2 });
  const firstMarkedTerm = document.querySelector(
    '.flip-face .flip-answer',
  ).textContent;
  let mark = document.querySelector('[data-remembered]');
  mark.checked = true;
  mark.dispatchEvent(new window.Event('change', { bubbles: true }));
  click('[data-action="next"]');
  const firstUnremembered = document.querySelector(
    '.flip-face .flip-answer',
  ).textContent;
  mark = document.querySelector('[data-remembered]');
  mark.checked = false;
  mark.dispatchEvent(new window.Event('change', { bubbles: true }));
  await exitStudy();
  await startStudy('learn', {
    order: 'ordered',
    count: 1,
    memoryFilter: 'remembered',
  });
  assert.equal(
    document.querySelector('.question-text').textContent,
    firstMarkedTerm,
  );
  assert.match(document.querySelector('.study-counter').textContent, /1 \/ 1/);
  await exitStudy();
  await startStudy('test', {
    order: 'ordered',
    count: 1,
    type: 'write',
    memoryFilter: 'unremembered',
  });
  assert.equal(
    document.querySelector('.test-question-title').textContent,
    firstUnremembered,
  );
  assert.equal(document.querySelectorAll('.test-question').length, 1);
  await exitStudy();
  const soundPlays = (name) =>
    audioClips
      .filter((clip) => clip.src.endsWith(`/sounds/${name}.wav`))
      .reduce((total, clip) => total + (clip.plays || 0), 0);
  const drag = (source, target) => {
    const beforeLift = soundPlays('drag-lift'),
      beforeDrop = soundPlays('drag-drop');
    source.dispatchEvent(
      new window.Event('dragstart', { bubbles: true, cancelable: true }),
    );
    target.dispatchEvent(
      new window.MouseEvent('dragover', {
        bubbles: true,
        cancelable: true,
        clientX: 10,
      }),
    );
    target.dispatchEvent(
      new window.MouseEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX: 10,
      }),
    );
    assert.equal(soundPlays('drag-lift'), beforeLift + 1);
    assert.equal(soundPlays('drag-drop'), beforeDrop + 1);
  };
  click('[data-nav="library"]');
  await waitFor(
    () => document.getElementById('library-search'),
    'library before sorting',
  );
  document.getElementById('library-search').value = '';
  document
    .getElementById('library-search')
    .dispatchEvent(new window.Event('input', { bubbles: true }));
  await waitFor(
    () => document.querySelectorAll('#library-grid [data-sort-id]').length >= 2,
    'sortable deck grid',
  );
  let gridCards = [
    ...document.querySelectorAll('#library-grid [data-sort-id]'),
  ];
  const initialDeckIds = gridCards.map((card) => card.dataset.sortId);
  drag(gridCards[0], gridCards[1]);
  assert.deepEqual(
    [...document.querySelectorAll('#library-grid [data-sort-id]')]
      .map((card) => card.dataset.sortId)
      .slice(0, 2),
    [initialDeckIds[1], initialDeckIds[0]],
  );
  await waitFor(
    () => snapshot.data.decks[0].id === initialDeckIds[1],
    'deck order persisted',
  );
  gridCards = [...document.querySelectorAll('#library-grid [data-sort-id]')];
  drag(gridCards[0], gridCards[1]);
  await waitFor(
    () => snapshot.data.decks[0].id === initialDeckIds[0],
    'deck order restored',
  );
  const secondPage = document.querySelector(
    '[data-list-scope="library"][data-list-page="2"]',
  );
  if (secondPage) {
    const moving = document.querySelector('#library-grid [data-sort-id]');
    const movingId = moving.dataset.sortId;
    drag(moving, secondPage);
    assert.equal(
      document.querySelector('[data-list-scope="library"][aria-current="page"]')
        .dataset.listPage,
      '2',
    );
    assert.equal(
      document.querySelector('#library-grid [data-sort-id]').dataset.sortId,
      movingId,
    );
    await waitFor(
      () => snapshot.data.decks[8].id === movingId,
      'cross-page deck order saved',
    );
  }
  click('[data-nav="classes"]');
  await waitFor(
    () => document.querySelector('[data-action="create-class"]'),
    'sortable classes',
  );
  let classCards = [...document.querySelectorAll('[data-sort-kind="class"]')];
  if (classCards.length < 2) {
    click('[data-action="create-class"]');
    document.getElementById('class-name').value = 'Sort fixture';
    const member = document.querySelector('[data-class-deck]');
    if (member) member.checked = true;
    submit('#modal-form');
    await waitFor(
      () => !document.querySelector('#modal-form'),
      'sort fixture saved',
    );
    click('[data-nav="classes"]');
    await waitFor(
      () => document.querySelectorAll('[data-sort-kind="class"]').length >= 2,
      'two sortable classes',
    );
    classCards = [...document.querySelectorAll('[data-sort-kind="class"]')];
  }
  if (classCards.length >= 2) {
    const classId = classCards[0].dataset.sortId,
      targetId = classCards[1].dataset.sortId;
    drag(classCards[0], classCards[1]);
    assert.equal(
      document.querySelector('[data-sort-kind="class"]').dataset.sortId,
      targetId,
    );
    await waitFor(
      () => snapshot.data.classes[0].id === targetId,
      'class order persisted',
    );
    assert.ok(snapshot.data.classes.some((group) => group.id === classId));
    await new Promise((resolve) => setTimeout(resolve, 400));
    click(`[data-class-id="${classId}"]`);
    await waitFor(
      () => document.querySelector('[data-action="edit-class"]'),
      'class detail for independent sorting',
    );
    const members = [
      ...document.querySelectorAll('#library-grid [data-sort-id]'),
    ];
    if (members.length >= 2) {
      const first = members[0].dataset.sortId,
        second = members[1].dataset.sortId;
      const libraryOrder = snapshot.data.decks.map((deck) => deck.id);
      drag(members[0], members[1]);
      await waitFor(
        () =>
          snapshot.data.classes.find((group) => group.id === classId)
            .deckIds[0] === second,
        'class member order saved',
      );
      assert.deepEqual(
        snapshot.data.decks.map((deck) => deck.id),
        libraryOrder,
      );
      assert.ok(
        snapshot.data.classes
          .find((group) => group.id === classId)
          .deckIds.includes(first),
      );
      click('[data-action="edit-class"]');
      submit('#modal-form');
      await waitFor(
        () => !document.querySelector('#modal-form'),
        'class metadata save preserves member order',
      );
      assert.equal(
        document.querySelector('#library-grid [data-sort-id]').dataset.sortId,
        second,
      );
    }
  }
});
