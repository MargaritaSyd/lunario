import type { CycleError } from '../domain/cycles';
import type { Discharge, Flow, Mood, Pain, Sensation } from '../domain/log';
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
  addPastPeriod: string;
  pastPeriodHint: string;
  pastPeriodStarted: string;
  pastPeriodStartedHint: string;
  pastPeriodEnded: string;
  pastPeriodEndedHint: string;
  savePastPeriod: string;
  removePastPeriod: string;
  removePastTitle: string;
  removePastBody: string;
  logThroughToday: string;
  day: string;
  dateWithYear: string;
  monthYear: string;
  monthDay: string;
  moon: Record<'new' | 'waxing' | 'full' | 'waning', string>;
  currentPeriod: string;
  pastPeriodMoment: string;
  beforeBleeding: string;
  afterBleeding: string;
  logMomentHint: string;
  flow: string;
  sensations: string;
  pain: string;
  mood: string;
  discharge: string;
  note: string;
  noteHint: string;
  saveLog: string;
  flowOption: Record<Flow, string>;
  sensationOption: Record<Sensation, string>;
  painOption: Record<Pain, string>;
  moodOption: Record<Mood, string>;
  dischargeOption: Record<Discharge, string>;
  history: string;
  settings: string;
  averageCycle: string;
  historyEmpty: string;
  bleedingValue: string;
  ongoing: string;
  reminder: string;
  reminderHint: string;
  daysBefore: string;
  daysBeforeHint: string;
  reminderDaysError: string;
  notificationsDenied: string;
  reminderTitle: string;
  reminderChannel: string;
  reminderToday: string;
  reminderTomorrow: string;
  reminderInDays: string;
  exportData: string;
  exportHint: string;
  exportFailed: string;
  deleteAll: string;
  deleteAllTitle: string;
  deleteAllBody: string;
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
  addPastPeriod: 'Add an earlier period',
  pastPeriodHint: 'A period that already ended, before the most recent one. Add them one at a time.',
  pastPeriodStarted: 'Started',
  pastPeriodStartedHint: 'The first day of bleeding.',
  pastPeriodEnded: 'Ended',
  pastPeriodEndedHint: 'The last day of bleeding.',
  savePastPeriod: 'Save period',
  removePastPeriod: 'Remove',
  removePastTitle: 'Remove this period?',
  removePastBody: 'This deletes it from the record on this phone.',
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
  flow: 'Flow',
  sensations: 'Sensations',
  pain: 'Pains',
  mood: 'Moods',
  discharge: 'Discharge',
  note: 'Note',
  noteHint: 'Optional. It stays on this phone.',
  saveLog: 'Save this day',
  currentPeriod: 'Current period',
  pastPeriodMoment: 'Past period',
  beforeBleeding: 'Before bleeding',
  afterBleeding: 'After bleeding',
  logMomentHint: 'Sensations, pains, and moods can be added on this day.',
  flowOption: { spotting: 'Spotting', light: 'Light', medium: 'Medium', heavy: 'Heavy' },
  sensationOption: {
    bloating: 'Bloating',
    'breast-tenderness': 'Breast tenderness',
    fatigue: 'Fatigue',
    energy: 'Energy',
    nausea: 'Nausea',
    craving: 'Craving',
  },
  painOption: {
    cramps: 'Cramps',
    head: 'Head',
    back: 'Back',
    breasts: 'Breasts',
    'low-back': 'Low back',
    pelvis: 'Pelvis',
    mild: 'Mild',
    moderate: 'Moderate',
    severe: 'Severe',
  },
  moodOption: {
    calm: 'Calm',
    sensitive: 'Sensitive',
    low: 'Low',
    irritable: 'Irritable',
    happy: 'Cheerful',
    anxious: 'Anxious',
    tearful: 'Tearful',
  },
  dischargeOption: { dry: 'Dry', sticky: 'Sticky', creamy: 'Creamy', 'egg-white': 'Egg-white' },
  history: 'History',
  settings: 'Settings',
  averageCycle: 'Average cycle',
  historyEmpty: 'Cycle length shows up after a second period starts.',
  bleedingValue: '{{count}} days of bleeding',
  ongoing: 'Ongoing',
  reminder: 'Reminder',
  reminderHint: 'A notification before the estimated period. It is not exact to the minute.',
  daysBefore: 'Days before',
  daysBeforeHint: 'How many days before the estimated start. Use a whole number from 0 to 7.',
  reminderDaysError: 'Use a whole number from 0 to 7.',
  notificationsDenied: 'Notifications are off for Lunario in this phone\'s settings.',
  reminderTitle: 'Lunario',
  reminderChannel: 'Reminders',
  reminderToday: 'Your period is estimated to start today.',
  reminderTomorrow: 'Your period is estimated to start tomorrow.',
  reminderInDays: 'Your period is estimated to start in {{count}} days.',
  exportData: 'Export',
  exportHint: 'A JSON file of what is stored on this phone.',
  exportFailed: 'Could not export the file.',
  deleteAll: 'Delete everything',
  deleteAllTitle: 'Delete everything?',
  deleteAllBody: 'This deletes periods, notes, and settings from this phone.',
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
    'not-past': 'This period has to start before the most recent one.',
    overlaps: 'These dates overlap a period that is already saved.',
  },
};
