/** A zero limit is unlimited. Deadlines include time spent in hidden tabs. */
export function studyClock(start: number, limitSeconds = 0, now = Date.now()) {
  const remainingMs = Math.max(0, start + limitSeconds * 1000 - now);
  return {
    limited: limitSeconds > 0,
    remainingSeconds: Math.ceil(remainingMs / 1000),
    expired: limitSeconds > 0 && remainingMs === 0,
    warning: limitSeconds > 0 && remainingMs <= (limitSeconds * 1000) / 3,
  };
}

export function durationSeconds(
  hours: number,
  minutes: number,
  seconds: number,
) {
  if (
    ![hours, minutes, seconds].every(Number.isInteger) ||
    hours < 0 ||
    hours > 99 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  )
    return undefined;
  return hours * 3600 + minutes * 60 + seconds;
}

export function formatCountdown(seconds: number) {
  const total = Math.max(0, Math.ceil(seconds));
  return [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}
