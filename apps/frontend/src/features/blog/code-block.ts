import { translateText } from '../../core/i18n';

export function codeBlockToolbar(language: string, source: string) {
  const toolbar = document.createElement('div');
  toolbar.className = 'markdown-code-toolbar';
  const label = document.createElement('span');
  label.className = 'markdown-code-language';
  if (language === 'Plain text') {
    label.dataset.markdownUiSource = 'Văn bản thuần';
    label.textContent = translateText('Văn bản thuần');
  } else label.textContent = language;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'markdown-code-copy';
  button.setAttribute('aria-live', 'polite');
  const setLabel = (text: string) => {
    button.dataset.markdownUiSource = text;
    button.textContent = translateText(text);
  };
  setLabel('Sao chép');
  let timer: ReturnType<typeof setTimeout> | undefined;
  button.onclick = async () => {
    clearTimeout(timer);
    button.disabled = true;
    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(source);
        } catch {
          copyFallback(source);
        }
      } else copyFallback(source);
      setLabel('Đã sao chép');
    } catch {
      setLabel('Không sao chép được');
    } finally {
      button.disabled = false;
      timer = setTimeout(() => setLabel('Sao chép'), 2500);
    }
  };
  toolbar.append(label, button);
  return toolbar;
}

function copyFallback(source: string) {
  const active = document.activeElement as HTMLElement | null;
  const selection = document.getSelection();
  const ranges = selection
    ? Array.from({ length: selection.rangeCount }, (_, index) =>
        selection.getRangeAt(index).cloneRange(),
      )
    : [];
  const input = document.createElement('textarea');
  input.value = source;
  input.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0';
  document.body.append(input);
  try {
    input.select();
    if (!document.execCommand('copy')) throw new Error('Copy failed');
  } finally {
    input.remove();
    active?.focus({ preventScroll: true });
    selection?.removeAllRanges();
    ranges.forEach((range) => selection?.addRange(range));
  }
}
