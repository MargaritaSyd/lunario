import { applyPeriodEnd, applyPeriodStart, initialCycle, removeLatestCycle } from './cycles';
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

describe('removeLatestCycle', () => {
  it('drops only the latest period', () => {
    const result = removeLatestCycle([
      cycle('2026-08-01', '2026-08-05'),
      cycle('2026-09-01', null),
    ]);

    expect(result).toEqual({ ok: true, cycles: [cycle('2026-08-01', '2026-08-05')] });
  });
});
