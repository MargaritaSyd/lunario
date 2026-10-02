import { dayContext } from './day-context';
import type { Cycle, PredictionSettings } from './predict';

const settings: PredictionSettings = { cycleLength: 28, periodLength: 5, showFertileWindow: true };

function cycle(startDate: string, endDate: string | null): Cycle {
  return { startDate, endDate };
}

describe('dayContext', () => {
  const cycles = [cycle('2026-09-01', '2026-09-05'), cycle('2026-09-29', null)];
  const today = '2026-09-30';

  it('marks bleeding, the days around it, ovulation, and the fertile window', () => {
    expect(dayContext(cycles, settings, today, '2026-09-03').pastPeriod).toBe(true);
    expect(dayContext(cycles, settings, today, '2026-09-07').afterBleeding).toBe(true);
    expect(dayContext(cycles, settings, today, '2026-09-12').fertile).toBe(true);
    expect(dayContext(cycles, settings, today, '2026-09-15')).toMatchObject({ ovulation: true, fertile: true });
    expect(dayContext(cycles, settings, today, '2026-09-20').beforeBleeding).toBe(true);
    expect(dayContext(cycles, settings, today, '2026-09-29').currentPeriod).toBe(true);
    expect(dayContext(cycles, settings, today, '2026-08-20').beforeBleeding).toBe(true);
  });

  it('has no phase when nothing is logged', () => {
    expect(dayContext([], settings, today, '2026-09-03')).toEqual({
      currentPeriod: false,
      pastPeriod: false,
      ovulation: false,
      fertile: false,
      beforeBleeding: false,
      afterBleeding: false,
    });
  });

  it('does not extend an open period past today', () => {
    const open = [cycle('2026-09-28', null)];

    expect(dayContext(open, settings, today, '2026-09-30').currentPeriod).toBe(true);
    expect(dayContext(open, settings, today, '2026-10-01')).toMatchObject({
      currentPeriod: false,
      pastPeriod: false,
    });
  });

  it('marks a late expected start as before bleeding, not as bleeding', () => {
    expect(dayContext([cycle('2026-08-01', '2026-08-05')], settings, today, '2026-08-29')).toMatchObject({
      currentPeriod: false,
      pastPeriod: false,
      beforeBleeding: true,
    });
  });
});
