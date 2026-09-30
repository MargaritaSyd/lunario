import { getISODay, parseISO } from 'date-fns';

import { addDaysKey, type DateKey } from './dates';

/** Monday-first cells for the month containing `day`. Leading and trailing blanks are null. */
export function monthGrid(day: DateKey): Array<DateKey | null> {
  const monthStart = `${day.slice(0, 7)}-01`;
  const lead = getISODay(parseISO(monthStart)) - 1;
  const cells: Array<DateKey | null> = Array.from({ length: lead }, () => null);

  let cursor = monthStart;
  cells.push(cursor);
  while (true) {
    const next = addDaysKey(cursor, 1);
    if (next.slice(0, 7) !== monthStart.slice(0, 7)) break;
    cells.push(next);
    cursor = next;
  }

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
