import { isDateKey, type DateKey } from './dates';

export const FLOWS = ['spotting', 'light', 'medium', 'heavy'] as const;
export const PAINS = ['mild', 'moderate', 'severe'] as const;
export const MOODS = ['calm', 'sensitive', 'low', 'irritable'] as const;
export const DISCHARGES = ['dry', 'sticky', 'creamy', 'egg-white'] as const;

export type Flow = (typeof FLOWS)[number];
export type Pain = (typeof PAINS)[number];
export type Mood = (typeof MOODS)[number];
export type Discharge = (typeof DISCHARGES)[number];

export type DayLog = {
  date: DateKey;
  flow: Flow | null;
  pain: Pain | null;
  mood: Mood | null;
  discharge: Discharge | null;
  note: string;
};

export const NOTE_LIMIT = 500;

export type StoredLog = {
  date: string;
  flow: string | null;
  pain: string | null;
  mood: string | null;
  discharge: string | null;
  note: string | null;
};

export function blankLog(date: DateKey): DayLog {
  return { date, flow: null, pain: null, mood: null, discharge: null, note: '' };
}

export function normalizeNote(note: string): string {
  return note.trim().slice(0, NOTE_LIMIT);
}

export function isEmptyLog(log: DayLog): boolean {
  return log.flow === null && log.pain === null && log.mood === null && log.discharge === null && normalizeNote(log.note) === '';
}

function oneOf<T extends string>(value: string | null, options: readonly T[]): T | null {
  if (value === null) return null;
  return options.find((option) => option === value) ?? null;
}

export function parseStoredLog(row: StoredLog): DayLog | null {
  if (!isDateKey(row.date)) return null;
  return {
    date: row.date,
    flow: oneOf(row.flow, FLOWS),
    pain: oneOf(row.pain, PAINS),
    mood: oneOf(row.mood, MOODS),
    discharge: oneOf(row.discharge, DISCHARGES),
    note: row.note ?? '',
  };
}
