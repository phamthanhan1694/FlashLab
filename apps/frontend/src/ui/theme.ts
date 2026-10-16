import type { Preferences } from '@flashlab/shared';
type Theme = Preferences['theme'];
const key = 'flashlab.theme';
const valid = (value: unknown): value is Theme =>
  ['system', 'light', 'dark'].includes(String(value));

export function initializeTheme(
  initial?: Theme,
  onChange?: (value: Theme) => void,
) {
  const controls = document.querySelectorAll<HTMLButtonElement>(
    '.theme-options [data-theme]',
  );
  const system = window.matchMedia('(prefers-color-scheme: dark)');
  let preference: Theme = 'system';
  try {
    const saved = localStorage.getItem(key);
    if (valid(saved)) preference = saved;
  } catch {
    /* Session-only preference. */
  }
  if (initial) {
    preference = initial;
    try {
      localStorage.setItem(key, initial);
    } catch {
      /* Session preference still applies. */
    }
  }
  const apply = () => {
    document.documentElement.dataset.theme =
      preference === 'system'
        ? system.matches
          ? 'dark'
          : 'light'
        : preference;
    const meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"]',
    );
    if (meta)
      meta.content =
        document.documentElement.dataset.theme === 'dark'
          ? '#101724'
          : '#f7f8fd';
    controls.forEach((control) =>
      control.setAttribute(
        'aria-pressed',
        String(control.dataset.theme === preference),
      ),
    );
  };
  controls.forEach((control) =>
    control.addEventListener('click', () => {
      if (!valid(control.dataset.theme)) return;
      preference = control.dataset.theme;
      try {
        localStorage.setItem(key, preference);
      } catch {
        /* Session only. */
      }
      apply();
      onChange?.(preference);
    }),
  );
  system.addEventListener('change', () => {
    if (preference === 'system') apply();
  });
  apply();
  return {
    configure(value: Theme) {
      preference = value;
      apply();
      try {
        localStorage.setItem(key, value);
      } catch {
        /* Session preference still applies. */
      }
    },
  };
}
