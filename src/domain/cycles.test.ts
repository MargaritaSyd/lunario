import {
  applyPastPeriod,
  applyPeriodEnd,
  applyPeriodStart,
  initialCycle,
  removeLatestCycle,
  removePastCycle,
  suggestedPastPeriod,
} from './cycles';
import type { Cycle } from './predict';

function cycle(startDate: string, endDate: string | null): Cycle {
  return { startDate, endDate };
}

describe('initialCycle', () => {
  it('closes a period whose usual end is already past', () => {
    expect(initialCycle('2026-09-01', 5, '2026-09-30')).toEqual({
      startDate: '2026-09-01',
      endDate: '2026-09-05',
    });
  });

  it('leaves the period open when today is still within the usual bleeding', () => {
    expect(initialCycle('2026-09-28', 5, '2026-09-30')).toEqual({
      startDate: '2026-09-28',
      endDate: null,
    });
  });

  it('closes the period the day after the usual end', () => {
    expect(initialCycle('2026-09-25', 5, '2026-09-30').endDate).toBe('2026-09-29');
  });
});

describe('applyPeriodStart', () => {
  const today = '2026-09-30';

  it('closes an open period the day before the new start', () => {
    const result = applyPeriodStart([cycle('2026-01-01', null)], '2026-02-01', '2026-03-01');

    expect(result).toEqual({
      ok: true,
      cycles: [cycle('2026-01-01', '2026-01-31'), cycle('2026-02-01', null)],
    });
  });

  it('rejects a start inside a closed period, before the latest start, or in the future', () => {
    const cycles = [cycle('2026-09-01', '2026-09-05')];

    expect(applyPeriodStart(cycles, '2026-09-04', today).ok).toBe(false);
    expect(applyPeriodStart(cycles, '2026-08-01', today)).toMatchObject({ error: 'before-latest' });
    expect(applyPeriodStart(cycles, '2026-10-01', today)).toMatchObject({ error: 'future' });
    expect(applyPeriodStart(cycles, '2026-09-01', today)).toMatchObject({ error: 'already-started' });
  });
});

describe('applyPeriodEnd', () => {
  it('sets the end on the open period', () => {
    const result = applyPeriodEnd([cycle('2026-09-28', null)], '2026-09-30', '2026-09-30');

    expect(result).toEqual({ ok: true, cycles: [cycle('2026-09-28', '2026-09-30')] });
  });

  it('rejects an end when the latest period is already closed or the day is before the start', () => {
    expect(applyPeriodEnd([cycle('2026-09-01', '2026-09-05')], '2026-09-06', '2026-09-30')).toMatchObject({
      error: 'no-open-period',
    });
    expect(applyPeriodEnd([cycle('2026-09-28', null)], '2026-09-27', '2026-09-30')).toMatchObject({
      error: 'before-start',
    });
  });
});

describe('applyPastPeriod', () => {
  const today = '2026-09-30';

  it('inserts a finished period before the most recent one, including into a gap', () => {
    const cycles = [cycle('2026-03-01', '2026-03-05'), cycle('2026-05-01', null)];

    expect(applyPastPeriod(cycles, '2026-01-01', '2026-01-05', today)).toEqual({
      ok: true,
      cycles: [cycle('2026-01-01', '2026-01-05'), cycle('2026-03-01', '2026-03-05'), cycle('2026-05-01', null)],
    });
    expect(applyPastPeriod(cycles, '2026-04-01', '2026-04-04', today).ok).toBe(true);
  });

  it('rejects a future date, an end before the start, the latest period, and an overlap', () => {
    const cycles = [cycle('2026-09-01', '2026-09-05'), cycle('2026-09-20', null)];

    expect(applyPastPeriod(cycles, '2026-10-01', '2026-10-05', today)).toMatchObject({ error: 'future' });
    expect(applyPastPeriod(cycles, '2026-08-10', '2026-08-01', today)).toMatchObject({ error: 'before-start' });
    expect(applyPastPeriod(cycles, '2026-09-20', '2026-09-24', today)).toMatchObject({ error: 'not-past' });
    expect(applyPastPeriod(cycles, '2026-08-28', '2026-09-02', today)).toMatchObject({ error: 'overlaps' });
  });
});

describe('removePastCycle', () => {
  it('removes an earlier period and keeps the latest', () => {
    const cycles = [cycle('2026-08-01', '2026-08-05'), cycle('2026-09-01', null)];

    expect(removePastCycle(cycles, '2026-08-01')).toEqual({ ok: true, cycles: [cycle('2026-09-01', null)] });
    expect(removePastCycle(cycles, '2026-09-01')).toMatchObject({ error: 'not-past' });
  });
});

describe('suggestedPastPeriod', () => {
  const today = '2026-09-30';

  it('places a usual period one cycle before the earliest start', () => {
    expect(suggestedPastPeriod('2026-09-29', 28, 5, today)).toEqual({
      start: '2026-09-01',
      end: '2026-09-05',
    });
  });

  it('stops the day before the earliest start and does not run past today', () => {
    expect(suggestedPastPeriod('2026-09-03', 3, 5, '2026-10-01')).toEqual({
      start: '2026-08-31',
      end: '2026-09-02',
    });
    expect(suggestedPastPeriod('2026-10-20', 28, 10, today)).toEqual({
      start: '2026-09-22',
      end: '2026-09-30',
    });
  });

  it('does not end before it starts', () => {
    expect(suggestedPastPeriod('2026-09-01', 0, 5, today)).toEqual({
      start: '2026-09-01',
      end: '2026-09-01',
    });
    expect(suggestedPastPeriod('2026-10-20', 5, 5, today)).toEqual({
      start: '2026-09-30',
      end: '2026-09-30',
    });
  });
});

describe('removeLatestCycle', () => {
  it('drops only the latest period', () => {
    const result = removeLatestCycle([
      cycle('2026-08-01', '2026-08-05'),
      cycle('2026-09-01', null),
    ]);

    expect(result).toEqual({ ok: true, cycles: [cycle('2026-08-01', '2026-08-05')] });
  });
});
