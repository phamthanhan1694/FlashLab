import { esc } from '../core/utils';

export const presets: Record<string, string> = {
  purple: '#8871eb',
  blue: '#67a3eb',
  peach: '#eeab79',
  mint: '#61c6a1',
  pink: '#e998bd',
};
const names: Record<string, string> = {
  purple: 'Tím',
  blue: 'Xanh dương',
  peach: 'Cam đào',
  mint: 'Xanh mint',
  pink: 'Hồng',
};
export function normalizeHex(value: string): string | undefined {
  const hex = value.trim().replace(/^#/, '');
  if (/^[\da-f]{3}$/i.test(hex))
    return (
      '#' +
      [...hex]
        .map((c) => c + c)
        .join('')
        .toLowerCase()
    );
  return /^[\da-f]{6}$/i.test(hex) ? '#' + hex.toLowerCase() : undefined;
}
export const resolveColor = (color: string) =>
  presets[color] ?? normalizeHex(color) ?? presets.purple;
export function badgeStyle(color: string) {
  const hex = resolveColor(color);
  const channels = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const luminance =
    channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  return `background:${hex};color:${luminance > 0.179 ? '#111111' : '#ffffff'}`;
}
function hsvToHex(h: number, s: number, v: number) {
  const c = v * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = v - c;
  const rgb =
    h < 60
      ? [c, x, 0]
      : h < 120
        ? [x, c, 0]
        : h < 180
          ? [0, c, x]
          : h < 240
            ? [0, x, c]
            : h < 300
              ? [x, 0, c]
              : [c, 0, x];
  return (
    '#' +
    rgb
      .map((n) =>
        Math.round((n + m) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')
  );
}
function hexToHsv(hex: string) {
  const [r, g, b] = [1, 3, 5].map(
    (i) => parseInt(hex.slice(i, i + 2), 16) / 255,
  );
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b),
    delta = max - min;
  const h = !delta
    ? 0
    : max === r
      ? 60 * (((g - b) / delta + 6) % 6)
      : max === g
        ? 60 * ((b - r) / delta + 2)
        : 60 * ((r - g) / delta + 4);
  return { h, s: max ? delta / max : 0, v: max };
}
export function colorPickerMarkup(color: string) {
  const hex = resolveColor(color);
  return `<fieldset class="color-picker"><legend>Màu nhận diện</legend>
    <div class="modal-colors">${Object.entries(presets)
      .map(
        ([name, value]) =>
          `<button type="button" class="color-option${hex === value ? ' active' : ''}" data-color="${value}" aria-label="${names[name]}" aria-pressed="${hex === value}"><span style="background-color:${value}"></span></button>`,
      )
      .join('')}</div>
    <details class="color-custom"><summary><span class="color-custom-swatch" style="background:${hex}" aria-hidden="true"></span>Tùy chỉnh màu</summary>
    <div class="color-plane" id="color-plane" role="group" aria-label="Bảng màu tùy chọn: dùng chuột để chọn hoặc các thanh bên dưới"><span class="color-cursor" aria-hidden="true"></span></div>
    <label class="color-slider-label" for="color-hue">Sắc màu</label><input class="color-range hue-range" id="color-hue" type="range" min="0" max="359" step="1" />
    <div class="color-slider-row"><label for="color-saturation">Độ đậm</label><input class="color-range" id="color-saturation" type="range" min="0" max="100" step="1" /></div>
    <div class="color-slider-row"><label for="color-brightness">Độ sáng</label><input class="color-range" id="color-brightness" type="range" min="0" max="100" step="1" /></div>
    <div class="color-hex-row"><span class="color-preview" id="color-preview" style="${badgeStyle(hex)}" aria-hidden="true">Aa</span><div><label for="deck-color-hex">Mã màu HEX</label><input id="deck-color-hex" value="${esc(hex)}" maxlength="7" spellcheck="false" autocomplete="off" aria-describedby="color-help" /></div></div>
    <p class="help-note" id="color-help">Chọn trên bảng màu, kéo các thanh hoặc nhập mã như #7c3aed, #f80.</p>
    <p class="field-error" id="color-error" hidden></p></details>
  </fieldset>`;
}
export function bindColorPicker(
  root: HTMLElement,
  initial: string,
): () => string | undefined {
  const hexInput = root.querySelector<HTMLInputElement>('#deck-color-hex')!;
  const hue = root.querySelector<HTMLInputElement>('#color-hue')!;
  const saturation = root.querySelector<HTMLInputElement>('#color-saturation')!;
  const brightness = root.querySelector<HTMLInputElement>('#color-brightness')!;
  const plane = root.querySelector<HTMLElement>('#color-plane')!;
  const cursor = root.querySelector<HTMLElement>('.color-cursor')!;
  const preview = root.querySelector<HTMLElement>('#color-preview')!;
  const error = root.querySelector<HTMLElement>('#color-error')!;
  let hex = resolveColor(initial),
    hsv = hexToHsv(hex);
  const paint = (writeInput = true) => {
    if (writeInput) hexInput.value = hex;
    hue.value = String(Math.round(hsv.h));
    saturation.value = String(Math.round(hsv.s * 100));
    brightness.value = String(Math.round(hsv.v * 100));
    plane.style.backgroundColor = `hsl(${hsv.h} 100% 50%)`;
    cursor.style.left = `${hsv.s * 100}%`;
    cursor.style.top = `${(1 - hsv.v) * 100}%`;
    preview.setAttribute('style', badgeStyle(hex));
    root.querySelector<HTMLElement>(
      '.color-custom-swatch',
    )!.style.backgroundColor = hex;
    saturation.style.background = `linear-gradient(to right, #808080, hsl(${hsv.h} 100% 50%))`;
    brightness.style.background = `linear-gradient(to right, #000, ${hsvToHex(hsv.h, hsv.s, 1)})`;
    root
      .querySelectorAll<HTMLButtonElement>('[data-color]')
      .forEach((button) => {
        const active = button.dataset.color === hex;
        button.classList.toggle('active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    error.hidden = true;
    hexInput.removeAttribute('aria-invalid');
    hexInput.setAttribute('aria-describedby', 'color-help');
  };
  const read = () => {
    const valid = normalizeHex(hexInput.value);
    if (!valid) {
      error.textContent = 'Nhập 3 hoặc 6 ký tự HEX (0–9, A–F), ví dụ #7c3aed.';
      error.hidden = false;
      hexInput.setAttribute('aria-invalid', 'true');
      hexInput.setAttribute('aria-describedby', 'color-help color-error');
      return undefined;
    }
    hex = valid;
    hsv = hexToHsv(hex);
    paint(false);
    return hex;
  };
  hexInput.addEventListener('input', read);
  root.querySelectorAll<HTMLButtonElement>('[data-color]').forEach((button) =>
    button.addEventListener('click', () => {
      hex = button.dataset.color!;
      hsv = hexToHsv(hex);
      paint();
    }),
  );
  for (const slider of [hue, saturation, brightness])
    slider.addEventListener('input', () => {
      hsv = {
        h: Number(hue.value),
        s: Number(saturation.value) / 100,
        v: Number(brightness.value) / 100,
      };
      hex = hsvToHex(hsv.h, hsv.s, hsv.v);
      paint();
    });
  let dragging = false;
  const choose = (event: PointerEvent) => {
    const rect = plane.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    hsv.s = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    hsv.v =
      1 - Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
    hex = hsvToHex(hsv.h, hsv.s, hsv.v);
    paint();
  };
  plane.addEventListener('pointerdown', (event) => {
    dragging = true;
    plane.setPointerCapture?.(event.pointerId);
    choose(event);
  });
  plane.addEventListener('pointermove', (event) => {
    if (dragging) choose(event);
  });
  plane.addEventListener('pointerup', () => {
    dragging = false;
  });
  plane.addEventListener('pointercancel', () => {
    dragging = false;
  });
  paint();
  return () => {
    const valid = read();
    if (!valid) {
      root.querySelector<HTMLDetailsElement>('.color-custom')!.open = true;
      hexInput.focus();
    }
    return valid;
  };
}
