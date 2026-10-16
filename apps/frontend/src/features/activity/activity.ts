import { dateKey, esc } from '../../core/utils';

/** A smooth, fixed scale: every additional answer increases color intensity. */
export function activityIntensity(count: number) {
  const value = Math.max(0, count);
  return value / (value + 120);
}
export function activityDays(
  history: Record<string, number>,
  today = new Date(),
  year = today.getFullYear(),
) {
  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() - start.getDay());
  const last = new Date(year, 11, 31);
  last.setDate(last.getDate() + 6 - last.getDay());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = [];
  for (
    const date = new Date(start);
    date <= last;
    date.setDate(date.getDate() + 1)
  ) {
    const key = dateKey(date.getTime());
    const outside = date.getFullYear() !== year;
    const count = outside || date > end ? 0 : (history[key] ?? 0);
    days.push({
      key,
      count,
      future: date > end,
      outside,
      intensity: activityIntensity(count),
      month: date.getMonth(),
      day: date.getDate(),
    });
  }
  return days;
}
export function activityYears(created: number, today = new Date()) {
  const current = today.getFullYear();
  const start =
    created > 0 ? Math.min(current, new Date(created).getFullYear()) : current;
  return Array.from(
    { length: current - start + 1 },
    (_, index) => start + index,
  );
}
export function activityHeatmap(
  history: Record<string, number>,
  selectedYear = new Date().getFullYear(),
  created = Date.now(),
) {
  const years = activityYears(created);
  const year = years.includes(selectedYear)
    ? selectedYear
    : years[years.length - 1];
  const days = activityDays(history, new Date(), year);
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const active = days.filter((day) => day.count > 0).length;
  const weeks = days.length / 7;
  const monthStarts = [0];
  for (let week = 1; week < weeks; week++) {
    const day = days[week * 7];
    if (
      !day.outside &&
      day.month > 0 &&
      day.month !== days[(week - 1) * 7].month
    )
      monthStarts.push(week);
  }
  const monthLabels = monthStarts
    .map(
      (start, month) =>
        `<span style="grid-column:${start + 1} / span ${(monthStarts[month + 1] ?? weeks) - start}">Tháng ${month + 1}</span>`,
    )
    .join('');
  return `<section class="activity-panel table-panel" aria-label="Lịch hoạt động học tập"><div class="section-heading"><h2>Hoạt động học tập</h2><label class="activity-year-label">Năm<select id="activity-year" aria-label="Năm hoạt động">${years.map((value) => `<option value="${value}" ${value === year ? 'selected' : ''}>${value}</option>`).join('')}</select></label><span class="help-note">${total} lượt học · ${active} ngày hoạt động</span></div><div class="activity-scroll"><div class="activity-calendar"><div class="activity-weekdays"><span></span><span>T2</span><span></span><span>T4</span><span></span><span>T6</span><span></span></div><div><div class="activity-months" style="grid-template-columns:repeat(${weeks},16px)">${monthLabels}</div><div class="activity-grid" role="list" aria-label="Mức độ học tập theo ngày">${days.map((day) => `<span role="listitem" class="activity-day ${day.count === 0 ? 'activity-empty' : ''} ${day.outside ? 'activity-outside' : ''} ${day.future ? 'activity-upcoming' : ''}" style="--activity-intensity:${day.intensity}" ${day.outside ? 'aria-hidden="true"' : `tabindex="0" data-activity-date="${esc(day.key)}" aria-label="${esc(day.key)}: ${day.count} lượt học"`}></span>`).join('')}</div></div></div></div><div class="activity-legend"><span class="activity-day activity-empty" title="0 lượt học"></span><span>0</span><span>Ít</span><span class="activity-gradient" role="img" aria-label="Màu tăng liên tục theo lượt học"></span><span>Nhiều</span></div></section>`;
}
export function initializeActivityTooltip() {
  const tip = document.createElement('div');
  tip.className = 'activity-tooltip';
  tip.id = 'activity-tooltip';
  tip.setAttribute('role', 'tooltip');
  tip.hidden = true;
  document.body.appendChild(tip);
  let current: HTMLElement | null = null;
  const hide = () => {
    current?.removeAttribute('aria-describedby');
    current = null;
    tip.hidden = true;
  };
  const show = (target: EventTarget | null) => {
    const cell =
      target instanceof Element
        ? target.closest<HTMLElement>('[data-activity-date]')
        : null;
    if (!cell) return;
    current?.removeAttribute('aria-describedby');
    current = cell;
    tip.textContent = cell.getAttribute('aria-label');
    tip.hidden = false;
    cell.setAttribute('aria-describedby', tip.id);
    const rect = cell.getBoundingClientRect();
    const width = tip.getBoundingClientRect().width || 200;
    tip.style.left = `${Math.max(8, Math.min(window.innerWidth - width - 8, rect.left + rect.width / 2 - width / 2))}px`;
    tip.style.top = `${rect.top >= 48 ? rect.top - 40 : rect.bottom + 8}px`;
  };
  document.addEventListener('mouseover', (event) => show(event.target));
  document.addEventListener('focusin', (event) => show(event.target));
  document.addEventListener('mouseout', (event) => {
    if (
      event.target === current &&
      !(
        event.relatedTarget instanceof Node &&
        current?.contains(event.relatedTarget)
      )
    )
      hide();
  });
  document.addEventListener('focusout', (event) => {
    if (event.target === current) hide();
  });
  document.addEventListener('scroll', hide, true);
  window.addEventListener('resize', hide);
}
