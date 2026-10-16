import { dateKey } from '../../core/utils';

/** Calendar days use the user's local timezone, including both boundary dates. */
export function filterSessionDates<T extends { date: number }>(
  sessions: readonly T[],
  from = '',
  to = '',
): T[] {
  return sessions.filter((session) => {
    const day = dateKey(session.date);
    return (!from || day >= from) && (!to || day <= to);
  });
}
