import { es as esDates } from 'date-fns/locale/es';

import { es } from './es';
import { fill } from './language';

export const language = 'es' as const;
export const messages = es;
export const dateLocale = esDates;

export function lateLabel(daysLate: number): string {
  if (daysLate === 1) return messages.lateOne;
  return fill(messages.lateOther, { count: daysLate });
}

export function cycleLengthLabel(days: number): string {
  return fill(messages.cycleLengthValue, { count: days });
}

export function reminderLabel(daysBefore: number): string {
  if (daysBefore <= 0) return messages.reminderToday;
  if (daysBefore === 1) return messages.reminderTomorrow;
  return fill(messages.reminderInDays, { count: daysBefore });
}
