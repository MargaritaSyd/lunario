import { diffDays, type DateKey } from './dates';
import { completeCycleLengths, sortCycles, type Cycle } from './predict';

export type HistoryEntry = {
  startDate: DateKey;
  endDate: DateKey | null;
  bleedingDays: number | null;
  cycleDays: number | null;
};

/** Newest cycle first. Cycle length exists once the next period has started. */
export function cycleHistory(cycles: Cycle[]): HistoryEntry[] {
  const sorted = sortCycles(cycles);
  return sorted
    .map((cycle, index) => {
      const next = sorted[index + 1];
      return {
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        bleedingDays: cycle.endDate ? diffDays(cycle.endDate, cycle.startDate) + 1 : null,
        cycleDays: next ? diffDays(next.startDate, cycle.startDate) : null,
      };
    })
    .reverse();
}

/** Rounded average of the last 6 complete cycles. This is the length used for prediction. */
export function averageCycleLength(cycles: Cycle[]): number | null {
  const lengths = completeCycleLengths(cycles);
  if (lengths.length === 0) return null;
  const sum = lengths.reduce((total, length) => total + length, 0);
  return Math.round(sum / lengths.length);
}
