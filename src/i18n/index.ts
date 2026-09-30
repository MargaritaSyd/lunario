import { getLocales } from 'expo-localization';
import type { Locale } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import { es as esDates } from 'date-fns/locale/es';

import { en } from './en';
import { es } from './es';
import { fill, languageFromCode, type Language } from './language';

const catalogs = { en, es } as const;
const dateLocales: Record<Language, Locale> = { en: enUS, es: esDates };

const device = getLocales()[0];
export const language = languageFromCode(device?.languageTag ?? device?.languageCode);

export const messages = catalogs[language];
export const dateLocale = dateLocales[language];

export function lateLabel(daysLate: number): string {
  if (daysLate === 1) return messages.lateOne;
  return fill(messages.lateOther, { count: daysLate });
}

export function cycleLengthLabel(days: number): string {
  return fill(messages.cycleLengthValue, { count: days });
}
