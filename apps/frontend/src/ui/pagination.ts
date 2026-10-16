/** Numeric page links with a bounded window for long lists. Attributes are supplied by callers. */
export function pageButtons(
  current: number,
  total: number,
  attributes: (page: number) => string,
): string {
  const pages = new Set([1, total]);
  for (
    let page = Math.max(1, current - 2);
    page <= Math.min(total, current + 2);
    page++
  )
    pages.add(page);
  if (total <= 7) for (let page = 1; page <= total; page++) pages.add(page);
  let previous = 0;
  const numbers = [...pages]
    .sort((a, b) => a - b)
    .map((page) => {
      const gap =
        previous && page > previous + 1
          ? '<span class="page-gap" aria-hidden="true">…</span>'
          : '';
      previous = page;
      return `${gap}<button type="button" class="btn ${page === current ? 'primary' : 'outline'} small page-number" ${attributes(page)} ${page === current ? 'aria-current="page"' : ''} data-user-content>${page}</button>`;
    })
    .join('');
  const arrow = (next: boolean) => {
    const disabled = next ? current >= total : current <= 1;
    const label = next ? 'Trang sau' : 'Trang trước';
    return `<button type="button" class="btn outline small page-arrow" aria-label="${label}" title="${label}" ${disabled ? 'disabled' : attributes(current + (next ? 1 : -1))}><span aria-hidden="true">${next ? '→' : '←'}</span></button>`;
  };
  return arrow(false) + numbers + arrow(true);
}
