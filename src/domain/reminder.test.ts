import { clampReminderDays, reminderDate, reminderTrigger } from './reminder';

describe('reminderDate', () => {
  it('lands the chosen number of days before the estimate', () => {
    expect(reminderDate('2026-10-10', 2, '2026-09-30', false)).toBe('2026-10-08');
    expect(reminderDate('2026-10-10', 0, '2026-10-10', false)).toBe('2026-10-10');
  });

  it('skips a late period and a reminder day that already passed', () => {
    expect(reminderDate('2026-09-20', 2, '2026-09-30', true)).toBeNull();
    expect(reminderDate('2026-10-01', 2, '2026-09-30', false)).toBeNull();
    expect(clampReminderDays(2)).toBe(2);
    expect(clampReminderDays(8)).toBeNull();
    expect(clampReminderDays(1.5)).toBeNull();
  });
});

describe('reminderTrigger', () => {
  it('uses 9:00 local time, or one minute from now after that', () => {
    const morning = new Date(2026, 8, 30, 8, 0, 0);
    const atNine = reminderTrigger('2026-09-30', morning);
    expect(atNine?.getHours()).toBe(9);
    expect(atNine?.getDate()).toBe(30);

    const afternoon = new Date(2026, 8, 30, 10, 0, 0);
    expect(reminderTrigger('2026-09-30', afternoon)?.getTime()).toBe(afternoon.getTime() + 60_000);

    const tomorrow = reminderTrigger('2026-10-01', afternoon);
    expect(tomorrow?.getDate()).toBe(1);
    expect(tomorrow?.getHours()).toBe(9);
    expect(reminderTrigger(null, afternoon)).toBeNull();
  });
});
