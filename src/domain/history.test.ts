import { averageCycleLength, cycleHistory } from './history';
import type { Cycle } from './predict';

function cycle(startDate: string, endDate: string | null): Cycle {
  return { startDate, endDate };
}

describe('cycleHistory', () => {
  it('lists newest cycles first, with length only after the next start', () => {
    const entries = cycleHistory([
      cycle('2026-01-01', '2026-01-05'),
      cycle('2026-01-29', '2026-02-02'),
      cycle('2026-02-27', null),
    ]);

    expect(entries).toEqual([
      { startDate: '2026-02-27', endDate: null, bleedingDays: null, cycleDays: null },
      { startDate: '2026-01-29', endDate: '2026-02-02', bleedingDays: 5, cycleDays: 29 },
      { startDate: '2026-01-01', endDate: '2026-01-05', bleedingDays: 5, cycleDays: 28 },
    ]);
    expect(averageCycleLength(entries.map((entry) => cycle(entry.startDate, entry.endDate)))).toBe(29);
  });

  it('has no average until two periods have started', () => {
    expect(averageCycleLength([cycle('2026-09-01', '2026-09-05')])).toBeNull();
  });
});
