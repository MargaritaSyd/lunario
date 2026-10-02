import { addDaysKey, addMonthsKey, diffDays, endOfToday, isDateKey, todayKey } from './dates';

function localKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

describe('isDateKey', () => {
  it('accepts a real calendar day, including a leap day', () => {
    expect(isDateKey('2026-02-28')).toBe(true);
    expect(isDateKey('2024-02-29')).toBe(true);
  });

  it('rejects a day that is not on the calendar', () => {
    expect(isDateKey('2026-02-29')).toBe(false);
    expect(isDateKey('2026-02-31')).toBe(false);
    expect(isDateKey('2026-13-01')).toBe(false);
    expect(isDateKey('2026-2-01')).toBe(false);
    expect(isDateKey('yesterday')).toBe(false);
  });
});

describe('calendar arithmetic', () => {
  it('crosses months, years, and leap day', () => {
    expect(addDaysKey('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysKey('2026-02-28', 1)).toBe('2026-03-01');
    expect(addDaysKey('2024-02-28', 1)).toBe('2024-02-29');
    expect(diffDays('2026-03-01', '2026-02-28')).toBe(1);
    expect(diffDays('2024-03-01', '2024-02-28')).toBe(2);
  });

  it('moves a month without inventing a day', () => {
    expect(addMonthsKey('2026-01-31', 1)).toBe('2026-02-28');
    expect(addMonthsKey('2026-03-15', -1)).toBe('2026-02-15');
    expect(addMonthsKey('2026-12-15', 1)).toBe('2027-01-15');
  });
});

describe('todayKey', () => {
  it('uses the local calendar day', () => {
    const lateEvening = new Date(2026, 8, 30, 23, 30, 0);
    const earlyMorning = new Date(2026, 8, 30, 0, 30, 0);
    const sample = lateEvening.getTimezoneOffset() > 0 ? lateEvening : earlyMorning;

    expect(todayKey(sample)).toBe(localKey(sample));
    if (sample.getTimezoneOffset() !== 0) {
      expect(sample.toISOString().slice(0, 10)).not.toBe(localKey(sample));
    }
  });
});

describe('endOfToday', () => {
  it('lands on the last millisecond of the same local day', () => {
    const end = endOfToday(new Date(2026, 8, 30, 8, 15, 0));

    expect(end.getFullYear()).toBe(2026);
    expect(end.getMonth()).toBe(8);
    expect(end.getDate()).toBe(30);
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
    expect(end.getMilliseconds()).toBe(999);
  });
});
