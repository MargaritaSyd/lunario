import { addDaysKey } from './dates';
import { markDay, predict, type Cycle, type PredictionSettings } from './predict';

const settings: PredictionSettings = {
  cycleLength: 28,
  periodLength: 5,
  showFertileWindow: true,
};

function cycle(startDate: string, endDate: string | null): Cycle {
  return { startDate, endDate };
}

describe('predict', () => {
  const cycles = [
    cycle('2026-01-01', '2026-01-05'),
    cycle('2026-01-29', '2026-02-02'),
    cycle('2026-02-26', '2026-03-02'),
  ];

  it('uses the rounded average of complete cycles and a 14-day luteal phase', () => {
    const prediction = predict(cycles, settings, '2026-03-01');

    expect(prediction).toMatchObject({
      cycleLength: 28,
      periodLength: 5,
      nextStart: '2026-03-26',
      late: false,
      daysLate: 0,
      ovulation: '2026-03-12',
      fertileStart: '2026-03-07',
      fertileEnd: '2026-03-13',
      predictedStart: '2026-03-26',
      predictedEnd: '2026-03-30',
    });
  });

  it('keeps a passed period on its expected date', () => {
    const prediction = predict(cycles, settings, '2026-04-02');

    expect(prediction?.nextStart).toBe('2026-03-26');
    expect(prediction?.late).toBe(true);
    expect(prediction?.daysLate).toBe(7);
  });

  it('is not late on the expected day', () => {
    expect(predict(cycles, settings, '2026-03-26')?.late).toBe(false);
  });

  it('averages only the last 6 complete cycles', () => {
    let start = '2025-01-01';
    const logged: Cycle[] = [cycle(start, addDaysKey(start, 4))];
    for (const length of [20, 21, 22, 23, 24, 25, 26, 40]) {
      start = addDaysKey(start, length);
      logged.push(cycle(start, addDaysKey(start, 4)));
    }

    expect(predict(logged, settings, '2026-09-30')?.cycleLength).toBe(27);
  });

  it('ignores an open period when averaging bleeding length', () => {
    const logged = [cycle('2026-01-01', '2026-01-04'), cycle('2026-02-01', null)];

    expect(predict(logged, settings, '2026-02-10')?.periodLength).toBe(4);
  });

  it('falls back to onboarding defaults without history', () => {
    const prediction = predict([cycle('2026-09-01', null)], settings, '2026-09-03');

    expect(prediction?.cycleLength).toBe(28);
    expect(prediction?.periodLength).toBe(5);
    expect(prediction?.nextStart).toBe('2026-09-29');
  });

  it('returns null when nothing is logged', () => {
    expect(predict([], settings, '2026-09-30')).toBeNull();
  });
});

describe('markDay', () => {
  it('paints a closed period from start through end', () => {
    const cycles = [cycle('2026-01-01', '2026-01-05')];

    expect(markDay(cycles, settings, '2026-02-01', '2026-01-05').period).toBe(true);
    expect(markDay(cycles, settings, '2026-02-01', '2026-01-06').period).toBe(false);
  });

  it('paints an open period through today and the expected remainder as predicted', () => {
    const cycles = [cycle('2026-09-28', null)];
    const today = '2026-09-30';

    expect(markDay(cycles, settings, today, '2026-09-28').period).toBe(true);
    expect(markDay(cycles, settings, today, '2026-09-30')).toMatchObject({
      period: true,
      predicted: false,
    });
    expect(markDay(cycles, settings, today, '2026-10-01').predicted).toBe(true);
    expect(markDay(cycles, settings, today, '2026-10-02').predicted).toBe(true);
    expect(markDay(cycles, settings, today, '2026-10-03').predicted).toBe(false);
  });

  it('marks the next period, ovulation, and an inclusive fertile window', () => {
    const cycles = [
      cycle('2026-01-01', '2026-01-05'),
      cycle('2026-01-29', '2026-02-02'),
      cycle('2026-02-26', '2026-03-02'),
    ];
    const today = '2026-03-01';

    expect(markDay(cycles, settings, today, '2026-03-26')).toMatchObject({
      period: false,
      predicted: true,
    });
    expect(markDay(cycles, settings, today, '2026-03-06').fertile).toBe(false);
    expect(markDay(cycles, settings, today, '2026-03-07').fertile).toBe(true);
    expect(markDay(cycles, settings, today, '2026-03-13').fertile).toBe(true);
    expect(markDay(cycles, settings, today, '2026-03-14').fertile).toBe(false);
    expect(markDay(cycles, settings, today, '2026-03-12')).toMatchObject({
      ovulation: true,
      fertile: true,
    });
  });

  it('hides the fertile window without hiding ovulation', () => {
    const cycles = [cycle('2026-02-26', '2026-03-02')];
    const hidden = { ...settings, showFertileWindow: false };

    expect(markDay(cycles, hidden, '2026-03-01', '2026-03-12')).toMatchObject({
      ovulation: true,
      fertile: false,
    });
  });

  it('still marks a late prediction on the days it was expected', () => {
    const cycles = [cycle('2026-02-26', '2026-03-02')];

    expect(markDay(cycles, settings, '2026-04-02', '2026-03-26').predicted).toBe(true);
  });
});
