export type TileSize = 'small' | 'medium' | 'large';
const widths = { small: 170, medium: 220, large: 285 };
export function tilePageCapacity(width: number, size: TileSize): number {
  return (
    Math.max(1, Math.floor((Math.max(0, width) + 14) / (widths[size] + 14))) * 2
  );
}
export function tilePageSize(): number {
  const container = document.getElementById('content');
  const style = container ? getComputedStyle(container) : undefined;
  const padding =
    (parseFloat(style?.paddingLeft ?? '') || 0) +
    (parseFloat(style?.paddingRight ?? '') || 0);
  const width = container?.clientWidth
    ? container.clientWidth - padding
    : Math.max(280, window.innerWidth - 80);
  const size = document.documentElement.dataset.tileSize as
    TileSize | undefined;
  return tilePageCapacity(width, size ?? 'medium');
}
export function tileSizeMarkup(): string {
  const size = document.documentElement.dataset.tileSize ?? 'medium';
  return `<div class="tile-size-toolbar"><label>Kích thước ô <select data-tile-size aria-label="Kích thước ô"><option value="small" ${size === 'small' ? 'selected' : ''}>Bé</option><option value="medium" ${size === 'medium' ? 'selected' : ''}>Trung bình</option><option value="large" ${size === 'large' ? 'selected' : ''}>Lớn</option></select></label></div>`;
}
export function applyTileSize(size: TileSize = 'medium') {
  document.documentElement.dataset.tileSize = size;
  document
    .querySelectorAll<HTMLSelectElement>('select[data-tile-size]')
    .forEach((select) => (select.value = size));
}
export function initializeTileSettings(
  size: TileSize,
  change: (size: TileSize) => void,
) {
  applyTileSize(size);
  const refresh = () => document.dispatchEvent(new Event('tile-layout-change'));
  document.addEventListener('change', (event) => {
    if (
      !(event.target instanceof HTMLSelectElement) ||
      !event.target.matches('[data-tile-size]')
    )
      return;
    const value = event.target.value as TileSize;
    if (!['small', 'medium', 'large'].includes(value)) return;
    applyTileSize(value);
    change(value);
    refresh();
  });
  let timer: ReturnType<typeof setTimeout>;
  let previousWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    if (window.innerWidth === previousWidth) return;
    previousWidth = window.innerWidth;
    clearTimeout(timer);
    timer = setTimeout(refresh, 120);
  });
}
