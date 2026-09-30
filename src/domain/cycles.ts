import { addDaysKey, type DateKey } from './dates';
import { sortCycles, type Cycle } from './predict';

export type CycleError =
  | 'future'
  | 'already-started'
  | 'inside-period'
  | 'before-latest'
  | 'no-open-period'
  | 'before-start'
  | 'nothing-to-remove';

export type CycleUpdate = { ok: true; cycles: Cycle[] } | { ok: false; error: CycleError };

export function initialCycle(startDate: DateKey, periodLength: number, today: DateKey): Cycle {
  const expectedEnd = addDaysKey(startDate, periodLength - 1);
  if (expectedEnd < today) return { startDate, endDate: expectedEnd };
  return { startDate, endDate: null };
}

export function applyPeriodStart(cycles: Cycle[], date: DateKey, today: DateKey): CycleUpdate {
  if (date > today) return { ok: false, error: 'future' };

  const sorted = sortCycles(cycles);
  if (sorted.some((cycle) => cycle.startDate === date)) {
    return { ok: false, error: 'already-started' };
  }

  for (const cycle of sorted) {
    if (cycle.endDate && date > cycle.startDate && date <= cycle.endDate) {
      return { ok: false, error: 'inside-period' };
    }
  }

  const latest = sorted[sorted.length - 1];
  if (latest && date < latest.startDate) return { ok: false, error: 'before-latest' };

  const next = sorted.map((cycle) => ({ ...cycle }));
  if (latest && !latest.endDate && date > latest.startDate) {
    next[next.length - 1] = { ...latest, endDate: addDaysKey(date, -1) };
  }
  next.push({ startDate: date, endDate: null });
  return { ok: true, cycles: next };
}

export function applyPeriodEnd(cycles: Cycle[], date: DateKey, today: DateKey): CycleUpdate {
  if (date > today) return { ok: false, error: 'future' };

  const sorted = sortCycles(cycles);
  const latest = sorted[sorted.length - 1];
  if (!latest || latest.endDate) return { ok: false, error: 'no-open-period' };
  if (date < latest.startDate) return { ok: false, error: 'before-start' };

  const next = sorted.slice(0, -1).map((cycle) => ({ ...cycle }));
  next.push({ ...latest, endDate: date });
  return { ok: true, cycles: next };
}

export function removeLatestCycle(cycles: Cycle[]): CycleUpdate {
  const sorted = sortCycles(cycles);
  if (sorted.length === 0) return { ok: false, error: 'nothing-to-remove' };
  return { ok: true, cycles: sorted.slice(0, -1).map((cycle) => ({ ...cycle })) };
}
