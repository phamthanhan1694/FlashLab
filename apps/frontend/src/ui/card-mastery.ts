import { masteryRequirements, type Card } from '@flashlab/shared';

/** Show the saved SRS level, separate from the current session's self-assessment. */
export function cardMasteryMarkup(
  card: Pick<Card, 'level' | 'last' | 'masteryProgress'>,
  pending = false,
): string {
  const level = card.level;
  const required = masteryRequirements(level);
  const progress = card.masteryProgress;
  const names = {
    flashcards: 'Thẻ ghi nhớ',
    learn: 'Trắc nghiệm',
    write: 'Viết',
    match: 'Ghép thẻ',
    test: 'Kiểm tra',
  };
  const state =
    level >= 3
      ? 'Thành thạo'
      : level > 0
        ? 'Đang học'
        : card.last
          ? 'Cần học lại'
          : 'Chưa học';
  const tone = level >= 3 ? 'mastered' : level > 0 ? 'learning' : 'new';
  const rows = Object.entries(names)
    .map(([mode, name]) => {
      const key = mode as keyof typeof names;
      const needed =
        key === 'test'
          ? required.testCorrect
          : required.modes.includes(key)
            ? 1
            : 0;
      const earned =
        progress?.modeCorrect?.[key] ??
        (key === 'test'
          ? (progress?.testCorrect ?? 0)
          : progress?.modes.includes(key)
            ? 1
            : 0);
      return `<li><span>${name}</span><strong data-user-content>${earned} / ${needed || '—'}</strong>${needed === 0 ? '<small>Không bắt buộc</small>' : ''}</li>`;
    })
    .join('');
  return `<div class="mastery-details"><span class="card-mastery ${tone}" data-card-level="${level}"><span>Cấp</span> <strong data-user-content>${level}/6</strong><span class="mastery-state">${state}</span></span>${level < 6 ? `<small class="mastery-progress" data-user-content>${progress?.correct ?? 0}/${required.correct}</small>` : ''}<button type="button" class="mastery-info" data-mastery-info aria-label="Chi tiết thành thạo" aria-expanded="false">i</button><div class="mastery-breakdown" hidden>${level === 6 ? '<strong>Đã đạt cấp tối đa</strong>' : `<strong><span>Tiến độ lên cấp</span> <span data-user-content>${level + 1}</span></strong><p><span>Điểm tiến độ</span>: <b data-user-content>${progress?.correct ?? 0} / ${required.correct}</b></p><ul>${rows}</ul><p>Tiến độ tại cấp hiện tại / yêu cầu tối thiểu. Câu sai trừ điểm và lượt của dạng bài vừa làm. Cần đủ điểm và từng dạng bắt buộc.</p>`}</div></div>${pending ? '<small class="mastery-pending">Cấp cập nhật khi kết thúc phiên</small>' : ''}`;
}

let dismiss: (() => void) | undefined;
export function closeMasteryInfo() {
  dismiss?.();
}
export function initializeMasteryInfo() {
  document.addEventListener(
    'click',
    (event) => {
      const target = event.target instanceof Element ? event.target : null;
      const button = target?.closest<HTMLButtonElement>('[data-mastery-info]');
      if (!button) {
        if (!target?.closest('.mastery-popover')) closeMasteryInfo();
        return;
      }
      const wasOpen = button.getAttribute('aria-expanded') === 'true';
      closeMasteryInfo();
      if (wasOpen) return;
      const source = button
        .closest('.mastery-details')
        ?.querySelector<HTMLElement>('.mastery-breakdown');
      if (!source) return;
      const panel = source.cloneNode(true) as HTMLElement;
      panel.hidden = false;
      panel.classList.add('mastery-popover');
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-label', button.getAttribute('aria-label')!);
      document.body.append(panel);
      button.setAttribute('aria-expanded', 'true');
      const rect = button.getBoundingClientRect();
      const width = panel.getBoundingClientRect().width || 320;
      const height = panel.getBoundingClientRect().height || 300;
      panel.style.left =
        Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)) +
        'px';
      panel.style.top =
        Math.max(
          12,
          rect.top >= height + 20
            ? rect.top - height - 8
            : Math.min(rect.bottom + 8, window.innerHeight - height - 12),
        ) + 'px';
      dismiss = () => {
        panel.remove();
        button.setAttribute('aria-expanded', 'false');
        dismiss = undefined;
      };
    },
    true,
  );
  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key === 'Escape' && dismiss) {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeMasteryInfo();
      }
    },
    true,
  );
  window.addEventListener('resize', closeMasteryInfo);
  window.addEventListener(
    'scroll',
    (event) => {
      if (!(
        event.target instanceof Element &&
        event.target.closest('.mastery-popover')
      ))
        closeMasteryInfo();
    },
    true,
  );
}
