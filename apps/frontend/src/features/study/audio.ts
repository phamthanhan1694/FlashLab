import { runtimeConfig } from '../../core/runtime';
import {
  audioPreferencesSchema,
  soundNames,
  type StudyMode,
  type AudioPreferences,
} from '@flashlab/shared';
import { ico } from '../../ui/icons';
type Sound = (typeof soundNames)[number];
const labels: Record<Sound, [string, string]> = {
  background: ['Nhạc nền', 'music'],
  'test-background': ['Nhạc kiểm tra', 'pen'],
  correct: ['Trả lời đúng', 'check'],
  incorrect: ['Trả lời sai', 'close'],
  completed: ['Hoàn thành', 'trophy'],
  'keep-trying': ['Cần cố gắng', 'repeat'],
  flip: ['Lật thẻ', 'cards'],
  swipe: ['Chuyển thẻ', 'arrow'],
  'drag-lift': ['Nhấc ô lên', 'upload'],
  'drag-drop': ['Đặt ô xuống', 'check'],
};

type Effect =
  | 'correct'
  | 'incorrect'
  | 'completed'
  | 'keep-trying'
  | 'flip'
  | 'swipe'
  | 'star'
  | 'drag-lift'
  | 'drag-drop';
export class StudyAudio {
  private music = new Audio();
  private effects = new Map<Effect, HTMLAudioElement>();
  private track = '';
  private active = false;
  private unlocked = false;
  private musicPending = false;
  private pendingReplay = false;
  private musicPaused = false;
  private preferences: AudioPreferences = structuredClone(
    runtimeConfig.defaults.audio,
  );
  private controls: HTMLElement;
  private preview?: HTMLAudioElement;
  private previewSound?: Sound;

  constructor(
    initial?: AudioPreferences,
    private onChange?: (value: AudioPreferences) => void,
  ) {
    try {
      const saved = audioPreferencesSchema.safeParse(
        JSON.parse(localStorage.getItem('flashlab.audio') ?? 'null'),
      );
      if (saved.success) this.preferences = saved.data;
    } catch {
      /* Optional local preference cache. */
    }
    if (initial) this.preferences = structuredClone(initial);
    this.music.loop = true;
    this.music.preload = 'none';
    const allowAudio = (event: Event) => {
      if (
        event.target instanceof Element &&
        event.target.closest('#audio-settings-mount')
      )
        return;
      if (!this.unlocked) this.unlock();
    };
    document.addEventListener('pointerdown', allowAudio, { capture: true });
    document.addEventListener('click', allowAudio, { capture: true });
    document.addEventListener('keydown', allowAudio, { capture: true });
    document.addEventListener('visibilitychange', () => this.update());
    this.controls = document.getElementById('audio-settings-mount')!;
    const controls = this.controls;
    controls.innerHTML = `<div class="settings-heading"><h3>Âm thanh</h3><button type="button" id="audio-transport" class="icon-button" aria-label="Dừng nhạc nền">${ico('pause', 18)}</button></div><div class="audio-master"><button type="button" id="audio-master-mute" class="icon-button" aria-label="Tắt âm thanh chung"></button><div class="audio-master-slider"><label for="audio-master-volume">Âm lượng chung</label><input id="audio-master-volume" type="range" min="0" max="100" aria-label="Âm lượng chung"></div><output id="audio-master-value" for="audio-master-volume"></output></div><details class="sound-mixer"><summary>${ico('volume', 18)}<span>Âm lượng từng loại</span><span class="mixer-count">${soundNames.length}</span>${ico('chevron', 16)}</summary><div class="sound-list">${soundNames.map((name) => `<div class="sound-row" data-sound="${name}"><div class="sound-heading"><span class="sound-label">${ico(labels[name][1], 17)}<label for="sound-${name}-volume">${labels[name][0]}</label></span><button type="button" class="icon-button sound-preview" data-sound-preview="${name}" aria-label="Nghe thử ${labels[name][0]}">${ico('play', 15)}</button></div><div class="sound-volume"><button type="button" class="icon-button" data-sound-mute="${name}" aria-label="Tắt ${labels[name][0]}"></button><input id="sound-${name}-volume" type="range" min="0" max="100" data-sound-volume="${name}" aria-label="Âm lượng ${labels[name][0]}"><output for="sound-${name}-volume"></output></div></div>`).join('')}</div></details><p id="audio-status" class="help-note" role="status">Nhạc nền phát trên mọi trang, chế độ kiểm tra có nhạc riêng.</p>`;
    controls
      .querySelector('#audio-transport')!
      .addEventListener('click', () => {
        this.musicPaused = !this.musicPaused;
        if (this.musicPaused) this.stopPreview();
        else this.unlocked = true;
        this.update();
        this.renderControls();
      });
    controls
      .querySelector('#audio-master-mute')!
      .addEventListener('click', () => {
        this.preferences.muted = !this.preferences.muted;
        this.changed();
      });
    controls
      .querySelector<HTMLInputElement>('#audio-master-volume')!
      .addEventListener('input', (event) => {
        this.preferences.masterVolume =
          Number((event.target as HTMLInputElement).value) / 100;
        this.changed();
      });
    controls
      .querySelectorAll<HTMLButtonElement>('[data-sound-mute]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          const name = button.dataset.soundMute as Sound;
          this.preferences.sounds ??= {};
          this.preferences.sounds[name] = {
            volume: this.level(name),
            muted: !this.isMuted(name),
          };
          this.changed();
        }),
      );
    controls
      .querySelectorAll<HTMLInputElement>('[data-sound-volume]')
      .forEach((input) =>
        input.addEventListener('input', () => {
          const name = input.dataset.soundVolume as Sound;
          this.preferences.sounds ??= {};
          this.preferences.sounds[name] = {
            volume: Number(input.value) / 100,
            muted: this.isMuted(name),
          };
          this.changed();
        }),
      );
    controls
      .querySelectorAll<HTMLButtonElement>('[data-sound-preview]')
      .forEach((button) =>
        button.addEventListener('click', () => {
          const name = button.dataset.soundPreview as Sound;
          if (this.previewSound === name && this.preview) {
            this.musicPaused = true;
            this.stopPreview();
            this.update();
            this.renderControls();
            return;
          }
          this.stopPreview();
          this.music.pause();
          this.unlocked = true;
          this.previewSound = name;
          const preview = new Audio(this.source(name));
          this.preview = preview;
          preview.volume = this.gain(name);
          preview.onended = () => {
            if (this.preview !== preview) return;
            this.stopPreview();
            this.update();
            this.renderControls();
          };
          this.renderControls();
          void preview.play()?.catch(() => {
            if (this.preview !== preview) return;
            this.stopPreview();
            this.update();
            this.renderControls();
            this.status('Không phát được âm thanh. Hãy thử lại.');
          });
        }),
      );
    this.renderControls();
  }
  configure(value: AudioPreferences) {
    this.preferences = structuredClone(value);
    this.renderControls();
    this.update();
  }
  private stopPreview() {
    if (this.preview) {
      this.preview.onended = null;
      this.preview.pause();
    }
    this.preview = undefined;
    this.previewSound = undefined;
  }
  private source(name: Sound) {
    return `/sounds/${name}.${['background', 'test-background', 'flip', 'swipe', 'drag-lift', 'drag-drop'].includes(name) ? 'wav' : 'mp3'}`;
  }
  private level(name: Sound) {
    return (
      this.preferences.sounds?.[name]?.volume ??
      (name === 'background' || name === 'test-background'
        ? this.preferences.musicVolume
        : this.preferences.volume)
    );
  }
  private isMuted(name: Sound) {
    return (
      this.preferences.sounds?.[name]?.muted ??
      !(name === 'background' || name === 'test-background'
        ? this.preferences.music
        : this.preferences.effects)
    );
  }
  private gain(effect: Sound | 'star') {
    const name = effect === 'star' ? 'swipe' : effect;
    return this.preferences.muted || this.isMuted(name)
      ? 0
      : (this.preferences.masterVolume ?? 1) * this.level(name);
  }
  private renderControls() {
    const transport =
      this.controls.querySelector<HTMLButtonElement>('#audio-transport')!;
    transport.innerHTML = ico(this.musicPaused ? 'play' : 'pause', 18);
    transport.setAttribute(
      'aria-label',
      this.musicPaused ? 'Phát nhạc nền' : 'Dừng nhạc nền',
    );
    transport.setAttribute('aria-pressed', String(this.musicPaused));
    const master = this.controls.querySelector<HTMLInputElement>(
      '#audio-master-volume',
    )!;
    master.value = String(
      Math.round((this.preferences.masterVolume ?? 1) * 100),
    );
    this.controls.querySelector('#audio-master-value')!.textContent =
      `${master.value}%`;
    const mute =
      this.controls.querySelector<HTMLButtonElement>('#audio-master-mute')!;
    mute.innerHTML = ico(this.preferences.muted ? 'muted' : 'volume', 20);
    mute.setAttribute('aria-pressed', String(!!this.preferences.muted));
    mute.setAttribute(
      'aria-label',
      this.preferences.muted ? 'Bật âm thanh chung' : 'Tắt âm thanh chung',
    );
    for (const name of soundNames) {
      const row = this.controls.querySelector<HTMLElement>(
        `[data-sound="${name}"]`,
      )!;
      const input = row.querySelector<HTMLInputElement>('input')!;
      input.value = String(Math.round(this.level(name) * 100));
      row.querySelector('output')!.textContent = `${input.value}%`;
      const button = row.querySelector<HTMLButtonElement>('[data-sound-mute]')!;
      button.innerHTML = ico(this.isMuted(name) ? 'muted' : 'volume', 18);
      button.setAttribute('aria-pressed', String(this.isMuted(name)));
      button.setAttribute(
        'aria-label',
        `${this.isMuted(name) ? 'Bật' : 'Tắt'} ${labels[name][0]}`,
      );
      const previewButton = row.querySelector<HTMLButtonElement>(
        '[data-sound-preview]',
      )!;
      const playing = this.previewSound === name && !!this.preview;
      previewButton.disabled = this.gain(name) === 0;
      previewButton.innerHTML = ico(playing ? 'stop' : 'play', 15);
      previewButton.setAttribute(
        'aria-label',
        `${playing ? 'Dừng nghe thử' : 'Nghe thử'} ${labels[name][0]}`,
      );
      previewButton.setAttribute('aria-pressed', String(playing));
    }
  }
  private changed() {
    this.renderControls();
    this.persist();
    this.update();
  }
  private persist() {
    this.onChange?.({ ...this.preferences });
    try {
      localStorage.setItem('flashlab.audio', JSON.stringify(this.preferences));
    } catch {
      /* Optional preference storage. */
    }
  }
  private unlock() {
    this.unlocked = true;
    this.update();
  }
  private status(message: string) {
    const node = document.getElementById('audio-status');
    if (node) node.textContent = message;
  }
  private play(audio: HTMLAudioElement) {
    if (audio !== this.music) {
      void audio.play()?.catch(() => {});
      return;
    }
    if (this.musicPending) {
      this.pendingReplay = true;
      return;
    }
    this.musicPending = true;
    this.status('Đang tải nhạc nền…');
    void audio
      .play()
      .then(() => {
        if (
          !this.active ||
          this.musicPaused ||
          !!this.preview ||
          this.gain(this.musicSound()) === 0 ||
          document.hidden
        ) {
          audio.pause();
          return;
        }
        this.status('Đang phát nhạc nền');
      })
      .catch((error: unknown) => {
        if (
          !this.active ||
          this.musicPaused ||
          !!this.preview ||
          this.gain(this.musicSound()) === 0 ||
          document.hidden
        )
          return;
        this.status(
          error instanceof DOMException && error.name === 'NotAllowedError'
            ? 'Bấm nút nghe thử trong Cài đặt để cho phép phát âm thanh.'
            : 'Không phát được nhạc nền. Hãy tải lại trang và thử lại.',
        );
      })
      .finally(() => {
        this.musicPending = false;
        if (this.pendingReplay) {
          this.pendingReplay = false;
          this.update();
        }
      });
  }
  private musicSound(): Sound {
    return this.track === 'test-background.wav'
      ? 'test-background'
      : 'background';
  }
  private update() {
    this.music.volume = this.gain(this.musicSound());
    this.effects.forEach((audio, name) => {
      audio.volume = this.gain(name);
      if (audio.volume === 0 || document.hidden) audio.pause();
    });
    if (this.preview && this.previewSound) {
      this.preview.volume = this.gain(this.previewSound);
      if (this.preview.volume === 0 || document.hidden) {
        this.stopPreview();
        this.renderControls();
      }
    }
    if (
      this.active &&
      !this.musicPaused &&
      !this.preview &&
      this.unlocked &&
      this.gain(this.musicSound()) > 0 &&
      !document.hidden
    ) {
      if (this.music.paused) this.play(this.music);
    } else {
      this.music.pause();
      this.status(
        !this.active
          ? 'Nhạc nền phát trên mọi trang, chế độ kiểm tra có nhạc riêng.'
          : this.musicPaused
            ? 'Nhạc nền đã dừng.'
            : this.preview
              ? 'Đang nghe thử âm thanh.'
              : this.gain(this.musicSound()) === 0
                ? 'Nhạc nền đang tắt.'
                : document.hidden
                  ? 'Nhạc tạm dừng khi ẩn tab.'
                  : 'Bấm vào ứng dụng để bắt đầu phát nhạc.',
      );
    }
    if (document.hidden) this.effects.forEach((audio) => audio.pause());
  }
  start(mode: StudyMode) {
    this.unlocked = true;
    this.sync(mode);
  }
  sync(mode?: StudyMode) {
    this.active = true;
    const track = mode === 'test' ? 'test-background.wav' : 'background.wav';
    if (track !== this.track) {
      this.music.pause();
      this.music.src = `/sounds/${track}`;
      this.track = track;
    }
    this.update();
  }
  effect(name: Effect) {
    if (!this.unlocked || this.gain(name) === 0 || document.hidden) return;
    let audio = this.effects.get(name);
    if (!audio) {
      audio = new Audio(
        name === 'star' ? '/sounds/star.wav' : this.source(name),
      );
      this.effects.set(name, audio);
    }
    audio.volume = this.gain(name);
    audio.currentTime = 0;
    this.play(audio);
  }
}
