import { addDays, addMonths, differenceInCalendarDays, format, parseISO, type Locale } from 'date-fns';

/** A local calendar day, `YYYY-MM-DD`. Never a timestamp. */
export type DateKey = string;

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

export function isDateKey(value: string): value is DateKey {
  if (!DATE_KEY.test(value)) return false;
  const date = parseISO(value);
  return !Number.isNaN(date.getTime()) && format(date, 'yyyy-MM-dd') === value;
}

export function todayKey(now = new Date()): DateKey {
  return format(now, 'yyyy-MM-dd');
}

export function addDaysKey(date: DateKey, days: number): DateKey {
  return format(addDays(parseISO(date), days), 'yyyy-MM-dd');
}

export function addMonthsKey(date: DateKey, months: number): DateKey {
  return format(addMonths(parseISO(date), months), 'yyyy-MM-dd');
}

export function diffDays(later: DateKey, earlier: DateKey): number {
  return differenceInCalendarDays(parseISO(later), parseISO(earlier));
}

export function formatDateKey(date: DateKey, pattern = 'MMMM d, yyyy', locale?: Locale): string {
  return format(parseISO(date), pattern, locale ? { locale } : undefined);
}

export function endOfToday(now = new Date()): Date {
  const date = new Date(now);
  date.setHours(23, 59, 59, 999);
  return date;
}
