import type { Study } from '../types/study-types';
import { formatCountdown, studyClock } from '../features/study/timer';
import { ico } from './icons';

export function timeLimitMarkup(limit: number, test: boolean) {
  const seconds = limit || 900;
  return (
    '<fieldset class="study-time-settings"><legend>Giới hạn thời gian</legend>' +
    '<label><input type="checkbox" id="setup-time-enabled" ' +
    (limit ? 'checked' : '') +
    '> Bật giới hạn thời gian</label>' +
    '<div class="study-time-fields" ' +
    (limit ? '' : 'hidden') +
    '>' +
    [
      ['hours', 'Giờ', 99, Math.floor(seconds / 3600)],
      ['minutes', 'Phút', 59, Math.floor(seconds / 60) % 60],
      ['seconds', 'Giây', 59, seconds % 60],
    ]
      .map(
        ([id, label, max, value]) =>
          '<div class="form-field"><label for="setup-time-' +
          id +
          '">' +
          label +
          '</label><input id="setup-time-' +
          id +
          '" type="number" min="0" max="' +
          max +
          '" step="1" value="' +
          value +
          '" ' +
          (limit ? '' : 'disabled') +
          '></div>',
      )
      .join('') +
    '</div><p class="help-note">Mặc định không giới hạn. Thời gian bắt đầu khi bấm Bắt đầu và vẫn chạy khi mở Cài đặt hoặc chuyển ứng dụng. Còn 1/3 thời gian sẽ hiện cảnh báo đỏ liên tục.</p>' +
    (test
      ? '<p class="help-note">Hết giờ tự nộp: chỉ câu đã xác nhận được chấm; câu chưa xác nhận hoặc bỏ trống tính sai.</p>'
      : '<p class="help-note">Hết giờ kết thúc phiên và lưu phần đã học; thẻ chưa làm không bị tính sai.</p>') +
    '</fieldset>'
  );
}

export function studyWarningMarkup(study: Study) {
  if (!study.timeLimitSeconds || study.finished) return '';
  const clock = studyClock(study.startTime, study.timeLimitSeconds);
  return (
    '<div class="study-deadline-warning" ' +
    (clock.warning ? '' : 'hidden') +
    '><span aria-hidden="true">' +
    ico('clock', 18) +
    '</span><span role="status">Sắp hết thời gian — còn tối đa 1/3 thời lượng.</span><strong data-time-remaining data-user-content>' +
    formatCountdown(clock.remainingSeconds) +
    '</strong></div>'
  );
}

export function studyTimerMarkup(study: Study) {
  const clock = studyClock(
    study.startTime,
    study.timeLimitSeconds,
    study.endTime || Date.now(),
  );
  const elapsed = Math.max(
    0,
    Math.floor(((study.endTime || Date.now()) - study.startTime) / 1000),
  );
  const label = clock.limited ? 'Còn lại' : 'Thời gian';
  const formatted = clock.limited
    ? formatCountdown(clock.remainingSeconds)
    : elapsed >= 3600
      ? formatCountdown(elapsed)
      : formatCountdown(elapsed).slice(3);
  return (
    '<span class="study-clock">' +
    ico('clock', 16) +
    '<span>' +
    label +
    '</span> <strong data-study-time data-user-content>' +
    formatted +
    '</strong></span>'
  );
}

export function studyTimeoutMarkup(study: Study) {
  if (!study.expired) return '';
  return (
    '<p class="help-note" role="status">' +
    (study.mode === 'test'
      ? 'Hết thời gian. Bài đã tự nộp; câu chưa xác nhận hoặc bỏ trống tính sai.'
      : 'Hết thời gian. Đã lưu phần đã học; thẻ chưa làm không bị tính sai.') +
    '</p>'
  );
}

export function sessionLimitMarkup(session: {
  timeLimitSeconds?: number;
  timedOut?: boolean;
}) {
  return (
    (session.timedOut ? '<span>Hết thời gian</span>' : '') +
    (session.timeLimitSeconds
      ? '<span><span>Giới hạn thời gian</span>: <strong data-user-content>' +
        formatCountdown(session.timeLimitSeconds) +
        '</strong></span>'
      : '')
  );
}
