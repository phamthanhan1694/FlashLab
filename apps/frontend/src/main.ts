import {
  applyTileSize,
  initializeTileSettings,
  tileSizeMarkup,
  tilePageSize,
} from './ui/tile-settings';
import { reorderItems } from './core/reorder';
import { gradeTestMeanings } from './features/study/test-grading';
import {
  defaultSpeechRate,
  initializeSpeechSettings,
} from './ui/speech-settings';
import { pageButtons } from './ui/pagination';
import { vocabularyToXlsx } from './core/vocabulary-export';
import {
  matchesMemoryFilter,
  type MemoryFilter,
} from './features/study/memory-filter';
import { reviewImportedCards } from './ui/import-review';
import { cardsToCsv } from '@flashlab/shared';
import {
  cardDefinitions,
  cardSenses,
  isDefinition,
  definitionChoices,
} from '@flashlab/shared';
import { createButton } from './ui/create-button';
import {
  renderHelpCenter,
  helpLink,
  initializeHelp,
  focusHelpTopic,
} from './ui/help';
import { personalNoteRequests } from './features/blog/personal-notes';
import {
  cardMasteryMarkup,
  initializeMasteryInfo,
  closeMasteryInfo,
} from './ui/card-mastery';
import { installStudyExitGuard } from './features/study/exit-guard';
import { reviewSchedule } from './features/study/review-schedule';
import { partOptions, formatPartOfSpeech } from './core/parts-of-speech';
import { initializeProfileAvatar } from './features/profiles/avatars';
import {
  speechLanguages,
  selectSpeechVoice,
  pronunciationKeyboard,
} from './features/study/pronunciation';
import { celebratePerfectSession } from './features/study/celebration';
import { runtimeConfig, initializeRuntimeConfig } from './core/runtime';
import { initializeProfiles } from './features/profiles/profiles';
import { StudyAudio } from './features/study/audio';
import {
  badgeStyle,
  colorPickerMarkup,
  bindColorPicker,
} from './ui/color-picker';
import {
  activateModal,
  askConfirmation,
  notify,
  validateForm,
  showFieldError,
  installFormFeedback,
} from './ui/feedback';
import { initializeTheme } from './ui/theme';
import { initializeSettings } from './ui/settings';
import { initializeLanguage, translatePage, uiLocale } from './core/i18n';
import {
  activityHeatmap,
  initializeActivityTooltip,
} from './features/activity/activity';
import { studyInsights } from './features/activity/study-insights';
import { filterSessionDates } from './features/activity/history';
import { ico } from './ui/icons';
import { esc, id, shuffle, dateKey, norm, clamp } from './core/utils';
import { samples } from './data/samples';
import { readVocabularyFile } from './core/vocabulary-import';
import { initializeBlog } from './features/blog';
import { parseDelimited } from './core/csv';
import {
  cardSchema,
  stateSchema,
  normalizeTerm,
  reviewCard,
  scheduledDue,
  defaultSrsPreferences,
  srsPreferencesSchema,
  modeSchema,
  preferencesSchema,
  type AppData,
  type Card,
  type Deck,
  type StudyMode,
} from '@flashlab/shared';
import { StateSync } from './core/api';
import { browserCache } from './core/cache';
import type { Item, Study, UIState } from './types/study-types';
import './ui/styles.css';

function element<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element: ${id}`);
  return node as T;
}
const input = (id: string) => element<HTMLInputElement>(id);
const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : 'Có lỗi xảy ra';
const reportSync = (message: string, error = false) => {
  const node = element('sync-status');
  node.textContent = message;
  node.title = message;
  node.classList.toggle('sync-error', error);
};

async function main() {
  initializeMasteryInfo();
  ('use strict');
  await initializeRuntimeConfig();
  installFormFeedback();
  let sync: StateSync;
  let exitGuard: ReturnType<typeof installStudyExitGuard> | undefined;
  async function prepareProfileSwitch(finalize = true) {
    if (finalize) {
      if (exitGuard && !(await exitGuard.confirm())) return false;
      cancelAdvance();
      trackSession();
    }
    await sync.flush();
    if (sync.hasPending) throw new Error(sync.pendingMessage);
    if (finalize) ui.study = null;
  }
  const profile = await initializeProfiles(prepareProfileSwitch);
  sync = new StateSync(reportSync, profile.id);
  let advanceTimer: ReturnType<typeof setInterval> | undefined;
  function cancelAdvance() {
    clearInterval(advanceTimer);
    advanceTimer = undefined;
  }
  function countdown(next: () => void) {
    cancelAdvance();
    const study = ui.study;
    const duration = runtimeConfig.study.autoAdvanceSeconds * 1000;
    let remaining = duration;
    let previous = performance.now();
    const node = document.getElementById('auto-next');
    if (node) {
      node.setAttribute('role', 'progressbar');
      node.setAttribute('aria-label', 'Thời gian còn lại trước khi chuyển câu');
      node.setAttribute('aria-valuemin', '0');
      node.setAttribute('aria-valuemax', '100');
      node.innerHTML = '<span class="auto-next-fill"></span>';
    }
    const update = () => {
      const percent = Math.max(0, remaining / duration) * 100;
      node?.setAttribute('aria-valuenow', String(Math.round(percent)));
      const fill = node?.firstElementChild as HTMLElement | null;
      if (fill) fill.style.transform = `scaleX(${percent / 100})`;
    };
    update();
    advanceTimer = setInterval(() => {
      if (ui.page !== 'study' || ui.study !== study || study?.finished) {
        cancelAdvance();
        return;
      }
      const now = performance.now();
      if (!document.hidden && !document.querySelector('[role="alertdialog"]'))
        remaining -= now - previous;
      previous = now;
      update();
      if (remaining <= 0) {
        cancelAdvance();
        next();
      }
    }, 50);
  }
  const STORE =
    profile.id === 'default'
      ? 'flashlab.html.v2'
      : `flashlab.html.v2.${profile.id}`;
  const DAY = 86_400_000;
  function validateBackup(raw: unknown): AppData {
    const parsed = stateSchema.safeParse(raw);
    if (!parsed.success)
      throw new Error('Dữ liệu đã lưu không đúng định dạng FlashLab.');
    return parsed.data;
  }
  async function load() {
    try {
      const raw = await browserCache.read(STORE);
      return raw
        ? validateBackup(raw)
        : profile.id === 'default'
          ? samples()
          : { version: 2 as const, decks: [], history: {}, sessions: [] };
    } catch (e) {
      return profile.id === 'default'
        ? samples()
        : { version: 2 as const, decks: [], history: {}, sessions: [] };
    }
  }
  let data: AppData = await sync.initialize(await load());
  let ui: UIState = {
    page: 'home',
    deckId: null,
    mode: null,
    study: null,
    filter: '',
    deckFilter: '',
  };
  const listPages: Record<string, number> = {};
  const pageSize = 5;
  let detailSessionId: string | null = null;
  let pendingSetup: Study | null = null;
  let releaseSetupModal: (() => void) | undefined;
  let routeSetup: { deckId: string; mode: StudyMode } | null = null;
  let activityYear = new Date().getFullYear();
  initializeActivityTooltip();

  let matchTimer: ReturnType<typeof setInterval> | null = null;
  if (!data.preferences) {
    let legacy: unknown = runtimeConfig.defaults;
    if (profile.id === 'default') {
      try {
        legacy = {
          theme:
            localStorage.getItem('flashlab.theme') ??
            runtimeConfig.defaults.theme,
          audio: {
            ...runtimeConfig.defaults.audio,
            ...JSON.parse(localStorage.getItem('flashlab.audio') ?? '{}'),
          },
        };
      } catch {
        /* Use defaults. */
      }
    }
    const parsed = preferencesSchema.safeParse(legacy);
    data.preferences = parsed.success
      ? parsed.data
      : structuredClone(runtimeConfig.defaults);
    save();
  }
  initializeProfileAvatar(profile, data.preferences.avatar, async (avatar) => {
    data.preferences!.avatar = avatar;
    save();
    await sync.flush();
    if (sync.hasPending) throw new Error(sync.pendingMessage);
  });
  initializeLanguage(data.preferences.language ?? 'vi', (language) => {
    data.preferences!.language = language;
    save();
    if (ui.page === 'review') render();
  });
  const audio = new StudyAudio(data.preferences.audio, (value) => {
    data.preferences!.audio = value;
    save();
  });
  initializeTheme(data.preferences.theme, (value) => {
    data.preferences!.theme = value;
    save();
  });
  initializeSpeechSettings(
    data.preferences.speechRate ?? defaultSpeechRate,
    (rate) => {
      data.preferences!.speechRate = rate;
      save();
    },
  );
  initializeTileSettings(data.preferences.tileSize ?? 'medium', (size) => {
    data.preferences!.tileSize = size;
    save();
  });
  initializeSettings(
    profile,
    async () => {
      await sync.flush();
      if (sync.hasPending)
        throw new Error(
          'Dữ liệu chưa đồng bộ. Hãy kiểm tra kết nối trước khi xuất database.',
        );
    },
    () => prepareProfileSwitch(),
  );

  sync.onReconcile = (merged) => {
    data = merged;
    if (!['blog', 'notes'].includes(ui.page)) render();
  };
  const resolveSync = document.createElement('button');
  resolveSync.type = 'button';
  resolveSync.textContent = 'Xử lý đồng bộ';
  element('sync-status').after(resolveSync);
  resolveSync.addEventListener('click', async () => {
    resolveSync.disabled = true;
    try {
      await sync.flush();
      if (!sync.hasConflict) {
        toast(
          sync.hasPending ? sync.pendingMessage : 'Đã đồng bộ',
          sync.hasPending,
        );
        return;
      }
      if (
        !(await askConfirmation(
          'Ứng dụng sẽ lưu riêng bản hiện tại trên trình duyệt và tải một bản JSON để bạn đối chiếu. Sau đó dùng dữ liệu máy chủ và tải lại trang. Tiếp tục?',
          {
            title: 'Xử lý hai phiên bản dữ liệu',
            confirmLabel: 'Sao lưu và dùng bản máy chủ',
          },
        ))
      )
        return;
      const backup = JSON.stringify(data);
      const backupKey = `flashlab.conflict-backup.${profile.id}.${Date.now()}`;
      await browserCache.write(backupKey, data);
      if (!(await browserCache.read(backupKey)))
        throw new Error('Chưa sao lưu được dữ liệu.');
      const url = URL.createObjectURL(
        new Blob([backup], { type: 'application/json' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `FlashLab-${profile.id}-chua-dong-bo-${Date.now()}.json`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      data = await sync.useServer();
      location.reload();
    } catch (error) {
      toast(errorMessage(error), true);
    } finally {
      resolveSync.disabled = false;
    }
  });

  function save() {
    sync.schedule(data);
    updateNav();
  }
  function due(c: Card | undefined) {
    return !!c && !c.suspended && (!c.due || c.due <= Date.now());
  }
  function metrics(deck: Deck) {
    return {
      total: deck.cards.length,
      mastered: deck.cards.filter((c) => c.level >= 3).length,
      due: deck.cards.filter(due).length,
      starred: deck.cards.filter((c) => c.starred).length,
    };
  }
  function totals() {
    return data.decks.reduce(
      (s, d) => {
        const m = metrics(d);
        s.decks++;
        s.cards += m.total;
        s.due += m.due;
        s.mastered += m.mastered;
        return s;
      },
      { decks: 0, cards: 0, due: 0, mastered: 0 },
    );
  }
  function getDeck(deckId: string | null | undefined) {
    return data.decks.find((d) => d.id === deckId);
  }
  function getCard(deckId: string | null | undefined, cardId: string) {
    return getDeck(deckId)?.cards.find((c) => c.id === cardId);
  }
  function allItems() {
    return data.decks.flatMap((d) =>
      d.cards.map((c) => ({ deckId: d.id, cardId: c.id, tries: 0 })),
    );
  }
  function recordOutcome(
    deckId: string,
    cardId: string,
    correct: boolean,
    mode: StudyMode,
    userAnswer?: string,
    expectedAnswer?: string,
  ) {
    const c = getCard(deckId, cardId);
    if (!c) return;
    if (ui.study)
      (ui.study.results ??= []).push({
        front: c.front,
        correctAnswer:
          expectedAnswer ??
          (userAnswer && isDefinition(c, userAnswer) ? userAnswer : c.back),
        userAnswer:
          userAnswer ??
          (mode === 'review' ? (correct ? 'Đã nhớ' : 'Chưa nhớ') : undefined),
        ok: correct,
      });
    Object.assign(
      c,
      reviewCard(
        c,
        correct,
        Date.now(),
        data.preferences?.srs ?? defaultSrsPreferences,
        mode,
      ),
    );
    if (mode !== 'test') audio.effect(correct ? 'correct' : 'incorrect');
    const key = dateKey();
    data.history[key] = (Number(data.history[key]) || 0) + 1;
    if (ui.study) {
      ui.study.correct = (ui.study.correct || 0) + (correct ? 1 : 0);
      ui.study.answers = (ui.study.answers || 0) + 1;
    }
    save();
  }
  function trackSession() {
    const s = ui.study;
    if (!s || !s.started || s.saved) return;
    if (['flashcards', 'review'].includes(s.mode)) {
      s.answers = s.pool.length;
      s.correct = s.pool.filter(
        (p) => s.remembered[JSON.stringify([p.deckId, p.cardId])],
      ).length;
    }
    if (!s.answers) return;
    s.saved = true;
    if (['flashcards', 'review'].includes(s.mode)) {
      const key = dateKey();
      data.history[key] =
        (Number(data.history[key]) || 0) + s.flashRated.length;
      for (const p of s.pool) {
        const cardKey = JSON.stringify([p.deckId, p.cardId]);
        const c = getCard(p.deckId, p.cardId);
        if (c && s.flashRated.includes(cardKey))
          Object.assign(
            c,
            reviewCard(
              c,
              !!s.remembered[cardKey],
              Date.now(),
              data.preferences?.srs ?? defaultSrsPreferences,
              s.mode,
            ),
          );
      }
    }
    data.sessions.push({
      id: id(),
      date: Date.now(),
      deckId: s.deckId,
      mode: s.mode,
      deckTitle:
        getDeck(s.deckId)?.title ??
        (s.deckId === 'all' ? 'Tất cả học phần' : 'Học phần đã xóa'),
      completed: s.finished,
      durationSeconds: Math.max(
        0,
        Math.floor(((s.endTime || Date.now()) - s.startTime) / 1000),
      ),
      results: ['flashcards', 'review'].includes(s.mode)
        ? s.pool.flatMap((p) => {
            const c = getCard(p.deckId, p.cardId);
            const key = JSON.stringify([p.deckId, p.cardId]);
            return c
              ? [
                  {
                    front: c.front,
                    correctAnswer: c.back,
                    userAnswer: s.flashRated.includes(key)
                      ? s.remembered[key]
                        ? 'Đã nhớ'
                        : 'Chưa nhớ'
                      : 'Chưa đánh giá',
                    ok: !!s.remembered[key],
                    assessed: s.flashRated.includes(key),
                  },
                ]
              : [];
          })
        : (s.results ?? []),
      answers: s.answers || 0,
      correct: s.correct || 0,
    });
    data.sessions = data.sessions.slice(-100);
    save();
  }
  function go(
    page: string,
    deckId: string | null | undefined = null,
    mode: string | null = null,
  ) {
    const p =
      page === 'classes' && deckId
        ? `#/classes/${encodeURIComponent(deckId)}`
        : page === 'deck'
          ? `#/deck/${encodeURIComponent(deckId ?? '')}`
          : page === 'study'
            ? `#/study/${encodeURIComponent(deckId ?? '')}/${encodeURIComponent(mode ?? '')}`
            : `#/${page === 'home' ? '' : page}`;

    if (location.hash !== p) {
      location.hash = p;
    } else {
      readRoute();
      render();
    }
    element('sidebar').classList.remove('open');
  }
  function readRoute() {
    if (pendingSetup) closeStudySetup();
    cancelAdvance();
    const parts = (location.hash || '#/')
      .slice(2)
      .split('/')
      .map((v) => {
        try {
          return decodeURIComponent(v);
        } catch {
          return v;
        }
      });
    if (['deck', 'study'].includes(parts[0]) && getDeck(parts[1])) {
      const deck = getDeck(parts[1])!;
      deck.lastOpened = Date.now();
      save();
    }
    if (parts[0] === 'home' && parts[1] === 'guide') {
      history.replaceState(
        null,
        '',
        `#/docs/${encodeURIComponent(parts[2] || 'start')}`,
      );
      parts.splice(0, parts.length, 'docs', parts[2] || 'start');
    }
    const page = parts[0] === 'stats' ? 'home' : parts[0] || 'home';
    if (parts[0] === 'stats') history.replaceState(null, '', '#/');
    if (page === 'deck' && getDeck(parts[1])) {
      ui.page = 'deck';
      ui.deckId = parts[1];
      ui.mode = null;
    } else if (
      page === 'study' &&
      (parts[1] === 'all' || getDeck(parts[1])) &&
      ['flashcards', 'learn', 'write', 'test', 'match', 'review'].includes(
        parts[2],
      )
    ) {
      if (
        !ui.study ||
        ui.study.deckId !== parts[1] ||
        ui.study.mode !== parts[2]
      )
        initStudy(parts[1], modeSchema.parse(parts[2]));
      ui.deckId = parts[1];
      ui.mode = parts[2];
      if (ui.study && !ui.study.started && ui.study.pool.length) {
        routeSetup = { deckId: parts[1], mode: modeSchema.parse(parts[2]) };
        ui.page = parts[1] === 'all' ? 'review' : 'deck';
        ui.study = null;
        history.replaceState(
          null,
          '',
          parts[1] === 'all'
            ? '#/review'
            : `#/deck/${encodeURIComponent(parts[1])}`,
        );
      } else ui.page = 'study';
    } else if (
      [
        'library',
        'review',
        'home',
        'classes',
        'blog',
        'notes',
        'docs',
      ].includes(page)
    ) {
      ui.page = page;
      ui.classId = page === 'classes' ? (parts[1] ?? null) : null;
      ui.deckId = null;
      ui.mode = null;
      ui.study = null;
    } else {
      ui.page = 'home';
      ui.study = null;
    }
    if (ui.page !== 'study' && matchTimer) {
      clearInterval(matchTimer);
      matchTimer = null;
    }
  }
  const content = () => element('content');
  function updateNav() {
    const t = totals();
    element('due-pill').textContent = String(t.due);
    document.querySelectorAll<HTMLElement>('[data-nav]').forEach((el) => {
      const nav = el.dataset.nav;
      el.classList.toggle(
        'active',
        ui.page === nav ||
          (ui.page === 'deck' && nav === 'library') ||
          (ui.page === 'study' && nav === 'library'),
      );
    });
  }
  const celebratedSessions = new WeakSet<Study>();
  let stopCelebration: (() => void) | undefined;
  document.addEventListener('tile-layout-change', () => {
    if (!['library', 'classes'].includes(ui.page)) return;
    for (const scope of Object.keys(listPages))
      if (
        scope === 'library' ||
        scope === 'classes' ||
        scope.startsWith('class-')
      )
        listPages[scope] = 1;
    render();
  });
  let testHeaderObserver: ResizeObserver | undefined;
  function render() {
    testHeaderObserver?.disconnect();
    applyTileSize(data.preferences?.tileSize ?? 'medium');
    closeMasteryInfo();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    stopCelebration?.();
    stopCelebration = undefined;
    updateNav();
    audio.sync(
      ui.page === 'study' && ui.study?.started && !ui.study.finished
        ? ui.study.mode
        : undefined,
    );
    const el = content();
    switch (ui.page) {
      case 'blog':
      case 'notes':
        el.innerHTML = '<p>Đang tải nội dung…</p>';
        break;
      case 'home':
        el.innerHTML = renderHome();
        break;
      case 'docs':
        el.innerHTML = renderHelpCenter();
        break;
      case 'classes':
        el.innerHTML = renderClasses();
        break;
      case 'library':
        el.innerHTML = renderLibrary();
        break;
      case 'deck':
        el.innerHTML = renderDeck();
        break;
      case 'review':
        el.innerHTML = renderReviewHome();
        break;
      case 'study':
        el.innerHTML = renderStudy();
        break;
      default:
        el.innerHTML = renderHome();
    }
    if (ui.page === 'docs') void initializeHelp();
    const yearPicker = document.getElementById(
      'activity-year',
    ) as HTMLSelectElement | null;
    if (yearPicker) yearPicker.value = String(activityYear);
    translatePage();
    const testHeader = el.querySelector<HTMLElement>('.test-sticky-header');
    if (testHeader) {
      const updateHeaderHeight = () =>
        testHeader.parentElement?.style.setProperty(
          '--test-header-height',
          `${Math.ceil(testHeader.getBoundingClientRect().height) + 12}px`,
        );
      updateHeaderHeight();
      if (typeof ResizeObserver !== 'undefined') {
        testHeaderObserver = new ResizeObserver(updateHeaderHeight);
        testHeaderObserver.observe(testHeader);
      }
    }
    const session = ui.study;
    if (
      ui.page === 'study' &&
      session?.finished &&
      session.answers > 0 &&
      session.correct === session.answers &&
      !celebratedSessions.has(session)
    ) {
      celebratedSessions.add(session);
      stopCelebration = celebratePerfectSession();
    }
    if (ui.page === 'study' && ui.study?.started && !ui.study.finished)
      startMatchTimer();
    if (ui.page === 'study' && ui.study?.mode === 'write' && !ui.study.feedback)
      document.getElementById('write-input')?.focus();
    if (ui.page === 'docs') focusHelpTopic();
    if (routeSetup) {
      const setup = routeSetup;
      routeSetup = null;
      openStudySetup(setup.deckId, setup.mode);
    }
  }
  function statsCards() {
    const t = totals(),
      today = data.history[dateKey()] || 0;
    return `<div class="stats-grid">
 ${statCard('Tổng học phần', t.decks, 'layers', 'purple', 'bộ thẻ đã tạo')}
 ${statCard('Thẻ ghi nhớ', t.cards, 'cards', 'blue', 'tổng số thẻ ghi nhớ')}
 ${statCard('Đến hạn ôn', t.due, 'clock', 'orange', 'nên ôn trong hôm nay')}
 ${statCard('Đã học hôm nay', today, 'check', 'green', 'lượt trả lời')}
 </div>`;
  }
  function statCard(
    title: string,
    n: number,
    icon: string,
    color: string,
    foot: string,
  ) {
    return `<div class="stat-card"><div class="stat-top"><span class="stat-title">${title}</span><span class="stat-icon ${color}">${ico(icon, 16)}</span></div><div class="stat-number">${n}</div><div class="stat-foot">${foot}</div></div>`;
  }
  function renderStudyPulse() {
    const insights = studyInsights(data.history);
    const t = totals();
    const percent = t.cards ? Math.round((t.mastered / t.cards) * 100) : 0;
    return `<section class="study-pulse" aria-label="Nhịp học tập"><div class="pulse-streak"><span class="pulse-label">${ico('fire', 20)} Chuỗi học hiện tại</span><div class="pulse-number">${insights.current}<small>ngày liên tiếp</small></div><p>${insights.studiedToday ? 'Đã học hôm nay · tiếp tục giữ nhịp nhé!' : insights.current ? 'Học hôm nay để giữ chuỗi.' : 'Học hôm nay để bắt đầu chuỗi mới.'}</p><span class="pulse-best">${ico('trophy', 16)} <span>Chuỗi dài nhất</span> <strong>${insights.longest}</strong> <span>ngày</span></span></div><div class="pulse-week"><h2>7 ngày gần đây</h2><div class="pulse-week-days">${insights.week.map((day) => `<div class="pulse-day ${day.count > 0 ? 'active' : ''}" title="${day.key} · ${day.count}" aria-label="${day.key} · ${day.count}"><span>${day.key.slice(8)}/${day.key.slice(5, 7)}</span><b>${day.count > 0 ? ico('check', 16) : '·'}</b><small>${day.count}</small></div>`).join('')}</div><p><strong>${insights.weeklyDays}/7</strong> <span>ngày có học</span> · <strong>${insights.weeklyAnswers}</strong> <span>lượt trả lời</span></p></div><div class="pulse-mastery"><div class="mastery-ring" style="--mastery:${percent}%" role="img" aria-label="${percent}%"><strong>${percent}%</strong></div><div><h2>Thành thạo</h2><p><strong>${t.mastered}/${t.cards}</strong> <span>thẻ đạt cấp ≥ 3</span></p></div></div></section>`;
  }
  function deckCard(d: Deck) {
    const m = metrics(d);
    return `<button type="button" class="deck-card" draggable="true" data-sort-kind="deck" data-sort-id="${esc(d.id)}" title="${esc(d.title)}" aria-label="${esc(d.title)}" data-deck="${esc(d.id)}"><div class="deck-card-top"><span class="deck-badge" style="${badgeStyle(d.color)}">${esc(d.title[0]?.toUpperCase() || '?')}</span><span class="card-more">···</span></div><h3>${esc(d.title)}</h3><p ${d.description ? 'data-user-content' : ''}>${esc(d.description || 'Tạo câu hỏi và bắt đầu ôn tập ngay hôm nay.')}</p><div class="deck-card-bottom"><span class="deck-metrics" title="Thành thạo: đạt cấp 3 qua nhiều lượt đúng, luyện nhiều dạng và kiểm tra.">${m.total} thẻ <span style="color:#c5cadd">·</span> ${m.mastered} thành thạo</span><span class="deck-open">${ico('arrow', 16)}</span></div><div class="thin-progress"><span style="width:${m.total ? Math.round((m.mastered / m.total) * 100) : 0}%"></span></div></button>`;
  }
  function scopePageSize(scope: string) {
    return scope === 'library' ||
      scope === 'classes' ||
      data.classes?.some((group) => scope === `class-${group.id}`)
      ? tilePageSize()
      : pageSize;
  }
  function pageRows<T>(rows: readonly T[], scope: string): T[] {
    const size = scopePageSize(scope);
    const pages = Math.max(1, Math.ceil(rows.length / size));
    listPages[scope] = clamp(listPages[scope] || 1, 1, pages);
    return rows.slice((listPages[scope] - 1) * size, listPages[scope] * size);
  }
  function listPagination(total: number, scope: string) {
    const size = scopePageSize(scope);
    if (total <= size) return '';
    const pages = Math.ceil(total / size),
      page = listPages[scope] || 1;
    return `<nav class="history-pagination" aria-label="Phân trang danh sách"><span>Trang ${page} / ${pages} · ${total} mục</span><div>${pageButtons(page, pages, (number) => `data-list-scope="${esc(scope)}" data-list-page="${number}"`)}</div></nav>`;
  }
  function libraryGrid(decks: Deck[], scope = 'library') {
    return (
      tileSizeMarkup() +
      (decks.length
        ? `<p class="help-note sort-hint">Giữ chuột để kéo sắp xếp; thả vào số trang để chuyển sang trang khác.</p><div class="deck-grid" id="library-grid" data-sort-scope="${esc(scope)}">${pageRows(decks, scope).map(deckCard).join('')}</div>${listPagination(decks.length, scope)}`
        : `<div class="empty"><span class="empty-icon">📚</span><h3>Chưa tìm thấy học phần</h3><p>Thử tên khác hoặc tạo học phần đầu tiên của bạn.</p>${createButton('Tạo học phần', 'data-action="create-deck"')}</div>`)
    );
  }
  function recentDecks() {
    const decks = [...data.decks].sort(
      (a, b) => (b.lastOpened ?? b.created) - (a.lastOpened ?? a.created),
    );
    return `<div class="recent-decks">${
      decks
        .slice(0, 5)
        .map(
          (d) =>
            `<button type="button" class="recent-deck" data-deck="${esc(d.id)}"><span class="side-deck-icon" style="${badgeStyle(d.color)}">${esc(d.title[0]?.toUpperCase() || '?')}</span><strong data-user-content>${esc(d.title)}</strong><small>${d.cards.length} thẻ</small>${ico('arrow', 16)}</button>`,
        )
        .join('') ||
      '<p class="help-note">Chưa có học phần. Tạo học phần để bắt đầu.</p>'
    }</div>`;
  }
  function renderHome() {
    const count = totals().due;
    return `<div class="welcome page-heading"><div><h1>Học tốt hơn mỗi ngày <span class="sparkle">✦</span></h1><p class="lead">Sẵn sàng khám phá kiến thức mới? Bắt đầu từ một thẻ nhỏ nhé.</p></div>${createButton('Tạo học phần', 'data-action="create-deck"')}</div>
 ${statsCards()}
 ${renderStudyPulse()}
 ${activityHeatmap(data.history, activityYear, profile.created)}
 <div class="home-recent-grid"><section class="table-panel recent-sets-panel"><div class="section-heading"><h2>Học phần gần đây</h2><button class="section-link" data-nav="library">Xem tất cả ${ico('arrow', 14)}</button></div>${recentDecks()}</section>${renderSessionHistory()}</div>
 ${renderInsights()}
 <div class="home-lower"><div class="wide-promo"><div><h2>Đến lúc củng cố trí nhớ! ✨</h2><p>${count ? `Có ${count} thẻ đến hạn. Dành vài phút để nhớ lâu hơn với ôn tập ngắt quãng.` : 'Bạn đã hoàn thành những thẻ đến hạn. Tiếp tục học để xây dựng thói quen nhé!'}</p><button class="btn" data-nav="review">${ico('repeat', 16)} ${count ? 'Ôn tập ngay' : 'Xem lịch ôn tập'}</button></div></div>
 <div class="mini-panel"><h3>💡 Mẹo học hiệu quả</h3><p>Thay vì đọc đi đọc lại, hãy <strong>tự trả lời trước khi lật thẻ</strong>. Chế độ Trắc nghiệm và Viết giúp luyện khả năng nhớ chủ động.</p><button class="section-link" data-nav="library" style="margin-top:14px">Khám phá các chế độ học ${ico('arrow', 14)}</button></div></div>`;
  }
  function deckMatches(deck: Deck, query: string) {
    return norm(
      deck.title +
        ' ' +
        deck.description +
        ' ' +
        deck.cards
          .map((card) => card.front + ' ' + cardDefinitions(card).join(' '))
          .join(' '),
    ).includes(norm(query));
  }
  let vocabularyPage = 1;
  function vocabularySearchResults(query: string) {
    if (!query.trim()) return '';
    const matches = data.decks.flatMap((deck) =>
      deck.cards
        .filter((card) =>
          norm(card.front + ' ' + cardDefinitions(card).join(' ')).includes(
            norm(query),
          ),
        )
        .map((card) => ({ deck, card })),
    );
    const pages = Math.max(1, Math.ceil(matches.length / 5));
    vocabularyPage = Math.min(vocabularyPage, pages);
    return `<section class="vocabulary-search-results"><h2>Kết quả tìm từ vựng</h2><p><span data-user-content>${matches.length}</span> <span>thẻ phù hợp</span></p>${
      matches
        .slice((vocabularyPage - 1) * 5, vocabularyPage * 5)
        .map(
          ({ deck, card }) =>
            `<article><strong data-user-content>${esc(card.front)}</strong><p data-user-content>${esc(cardDefinitions(card).join(' · '))}</p><button type="button" class="section-link" data-deck="${esc(deck.id)}"><span data-user-content>${esc(deck.title)}</span> ${ico('arrow', 15)}</button></article>`,
        )
        .join('') || '<p>Không tìm thấy từ vựng.</p>'
    }${pages > 1 ? `<nav class="history-pagination">${pageButtons(vocabularyPage, pages, (number) => `data-vocabulary-page="${number}"`)}</nav>` : ''}</section>`;
  }
  function renderLibrary() {
    return `<div class="heading-row page-heading"><div><h1>Thư viện học phần</h1><p class="lead">Tổ chức kiến thức theo chủ đề, học theo tốc độ của bạn.</p></div><div class="header-actions">${createButton('Tạo học phần', 'data-action="create-deck"')}</div></div>
 <div class="library-tools"><div class="search-box" style="width:min(330px,100%)">${ico('search', 17)}<input id="library-search" placeholder="Tìm học phần hoặc từ vựng..." value="${esc(ui.filter)}" autocomplete="off"></div><span style="color:var(--sub);font-size:14px">${data.decks.length} học phần</span></div>
 <div id="vocabulary-results">${vocabularySearchResults(ui.filter)}</div><div id="library-result">${libraryGrid(data.decks.filter((d) => deckMatches(d, ui.filter)))}</div>
 <div class="mini-panel" style="margin-top:27px;display:flex;align-items:center;justify-content:space-between;gap:15px;flex-wrap:wrap"><div><h3>🔐 Dữ liệu thuộc về bạn</h3><p>Không có tài khoản, không gửi thẻ lên Internet. Sao lưu database trong Cài đặt hoặc khôi phục database qua menu người dùng.</p></div></div>`;
  }
  function renderClasses() {
    const groups = data.classes ?? [];
    const group = groups.find((group) => group.id === ui.classId);
    if (group)
      return `<div class="heading-row page-heading"><div><button class="btn-ghost" data-nav="classes">${ico('back', 15)} Tất cả lớp học</button><h1 data-user-content>${esc(group.name)}</h1><p class="lead" data-user-content>${esc(group.description)}</p></div><div class="header-actions"><button class="btn outline" data-action="edit-class">${ico('pencil', 16)} Quản lý học phần</button><button class="btn danger" data-action="delete-class">${ico('trash', 16)} Xóa lớp học</button></div></div><div class="section-heading"><h2>Học phần trong lớp</h2><span>${group.deckIds.length} học phần</span></div>${
        group.deckIds.length
          ? libraryGrid(
              group.deckIds
                .map((id) => getDeck(id))
                .filter((deck): deck is Deck => !!deck),
              `class-${group.id}`,
            )
          : '<div class="empty"><h3>Lớp học chưa có học phần</h3><button class="btn primary" data-action="edit-class">Thêm học phần vào lớp</button></div>'
      }`;
    return `<div class="heading-row page-heading"><div><h1>Lớp học</h1><p class="lead">Gom các học phần theo lớp hoặc chủ đề.</p></div>${createButton('Tạo lớp học', 'data-action="create-class"')}</div>${tileSizeMarkup()}<p class="help-note sort-hint">Giữ chuột để kéo sắp xếp; thả vào số trang để chuyển sang trang khác.</p><div class="deck-grid" data-sort-scope="classes">${pageRows(
      groups,
      'classes',
    )
      .map(
        (group) =>
          `<button type="button" class="deck-card class-card" draggable="true" data-sort-kind="class" data-sort-id="${esc(group.id)}" title="${esc(group.name)}" aria-label="${esc(group.name)}" data-class-id="${esc(group.id)}"><div class="class-card-heading"><span class="class-badge" style="${badgeStyle(group.color ?? 'purple')}">${ico('classroom', 22)}</span><h3 data-user-content>${esc(group.name)}</h3></div>${group.description ? `<p data-user-content>${esc(group.description)}</p>` : ''}<div class="deck-card-bottom"><span class="deck-metrics">${group.deckIds.length} học phần</span><span class="deck-open">${ico('arrow', 16)}</span></div></button>`,
      )
      .join(
        '',
      )}</div>${listPagination(groups.length, 'classes')}${!groups.length ? '<div class="empty"><h3>Chưa có lớp học</h3><p>Tạo lớp học rồi chọn các học phần muốn gom.</p></div>' : ''}`;
  }
  let readClassColor: (() => string | undefined) | undefined;
  function classModal(edit = false) {
    const group = edit
      ? data.classes?.find((group) => group.id === ui.classId)
      : undefined;
    if (!group && (data.classes?.length ?? 0) >= 100) {
      toast('Tối đa 100 lớp học.', true);
      return;
    }
    modal(
      group ? 'Quản lý lớp học' : 'Tạo lớp học',
      'Chọn học phần để gom vào lớp. Học phần có thể thuộc nhiều lớp.',
      `<input id="class-id" type="hidden" value="${esc(group?.id ?? '')}"><div class="class-form-top"><div class="form-field"><label for="class-name">Tên lớp học *</label><input id="class-name" required maxlength="120" value="${esc(group?.name ?? '')}"></div><div class="form-field"><label for="class-description">Mô tả</label><textarea id="class-description" maxlength="500">${esc(group?.description ?? '')}</textarea></div></div><div class="class-form-bottom"><div class="class-form-members"><div class="form-field"><label for="class-set-search">Tìm học phần</label><input type="search" id="class-set-search" placeholder="Tìm theo tên hoặc mô tả học phần" autocomplete="off"></div><p id="class-search-count" class="help-note" role="status">${data.decks.length} học phần</p><fieldset class="class-members"><legend>Chọn học phần</legend>${data.decks.map((deck) => `<label data-class-search="${esc(norm(deck.title + ' ' + deck.description))}"><input type="checkbox" data-class-deck value="${esc(deck.id)}" ${group?.deckIds.includes(deck.id) ? 'checked' : ''}><span data-user-content>${esc(deck.title)}</span></label>`).join('') || '<p>Chưa có học phần để thêm.</p>'}</fieldset><p id="class-search-empty" class="help-note" hidden>Không tìm thấy học phần phù hợp.</p></div><div class="class-form-color">${colorPickerMarkup(group?.color ?? 'purple')}</div></div>`,
      'save-class',
    );
    element('modal-root').querySelector('.modal')!.classList.add('class-modal');
    readClassColor = bindColorPicker(
      element('modal-root'),
      group?.color ?? 'purple',
    );
    listPages['class-members'] = 1;
    updateClassChoices();
  }
  function updateClassChoices() {
    const query = norm(input('class-set-search').value);
    const rows = Array.from(
      document.querySelectorAll<HTMLElement>('[data-class-search]'),
    );
    const matches = rows.filter((row) =>
      row.dataset.classSearch?.includes(query),
    );
    const visible = new Set(pageRows(matches, 'class-members'));
    rows.forEach((row) => {
      row.hidden = !visible.has(row);
    });
    element('class-search-count').textContent =
      `${matches.length} / ${data.decks.length} học phần`;
    element('class-search-empty').hidden = matches.length > 0;
    let pager = document.getElementById('class-members-pagination');
    if (!pager) {
      pager = document.createElement('div');
      pager.id = 'class-members-pagination';
      document.querySelector('.class-members')!.after(pager);
    }
    pager.innerHTML = listPagination(matches.length, 'class-members');
  }
  const modes = [
    [
      'flashcards',
      'Thẻ ghi nhớ',
      'Lật thẻ, tự đánh giá trí nhớ',
      'cards',
      'purple',
    ],
    ['learn', 'Trắc nghiệm', 'Luyện trắc nghiệm chủ động', 'bolt', 'orange'],
    ['write', 'Viết', 'Tự gõ đáp án để ghi nhớ', 'pen', 'blue'],
    ['test', 'Kiểm tra', 'Bài kiểm tra & chấm điểm', 'check', 'green'],
    ['match', 'Ghép cặp', 'Ghép cặp, thử thách tốc độ', 'link', 'pink'],
    [
      'review',
      'Ôn tập cách quãng',
      'Học thẻ đến hạn theo lịch',
      'repeat',
      'purple',
    ],
  ];
  function studyOrder(mode: StudyMode) {
    if (mode === 'match') return 'random';
    return (
      data.preferences?.study?.orders?.[mode] ??
      (mode === 'flashcards' ? 'ordered' : 'random')
    );
  }
  function renderStudySetup(s: Study) {
    const maximum = s.pool.length;
    const type = data.preferences?.study?.testType ?? 'mixed';
    return `<div class="modal-overlay" data-action="study-setup-overlay"><section class="modal study-setup" role="dialog" aria-modal="true" aria-labelledby="study-setup-title"><div class="modal-head"><div><span class="eyebrow">${modeTitle(s.mode)}</span><h2 id="study-setup-title">Bạn muốn học như thế nào?</h2><p>Chọn trước khi bắt đầu.</p></div><button type="button" class="icon-button" data-action="study-setup-cancel" aria-label="Đóng hộp thoại">${ico('close', 19)}</button></div><form id="study-setup-form" novalidate><div class="form-field"><label for="setup-memory-filter">Chọn từ để học</label><select id="setup-memory-filter"><option value="all">Tất cả từ</option><option value="remembered">Từ đã nhớ</option><option value="unremembered">Từ chưa nhớ</option></select><small class="help-note">Dựa trên dấu đã nhớ của thẻ ghi nhớ.</small><small class="help-note" id="setup-memory-count" role="status"></small></div>${s.mode !== 'match' ? `<div class="form-field"><label for="setup-order">Thứ tự</label><select id="setup-order"><option value="ordered" ${studyOrder(s.mode) === 'ordered' ? 'selected' : ''}>Theo thứ tự</option><option value="random" ${studyOrder(s.mode) === 'random' ? 'selected' : ''}>Ngẫu nhiên</option></select></div>` : ''}<div class="form-field"><label for="setup-count">${s.mode === 'match' ? 'Số cặp ghép' : 'Số câu'}</label><input id="setup-count" type="number" min="1" max="${maximum}" value="${maximum}" required><small class="help-note" id="setup-count-hint">Tối đa ${maximum} thẻ có sẵn</small></div>${s.mode === 'test' ? `<div class="form-field"><label for="setup-test-type">Loại câu hỏi kiểm tra</label><select id="setup-test-type"><option value="mixed" ${type === 'mixed' ? 'selected' : ''}>Trắc nghiệm và tự luận</option><option value="mc" ${type === 'mc' ? 'selected' : ''}>Chỉ trắc nghiệm</option><option value="write" ${type === 'write' ? 'selected' : ''}>Chỉ tự luận</option></select></div><div class="test-answer-settings"><label><input id="setup-multiple-choice" type="checkbox" ${data.preferences?.study?.testMultipleChoice ? 'checked' : ''}><span>Cho phép câu chọn nhiều đáp án</span></label><label><input id="setup-multiple-write" type="checkbox" ${data.preferences?.study?.testMultipleWrite ? 'checked' : ''}><span>Điền nhiều nghĩa bằng các ô riêng</span></label><p class="help-note">Bật để dùng ô chọn nhiều hoặc nút + ở mọi câu điền. Cần trả lời đủ các nghĩa đã lưu; từ chỉ có một nghĩa chỉ cần một đáp án. Bỏ chọn để chấp nhận một nghĩa bất kỳ.</p></div>` : ''}<div class="modal-actions"><button type="button" class="btn outline" data-action="study-setup-cancel">Hủy</button><button class="btn primary" type="submit">${ico('arrow', 16)} Bắt đầu</button></div></form></section></div>`;
  }
  function selectedSetupPool(s: Study, filter: MemoryFilter) {
    return s.pool.filter((item) =>
      matchesMemoryFilter(getCard(item.deckId, item.cardId), filter),
    );
  }
  function updateSetupMemoryFilter() {
    if (!pendingSetup) return;
    const filter = element<HTMLSelectElement>('setup-memory-filter')
      .value as MemoryFilter;
    const maximum = selectedSetupPool(pendingSetup, filter).length;
    const count = input('setup-count');
    count.max = String(maximum);
    count.value = String(maximum);
    count.disabled = maximum === 0;
    element('setup-count-hint').textContent = `Tối đa ${maximum} thẻ có sẵn`;
    element('setup-memory-count').textContent = maximum
      ? ''
      : 'Không có từ phù hợp với lựa chọn này.';
    element<HTMLButtonElement>(
      'study-setup-form',
    ).querySelector<HTMLButtonElement>('[type="submit"]')!.disabled =
      maximum === 0;
    translatePage();
  }
  document.addEventListener('change', (event) => {
    if (
      event.target instanceof HTMLSelectElement &&
      event.target.id === 'setup-memory-filter'
    )
      updateSetupMemoryFilter();
  });
  function closeStudySetup() {
    if (!pendingSetup) return;
    pendingSetup = null;
    element('modal-root').replaceChildren();
    releaseSetupModal?.();
    releaseSetupModal = undefined;
  }
  function openStudySetup(deckId: string, mode: StudyMode) {
    closeModal();
    const previous = ui.study;
    initStudy(deckId, mode);
    const setup = ui.study!;
    ui.study = previous;
    if (!setup.pool.length) {
      ui.study = setup;
      go('study', deckId, mode);
      return;
    }
    pendingSetup = setup;
    const root = element('modal-root');
    root.innerHTML = renderStudySetup(setup);
    releaseSetupModal = activateModal(
      root.querySelector<HTMLElement>('[role="dialog"]')!,
      closeStudySetup,
    );
    element('setup-memory-filter').focus();
    updateSetupMemoryFilter();
    translatePage();
  }
  document.addEventListener('change', (event) => {
    if (
      !(event.target instanceof HTMLSelectElement) ||
      event.target.id !== 'activity-year'
    )
      return;
    activityYear = Number(event.target.value);
    render();
  });
  let cardPage = 1;
  const cardPageSize = 5;
  function renderDeck() {
    const d = getDeck(ui.deckId);
    if (!d) {
      go('library');
      return '';
    }
    const m = metrics(d);
    const filtered = d.cards.filter((c) =>
      norm(c.front + ' ' + cardDefinitions(c).join(' ')).includes(
        norm(ui.deckFilter),
      ),
    );
    return `<div class="heading-row"><button class="btn-ghost" data-nav="library">${ico('back', 15)} Quay về thư viện</button><div class="header-actions"><button class="btn outline" data-action="import-csv">${ico('upload', 16)} Nhập Excel / CSV</button><button class="btn outline" data-action="import-text">Nhập text</button><button class="btn outline" data-action="import-guide">Hướng dẫn nhập</button><details class="deck-export-menu"><summary class="btn outline">${ico('download', 16)} Xuất thẻ</summary><div class="deck-export-options"><button type="button" class="btn outline" data-action="export-csv">CSV (.csv)</button><button type="button" class="btn outline" data-action="export-text">Text (.txt)</button><button type="button" class="btn outline" data-action="export-excel">Excel (.xlsx)</button></div></details><button class="btn outline" data-action="edit-deck">${ico('pencil', 16)} Chỉnh sửa</button><button class="btn danger" data-action="delete-deck">${ico('trash', 15)} Xóa</button></div></div>
 <div class="deck-hero"><div class="deck-hero-left"><div class="deck-hero-icon" style="${badgeStyle(d.color)}">${esc(d.title[0]?.toUpperCase() || '?')}</div><div><h1>${esc(d.title)}</h1><p ${d.description ? 'data-user-content' : ''}>${esc(d.description || 'Bộ thẻ cá nhân của bạn')}</p><div class="hero-meta"><span>${ico('cards', 14)} ${m.total} thẻ</span><span title="Thành thạo: đạt cấp 3 qua nhiều lượt đúng, luyện nhiều dạng và kiểm tra.">${ico('check', 14)} ${m.mastered} thành thạo</span><span>${ico('clock', 14)} ${m.due} đến hạn</span></div></div></div><div class="header-actions"><button class="btn primary" data-mode="flashcards">${ico('arrow', 16)} Bắt đầu học</button>${createButton('Thêm thẻ', 'data-action="add-card"')}</div></div>
 <div class="section-heading"><h2>Chọn chế độ học</h2><span style="color:var(--sub);font-size:14px">6 chế độ luyện tập</span></div>
 <div class="mode-grid">${modes.map(([mode, name, desc, icon, color]) => `<button class="mode-card" data-mode="${mode}"><span class="mode-card-icon ${color}">${ico(icon, 23)}</span><span><strong>${name}</strong><small>${desc}</small></span><span class="mode-arrow">${ico('arrow', 16)}</span></button>`).join('')}</div>
 <div class="section-heading"><h2>Danh sách thẻ <span style="color:var(--sub);font-size:14px">(${m.total})</span></h2><div class="header-actions">${createButton('Thêm thẻ', 'data-action="add-card"')}</div></div>
 <div class="library-tools"><div class="search-box" style="width:min(390px,100%)">${ico('search', 17)}<input id="card-search" placeholder="Tìm thuật ngữ hoặc định nghĩa..." value="${esc(ui.deckFilter)}"></div></div>
 <div id="card-results">${renderCardRows(filtered)}</div>`;
  }
  function renderCardRows(cards: Card[]) {
    const pages = Math.max(1, Math.ceil(cards.length / cardPageSize));
    cardPage = clamp(cardPage, 1, pages);
    const offset = (cardPage - 1) * cardPageSize;
    const pagination = `<div class="history-pagination"><span>${cards.length} thẻ · Trang ${cardPage} / ${pages}</span><div class="header-actions">${pageButtons(cardPage, pages, (number) => `data-card-page="${number}"`)}</div></div>`;
    cards = cards.slice(offset, offset + cardPageSize);
    if (!cards.length)
      return `<div class="empty"><span class="empty-icon">🗂️</span><h3>Chưa có thẻ phù hợp</h3><p>Thêm thẻ mới hoặc thử từ khóa khác.</p>${createButton('Thêm thẻ', 'data-action="add-card"')}</div>`;
    return `<div class="card-list"><div class="card-list-header"><span>#</span><span>THUẬT NGỮ / MẶT TRƯỚC</span><span>ĐỊNH NGHĨA / MẶT SAU</span><span aria-hidden="true"></span></div>${cards
      .map(
        (c, i) =>
          `<div class="card-list-row ${c.starred ? 'card-row-starred' : ''}"><span class="card-num">${String(offset + i + 1).padStart(2, '0')}</span><div class="card-term-cell"><div class="card-term"><span data-user-content>${esc(c.front)}</span>${[
            ...new Set(
              cardSenses(c)
                .map((sense) => sense.partOfSpeech)
                .filter(Boolean),
            ),
          ]
            .map(
              (part) =>
                `<small data-user-content data-part-of-speech="${esc(part)}">${esc(formatPartOfSpeech(part))}</small>`,
            )
            .join(
              ' ',
            )}${c.image ? `<img class="vocabulary-image thumbnail" src="${esc(c.image)}" alt="${esc(c.front)}">` : ''}</div>${cardMasteryMarkup(c)}</div><div class="card-definition">${cardSenses(
            c,
          )
            .map(
              (sense) =>
                `<p data-user-content>${sense.partOfSpeech ? `<small class="sense-part" data-part-of-speech="${esc(sense.partOfSpeech)}">${esc(formatPartOfSpeech(sense.partOfSpeech))}</small> ` : ''}${esc(sense.meaning)}</p>`,
            )
            .join(
              '',
            )}</div><div class="card-actions"><button type="button" class="icon-button card-speak" data-speak="${esc(c.front)}" data-speech-language="${esc(c.speechLanguage || 'en-US')}" aria-label="Nghe phát âm: ${esc(c.front)}" title="Nghe phát âm">${ico('volume', 18)}</button><button type="button" class="icon-button star-toggle ${c.starred ? 'is-starred' : ''}" title="${c.starred ? 'Bỏ dấu sao' : 'Đánh dấu sao'}" data-star="${esc(c.id)}" aria-pressed="${!!c.starred}" aria-label="${c.starred ? 'Bỏ dấu sao' : 'Đánh dấu sao'}">${ico('star', 15)}</button><button type="button" class="icon-button" title="Sửa thẻ" data-edit-card="${esc(c.id)}" aria-label="Sửa thẻ">${ico('pencil', 15)}</button><button type="button" class="icon-button" title="Xóa thẻ" data-delete-card="${esc(c.id)}" aria-label="Xóa thẻ">${ico('trash', 15)}</button></div></div>`,
      )
      .join('')}</div>${pages > 1 ? pagination : ''}`;
  }
  let duePage = 1;
  function dueCardList() {
    const items = data.decks.flatMap((deck) =>
      deck.cards.filter(due).map((card) => ({ deck, card })),
    );
    const pages = Math.max(1, Math.ceil(items.length / 5));
    duePage = clamp(duePage, 1, pages);
    return `<section class="table-panel due-cards"><div class="section-heading"><h2>Thẻ cần ôn</h2><span>${items.length} thẻ</span></div>${items
      .slice((duePage - 1) * 5, duePage * 5)
      .map(
        ({ deck, card }) =>
          `<article class="due-card-row"><div class="due-card-content"><strong data-user-content>${esc(card.front)}</strong>${cardMasteryMarkup(card)}<p data-user-content>${esc(card.back)}</p></div><div class="due-card-source"><button type="button" class="section-link" data-deck="${esc(deck.id)}"><span data-user-content>${esc(deck.title)}</span>${ico('arrow', 14)}</button><small>${!card.last ? 'Chưa học' : 'Đến hạn'}${card.last && card.due ? ` · ${new Date(card.due).toLocaleString(uiLocale())}` : ''}</small></div></article>`,
      )
      .join(
        '',
      )}${pages > 1 ? `<div class="history-pagination"><span>${duePage} / ${pages}</span><div>${pageButtons(duePage, pages, (number) => `data-due-page="${number}"`)}</div></div>` : ''}</section>`;
  }
  let scheduleSelection = 'due';
  let scheduleDeck = '';
  let scheduleDays = 14;
  function renderSchedule() {
    const now = Date.now();
    const decks = scheduleDeck
      ? data.decks.filter((deck) => deck.id === scheduleDeck)
      : data.decks;
    const schedule = reviewSchedule(decks, now, scheduleDays);
    const selected = schedule.calendar.find(
      (day) => day.key === scheduleSelection,
    );
    const items = (
      scheduleSelection === 'all'
        ? schedule.entries
        : scheduleSelection === 'paused'
          ? schedule.paused
          : selected
            ? selected.items
            : schedule.due
    )
      .slice()
      .sort((a, b) => a.card.due - b.card.due);
    const rows = pageRows(items, 'srs');
    return `<section class="table-panel srs-panel"><div class="section-heading"><div><h2>Lịch ôn & quản lý thẻ</h2><p class="help-note">Dự kiến theo lịch hiện tại. Kết quả học tiếp theo có thể thay đổi lịch này.</p></div><button type="button" class="btn outline" data-action="srs-settings">${ico('settings', 16)} Cấu hình ôn tập</button></div>
      <div class="srs-filters"><div class="form-field"><label for="srs-deck-filter">Học phần</label><select id="srs-deck-filter"><option value="">Tất cả học phần</option>${data.decks.map((deck) => `<option data-user-content value="${esc(deck.id)}" ${scheduleDeck === deck.id ? 'selected' : ''}>${esc(deck.title)}</option>`).join('')}</select></div><div class="form-field"><label for="srs-days">Xem lịch trong</label><select id="srs-days">${[14, 30, 90].map((n) => `<option value="${n}" ${scheduleDays === n ? 'selected' : ''}>${n} ngày</option>`).join('')}</select></div></div>
      <div class="srs-view-tabs"><button class="btn ${scheduleSelection === 'due' ? 'primary' : 'outline'}" data-srs-date="due">Cần ôn ngay <span data-user-content>(${schedule.due.length})</span></button><button class="btn ${scheduleSelection === 'all' ? 'primary' : 'outline'}" data-srs-date="all">Tất cả thẻ <span data-user-content>(${schedule.entries.length})</span></button><button class="btn ${scheduleSelection === 'paused' ? 'primary' : 'outline'}" data-srs-date="paused">Tạm dừng <span data-user-content>(${schedule.paused.length})</span></button></div>
      <div class="srs-calendar" aria-label="Lịch ôn sắp tới">${schedule.calendar.map((day, index) => `<button type="button" class="srs-day ${day.key === scheduleSelection ? 'selected' : ''}" data-srs-date="${day.key}" aria-pressed="${day.key === scheduleSelection}"><span>${index === 0 ? 'Hôm nay' : index === 1 ? 'Ngày mai' : `<span data-user-content>${new Date(day.start).toLocaleDateString(uiLocale(), { day: '2-digit', month: '2-digit' })}</span>`}</span><strong data-user-content>${day.items.length}</strong><small>thẻ</small></button>`).join('')}</div>
      <div class="section-heading srs-list-heading"><h3>${selected ? `<span data-user-content>${new Date(selected.start).toLocaleDateString(uiLocale(), { dateStyle: 'full' })}</span>` : scheduleSelection === 'all' ? 'Tất cả thẻ' : scheduleSelection === 'paused' ? 'Thẻ tạm dừng' : 'Thẻ cần ôn ngay'}</h3><span data-user-content>${items.length}</span></div>
      <div class="srs-card-list">${rows.map(({ deck, card }) => `<article class="srs-card-row"><div class="srs-card-copy"><strong data-user-content>${esc(card.front)}</strong><p data-user-content>${esc(card.back)}</p><button type="button" class="section-link" data-deck="${esc(deck.id)}"><span data-user-content>${esc(deck.title)}</span></button></div><div class="srs-card-meta"><span>${card.suspended ? 'Tạm dừng' : !card.last ? 'Chưa học' : card.due <= now ? 'Đến hạn' : 'Sắp tới'}</span>${cardMasteryMarkup(card)}<time data-user-content>${card.due ? new Date(card.due).toLocaleString(uiLocale()) : '—'}</time></div><div class="srs-card-actions"><button type="button" class="btn outline small" data-srs-edit="${esc(card.id)}" data-srs-deck="${esc(deck.id)}">Sửa lịch</button><button type="button" class="btn outline small" data-srs-pause="${esc(card.id)}" data-srs-deck="${esc(deck.id)}">${card.suspended ? 'Tiếp tục ôn' : 'Tạm dừng ôn'}</button></div></article>`).join('') || '<p class="srs-empty">Không có thẻ trong khoảng thời gian này.</p>'}</div>${listPagination(items.length, 'srs')}</section>`;
  }
  function srsSettingsModal() {
    const settings = data.preferences?.srs ?? defaultSrsPreferences;
    modal(
      'Cấu hình ôn tập cách quãng',
      'Cấu hình riêng cho người dùng hiện tại.',
      `<div class="srs-interval-inputs">${settings.intervals.map((days, i) => `<div class="form-field"><label for="srs-interval-${i}">Cấp ${i + 1} (ngày)</label><input id="srs-interval-${i}" type="number" min="1" max="3650" step="1" required value="${days}"></div>`).join('')}</div><div class="form-field"><label for="srs-retry">Học lại sau khi trả lời sai (phút)</label><input id="srs-retry" type="number" min="1" max="10080" step="1" required value="${settings.retryMinutes}"></div><p class="help-note">Khoảng cách của 6 cấp phải tăng dần. Trả lời sai trừ tiến độ; chỉ sai khi đã 0 điểm mới hạ một cấp.</p><label class="srs-recalculate"><input id="srs-recalculate" type="checkbox"><span>Tính lại lịch các thẻ đã học từ lần học gần nhất</span></label><p class="help-note">Không chọn: giữ lịch hiện có, áp dụng cấu hình từ lượt học tiếp theo. Chọn: thay cả ngày ôn đã chỉnh thủ công; thẻ chưa học và thẻ tạm dừng giữ nguyên.</p><p id="srs-config-error" class="test-submit-error" role="alert" hidden></p><button type="button" class="btn outline" data-action="srs-defaults">Điền cấu hình mặc định</button>`,
      'srs-settings',
    );
  }
  function srsCardModal(deckId: string, cardId: string) {
    const card = getCard(deckId, cardId);
    if (!card) return;
    const date = new Date(card.due || Date.now());
    const local = `${dateKey(date.getTime())}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    modal(
      'Chỉnh lịch ôn thẻ',
      card.front,
      `<input type="hidden" id="srs-card-id" value="${esc(card.id)}"><input type="hidden" id="srs-card-deck" value="${esc(deckId)}"><div class="form-field"><label for="srs-card-level">Cấp ghi nhớ</label><select id="srs-card-level">${Array.from({ length: 7 }, (_, i) => `<option value="${i}" ${card.level === i ? 'selected' : ''}>${i}</option>`).join('')}</select></div><div class="form-field"><label for="srs-card-due">Lần ôn tiếp theo</label><input id="srs-card-due" type="datetime-local" required value="${local}"></div><p class="help-note">Chỉnh lịch không thay đổi số lần trả lời đúng/sai.</p><button type="button" class="btn outline" data-action="srs-due-now">Đưa về ôn ngay</button>`,
      'srs-card',
    );
    element('modal-root')
      .querySelector('.modal-head p')!
      .setAttribute('data-user-content', '');
  }
  function renderReviewHome() {
    const t = totals();
    const settings = data.preferences?.srs ?? defaultSrsPreferences;
    return `<section class="review-home"><div class="review-heading centered-heading"><h1>Cần ôn hôm nay</h1><p class="lead">Thẻ vừa học sẽ xuất hiện lại theo khoảng cách tăng dần để ghi nhớ lâu hơn.</p>${helpLink('study')}</div>
      <div class="review-overview-grid"><section class="table-panel review-summary" aria-labelledby="review-summary-title">
        <div class="review-summary-heading"><h2 id="review-summary-title">Tổng số thẻ đang chờ</h2><span class="stat-icon orange">${ico('calendar', 22)}</span></div>
        <div class="stat-number">${t.due}</div><p class="stat-foot">Các thẻ chưa học hoặc đã đến hạn ôn.</p>
        ${t.due ? `<button class="btn primary" data-study-all="review">${ico('repeat', 17)} Ôn tất cả (${t.due})</button>` : ''}
        <div class="review-schedule-note"><h3>🧠 Lịch ôn đang áp dụng</h3><p>Thẻ được hẹn ôn theo cấp ghi nhớ đã đạt.</p><strong data-user-content>${settings.intervals.join(' → ')}</strong><p>Trả lời sai: học lại sau <span data-user-content>${settings.retryMinutes}</span> <span>phút</span>.</p><button class="btn outline small" data-action="srs-settings">Cấu hình ôn tập</button></div>
      </section>
      ${t.due ? dueCardList() : `<section class="table-panel review-empty"><div class="section-heading"><h2>Thẻ cần ôn</h2><span>0 thẻ</span></div><div class="empty"><span class="empty-icon">🎉</span><h3>Không còn thẻ đến hạn!</h3><p>Bạn đã hoàn thành lịch ôn tập hiện tại. Hãy quay lại ngày mai hoặc học các thẻ mới.</p><button class="btn primary" data-nav="library">Đến thư viện ${ico('arrow', 15)}</button></div></section>`}
      </div>${renderSchedule()}</section>`;
  }
  let historyFrom = '';
  let historyTo = '';
  function renderInsights() {
    const cards = data.decks.map((d) => ({ name: d.title, ...metrics(d) }));
    const rows = pageRows(cards, 'progress');
    return `<section class="table-panel progress-panel"><div class="section-heading"><h2>Tiến độ theo học phần</h2>${helpLink('study')}</div><div class="stat-list">${rows.map((c) => `<div class="stat-line"><strong data-user-content title="${esc(c.name)}">${esc(c.name)}</strong><span class="bar"><span style="width:${c.total ? Math.round((c.mastered / c.total) * 100) : 0}%"></span></span><span>${c.mastered}/${c.total} thẻ</span></div>`).join('') || '<p class="lead">Chưa có học phần.</p>'}</div>${listPagination(cards.length, 'progress')}</section>`;
  }
  function renderSessionHistory() {
    const sessions = filterSessionDates(
      data.sessions,
      historyFrom,
      historyTo,
    ).sort((a, b) => b.date - a.date);
    const rows = pageRows(sessions, 'history');
    return `<section class="table-panel recent-sessions-panel"><div class="section-heading compact-heading"><h2 id="history-heading" tabindex="-1">Phiên học gần đây</h2><span class="stat-title">${sessions.length} phiên đã lưu</span></div><form id="history-filter-form" class="history-filters" novalidate><div class="form-field"><label for="history-from">Từ ngày</label><input id="history-from" type="date" value="${historyFrom}"></div><div class="form-field"><label for="history-to">Đến ngày</label><input id="history-to" type="date" value="${historyTo}"></div><button class="btn primary small" type="submit">Lọc</button><button class="btn outline small" type="button" data-action="history-clear">Xóa bộ lọc</button></form><div class="history-list" id="history-entries">${
      rows
        .map((session) => {
          const name =
            session.deckTitle ??
            (session.deckId === 'all'
              ? 'Tất cả học phần'
              : getDeck(session.deckId)?.title || 'Học phần đã xóa');
          const mode =
            modes.find((m) => m[0] === session.mode)?.[1] || session.mode;
          return `<div class="history-session-row"><button type="button" class="history-item" data-session="${esc(session.id)}" aria-label="Xem chi tiết phiên ${esc(name)}"><span class="history-dot">${ico('cards', 16)}</span><span class="history-info"><strong data-user-content>${esc(name)}</strong><span><span>${esc(mode)}</span> · <time data-user-content data-ui-date datetime="${new Date(session.date).toISOString()}">${new Date(session.date).toLocaleString(uiLocale())}</time></span></span><span class="history-count">${session.correct}/${session.answers}<small>${['flashcards', 'review'].includes(session.mode) ? 'đã nhớ' : 'đúng'}</small></span>${ico('chevron', 14)}</button><button type="button" class="icon-button history-delete" data-delete-session="${esc(session.id)}" title="Xóa phiên học" aria-label="Xóa phiên học ${esc(name)}">${ico('trash', 16)}</button></div>`;
        })
        .join('') ||
      `<p class="help-note">${historyFrom || historyTo ? 'Không có phiên học trong khoảng ngày đã chọn.' : 'Chưa có phiên học. Học thử một bộ thẻ nhé!'}</p>`
    }</div>${listPagination(sessions.length, 'history')}</section>`;
  }
  function showSessionDetails(sessionId: string) {
    const session = data.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    detailSessionId = sessionId;
    const results = session.results ?? [];
    const rows = pageRows(results, 'session-detail');
    const offset = ((listPages['session-detail'] || 1) - 1) * pageSize;
    const mode = modes.find((m) => m[0] === session.mode)?.[1] || session.mode;
    modal(
      'Chi tiết phiên học',
      session.deckTitle ?? getDeck(session.deckId)?.title ?? 'Học phần đã xóa',
      `<div class="session-summary"><span>${esc(mode)}</span><time data-user-content data-ui-date datetime="${new Date(session.date).toISOString()}">${new Date(session.date).toLocaleString(uiLocale())}</time><strong>${session.correct}/${session.answers} ${['flashcards', 'review'].includes(session.mode) ? 'đã nhớ' : 'đúng'}</strong>${session.durationSeconds !== undefined ? `<span>Thời gian: ${formatTime(session.durationSeconds)}</span>` : ''}${session.completed !== undefined ? `<span>${session.completed ? 'Đã hoàn thành' : 'Đã dừng giữa chừng'}</span>` : ''}</div><div class="session-result-list">${rows.map((r, i) => `<article class="review-row"><div><strong data-user-content>${offset + i + 1}. ${esc(r.front)}</strong><p><span>${['flashcards', 'review'].includes(session.mode) ? 'Đánh giá:' : 'Bạn trả lời:'}</span> ${r.userAnswer === undefined ? '<span>(không ghi lại)</span>' : `<span data-user-content>${esc(r.userAnswer)}</span>`}</p><p><span>Đáp án:</span> <span data-user-content>${esc(r.correctAnswer)}</span></p></div><span class="${r.ok ? 'correct-label' : 'wrong-label'}">${r.assessed === false ? 'Chưa đánh giá' : ['flashcards', 'review'].includes(session.mode) ? (r.ok ? 'Đã nhớ' : 'Chưa nhớ') : r.ok ? '✓ Đúng' : '✕ Sai'}</span></article>`).join('') || '<p class="help-note">Phiên học cũ chỉ lưu tổng điểm, chưa có chi tiết từng câu. Các phiên học mới sẽ lưu câu hỏi, đáp án và câu trả lời.</p>'}</div>${listPagination(results.length, 'session-detail')}`,
      'session-detail',
    );
    element('modal-root')
      .querySelector('.modal')!
      .classList.add('session-detail-modal');
    element('modal-root').querySelector('.modal-actions')!.innerHTML =
      `<button type="button" class="btn danger" data-delete-session="${esc(sessionId)}">${ico('trash', 15)} Xóa phiên học</button><button type="button" class="btn outline" data-action="close-modal">Đóng</button>`;
  }
  function initStudy(
    deckId: string,
    mode: StudyMode,
    options?: {
      count: number;
      order: 'ordered' | 'random';
      testType: 'mixed' | 'mc' | 'write';
      memoryFilter?: MemoryFilter;
      multipleChoice?: boolean;
      multipleWrite?: boolean;
    },
  ) {
    cancelAdvance();
    listPages['test-results'] = 1;
    if (matchTimer) {
      clearInterval(matchTimer);
      matchTimer = null;
    }
    let pool =
      deckId === 'all'
        ? allItems()
        : getDeck(deckId)?.cards.map((c) => ({
            deckId,
            cardId: c.id,
            tries: 0,
          })) || [];
    if (mode === 'review')
      pool = pool.filter((p) => due(getCard(p.deckId, p.cardId)));
    if (options?.memoryFilter)
      pool = pool.filter((item) =>
        matchesMemoryFilter(
          getCard(item.deckId, item.cardId),
          options.memoryFilter!,
        ),
      );
    if (mode === 'match' || options?.order === 'random') pool = shuffle(pool);
    if (options) pool = pool.slice(0, options.count);
    const s: Study = {
      started: !!options,
      flashRated: [],
      remembered: Object.fromEntries(
        pool.map((p) => [
          JSON.stringify([p.deckId, p.cardId]),
          getCard(p.deckId, p.cardId)?.remembered ?? false,
        ]),
      ),
      queue: [],
      questions: [],
      pairs: [],
      tiles: [],
      endTime: 0,
      deckId,
      mode,
      pool,
      index: 0,
      testAnswers: [],
      testConfirmed: [],
      flipped: false,
      feedback: null,
      choices: null,
      correct: 0,
      answers: 0,
      saved: false,
      finished: false,
      matchChosen: [],
      matchSolved: [],
      matchWrong: [],
      matchWrongTimer: false,
      startTime: Date.now(),
    };
    if (mode === 'learn' || mode === 'write')
      s.queue = pool.map((p) => ({ ...p, tries: 0 }));
    if (mode === 'test' && options) {
      s.questions = pool.map((p, i) => {
        const card = getCard(p.deckId, p.cardId)!;
        const type =
          options.testType === 'write'
            ? 'write'
            : options.testType === 'mc'
              ? 'mc'
              : i % 2 === 1
                ? 'write'
                : 'mc';
        const multiple = !!(type === 'mc'
          ? options.multipleChoice
          : options.multipleWrite);
        const choices = makeChoices(p, deckId);
        return {
          item: p,
          type,
          multiple,
          choices:
            multiple && type === 'mc'
              ? shuffle([
                  ...cardDefinitions(card),
                  ...choices.filter((choice) => !isDefinition(card, choice)),
                ])
              : choices,
        };
      });
    }
    if (mode === 'match' && options) {
      s.pairs = pool;
      s.tiles = shuffle(
        s.pairs.flatMap((p, i) => [
          {
            uid: `a${i}`,
            pair: i,
            kind: 'front',
            text: getCard(p.deckId, p.cardId)?.front || '',
          },
          {
            uid: `b${i}`,
            pair: i,
            kind: 'back',
            text: shuffle(cardDefinitions(getCard(p.deckId, p.cardId)!))[0],
          },
        ]),
      );
    }
    ui.study = s;
  }
  function makeChoices(item: Item, deckId: string) {
    const card = getCard(item.deckId, item.cardId);
    if (!card) return [];
    const candidates =
      deckId === 'all'
        ? data.decks.flatMap((deck) => deck.cards)
        : (getDeck(deckId)?.cards ?? []);
    return definitionChoices(card, candidates);
  }
  function modeTitle(m: StudyMode) {
    return (
      {
        flashcards: 'Thẻ ghi nhớ',
        learn: 'Trắc nghiệm',
        write: 'Viết · Tự trả lời',
        test: 'Kiểm tra',
        match: 'Ghép cặp',
        review: 'Ôn tập cách quãng',
      }[m] || m
    );
  }
  function studyTop(s: Study, index: number, total: number) {
    const d = getDeck(s.deckId);
    return `<div class="study-top"><button class="btn outline study-back" data-action="study-exit" >${ico('back', 18)} <span>${s.deckId === 'all' ? 'Quay về ôn tập' : 'Quay về học phần'}</span></button><div class="study-heading"><h1>${modeTitle(s.mode)}</h1><span class="study-deck-name" ${d ? 'data-user-content' : ''}>${esc(d?.title || 'Tất cả học phần')}</span></div><span class="study-clock">${ico('clock', 16)} <strong data-study-time data-user-content>${formatTime(Math.max(0, Math.floor(((s.endTime || Date.now()) - s.startTime) / 1000)))}</strong></span><div class="study-counter">${s.mode === 'test' ? `${index} / ${total} câu đã xác nhận` : `${total ? clamp(index + 1, 1, total) : 0} / ${total} thẻ`}</div></div><div class="study-progress"><span style="width:${total ? Math.round((index / total) * 100) : 0}%"></span></div>`;
  }
  function currentItem(s: Study) {
    return s.mode === 'learn' || s.mode === 'write'
      ? s.queue[s.index]
      : s.pool[s.index];
  }
  function renderStudy() {
    const s = ui.study;
    if (!s) return '<div class="empty">Không thể tải phiên học.</div>';
    if (s.finished) return renderFinished(s);
    if (!s.pool.length)
      return `<div class="study-area">${studyTop(s, 0, 0)}<div class="empty"><span class="empty-icon">🌿</span><h3>${s.mode === 'review' ? 'Không có thẻ đến hạn' : 'Học phần chưa có thẻ'}</h3><p>${s.mode === 'review' ? 'Các thẻ trong học phần đã được lên lịch ôn vào lúc khác.' : 'Hãy thêm một vài thẻ để bắt đầu.'}</p><button class="btn primary" data-action="study-exit">${ico('back', 16)} Quay về học phần</button></div></div>`;
    switch (s.mode) {
      case 'flashcards':
      case 'review':
        return renderFlash(s);
      case 'learn':
        return renderLearn(s);
      case 'write':
        return renderWrite(s);
      case 'test':
        return renderTest(s);
      case 'match':
        return renderMatch(s);
      default:
        return '';
    }
  }
  function renderFlash(s: Study) {
    const p = s.pool[s.index];
    if (!p) {
      s.finished = true;
      s.endTime = Date.now();
      trackSession();
      return renderFinished(s);
    }
    const c = getCard(p.deckId, p.cardId);
    if (!c) return '';
    const n = s.pool.length;
    const remembered = !!s.remembered[JSON.stringify([p.deckId, p.cardId])];
    const status = `<div class="flash-card-tools">${['flashcards', 'review'].includes(s.mode) ? `<label class="memory-toggle ${remembered ? 'is-remembered' : ''}"><input type="checkbox" data-remembered ${remembered ? 'checked' : ''}><span>${remembered ? ico('check', 16) : ''}${remembered ? 'đã nhớ' : 'chưa nhớ'}</span></label>` : ''}<div class="flash-mastery">${cardMasteryMarkup(c, s.flashRated.includes(JSON.stringify([p.deckId, p.cardId])) && !s.saved)}</div><div class="flash-secondary-actions"><button type="button" class="icon-button star-toggle ${c.starred ? 'is-starred' : ''}" data-study-star aria-pressed="${!!c.starred}" aria-label="${c.starred ? 'Bỏ dấu sao' : 'Đánh dấu sao'}" title="${c.starred ? 'Bỏ dấu sao' : 'Đánh dấu sao'}">${ico('star', 22)}</button><button type="button" class="icon-button flash-edit" data-study-edit aria-label="Sửa thẻ" title="Sửa thẻ">${ico('pencil', 20)}</button></div></div>`;
    return `<div class="study-area">${studyTop(s, s.index, n)}<div class="flash-card-shell">${status}<div class="flip-card ${s.flipped ? 'flipped' : ''}" tabindex="0" role="button" aria-label="Lật thẻ" data-action="flip"><div class="flip-inner"><div class="flip-face"><span class="flip-side">MẶT TRƯỚC · THUẬT NGỮ</span><div class="flip-answer">${esc(c.front)}</div>${c.image ? `<img class="vocabulary-image" src="${esc(c.image)}" alt="${esc(c.front)}">` : ''}${c.pronunciation ? `<div class="flash-pronunciation" data-user-content>${esc(c.pronunciation)}</div>` : ''}<span class="flip-hint">${ico('repeat', 13)} Nhấn vào thẻ hoặc phím Space để lật</span></div><div class="flip-face flip-back"><span class="flip-side">MẶT SAU · ĐỊNH NGHĨA</span><div class="flip-answer">${cardSenses(
      c,
    )
      .map(
        (sense) =>
          `<p data-user-content>${sense.partOfSpeech ? `<small class="sense-part" data-part-of-speech="${esc(sense.partOfSpeech)}">${esc(formatPartOfSpeech(sense.partOfSpeech))}</small> ` : ''}${esc(sense.meaning)}</p>`,
      )
      .join(
        '',
      )}</div><span class="flip-hint">Bạn đã nhớ nội dung này chưa?</span></div></div></div></div>
 ${c.notes ? `<details class="flash-notes"><summary>Ghi chú</summary><p data-user-content>${esc(c.notes)}</p></details>` : ''}<div class="study-controls"><div class="nav-controls"><button class="btn outline" data-action="prev" ${s.index === 0 ? 'disabled' : ''}>${ico('back', 15)} Trước</button><button class="btn outline" data-action="next">Tiếp ${ico('arrow', 15)}</button></div><div class="answer-controls"><button type="button" class="btn outline flash-speak" data-speak="${esc(c.front)}" data-speech-language="${esc(c.speechLanguage || 'en-US')}" aria-label="Nghe phát âm" aria-keyshortcuts="3" title="Nghe phát âm (3)">${ico('volume', 20)} Nghe</button><button class="btn orange" data-outcome="false">${ico('repeat', 16)} Chưa nhớ</button><button class="btn green" data-outcome="true">${ico('check', 16)} Đã nhớ</button></div></div><div class="keyboard-hint"><kbd>Space</kbd> Lật thẻ · <kbd>←</kbd> <kbd>→</kbd> Chuyển thẻ · <kbd>1</kbd> Chưa nhớ · <kbd>2</kbd> Đã nhớ · <kbd>3</kbd> Nghe</div></div>`;
  }
  function renderLearn(s: Study) {
    const n = s.queue.length;
    if (s.index >= n) {
      s.finished = true;
      s.endTime = Date.now();
      trackSession();
      return renderFinished(s);
    }
    const p = currentItem(s),
      c = getCard(p.deckId, p.cardId);
    if (!c) return '';
    if (!s.choices) s.choices = makeChoices(p, s.deckId);
    return `<div class="study-area">${studyTop(s, s.index, n)}<div class="question-panel"><div class="question-heading"><span class="question-badge">${ico('bolt', 14)} TRẮC NGHIỆM</span><p>Chọn định nghĩa đúng cho thuật ngữ</p>${cardMasteryMarkup(c)}</div><div class="question-text">${esc(c.front)}</div>${s.feedback ? `<div class="question-footer"><span id="auto-next" role="status"></span><button class="btn primary" data-action="question-next">Tiếp tục ${ico('arrow', 15)}</button></div>` : ''}<div class="choice-grid">${s.choices
      .map((answer, i) => {
        const selected = s.feedback?.selected === i;
        const correct = isDefinition(c, answer);
        const cls = s.feedback
          ? correct
            ? 'correct'
            : selected
              ? 'wrong'
              : ''
          : '';
        return `<button type="button" class="choice ${cls}" data-choice="${i}" ${s.feedback ? 'disabled' : ''}><span class="choice-index">${String.fromCharCode(65 + i)}</span><span>${esc(answer)}</span></button>`;
      })
      .join(
        '',
      )}</div>${s.feedback ? `<div class="feedback ${s.feedback.ok ? '' : 'bad'}">${s.feedback.ok ? '✓ Chính xác!' : '✕ Chưa đúng, hãy thử nhớ lại.'}<small>Đáp án: ${esc(s.choices?.find((answer) => isDefinition(c, answer)) ?? c.back)}</small></div>` : ''}</div><div class="keyboard-hint">${s.feedback ? 'Nhấn Enter để tiếp tục.' : 'Chọn một đáp án để kiểm tra kiến thức.'}</div></div>`;
  }
  function renderWrite(s: Study) {
    const n = s.queue.length;
    if (s.index >= n) {
      s.finished = true;
      s.endTime = Date.now();
      trackSession();
      return renderFinished(s);
    }
    const response = ((s.writeResponses ??= {})[s.index] ??= { answer: '' });
    s.feedback = response.feedback ?? null;
    const p = currentItem(s),
      c = getCard(p.deckId, p.cardId);
    if (!c) return '';
    return `<div class="study-area">${studyTop(s, s.index, n)}<div class="question-panel"><div class="question-heading"><span class="question-badge">${ico('pen', 14)} VIẾT</span><p>Nhập định nghĩa hoặc ý nghĩa của thuật ngữ</p>${cardMasteryMarkup(c)}</div><div class="question-text">${esc(c.front)}</div><form novalidate id="write-form" autocomplete="off"><input id="write-input" value="${esc(response.answer)}" class="write-answer" placeholder="Nhập câu trả lời của bạn..." ${s.feedback ? 'disabled' : ''} maxlength="4000" required/><details class="study-help"><summary>Cách chấm đáp án</summary><p class="help-note">Chấm đúng khi nội dung trùng khớp (không phân biệt chữ hoa/thường và khoảng trắng). Cách diễn đạt khác có thể bị đánh sai.</p></details>${s.feedback ? `<div class="feedback ${s.feedback.ok ? '' : 'bad'}">${s.feedback.ok ? '✓ Chính xác!' : '✕ Chưa khớp với đáp án đã lưu.'}<small>Đáp án gợi ý: ${esc(c.back)}</small></div>` : ''}<div class="write-actions"><button type="button" class="btn outline" data-action="reveal-answer" ${s.feedback ? 'disabled' : ''}>Hiện đáp án</button>${s.feedback ? `<button class="btn primary" type="button" data-action="question-next">Tiếp tục ${ico('arrow', 15)}</button>` : `<button class="btn primary" type="submit">Kiểm tra đáp án ${ico('check', 15)}</button>`}</div><div class="write-navigation"><button type="button" class="btn outline" data-action="write-prev" aria-keyshortcuts="Alt+1" ${s.index === 0 ? 'disabled' : ''}>${ico('back', 16)} Câu trước <kbd>Alt+1</kbd></button><button type="button" class="btn outline" data-action="write-next" aria-keyshortcuts="Alt+2" ${s.index >= n - 1 ? 'disabled' : ''}>Câu sau ${ico('arrow', 16)} <kbd>Alt+2</kbd></button></div><p class="keyboard-hint">Alt+1 / Alt+2 chuyển câu khi đang gõ; ngoài ô nhập có thể dùng 1 / 2 hoặc ← / →. Enter kiểm tra đáp án.</p></form></div></div>`;
  }
  function testWriteFields(index: number, values: string[]) {
    return values
      .map(
        (value, row) =>
          `<div class="test-write-row"><input aria-label="Đáp án câu ${index + 1}" class="test-input" data-question-index="${index}" data-write-row="${row}" name="answer-${index}-${row}" value="${esc(value)}" placeholder="Nhập đáp án" maxlength="4000" autocomplete="off">${values.length > 1 ? `<button type="button" class="icon-button" data-test-remove-answer="${index}" data-answer-row="${row}" aria-label="Xóa ô đáp án">×</button>` : ''}</div>`,
      )
      .join('');
  }
  function hasTestAnswer(s: Study, index: number) {
    if (!s.questions[index]?.multiple) return !!s.testAnswers[index]?.trim();
    const answers = s.testMultiAnswers?.[index] ?? [];
    return answers.length > 0 && answers.every((answer) => !!answer.trim());
  }
  function renderTest(s: Study) {
    const answered = s.testConfirmed?.filter(Boolean).length ?? 0;
    return `<div class="study-area test-study-area"><div class="test-sticky-header">${studyTop(s, answered, s.questions.length)}</div><div class="test-layout"><aside class="test-sidebar"><h2>Danh sách câu hỏi</h2><div class="test-clock"><strong id="test-time">${formatTime(Math.floor((Date.now() - s.startTime) / 1000))}</strong></div><div class="test-question-grid">${s.questions.map((_, i) => `<button type="button" class="test-jump ${s.testConfirmed?.[i] ? 'answered' : ''}" data-test-jump="${i}">${i + 1}</button>`).join('')}</div><p id="test-answered">${answered} / ${s.questions.length} câu đã xác nhận</p><button type="button" class="btn primary" data-action="test-submit">Nộp bài</button></aside><form id="test-form" class="test-all-questions"><p class="help-note">Xác nhận từng câu trước khi nộp bài. Sửa đáp án sẽ bỏ xác nhận của câu đó.</p><p id="test-submit-error" class="test-submit-error" role="alert" hidden></p>${s.questions
      .map((q, i) => {
        const c = getCard(q.item.deckId, q.item.cardId);
        if (!c) return '';
        const answer = s.testAnswers[i] ?? '';
        return `<section id="test-question-${i}" class="question-panel test-question"><div class="question-heading"><p class="question-label">CÂU ${i + 1} · ${q.type === 'write' ? (q.multiple ? 'ĐIỀN NHIỀU ĐÁP ÁN' : 'TỰ LUẬN') : q.multiple ? 'CÂU NHIỀU LỰA CHỌN' : 'CHỌN MỘT ĐÁP ÁN'}</p></div><h3 class="test-question-title" data-user-content>${esc(c.front)}</h3>${q.type === 'write' ? (q.multiple ? `<div data-test-write-fields="${i}">${testWriteFields(i, s.testMultiAnswers?.[i] ?? [''])}</div><button type="button" class="create-button test-add-answer" data-test-add-answer="${i}" aria-label="Thêm ô đáp án" title="Thêm ô đáp án">+</button><p class="help-note">Mỗi ô một nghĩa, điền đủ các nghĩa khác nhau.</p>` : `<input aria-label="Đáp án câu ${i + 1}" class="test-input" data-question-index="${i}" name="answer-${i}" value="${esc(answer)}" placeholder="Nhập đáp án" maxlength="4000" autocomplete="off">`) : `<div class="test-options">${q.choices.map((text, j) => `<label class="test-option"><input type="${q.multiple ? 'checkbox' : 'radio'}" data-question-index="${i}" name="answer-${i}" value="${j}" ${(q.multiple ? s.testMultiAnswers?.[i]?.includes(String(j)) : answer === String(j)) ? 'checked' : ''}><span data-user-content>${esc(text)}</span></label>`).join('')}</div>`}<div class="test-confirm-row"><button type="button" class="btn ${s.testConfirmed?.[i] ? 'outline' : 'primary'}" data-test-confirm="${i}" aria-pressed="${!!s.testConfirmed?.[i]}">${s.testConfirmed?.[i] ? 'Bỏ xác nhận' : 'Xác nhận'}</button><span class="test-confirm-status">${s.testConfirmed?.[i] ? 'Đã xác nhận' : 'Chưa xác nhận'}</span></div></section>`;
      })
      .join(
        '',
      )}<button type="button" class="btn primary" data-action="test-submit">Nộp bài</button></form></div></div>`;
  }
  function advanceTest(submit = false) {
    const s = ui.study;
    if (!s || s.mode !== 'test' || s.finished) return;
    cancelAdvance();
    if (!submit && s.index < s.questions.length - 1) {
      s.index++;
      render();
      return;
    }
    const missing = s.questions
      .map((_, i) => i)
      .filter((i) => !s.testConfirmed?.[i] || !hasTestAnswer(s, i));
    if (missing.length) {
      const error = element('test-submit-error');
      error.hidden = false;
      error.textContent = `Chưa thể nộp bài. Cần trả lời và xác nhận các câu: ${missing.map((i) => i + 1).join(', ')}.`;
      const first = document.getElementById(`test-question-${missing[0]}`);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      first
        ?.querySelector<HTMLElement>('input')
        ?.focus({ preventScroll: true });
      translatePage();
      return;
    }
    s.testResults = s.questions.map((q, i) => {
      const c = getCard(q.item.deckId, q.item.cardId)!;
      const answer = s.testAnswers[i] ?? '';
      const supplied = q.multiple ? (s.testMultiAnswers?.[i] ?? []) : [answer];
      const meanings =
        q.type === 'write'
          ? supplied
          : supplied.map((value) => q.choices[Number(value)] ?? '');
      const userAnswer = meanings.join(' ; ');
      const ok = gradeTestMeanings(c, meanings, !!q.multiple);
      const expected =
        q.type === 'write' || q.multiple
          ? cardDefinitions(c).join(' ; ')
          : (q.choices.find((choice) => isDefinition(c, choice)) ?? c.back);
      recordOutcome(
        q.item.deckId,
        q.item.cardId,
        ok,
        'test',
        userAnswer,
        expected,
      );
      return {
        front: c.front,
        correctAnswer: expected,
        userAnswer,
        ok,
      };
    });
    finishStudy();
  }
  function renderMatch(s: Study) {
    const solved = s.matchSolved.length;
    const elapsed = Math.floor((Date.now() - s.startTime) / 1000);
    return `<div class="study-area">${studyTop(s, solved, s.pairs.length)}<div class="match-toolbar"><span>${ico('link', 17)} Đã ghép <strong>${solved} / ${s.pairs.length}</strong> cặp · Đúng ${s.answers ? Math.round((s.correct / s.answers) * 100) : 0}% (${s.correct}/${s.answers} lượt)</span><span>${ico('clock', 17)} Thời gian <strong id="match-time">${formatTime(elapsed)}</strong></span></div><div class="match-grid">${s.tiles
      .map((tile) => {
        const cls = s.matchSolved.includes(tile.pair)
          ? 'matched'
          : s.matchChosen.includes(tile.uid)
            ? 'selected'
            : s.matchWrong.includes(tile.uid)
              ? 'shake'
              : '';
        return `<div class="match-cell"><button type="button" class="match-item ${cls}" data-tile="${tile.uid}" ${s.matchSolved.includes(tile.pair) || s.matchWrongTimer ? 'disabled' : ''}><span data-user-content>${esc(tile.text)}</span></button></div>`;
      })
      .join(
        '',
      )}</div><p class="match-info">Nhấn một thuật ngữ và định nghĩa tương ứng. Cố gắng ghép tất cả trong thời gian ngắn nhất!</p></div>`;
  }
  function formatTime(s: number) {
    return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  }
  function renderFinished(s: Study) {
    const total = ['flashcards', 'review'].includes(s.mode)
        ? s.pool.length
        : s.answers,
      percentage = total ? Math.round((s.correct / total) * 100) : 0;
    let text = '';
    if (['flashcards', 'review'].includes(s.mode)) {
      text = `${s.correct} từ đã nhớ · ${total - s.correct} từ chưa nhớ · ${percentage}% đã nhớ`;
    } else if (s.mode === 'match') {
      text = `Hoàn thành ${s.pairs.length} cặp · ${s.correct}/${total} lượt ghép đúng · ${total - s.correct} lượt sai`;
    } else
      text = `Đã trả lời ${total} lượt · ${s.correct} đúng · ${total - s.correct} chưa đúng`;

    return `<div class="study-area">${studyTop(s, total, total)}<div class="result-banner"><span class="result-emoji">${percentage >= runtimeConfig.study.completionPercent ? '🏆' : percentage >= 50 ? '🎉' : '🌱'}</span><span class="eyebrow">PHIÊN HỌC HOÀN THÀNH</span><h2>Bạn đã hoàn thành!</h2><div class="result-score">${percentage}%</div><p>${text}</p><p class="result-time"><span>Thời gian</span>: <strong data-user-content>${formatTime(Math.max(0, Math.floor((s.endTime - s.startTime) / 1000)))}</strong></p><div class="result-actions"><button class="btn outline" data-action="study-exit">${ico('back', 16)} Về học phần</button><button class="btn primary" data-action="retry-study">${ico('repeat', 16)} Học lại</button></div></div>${
      s.testResults
        ? `<details class="result-review"><summary>Chi tiết đáp án (${s.testResults.length} câu)</summary>${pageRows(
            s.testResults,
            'test-results',
          )
            .map((r, i) => {
              const index =
                ((listPages['test-results'] || 1) - 1) * pageSize + i;
              return `<div class="review-row"><div><strong>${index + 1}. ${esc(r.front)}</strong><p>Bạn trả lời: ${esc(r.userAnswer || '(bỏ trống)')}</p><p>Đáp án: ${esc(r.correctAnswer)}</p></div><span class="${r.ok ? 'correct-label' : 'wrong-label'}">${r.ok ? '✓ Đúng' : '✕ Sai'}</span></div>`;
            })
            .join(
              '',
            )}${listPagination(s.testResults.length, 'test-results')}</details>`
        : ''
    }</div>`;
  }
  function finishStudy() {
    const s = ui.study;
    if (!s || s.finished) return;
    cancelAdvance();
    if (['flashcards', 'review'].includes(s.mode)) {
      s.answers = s.pool.length;
      s.correct = s.pool.filter(
        (p) => s.remembered[JSON.stringify([p.deckId, p.cardId])],
      ).length;
    }
    audio.effect(
      s.answers &&
        (s.correct / s.answers) * 100 >= runtimeConfig.study.completionPercent
        ? 'completed'
        : 'keep-trying',
    );
    s.finished = true;
    s.endTime = Date.now();
    if (matchTimer) {
      clearInterval(matchTimer);
      matchTimer = null;
    }
    trackSession();
    render();
  }
  function moveWriteQuestion(direction: number) {
    const s = ui.study;
    if (!s || s.mode !== 'write' || s.finished) return;
    const next = clamp(s.index + direction, 0, s.queue.length - 1);
    if (next === s.index) return;
    cancelAdvance();
    s.index = next;
    s.feedback = s.writeResponses?.[next]?.feedback ?? null;
    render();
  }
  function nextQuestion() {
    cancelAdvance();
    const s = ui.study;
    if (!s || !s.feedback || s.finished) return;
    if (s.mode === 'write') {
      const next = s.index + 1;
      const unanswered = s.queue.findIndex(
        (_, index) => !s.writeResponses?.[index]?.feedback,
      );
      if (unanswered < 0) {
        finishStudy();
        return;
      }
      s.index = next < s.queue.length ? next : unanswered;
      s.feedback = s.writeResponses?.[s.index]?.feedback ?? null;
      render();
      return;
    }
    s.index++;
    s.feedback = null;
    s.choices = null;
    if (s.index >= (s.queue?.length || 0)) finishStudy();
    else render();
  }
  function setRemembered(value: boolean) {
    const s = ui.study;
    if (!s || s.finished || !['flashcards', 'review'].includes(s.mode)) return;
    const p = currentItem(s),
      c = getCard(p.deckId, p.cardId);
    if (!c) return;
    s.remembered[JSON.stringify([p.deckId, p.cardId])] = value;
    c.remembered = value;
    const key = JSON.stringify([p.deckId, p.cardId]);
    if (!s.flashRated.includes(key)) s.flashRated.push(key);
    audio.effect(value ? 'correct' : 'incorrect');
    save();
  }
  document.addEventListener('change', (event) => {
    if (
      event.target instanceof HTMLInputElement &&
      event.target.matches('[data-remembered]')
    ) {
      setRemembered(event.target.checked);
      render();
    }
  });
  function moveCard(dir: number) {
    const s = ui.study;
    if (!s) return;
    const n = s.pool.length;
    const next = s.index + dir;
    if (next >= n) {
      finishStudy();
      return;
    }
    if (next < 0 || s.finished) return;
    audio.effect('swipe');
    s.index = clamp(next, 0, n - 1);
    s.flipped = false;
    render();
    document
      .querySelector('.flip-card')
      ?.classList.add(dir > 0 ? 'card-enter-next' : 'card-enter-prev');
  }
  let releaseFormModal: (() => void) | undefined;
  function modal(
    title: string,
    subtitle: string,
    body: string,
    formAction: string,
  ) {
    releaseFormModal?.();
    element('modal-root').innerHTML =
      `<div class="modal-overlay" data-action="overlay"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><div class="modal-head"><div><h2 id="modal-title">${esc(title)}</h2><p>${esc(subtitle)}</p></div><button class="icon-button" aria-label="Đóng hộp thoại" data-action="close-modal">${ico('close', 19)}</button></div><form novalidate id="modal-form" data-form="${esc(formAction)}">${body}<div class="modal-actions"><button type="button" class="btn outline" data-action="close-modal">Hủy</button><button type="submit" class="btn primary">${ico('check', 15)} Lưu lại</button></div></form></div></div>`;
    releaseFormModal = activateModal(
      element('modal-root').querySelector<HTMLElement>('.modal')!,
      closeModal,
    );
    document
      .querySelector<HTMLInputElement | HTMLTextAreaElement>(
        '#modal-form input:not([type=hidden]), #modal-form textarea',
      )
      ?.focus();
  }
  function closeModal() {
    if (pendingSetup) closeStudySetup();
    element('modal-root').innerHTML = '';
    releaseFormModal?.();
    releaseFormModal = undefined;
  }
  let deckColor: Deck['color'] = 'purple';
  let readDeckColor: (() => string | undefined) | undefined;
  function deckModal(edit = false) {
    const d = edit ? getDeck(ui.deckId) : null;
    deckColor = d?.color || 'purple';
    const body = `<div class="class-form-bottom deck-form-layout"><div class="deck-form-fields"><div class="form-field"><label for="deck-title">Tên học phần *</label><input id="deck-title" maxlength="120" required value="${esc(d?.title || '')}" placeholder="Ví dụ: English for IT" /></div><div class="form-field"><label for="deck-description">Mô tả</label><textarea id="deck-description" maxlength="500" placeholder="Học phần này chứa nội dung gì?">${esc(d?.description || '')}</textarea></div></div><div class="class-form-color deck-form-color">${colorPickerMarkup(deckColor)}</div></div>`;
    modal(
      edit ? 'Chỉnh sửa học phần' : 'Tạo học phần mới',
      'Sắp xếp kiến thức của bạn thành từng bộ thẻ.',
      body,
      edit ? 'edit-deck' : 'create-deck',
    );
    element('modal-root')
      .querySelector('.modal')!
      .classList.add('class-modal', 'deck-modal');
    readDeckColor = bindColorPicker(element('modal-root'), deckColor);
  }
  function sensePartOptions(selected = '') {
    return `<option value="">Chưa chọn</option>${partOptions.map(([value, label], i) => `${i === 0 ? '<optgroup label="8 từ loại truyền thống">' : i === 8 ? '</optgroup><optgroup label="Nhóm thường tách riêng và nhóm chức năng">' : ''}<option value="${value}" ${selected === value ? 'selected' : ''}>${label}</option>`).join('')}</optgroup>${selected && !partOptions.some(([value]) => value === selected) ? `<option selected value="${esc(selected)}">${esc(selected)}</option>` : ''}`;
  }
  function definitionField(
    value: NonNullable<Card['definitions']>[number] = '',
    legacyPart = '',
  ) {
    const sense =
      typeof value === 'string'
        ? { meaning: value, partOfSpeech: legacyPart }
        : value;
    return `<div class="definition-row form-field" data-definition-row><label>Từ loại<select data-definition-part="${esc(sense.partOfSpeech ?? '')}">${sensePartOptions(sense.partOfSpeech)}</select></label><label>Nghĩa<textarea data-definition maxlength="4000" rows="2" aria-label="Định nghĩa" required>${esc(sense.meaning)}</textarea></label><button type="button" class="icon-button" data-remove-definition aria-label="Xóa định nghĩa">${ico('trash', 16)}</button></div>`;
  }
  function cardModal(cardId?: string, deckId = ui.deckId) {
    const d = getDeck(deckId);
    if (!d) return;
    const c = cardId ? getCard(d.id, cardId) : null;
    const body = `<input type="hidden" id="card-deck-id" value="${esc(d.id)}"><input type="hidden" id="card-id" value="${esc(c?.id || '')}">
      <div class="card-editor-flow">
        <div class="form-field" data-card-field="term"><label for="card-front">Thuật ngữ <span class="field-required">*</span></label><textarea id="card-front" required maxlength="4000" rows="2" placeholder="Từ hoặc câu hỏi">${esc(c?.front || '')}</textarea></div>
        <section class="card-definitions-field" data-card-field="definitions" aria-labelledby="card-definitions-title">
          <div class="section-heading"><h3 id="card-definitions-title">Định nghĩa <span class="field-required">*</span></h3>${createButton('Thêm định nghĩa', 'data-add-definition')}</div>
          <div class="card-parts-help"><a class="section-link help-link" data-help-link href="#/docs/parts" target="_blank" rel="noopener" title="Mở hướng dẫn trong tab mới">Tra cứu từ loại tiếng Anh ↗</a></div>
          <div class="definition-row form-field" data-primary-definition><div class="definition-input"><label for="card-part">Từ loại <span class="optional-label">Tùy chọn</span></label><select id="card-part">${sensePartOptions(c?.partOfSpeech)}</select></div><div class="definition-input"><label for="card-back">Nghĩa <span class="field-required">*</span></label><textarea id="card-back" required maxlength="4000" rows="2" placeholder="Nghĩa hoặc đáp án">${esc(c?.back || '')}</textarea></div><span class="definition-remove-placeholder" aria-hidden="true"></span></div>
          <div id="additional-definitions">${(c?.definitions ?? []).map((value) => definitionField(value, c?.partOfSpeech)).join('')}</div>
        </section>
      <section class="card-pronunciation-panel" data-card-field="pronunciation" aria-label="Cách đọc">
        <div class="pronunciation-toolbar"><div><span class="editor-section-title">Cách đọc</span><span class="optional-label">Tùy chọn</span></div><button type="button" class="btn outline speech-preview" data-preview-speech>${ico('volume', 16)} Nghe thử</button></div>
        <div class="pronunciation-fields"><div class="form-field"><label for="card-speech-language">Ngôn ngữ đọc</label><div class="language-select-wrap"><span class="language-select-icon" aria-hidden="true">${ico('volume', 16)}</span><select id="card-speech-language">${speechLanguages.map(([code, label]) => `<option value="${code}" ${(c?.speechLanguage || 'en-US') === code ? 'selected' : ''}>${label}</option>`).join('')}</select><span class="language-select-arrow" aria-hidden="true">${ico('chevron', 16)}</span></div></div>
        <div class="form-field"><label for="card-pronunciation">Phiên âm</label><input id="card-pronunciation" maxlength="500" value="${esc(c?.pronunciation || '')}" autocomplete="off"></div></div>
        <details id="card-ipa"><summary></summary><p id="pronunciation-keyboard-hint" class="help-note"></p><div class="pronunciation-keyboard-groups"></div></details>
        <p class="help-note speech-explanation">Nút nghe đọc mặt trước theo ngôn ngữ đã chọn. Phiên âm dùng để nhìn cách đọc.</p>
      </section>
      <div class="form-field card-notes-field" data-card-field="notes"><label for="card-notes">Ghi chú <span class="optional-label">Tùy chọn</span></label><textarea id="card-notes" maxlength="4000" placeholder="Ví dụ, cách dùng hoặc mẹo ghi nhớ…">${esc(c?.notes || '')}</textarea></div>
      <section class="card-image-panel" data-card-field="image" aria-labelledby="card-image-title">
        <div class="card-section-heading"><span id="card-image-title" class="editor-section-title">Ảnh minh họa</span><span class="optional-label">Tùy chọn</span></div>
        <div class="card-image-upload ${c?.image ? 'has-image' : ''}" id="card-image-upload">
          <img id="card-image-preview" class="vocabulary-image" ${c?.image ? `src="${esc(c.image)}"` : 'hidden'} alt="Ảnh minh họa">
          <label class="card-image-picker" for="card-image-file"><span class="card-upload-icon" aria-hidden="true">${ico('upload', 22)}</span><strong>Chọn ảnh minh họa</strong><span>PNG, JPEG, WebP hoặc GIF</span><input id="card-image-file" type="file" accept="image/png,image/jpeg,image/webp,image/gif"></label>
        </div>
        <input id="card-image" type="hidden" value="${esc(c?.image || '')}">
        <button type="button" id="card-image-remove" class="btn-ghost card-image-remove" ${c?.image ? '' : 'hidden'}>${ico('trash', 14)} Xóa ảnh</button>
      </section></div>`;
    modal(
      c ? 'Sửa thẻ ghi nhớ' : 'Thêm thẻ ghi nhớ',
      `Học phần: ${d.title}`,
      body,
      'save-card',
    );
    element('modal-root').querySelector('.modal')!.classList.add('card-editor');
    if (c)
      element('modal-root')
        .querySelector('.modal-head > div')!
        .insertAdjacentHTML('beforeend', cardMasteryMarkup(c));
    element<HTMLSelectElement>('card-part').value = c?.partOfSpeech ?? '';
    const extraDefinitions = element('additional-definitions');
    extraDefinitions
      .querySelectorAll<HTMLSelectElement>('[data-definition-part]')
      .forEach((select) => {
        select.value = select.dataset.definitionPart ?? '';
      });
    const addDefinition = element(
      'modal-root',
    ).querySelector<HTMLButtonElement>('[data-add-definition]')!;
    const updateDefinitionLimit = () => {
      addDefinition.disabled = extraDefinitions.children.length >= 19;
    };
    addDefinition.onclick = () => {
      if (extraDefinitions.children.length >= 19) return;
      extraDefinitions.insertAdjacentHTML('beforeend', definitionField());
      const newPart =
        extraDefinitions.lastElementChild?.querySelector<HTMLSelectElement>(
          '[data-definition-part]',
        );
      if (newPart) newPart.value = '';
      extraDefinitions.lastElementChild?.querySelector('textarea')?.focus();
      updateDefinitionLimit();
    };
    extraDefinitions.onclick = (event) => {
      const remove = (event.target as Element).closest(
        '[data-remove-definition]',
      );
      if (remove) {
        remove.closest('[data-definition-row]')?.remove();
        updateDefinitionLimit();
      }
    };
    updateDefinitionLimit();
    input('card-image-file').onchange = async () => {
      const file = input('card-image-file').files?.[0];
      if (!file) return;
      if (
        !['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(
          file.type,
        )
      ) {
        toast('Chọn ảnh PNG, JPEG, WebP hoặc GIF hợp lệ.', true);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        input('card-image').value = String(reader.result);
        const preview = element<HTMLImageElement>('card-image-preview');
        preview.src = String(reader.result);
        preview.hidden = false;
        element('card-image-upload').classList.add('has-image');
        element('card-image-remove').hidden = false;
      };
      reader.readAsDataURL(file);
    };
    element('card-image-remove').onclick = () => {
      input('card-image').value = '';
      input('card-image-file').value = '';
      element('card-image-preview').hidden = true;
      element('card-image-upload').classList.remove('has-image');
      element('card-image-remove').hidden = true;
    };
    const updatePronunciationLanguage = () => {
      const language = element<HTMLSelectElement>('card-speech-language').value;
      input('card-pronunciation').placeholder =
        speechLanguages.find(([code]) => code === language)?.[2] ?? '';
      const keyboard = pronunciationKeyboard(language);
      const panel = element<HTMLDetailsElement>('card-ipa');
      panel.querySelector('summary')!.textContent =
        keyboard.title + ' · mở bảng ký tự';
      element('pronunciation-keyboard-hint').textContent = keyboard.hint;
      panel.querySelector('.pronunciation-keyboard-groups')!.innerHTML =
        keyboard.groups
          .map(
            (group) =>
              `<div class="pronunciation-key-group"><span>${esc(group.label)}</span><div class="ipa-keyboard" role="group" aria-label="${esc(group.label)}">${group.symbols.map((symbol) => `<button type="button" data-ipa="${esc(symbol)}" aria-label="Chèn ${esc(symbol)}">${esc(symbol)}</button>`).join('')}</div></div>`,
          )
          .join('');
    };
    element('card-speech-language').addEventListener(
      'change',
      updatePronunciationLanguage,
    );
    updatePronunciationLanguage();
  }
  const toast = notify;
  function download(name: string, text: string | Uint8Array, mime: string) {
    const blob = new Blob(
      [typeof text === 'string' ? text : (text.slice().buffer as ArrayBuffer)],
      { type: mime },
    );
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(u), 1000);
  }
  function exportCsv(format: 'csv' | 'txt' | 'xlsx' = 'csv') {
    const d = getDeck(ui.deckId);
    if (!d) return;
    download(
      `${d.title.replace(/[^\p{L}\p{N}_-]+/gu, '_').slice(0, 50) || 'flashcards'}.${format}`,
      format === 'xlsx' ? vocabularyToXlsx(d.cards) : cardsToCsv(d.cards),
      format === 'xlsx'
        ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        : format === 'txt'
          ? 'text/plain;charset=utf-8'
          : 'text/csv;charset=utf-8',
    );
    document
      .querySelector<HTMLDetailsElement>('.deck-export-menu')
      ?.removeAttribute('open');
    toast(
      format === 'xlsx'
        ? 'Đã xuất Excel học phần.'
        : format === 'txt'
          ? 'Đã xuất text học phần.'
          : 'Đã xuất CSV học phần.',
    );
  }
  function canAddCards(deck: Deck, count: number): boolean {
    if (
      deck.cards.length + count > 10000 ||
      data.decks.reduce((sum, item) => sum + item.cards.length, 0) + count >
        100000
    ) {
      toast('Tối đa 10.000 thẻ mỗi học phần và 100.000 thẻ tổng cộng.', true);
      return false;
    }
    return true;
  }
  let reviewingSingleCard = false;
  async function handleModalForm(type: string | undefined) {
    if (type === 'import-guide') return;
    if (type === 'srs-settings') {
      const parsed = srsPreferencesSchema.safeParse({
        intervals: Array.from({ length: 6 }, (_, i) =>
          Number(input(`srs-interval-${i}`).value),
        ),
        retryMinutes: Number(input('srs-retry').value),
      });
      if (!parsed.success) {
        const error = element('srs-config-error');
        error.textContent =
          'Khoảng cách ôn phải là số nguyên tăng dần từ 1 đến 3650 ngày; thời gian học lại từ 1 đến 10080 phút.';
        error.hidden = false;
        translatePage();
        return;
      }
      data.preferences!.srs = parsed.data;
      if (input('srs-recalculate').checked)
        for (const deck of data.decks)
          for (const card of deck.cards)
            if (card.last && !card.suspended)
              card.due = scheduledDue(card, parsed.data);
      save();
      closeModal();
      render();
      toast('Đã lưu cấu hình ôn tập.');
      return;
    }
    if (type === 'srs-card') {
      const card = getCard(
        input('srs-card-deck').value,
        input('srs-card-id').value,
      );
      const dueAt = new Date(input('srs-card-due').value).getTime();
      const level = Number(element<HTMLSelectElement>('srs-card-level').value);
      if (!card) return;
      if (!Number.isFinite(dueAt) || dueAt < 0) {
        showFieldError(input('srs-card-due'), 'Chọn ngày giờ hợp lệ.');
        return;
      }
      if (card.level !== level)
        card.masteryProgress = { correct: 0, modes: [], testCorrect: 0 };
      card.level = level;
      card.due = dueAt;
      save();
      closeModal();
      render();
      toast('Đã cập nhật lịch ôn thẻ.');
      return;
    }
    if (type === 'import-text') {
      try {
        if (await appendImported(parseDelimited(input('bulk-text').value, ',')))
          closeModal();
      } catch (error) {
        toast(errorMessage(error), true);
      }
      return;
    }
    if (type === 'save-class') {
      const color = readClassColor?.();
      if (!color) return;
      const groupId = input('class-id').value || id();
      const name = input('class-name').value.trim();
      if (
        data.classes?.some(
          (group) => group.id !== groupId && norm(group.name) === norm(name),
        )
      ) {
        showFieldError(input('class-name'), 'Tên lớp học đã tồn tại.');
        return;
      }
      const selectedDeckIds = [
        ...document.querySelectorAll<HTMLInputElement>(
          '[data-class-deck]:checked',
        ),
      ].map((field) => field.value);
      const previousDeckIds =
        data.classes?.find((item) => item.id === groupId)?.deckIds ?? [];
      const orderedDeckIds = [
        ...previousDeckIds.filter((id) => selectedDeckIds.includes(id)),
        ...selectedDeckIds.filter((id) => !previousDeckIds.includes(id)),
      ];
      const group = {
        id: groupId,
        name,
        description: input('class-description').value.trim(),
        color,
        deckIds: orderedDeckIds,
      };
      data.classes ??= [];
      const index = data.classes.findIndex((item) => item.id === groupId);
      if (index < 0) data.classes.push(group);
      else data.classes[index] = group;
      save();
      closeModal();
      go('classes', groupId);
      toast('Đã lưu lớp học.');
      return;
    }
    const title = type === 'save-card' ? '' : input('deck-title').value.trim();
    if (type === 'create-deck' || type === 'edit-deck') {
      const color = readDeckColor?.();
      if (!color) return;
      deckColor = color;
    }
    if (type === 'create-deck') {
      if (data.decks.length >= 500) {
        toast('Tối đa 500 học phần.', true);
        return;
      }
      if (!title) {
        toast('Cần nhập tên học phần.', true);
        return;
      }
      const d = {
        id: id(),
        title,
        description: input('deck-description').value.trim(),
        color: deckColor,
        created: Date.now(),
        cards: [],
      };
      data.decks.unshift(d);
      ui.deckFilter = '';
      cardPage = 1;
      save();
      closeModal();
      go('deck', d.id);
      toast('Đã tạo học phần mới!');
    } else if (type === 'edit-deck') {
      const d = getDeck(ui.deckId);
      if (!d) return;
      d.title = title;
      d.description = input('deck-description').value.trim();
      d.color = deckColor;
      save();
      closeModal();
      render();
      toast('Đã cập nhật học phần.');
    } else if (type === 'save-card') {
      if (reviewingSingleCard) return;
      let singleCardMessage = '';
      const d = getDeck(input('card-deck-id').value),
        front = input('card-front').value.trim(),
        back = input('card-back').value.trim();
      if (!d || !front || !back) {
        toast('Cần nhập đủ hai mặt của thẻ.', true);
        return;
      }
      const cardId = input('card-id').value;
      if (
        cardId &&
        d.cards.some(
          (card) =>
            card.id !== cardId &&
            normalizeTerm(card.front) === normalizeTerm(front),
        )
      ) {
        showFieldError(
          input('card-front'),
          'Thuật ngữ này đã có trong học phần. Hãy nhập thuật ngữ khác.',
        );
        return;
      }
      const definitions = [
        ...document.querySelectorAll<HTMLElement>('[data-definition-row]'),
      ]
        .map((row) => ({
          meaning: row
            .querySelector<HTMLTextAreaElement>('[data-definition]')!
            .value.trim(),
          partOfSpeech: row.querySelector<HTMLSelectElement>(
            '[data-definition-part]',
          )!.value,
        }))
        .filter((sense) => sense.meaning);
      const partOfSpeech = element<HTMLSelectElement>('card-part').value;
      const image = input('card-image').value || undefined;
      const pronunciation = input('card-pronunciation').value.trim();
      const notes = input('card-notes').value.trim();
      const speechLanguage = element<HTMLSelectElement>('card-speech-language')
        .value as NonNullable<Card['speechLanguage']>;
      const existing = cardId ? getCard(d.id, cardId) : null;
      if (existing) {
        existing.front = front;
        existing.back = back;
        existing.definitions = definitions;
        existing.partOfSpeech = partOfSpeech;
        existing.image = image;
        existing.pronunciation = pronunciation;
        existing.notes = notes;
        existing.speechLanguage = speechLanguage;
      } else {
        const incoming = cardSchema.parse({
          id: id(),
          front,
          back,
          definitions,
          pronunciation,
          partOfSpeech,
          image,
          notes,
          speechLanguage,
        });
        const duplicate = d.cards.some(
          (card) => normalizeTerm(card.front) === normalizeTerm(front),
        );
        if (duplicate) {
          reviewingSingleCard = true;
          let reviewed: Awaited<ReturnType<typeof reviewImportedCards>>;
          try {
            reviewed = await reviewImportedCards(d.cards, [incoming]);
          } finally {
            reviewingSingleCard = false;
          }
          if (
            !reviewed ||
            (!reviewed.added && !reviewed.replaced && !reviewed.merged)
          )
            return;
          if (!canAddCards(d, reviewed.cards.length - d.cards.length)) return;
          d.cards = reviewed.cards;
          singleCardMessage = reviewed.merged
            ? 'Đã bổ sung nghĩa vào thẻ.'
            : reviewed.replaced
              ? 'Đã ghi đè thẻ.'
              : 'Đã thêm thẻ mới.';
        } else {
          if (!canAddCards(d, 1)) return;
          d.cards.push(incoming);
        }
      }
      save();
      closeModal();
      ui.deckFilter = '';
      cardPage = 1;
      render();
      toast(
        singleCardMessage || (existing ? 'Đã sửa thẻ.' : 'Đã thêm thẻ mới.'),
      );
    }
  }
  function isEditableFocus() {
    return !!document.activeElement?.closest(
      'input,textarea,select,button,summary,[role="separator"],[contenteditable="true"]',
    );
  }
  function startMatchTimer() {
    if (matchTimer) return;
    matchTimer = setInterval(() => {
      if (!ui.study || ui.page !== 'study' || ui.study.finished) {
        if (matchTimer !== null) clearInterval(matchTimer);
        matchTimer = null;
        return;
      }
      const elapsed = formatTime(
        Math.floor((Date.now() - ui.study.startTime) / 1000),
      );
      document
        .querySelectorAll('[data-study-time], #test-time, #match-time')
        .forEach((el) => {
          el.textContent = elapsed;
        });
    }, 500);
  }
  // Handle navigation and clicks through a single delegated listener.
  document.addEventListener('pointerdown', (event) => {
    if (event.target instanceof Element && event.target.closest('[data-ipa]'))
      event.preventDefault();
  });
  document.addEventListener('click', (event) => {
    const target = event.target as Element;
    const vocabularyNav = target.closest<HTMLButtonElement>(
      '[data-vocabulary-page]',
    );
    if (vocabularyNav) {
      vocabularyPage = Number(vocabularyNav.dataset.vocabularyPage);
      element('vocabulary-results').innerHTML = vocabularySearchResults(
        ui.filter,
      );
      return;
    }
    const help = target.closest<HTMLAnchorElement>(
      '[data-help-link],.docs-toc a',
    );
    if (help) {
      if (help.target === '_blank') return;
      event.preventDefault();
      closeModal();
      const hash = help.getAttribute('href')!;
      if (location.hash === hash) render();
      else location.hash = hash;
      return;
    }
    const key = target.closest<HTMLElement>('[data-ipa]');
    if (key) {
      const field = input('card-pronunciation');
      const symbol = key.dataset.ipa!;
      if (
        field.value.length -
          ((field.selectionEnd ?? 0) - (field.selectionStart ?? 0)) +
          symbol.length >
        500
      )
        return;
      field.setRangeText(
        symbol,
        field.selectionStart ?? field.value.length,
        field.selectionEnd ?? field.value.length,
        'end',
      );
      field.focus();
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    const speak = target.closest<HTMLElement>(
      '[data-speak], [data-preview-speech]',
    );
    if (speak) {
      const text = speak.hasAttribute('data-preview-speech')
        ? input('card-front').value.trim()
        : speak.dataset.speak!;
      if (!text) return notify('Nhập từ ở mặt trước để nghe phát âm.', true);
      if (!('speechSynthesis' in window))
        return notify('Trình duyệt này chưa hỗ trợ giọng đọc.', true);
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const language = speak.hasAttribute('data-preview-speech')
        ? element<HTMLSelectElement>('card-speech-language').value
        : speak.dataset.speechLanguage || 'en-US';
      utterance.lang = language;
      const voice = selectSpeechVoice(
        window.speechSynthesis.getVoices(),
        language,
      );
      if (voice) utterance.voice = voice;
      utterance.rate = data.preferences?.speechRate ?? defaultSpeechRate;
      utterance.onerror = (e) => {
        if (!['interrupted', 'canceled'].includes(e.error))
          notify(
            'Không phát được giọng đọc. Hãy kiểm tra giọng của ngôn ngữ đã chọn trên thiết bị.',
            true,
          );
      };
      window.speechSynthesis.speak(utterance);
    }
  });
  document.addEventListener('click', async (ev) => {
    const btn = (
      ev.target instanceof Element ? ev.target : null
    )?.closest<HTMLButtonElement>(
      'button,[data-deck],[data-action],[data-tile]',
    );
    if (!btn || btn.disabled) return;
    if (btn.dataset.listPage !== undefined) {
      const scope = btn.dataset.listScope!;
      listPages[scope] = Number(btn.dataset.listPage);
      if (scope === 'session-detail' && detailSessionId)
        showSessionDetails(detailSessionId);
      else if (scope === 'class-members') updateClassChoices();
      else {
        render();
        if (scope === 'test-results') {
          const details =
            document.querySelector<HTMLDetailsElement>('.result-review');
          if (details) details.open = true;
        }
      }
      return;
    }
    if (btn.dataset.deleteSession) {
      const sessionId = btn.dataset.deleteSession;
      if (!data.sessions.some((session) => session.id === sessionId)) return;
      if (
        !(await askConfirmation(
          'Xóa bản ghi phiên học này? Tiến độ thẻ, lịch ôn và thống kê học tập vẫn được giữ lại.',
          {
            title: 'Xóa phiên học?',
            confirmLabel: 'Xóa phiên học',
            danger: true,
          },
        ))
      )
        return;
      data.sessions = data.sessions.filter(
        (session) => session.id !== sessionId,
      );
      if (detailSessionId === sessionId) {
        if (document.querySelector('.session-detail-modal')) closeModal();
        detailSessionId = null;
      }
      save();
      render();
      document
        .getElementById('history-heading')
        ?.focus({ preventScroll: true });
      toast('Đã xóa phiên học.');
      return;
    }
    if (btn.dataset.session) {
      listPages['session-detail'] = 1;
      showSessionDetails(btn.dataset.session);
      return;
    }
    if (btn.dataset.srsDate !== undefined) {
      scheduleSelection = btn.dataset.srsDate;
      listPages.srs = 1;
      render();
      return;
    }
    if (btn.dataset.srsEdit) {
      srsCardModal(btn.dataset.srsDeck!, btn.dataset.srsEdit);
      return;
    }
    if (btn.dataset.srsPause) {
      const card = getCard(btn.dataset.srsDeck, btn.dataset.srsPause);
      if (card) {
        card.suspended = !card.suspended;
        save();
        render();
      }
      return;
    }
    if (
      btn.dataset.testAddAnswer !== undefined ||
      btn.dataset.testRemoveAnswer !== undefined
    ) {
      const s = ui.study;
      const index = Number(
        btn.dataset.testAddAnswer ?? btn.dataset.testRemoveAnswer,
      );
      if (
        s?.mode !== 'test' ||
        s.finished ||
        !s.questions[index]?.multiple ||
        s.questions[index].type !== 'write'
      )
        return;
      const values = (s.testMultiAnswers ??= {})[index] ?? [''];
      if (btn.dataset.testAddAnswer !== undefined) {
        if (values.length >= 20) return;
        values.push('');
      } else if (values.length > 1)
        values.splice(Number(btn.dataset.answerRow), 1);
      s.testMultiAnswers[index] = values;
      s.testAnswers[index] = values.join('\n');
      (s.testConfirmed ??= [])[index] = false;
      element(`test-question-${index}`).querySelector(
        '[data-test-write-fields]',
      )!.innerHTML = testWriteFields(index, values);
      updateTestConfirmation(index);
      translatePage();
      if (btn.dataset.testAddAnswer !== undefined)
        element(`test-question-${index}`)
          .querySelector<HTMLInputElement>('.test-write-row:last-child input')
          ?.focus({ preventScroll: true });
      return;
    }
    if (btn.dataset.testConfirm !== undefined) {
      const s = ui.study;
      const index = Number(btn.dataset.testConfirm);
      if (s?.mode !== 'test' || s.finished || !s.questions[index]) return;
      if (!hasTestAnswer(s, index)) {
        toast('Hãy trả lời câu hỏi trước khi xác nhận.', true);
        return;
      }
      s.testConfirmed ??= [];
      s.testConfirmed[index] = !s.testConfirmed[index];
      updateTestConfirmation(index);
      translatePage();
      return;
    }
    if (btn.dataset.testJump !== undefined) {
      const s = ui.study;
      if (s?.mode === 'test' && !s.finished) {
        s.index = Number(btn.dataset.testJump);
        document
          .getElementById(`test-question-${s.index}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (btn.hasAttribute('data-study-edit')) {
      const s = ui.study;
      if (!s || s.finished || !['flashcards', 'review'].includes(s.mode))
        return;
      const p = s.pool[s.index];
      if (p) cardModal(p.cardId, p.deckId);
      return;
    }
    if (btn.hasAttribute('data-study-star')) {
      const s = ui.study;
      if (!s || s.finished) return;
      const p = currentItem(s),
        c = getCard(p.deckId, p.cardId);
      if (c) {
        c.starred = !c.starred;
        audio.effect('star');
        save();
        render();
      }
      return;
    }
    if (btn.dataset.duePage) {
      duePage = Number(btn.dataset.duePage);
      render();
      return;
    }
    if (btn.dataset.cardPage) {
      cardPage = Number(btn.dataset.cardPage);
      render();
      return;
    }
    if (btn.dataset.classId) {
      go('classes', btn.dataset.classId);
      return;
    }
    const nav = btn.dataset.nav;
    if (nav) {
      go(nav);
      return;
    }
    const deck = btn.dataset.deck;
    if (deck) {
      ui.deckFilter = '';
      cardPage = 1;
      go('deck', deck);
      return;
    }
    const studyAll = btn.dataset.studyAll;
    if (studyAll) {
      openStudySetup('all', modeSchema.parse(studyAll));
      return;
    }
    const mode = btn.dataset.mode;
    if (mode) {
      if (!getDeck(ui.deckId)?.cards.length) {
        toast('Hãy thêm thẻ trước khi bắt đầu học.', true);
        return;
      }
      if (ui.deckId) openStudySetup(ui.deckId, modeSchema.parse(mode));
      return;
    }
    const star = btn.dataset.star;
    if (star) {
      const c = getCard(ui.deckId, star);
      if (c) {
        c.starred = !c.starred;
        audio.effect('star');
        save();
        render();
      }
      return;
    }
    const edit = btn.dataset.editCard;
    if (edit) {
      cardModal(edit);
      return;
    }
    const remove = btn.dataset.deleteCard;
    if (remove) {
      const d = getDeck(ui.deckId),
        c = getCard(ui.deckId, remove);
      if (!d || !c) return;
      if (
        await askConfirmation(
          `Thẻ “${c.front.slice(0, 80)}” sẽ bị xóa khỏi học phần. Thao tác này không thể hoàn tác.`,
          { title: 'Xóa thẻ ghi nhớ?', confirmLabel: 'Xóa thẻ', danger: true },
        )
      ) {
        d.cards = d.cards.filter((c) => c.id !== remove);
        save();
        render();
        toast('Đã xóa thẻ.');
      }
      return;
    }
    const choice = btn.dataset.choice;
    if (choice !== undefined) {
      const s = ui.study;
      if (!s || s.finished || s.mode !== 'learn' || s.feedback) return;
      const p = currentItem(s),
        c = getCard(p.deckId, p.cardId);
      if (!c || !s.choices) return;
      const ok = isDefinition(c, s.choices[Number(choice)]);
      s.feedback = { selected: Number(choice), ok };
      recordOutcome(
        p.deckId,
        p.cardId,
        ok,
        'learn',
        s.choices[Number(choice)],
        s.choices.find((answer) => isDefinition(c, answer)),
      );
      if (!ok && p.tries < 1) {
        s.queue.push({ ...p, tries: p.tries + 1 });
      }
      render();
      countdown(nextQuestion);
      return;
    }
    const outcome = btn.dataset.outcome;
    if (outcome !== undefined) {
      const s = ui.study;
      if (!s || s.finished || !['flashcards', 'review'].includes(s.mode))
        return;
      setRemembered(outcome === 'true');
      moveCard(1);
      return;
    }
    const tileId = btn.dataset.tile;
    if (tileId) {
      const s = ui.study;
      if (!s || s.finished || s.mode !== 'match' || s.matchWrongTimer) return;
      const tile = s.tiles.find((t) => t.uid === tileId);
      if (
        !tile ||
        s.matchSolved.includes(tile.pair) ||
        s.matchChosen.includes(tileId)
      )
        return;
      s.matchChosen.push(tileId);
      if (s.matchChosen.length === 2) {
        const a = s.tiles.find((t) => t.uid === s.matchChosen[0]),
          b = s.tiles.find((t) => t.uid === s.matchChosen[1]);
        if (!a || !b) return;
        if (a.pair === b.pair && a.kind !== b.kind) {
          s.matchSolved.push(a.pair);
          const p = s.pairs[a.pair];
          recordOutcome(
            p.deckId,
            p.cardId,
            true,
            'match',
            a.kind === 'back' ? a.text : b.text,
          );
          s.matchChosen = [];
          if (s.matchSolved.length === s.pairs.length) {
            finishStudy();
            return;
          }
        } else {
          const p = s.pairs[a.pair];
          recordOutcome(
            p.deckId,
            p.cardId,
            false,
            'match',
            `${a.text} ↔ ${b.text}`,
          );
          s.matchWrong = [...s.matchChosen];
          s.matchChosen = [];
          s.matchWrongTimer = true;
          render();
          setTimeout(() => {
            if (ui.study === s && !s.finished) {
              s.matchWrong = [];
              s.matchWrongTimer = false;
              render();
            }
          }, 520);
          return;
        }
      }
      render();
      return;
    }
    const action = btn.dataset.action;
    if (!action) return;
    switch (action) {
      case 'history-clear':
        historyFrom = '';
        historyTo = '';
        listPages.history = 1;
        render();
        element('history-from').focus({ preventScroll: true });
        break;
      case 'create-class':
        classModal();
        break;
      case 'edit-class':
        classModal(true);
        break;
      case 'delete-class': {
        const group = data.classes?.find((group) => group.id === ui.classId);
        if (
          group &&
          (await askConfirmation(
            `Xóa lớp “${group.name}”? Các học phần và tiến độ được giữ lại.`,
            {
              title: 'Xóa lớp học?',
              confirmLabel: 'Xóa lớp học',
              danger: true,
            },
          ))
        ) {
          data.classes = data.classes?.filter((item) => item.id !== group.id);
          save();
          go('classes');
          toast('Đã xóa lớp học.');
        }
        break;
      }
      case 'toggle-menu':
        element('sidebar').classList.toggle('open');
        break;
      case 'create-deck':
        deckModal(false);
        break;
      case 'edit-deck':
        deckModal(true);
        break;
      case 'delete-deck': {
        const d = getDeck(ui.deckId);
        if (
          d &&
          (await askConfirmation(
            `Học phần “${d.title}” và ${d.cards.length} thẻ sẽ bị xóa. Thao tác này không thể hoàn tác.`,
            {
              title: 'Xóa học phần?',
              confirmLabel: 'Xóa học phần',
              danger: true,
            },
          ))
        ) {
          data.decks = data.decks.filter((x) => x.id !== d.id);
          data.classes?.forEach((group) => {
            group.deckIds = group.deckIds.filter((id) => id !== d.id);
          });
          save();
          go('library');
          toast('Đã xóa học phần.');
        }
        break;
      }
      case 'add-card':
        cardModal();
        break;
      case 'import-text':
        modal(
          'Nhập từ vựng hàng loạt',
          'Mỗi dòng gồm 5 trường: thuật ngữ, định nghĩa, cách đọc, ghi chú, ảnh minh họa. Chỉ hai trường đầu bắt buộc. Trong định nghĩa, dùng từ loại::nghĩa và dấu | để thêm nghĩa.',
          `<div class="form-field"><label for="bulk-text">Nội dung</label><textarea id="bulk-text" rows="10" required placeholder="book,n.::sách|v.::đặt chỗ,/bʊk/,Ví dụ,&#10;hello,xin chào,,,"></textarea></div>${helpLink('import')}`,
          'import-text',
        );
        break;
      case 'import-guide':
        location.hash = '#/docs/import';
        break;
      case 'import-csv':
        element('csv-file').click();
        break;
      case 'export-csv':
        exportCsv();
        break;
      case 'export-text':
        exportCsv('txt');
        break;
      case 'export-excel':
        exportCsv('xlsx');
        break;
      case 'study-setup-cancel':
        closeStudySetup();
        break;
      case 'study-setup-overlay':
        if (ev.target === btn) closeStudySetup();
        break;
      case 'close-modal':
        closeModal();
        break;
      case 'overlay':
        if (ev.target === btn) closeModal();
        break;
      case 'study-exit':
        go(ui.study?.deckId === 'all' ? 'review' : 'deck', ui.study?.deckId);
        break;
      case 'retry-study': {
        const s = ui.study;
        if (!s) return;
        openStudySetup(s.deckId, s.mode);
        break;
      }
      case 'test-next':
        if (
          ui.study?.mode === 'test' &&
          ui.study.index < ui.study.questions.length - 1
        )
          advanceTest();
        break;
      case 'srs-settings':
        srsSettingsModal();
        break;
      case 'srs-defaults':
        defaultSrsPreferences.intervals.forEach((days, i) => {
          input(`srs-interval-${i}`).value = String(days);
        });
        input('srs-retry').value = String(defaultSrsPreferences.retryMinutes);
        break;
      case 'srs-due-now':
        input('srs-card-due').value = (() => {
          const date = new Date();
          return `${dateKey()}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        })();
        break;
      case 'test-submit':
        advanceTest(true);
        break;
      case 'test-prev':
        cancelAdvance();
        if (ui.study?.mode === 'test' && ui.study.index > 0) {
          ui.study.index--;
          render();
        }
        break;
      case 'flip':
        if (ui.study) {
          audio.effect('flip');
          ui.study.flipped = !ui.study.flipped;
          document
            .querySelector('.flip-card')
            ?.classList.toggle('flipped', ui.study.flipped);
        }
        break;
      case 'next':
        moveCard(1);
        break;
      case 'prev':
        moveCard(-1);
        break;
      case 'write-prev':
        moveWriteQuestion(-1);
        break;
      case 'write-next':
        moveWriteQuestion(1);
        break;
      case 'question-next':
        nextQuestion();
        break;
      case 'reveal-answer': {
        const s = ui.study;
        if (!s) return;
        const p = currentItem(s);
        if (!p) return;
        if (!s.feedback) {
          s.feedback = { ok: false };
          (s.writeResponses ??= {})[s.index] = {
            answer: input('write-input').value,
            feedback: { ok: false },
          };
          recordOutcome(p.deckId, p.cardId, false, 'write', '(bỏ qua)');
          if (p.tries < 1) s.queue.push({ ...p, tries: p.tries + 1 });
          render();
        }
        break;
      }
    }
  });
  document.addEventListener('submit', (e) => {
    if (!(e.target instanceof HTMLFormElement)) return;
    const target = e.target;
    if (target.id === 'history-filter-form') {
      e.preventDefault();
      const from = input('history-from').value;
      const to = input('history-to').value;
      if (from && to && from > to) {
        showFieldError(
          input('history-to'),
          'Ngày kết thúc phải từ ngày bắt đầu trở đi.',
        );
        return;
      }
      historyFrom = from;
      historyTo = to;
      listPages.history = 1;
      render();
      document
        .querySelector<HTMLButtonElement>(
          '#history-filter-form [type="submit"]',
        )
        ?.focus({ preventScroll: true });
      return;
    }
    if (
      ['modal-form', 'write-form', 'test-form', 'study-setup-form'].includes(
        target.id,
      )
    ) {
      e.preventDefault();
      if (!validateForm(target)) return;
    }
    if (target.id === 'study-setup-form') {
      const s = pendingSetup;
      if (!s) return;
      const memoryFilter = element<HTMLSelectElement>('setup-memory-filter')
        .value as MemoryFilter;
      const available = selectedSetupPool(s, memoryFilter).length;
      if (!available) {
        element('setup-memory-count').textContent =
          'Không có từ phù hợp với lựa chọn này.';
        translatePage();
        return;
      }
      const count = Number(input('setup-count').value);
      if (!Number.isInteger(count) || count < 1 || count > available) {
        showFieldError(input('setup-count'), `Chọn từ 1 đến ${available}.`);
        return;
      }
      const order =
        s.mode !== 'match' &&
        element<HTMLSelectElement>('setup-order').value === 'ordered'
          ? 'ordered'
          : 'random';
      const testType =
        s.mode === 'test'
          ? (element<HTMLSelectElement>('setup-test-type').value as
              'mixed' | 'mc' | 'write')
          : 'mixed';
      const settings = (data.preferences!.study ??= {});
      settings.orders ??= {};
      settings.orders[s.mode] = order;
      const multipleChoice =
        s.mode === 'test' && input('setup-multiple-choice').checked;
      const multipleWrite =
        s.mode === 'test' && input('setup-multiple-write').checked;
      if (s.mode === 'test') {
        settings.testType = testType;
        settings.testMultipleChoice = multipleChoice;
        settings.testMultipleWrite = multipleWrite;
      }
      save();
      closeStudySetup();
      initStudy(s.deckId, s.mode, {
        count,
        order,
        testType,
        memoryFilter,
        multipleChoice,
        multipleWrite,
      });
      audio.start(s.mode);
      go('study', s.deckId, s.mode);
    } else if (target.id === 'modal-form') {
      e.preventDefault();
      void handleModalForm(target.dataset.form).catch((error) =>
        toast(errorMessage(error), true),
      );
    } else if (target.id === 'write-form') {
      e.preventDefault();
      const s = ui.study;
      if (!s || s.feedback) return;
      const p = currentItem(s),
        c = getCard(p.deckId, p.cardId),
        answer = input('write-input').value;
      if (!c) return;
      const ok = isDefinition(c, answer);
      s.feedback = { ok };
      (s.writeResponses ??= {})[s.index] = { answer, feedback: { ok } };
      recordOutcome(p.deckId, p.cardId, ok, 'write', answer);
      if (!ok && p.tries < 1) s.queue.push({ ...p, tries: p.tries + 1 });
      render();
    } else if (target.id === 'test-form') {
      e.preventDefault();
    }
  });
  document.addEventListener('change', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) return;
    if (target.id === 'srs-deck-filter') {
      scheduleDeck = target.value;
      listPages.srs = 1;
      render();
    }
    if (target.id === 'srs-days') {
      scheduleDays = Number(target.value);
      if (!['all', 'due', 'paused'].includes(scheduleSelection))
        scheduleSelection = 'due';
      listPages.srs = 1;
      render();
    }
  });
  document.addEventListener('input', (event) => {
    if (
      !(event.target instanceof HTMLInputElement) ||
      event.target.id !== 'write-input'
    )
      return;
    const s = ui.study;
    if (s?.mode === 'write' && !s.finished && !s.feedback)
      (s.writeResponses ??= {})[s.index] = { answer: event.target.value };
  });
  document.addEventListener('input', (event) => {
    const field = event.target;
    const s = ui.study;
    if (
      !(field instanceof HTMLInputElement) ||
      !field.closest('#test-form') ||
      s?.mode !== 'test' ||
      s.finished
    )
      return;
    const index = Number(field.dataset.questionIndex);
    if (!Number.isInteger(index) || !s.questions[index]) return;
    s.index = index;
    if (s.questions[index].multiple) {
      const panel = element(`test-question-${index}`);
      const values =
        s.questions[index].type === 'write'
          ? Array.from(
              panel.querySelectorAll<HTMLInputElement>('.test-input'),
            ).map((input) => input.value)
          : Array.from(
              panel.querySelectorAll<HTMLInputElement>('input:checked'),
            ).map((input) => input.value);
      (s.testMultiAnswers ??= {})[index] = values;
      s.testAnswers[index] = values.join('\n');
    } else s.testAnswers[index] = field.value;
    s.testConfirmed ??= [];
    s.testConfirmed[index] = false;
    updateTestConfirmation(index);
    translatePage();
  });
  function updateTestConfirmation(index: number) {
    const s = ui.study;
    if (!s || s.mode !== 'test') return;
    const confirmed = !!s.testConfirmed?.[index];
    document
      .querySelector(`[data-test-jump="${index}"]`)
      ?.classList.toggle('answered', confirmed);
    const button = document.querySelector<HTMLButtonElement>(
      `[data-test-confirm="${index}"]`,
    );
    if (button) {
      button.textContent = confirmed ? 'Bỏ xác nhận' : 'Xác nhận';
      button.className = `btn ${confirmed ? 'outline' : 'primary'}`;
      button.setAttribute('aria-pressed', String(confirmed));
    }
    const status = document.querySelector(
      `#test-question-${index} .test-confirm-status`,
    );
    if (status)
      status.textContent = confirmed ? 'Đã xác nhận' : 'Chưa xác nhận';
    element('test-answered').textContent =
      `${s.testConfirmed?.filter(Boolean).length ?? 0} / ${s.questions.length} câu đã xác nhận`;
    element('test-submit-error').hidden = true;
    const count = s.testConfirmed?.filter(Boolean).length ?? 0;
    const counter = document.querySelector('.test-study-area .study-counter');
    if (counter)
      counter.textContent = `${count} / ${s.questions.length} câu đã xác nhận`;
    const progress = document.querySelector<HTMLElement>(
      '.test-study-area .study-progress > span',
    );
    if (progress)
      progress.style.width = `${Math.round((count / s.questions.length) * 100)}%`;
  }
  document.addEventListener('input', (e) => {
    if (!(e.target instanceof HTMLInputElement)) return;
    const target = e.target;
    if (target.id === 'class-set-search') {
      listPages['class-members'] = 1;
      updateClassChoices();
    } else if (target.id === 'library-search') {
      ui.filter = target.value;
      vocabularyPage = 1;
      element('vocabulary-results').innerHTML = vocabularySearchResults(
        ui.filter,
      );
      listPages.library = 1;
      element('library-result').innerHTML = libraryGrid(
        data.decks.filter((d) => deckMatches(d, ui.filter)),
      );
    } else if (target.id === 'card-search') {
      cardPage = 1;
      ui.deckFilter = target.value;
      const d = getDeck(ui.deckId);
      if (d)
        element('card-results').innerHTML = renderCardRows(
          d.cards.filter((c) =>
            norm(c.front + ' ' + cardDefinitions(c).join(' ')).includes(
              norm(ui.deckFilter),
            ),
          ),
        );
    }
  });
  let importing = false;
  async function appendImported(rows: string[][]) {
    if (importing) return false;
    importing = true;
    try {
      const d = getDeck(ui.deckId);
      if (!d || !rows.length) throw Error('Không có từ vựng hợp lệ để nhập.');
      const cards = rows.map(
        ([
          front,
          back,
          pronunciation,
          notes,
          language,
          partOfSpeech,
          definitions,
          image,
        ]) =>
          cardSchema.parse({
            id: id(),
            front,
            back,
            pronunciation,
            notes,
            image: image || undefined,
            speechLanguage: language || undefined,
            definitions: definitions ? JSON.parse(definitions) : undefined,
            partOfSpeech,
          }),
      );
      const reviewed = await reviewImportedCards(d.cards, cards);
      if (!reviewed) return false;
      if (!canAddCards(d, reviewed.cards.length - d.cards.length)) return false;
      d.cards = reviewed.cards;
      save();
      render();
      toast(
        `Đã nhập ${reviewed.added} thẻ. Ghi đè ${reviewed.replaced}. Bổ sung ${reviewed.merged}. Bỏ qua ${reviewed.skipped}.`,
      );
      return true;
    } finally {
      importing = false;
    }
  }
  element('csv-file').addEventListener('change', async (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    target.value = '';
    if (!file) return;
    try {
      if (file.size > 5000000) throw Error('File lớn hơn 5 MB.');
      await appendImported(await readVocabularyFile(file));
    } catch (error) {
      toast(errorMessage(error), true);
    }
  });
  let dragging:
    { id: string; kind: string; grid: Element; scope: string } | undefined;
  let suppressSortClickUntil = 0;
  const sortCard = (target: EventTarget | null) =>
    target instanceof Element
      ? target.closest<HTMLElement>('[data-sort-id]')
      : null;
  const clearDrop = () =>
    document
      .querySelectorAll(
        '.sort-drop-before,.sort-drop-after,.sort-dragging,.sort-drop-page',
      )
      .forEach((node) =>
        node.classList.remove(
          'sort-drop-before',
          'sort-drop-after',
          'sort-dragging',
          'sort-drop-page',
        ),
      );
  document.addEventListener('dragstart', (event) => {
    const card = sortCard(event.target),
      grid = card?.closest('.deck-grid');
    if (!card || !grid) return;
    dragging = {
      id: card.dataset.sortId!,
      kind: card.dataset.sortKind!,
      grid,
      scope: grid.getAttribute('data-sort-scope') ?? '',
    };
    card.classList.add('sort-dragging');
    audio.effect('drag-lift');
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', dragging.id);
    }
  });
  const sortPage = (target: EventTarget | null) => {
    const page =
      target instanceof Element
        ? target.closest<HTMLElement>('[data-list-scope][data-list-page]')
        : null;
    return page && dragging?.scope && page.dataset.listScope === dragging.scope
      ? page
      : null;
  };
  const sortPageTarget = (page: HTMLElement) => {
    if (!dragging) return undefined;
    const items =
      dragging.kind === 'class'
        ? (data.classes ?? [])
        : dragging.scope.startsWith('class-')
          ? (
              data.classes?.find(
                (group) => `class-${group.id}` === dragging!.scope,
              )?.deckIds ?? []
            ).map((id) => ({ id }))
          : data.decks.filter((deck) => deckMatches(deck, ui.filter));
    const remaining = items.filter((item) => item.id !== dragging!.id);
    const index =
      (Number(page.dataset.listPage) - 1) * scopePageSize(dragging.scope);
    const item = remaining[Math.min(index, remaining.length - 1)];
    return item ? { id: item.id, after: index >= remaining.length } : undefined;
  };
  document.addEventListener('dragover', (event) => {
    const page = sortPage(event.target);
    if (page) {
      event.preventDefault();
      document
        .querySelectorAll('.sort-drop-page,.sort-drop-before,.sort-drop-after')
        .forEach((node) =>
          node.classList.remove(
            'sort-drop-page',
            'sort-drop-before',
            'sort-drop-after',
          ),
        );
      page.classList.add('sort-drop-page');
      return;
    }
    const card = sortCard(event.target);
    if (
      !dragging ||
      !card ||
      card.closest('.deck-grid') !== dragging.grid ||
      card.dataset.sortKind !== dragging.kind ||
      card.dataset.sortId === dragging.id
    )
      return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    document
      .querySelectorAll('.sort-drop-before,.sort-drop-after,.sort-drop-page')
      .forEach((node) =>
        node.classList.remove(
          'sort-drop-before',
          'sort-drop-after',
          'sort-drop-page',
        ),
      );
    const rect = card.getBoundingClientRect();
    card.classList.add(
      event.clientX >= rect.left + rect.width / 2
        ? 'sort-drop-after'
        : 'sort-drop-before',
    );
  });
  document.addEventListener('drop', (event) => {
    const card = sortCard(event.target),
      page = sortPage(event.target);
    if (
      !dragging ||
      (!page &&
        (!card ||
          card.closest('.deck-grid') !== dragging.grid ||
          card.dataset.sortKind !== dragging.kind))
    )
      return;
    const destination = page ? sortPageTarget(page) : undefined;
    if (page && !destination) return;
    event.preventDefault();
    const source = dragging.id,
      target = destination?.id ?? card!.dataset.sortId!,
      after = destination?.after ?? card!.classList.contains('sort-drop-after');
    audio.effect('drag-drop');
    if (page) listPages[dragging.scope] = Number(page.dataset.listPage);
    if (source !== target) {
      if (dragging.kind === 'class')
        data.classes = reorderItems(data.classes ?? [], source, target, after);
      else if (ui.page === 'classes' && ui.classId) {
        const group = data.classes?.find((group) => group.id === ui.classId);
        if (group)
          group.deckIds = reorderItems(
            group.deckIds.map((id) => ({ id })),
            source,
            target,
            after,
          ).map((item) => item.id);
      } else data.decks = reorderItems(data.decks, source, target, after);
      save();
    }
    dragging = undefined;
    suppressSortClickUntil = Date.now() + 350;
    clearDrop();
    render();
  });
  document.addEventListener('dragend', () => {
    if (dragging) {
      suppressSortClickUntil = Date.now() + 350;
      audio.effect('drag-drop');
    }
    dragging = undefined;
    clearDrop();
  });
  document.addEventListener(
    'click',
    (event) => {
      if (Date.now() < suppressSortClickUntil && sortCard(event.target)) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    },
    true,
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      return;
    }
    if (e.target instanceof Element && e.target.closest('.mastery-details'))
      return;
    if (
      e.altKey &&
      !e.ctrlKey &&
      !e.metaKey &&
      ['1', '2'].includes(e.key) &&
      !e.isComposing &&
      ui.page === 'study' &&
      ui.study?.mode === 'write' &&
      ui.study.started &&
      !ui.study.finished &&
      !element('modal-root').children.length &&
      !document.querySelector('[role="alertdialog"]')
    ) {
      e.preventDefault();
      moveWriteQuestion(e.key === '1' ? -1 : 1);
      return;
    }
    if (e.ctrlKey || e.altKey || e.metaKey) return;
    if (e.isComposing || e.keyCode === 229) return;
    const activeControl = document.activeElement;
    const studyShortcut =
      ['1', '2', '3', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
      (activeControl instanceof HTMLButtonElement ||
        activeControl?.matches('[data-remembered]'));
    if (
      element('modal-root').children.length ||
      (isEditableFocus() && !studyShortcut) ||
      ui.page !== 'study' ||
      !ui.study
    )
      return;
    const s = ui.study;
    if (!s.started || s.finished) return;
    if (
      s.mode === 'write' &&
      ['1', '2', 'ArrowLeft', 'ArrowRight'].includes(e.key)
    ) {
      e.preventDefault();
      moveWriteQuestion(['1', 'ArrowLeft'].includes(e.key) ? -1 : 1);
      return;
    }
    if (['flashcards', 'review'].includes(s.mode)) {
      if (e.key === ' ') {
        e.preventDefault();
        audio.effect('flip');
        s.flipped = !s.flipped;
        document
          .querySelector('.flip-card')
          ?.classList.toggle('flipped', s.flipped);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveCard(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveCard(-1);
      } else if (e.key === '3') {
        e.preventDefault();
        if (!e.repeat)
          document.querySelector<HTMLButtonElement>('.flash-speak')?.click();
      } else if (e.key === '1' || e.key === '2') {
        e.preventDefault();
        setRemembered(e.key === '2');
        moveCard(1);
      }
    } else if (
      (s.mode === 'learn' || s.mode === 'write') &&
      s.feedback &&
      e.key === 'Enter'
    ) {
      e.preventDefault();
      nextQuestion();
    } else if (
      s.mode === 'learn' &&
      !s.feedback &&
      ['1', '2', '3', '4'].includes(e.key)
    ) {
      const b = document.querySelector<HTMLButtonElement>(
        `[data-choice="${Number(e.key) - 1}"]`,
      );
      b?.click();
    }
  });
  document
    .querySelectorAll<HTMLElement>('[data-icon]')
    .forEach((el) => (el.innerHTML = ico(el.dataset.icon ?? 'cards', 18)));
  readRoute();
  render();
  exitGuard = installStudyExitGuard({
    navigate: () => {
      readRoute();
      if (!location.hash.startsWith('#/docs/'))
        window.scrollTo({ top: 0, behavior: 'auto' });
      render();
    },
    active: () =>
      ui.page === 'study' &&
      ui.study?.started &&
      !ui.study.finished &&
      ui.study.pool.length > 0
        ? ui.study
        : null,
    leave: () => {
      cancelAdvance();
      trackSession();
      ui.study = null;
    },
  });
  initializeBlog(profile);
  initializeBlog(
    profile,
    personalNoteRequests(
      profile,
      () => data.notes ?? [],
      async (notes) => {
        data.notes = stateSchema.parse({ ...data, notes }).notes;
        save();
        await sync.flush();
        if (sync.hasPending) throw new Error(sync.pendingMessage);
      },
    ),
  );
  element<HTMLButtonElement>('profile-button').disabled = false;
  window.addEventListener('online', () => {
    void sync.flush();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') void sync.flush();
  });
  setInterval(() => {
    void sync.flush();
  }, 15000);
}
void main().catch((error) => {
  element('content').textContent = errorMessage(error);
});
