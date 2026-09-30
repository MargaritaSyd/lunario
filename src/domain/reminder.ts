import { addDaysKey, todayKey, type DateKey } from './dates';

export const MIN_REMINDER_DAYS = 0;
export const MAX_REMINDER_DAYS = 7;
const REMINDER_HOUR = 9;

export function clampReminderDays(value: number): number | null {
  if (!Number.isInteger(value) || value < MIN_REMINDER_DAYS || value > MAX_REMINDER_DAYS) return null;
  return value;
}

/** The calendar day of the reminder. A late period is not notified again. */
export function reminderDate(nextStart: DateKey, daysBefore: number, today: DateKey, late: boolean): DateKey | null {
  if (late) return null;
  const day = addDaysKey(nextStart, -daysBefore);
  if (day < today) return null;
  return day;
}

/**
 * Local time for that reminder day: 9:00, or one minute from now if 9:00 has passed today.
 */
export function reminderTrigger(day: DateKey | null, now = new Date()): Date | null {
  if (!day) return null;
  const today = todayKey(now);
  if (day < today) return null;
  const atNine = new Date(Number(day.slice(0, 4)), Number(day.slice(5, 7)) - 1, Number(day.slice(8, 10)), REMINDER_HOUR, 0, 0, 0);
  if (day > today || now.getTime() < atNine.getTime()) return atNine;
  return new Date(now.getTime() + 60_000);
}
