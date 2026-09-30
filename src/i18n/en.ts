import type { CycleError } from '../domain/cycles';
import type { OnboardingError } from '../domain/onboarding';

export type WeekdayLabels = [string, string, string, string, string, string, string];

export type Messages = {
  appName: string;
  onboardingSubtitle: string;
  lastPeriodStarted: string;
  lastPeriodHint: string;
  usualCycleLength: string;
  usualCycleHint: string;
  usualBleedingLength: string;
  usualBleedingHint: string;
  continue: string;
  saving: string;
  saveFailed: string;
  disclaimer: string;
  databaseError: string;
  previousMonth: string;
  nextMonth: string;
  today: string;
  weekdays: WeekdayLabels;
  period: string;
  predicted: string;
  predictedPeriod: string;
  ovulation: string;
  estimatedOvulation: string;
  fertileWindow: string;
  estimatedFertileWindow: string;
  nextPeriod: string;
  cycleLength: string;
  cycleLengthValue: string;
  lateOne: string;
  lateOther: string;
  periodLate: string;
  emptyPrediction: string;
  invalidDate: string;
  nothingThisDay: string;
  periodStarted: string;
  periodEnded: string;
  removePeriod: string;
  removePeriodTitle: string;
  removePeriodBody: string;
  cancel: string;
  remove: string;
  logThroughToday: string;
  day: string;
  dateWithYear: string;
  monthYear: string;
  monthDay: string;
  moon: Record<'new' | 'waxing' | 'full' | 'waning', string>;
  onboardingError: Record<OnboardingError, string>;
  cycleError: Record<CycleError, string>;
};

/** English is the source language. Other catalogs must match this shape. */
export const en: Messages = {
  appName: 'Lunario',
  onboardingSubtitle: 'A cycle diary that stays on this phone.',
  lastPeriodStarted: 'Last period started',
  lastPeriodHint: 'The first day of bleeding, not the day it ended.',
  usualCycleLength: 'Usual cycle length',
  usualCycleHint: 'Days from one period start to the next.',
  usualBleedingLength: 'Usual bleeding length',
  usualBleedingHint: 'How many days your period usually lasts.',
  continue: 'Continue',
  saving: 'Saving…',
  saveFailed: 'Could not save on this phone.',
  disclaimer: 'Dates are estimates from your cycles. Lunario is not a contraceptive method.',
  databaseError: 'Could not open the local database.',
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  today: 'Today',
  weekdays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  period: 'Period',
  predicted: 'Predicted',
  predictedPeriod: 'Predicted period',
  ovulation: 'Ovulation',
  estimatedOvulation: 'Estimated ovulation',
  fertileWindow: 'Fertile window',
  estimatedFertileWindow: 'Estimated fertile window',
  nextPeriod: 'Next period',
  cycleLength: 'Cycle length',
  cycleLengthValue: '{{count}} days',
  lateOne: '1 day late',
  lateOther: '{{count}} days late',
  periodLate: 'This expected period is late',
  emptyPrediction: 'Log a period to see estimates.',
  invalidDate: 'That date is not valid.',
  nothingThisDay: 'Nothing logged or estimated for this day.',
  periodStarted: 'Period started',
  periodEnded: 'Period ended',
  removePeriod: 'Remove this period',
  removePeriodTitle: 'Remove this period?',
  removePeriodBody: 'This removes the latest period from this phone.',
  cancel: 'Cancel',
  remove: 'Remove',
  logThroughToday: 'You can log a period through today.',
  day: 'Day',
  dateWithYear: 'MMMM d, yyyy',
  monthYear: 'MMMM yyyy',
  monthDay: 'MMMM d',
  moon: {
    new: 'New moon',
    waxing: 'Waxing',
    full: 'Full moon',
    waning: 'Waning',
  },
  onboardingError: {
    'invalid-date': 'Enter the day your last period started. It cannot be in the future.',
    'cycle-length':
      'Cycle length is the number of days from one period start to the next. Use a whole number from 15 to 90.',
    'period-length': 'Bleeding length is how many days your period usually lasts. Use a whole number from 1 to 14.',
  },
  cycleError: {
    future: 'You can log a period through today.',
    'already-started': 'A period already starts on this day.',
    'inside-period': 'This day is already part of a period.',
    'before-latest': 'A new period has to start after your latest one.',
    'no-open-period': 'There is no open period to end.',
    'before-start': 'The period cannot end before it starts.',
    'nothing-to-remove': 'There is no period to remove.',
  },
};
