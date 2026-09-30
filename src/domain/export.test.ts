import { blankLog } from './log';
import { buildExport } from './export';

describe('buildExport', () => {
  it('keeps cycles and non-empty logs in date order', () => {
    const document = buildExport({
      exportedOn: '2026-09-30',
      settings: {
        cycleLength: 28,
        periodLength: 5,
        showFertileWindow: true,
        reminderEnabled: false,
        reminderDaysBefore: 2,
      },
      cycles: [
        { startDate: '2026-02-01', endDate: null },
        { startDate: '2026-01-01', endDate: '2026-01-05' },
      ],
      logs: [
        { ...blankLog('2026-02-02'), note: '  headache  ' },
        blankLog('2026-02-03'),
        { ...blankLog('2026-01-02'), flow: 'medium' },
      ],
    });

    expect(document.app).toBe('lunario');
    expect(document.cycles.map((cycle) => cycle.startDate)).toEqual(['2026-01-01', '2026-02-01']);
    expect(document.logs).toEqual([
      { ...blankLog('2026-01-02'), flow: 'medium' },
      { ...blankLog('2026-02-02'), note: 'headache' },
    ]);
  });
});
