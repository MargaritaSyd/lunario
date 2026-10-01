import { isDateKey, type DateKey } from './dates';

export const FLOWS = ['spotting', 'light', 'medium', 'heavy'] as const;
export const SENSATIONS = ['bloating', 'breast-tenderness', 'fatigue', 'energy', 'nausea', 'craving'] as const;
export const PAINS = ['cramps', 'head', 'back', 'breasts', 'low-back', 'pelvis'] as const;
export const PAIN_INTENSITIES = ['mild', 'moderate', 'severe'] as const;
export const MOODS = ['calm', 'sensitive', 'low', 'irritable', 'happy', 'anxious', 'tearful'] as const;
export const DISCHARGES = ['dry', 'sticky', 'creamy', 'egg-white'] as const;

export type Flow = (typeof FLOWS)[number];
export type Sensation = (typeof SENSATIONS)[number];
export type Pain = (typeof PAINS)[number];
export type PainIntensity = (typeof PAIN_INTENSITIES)[number];
export type Mood = (typeof MOODS)[number];
export type Discharge = (typeof DISCHARGES)[number];

export type DayLog = {
  date: DateKey;
  flow: Flow | null;
  sensations: Sensation[];
  pains: Pain[];
  painIntensity: PainIntensity | null;
  moods: Mood[];
  discharge: Discharge | null;
  note: string;
};

export const NOTE_LIMIT = 500;

export type StoredLog = {
  date: string;
  flow: string | null;
  sensations: string | null;
  pain: string | null;
  painIntensity: string | null;
  mood: string | null;
  discharge: string | null;
  note: string | null;
};

export function blankLog(date: DateKey): DayLog {
  return { date, flow: null, sensations: [], pains: [], painIntensity: null, moods: [], discharge: null, note: '' };
}

export function normalizeNote(note: string): string {
  return note.trim().slice(0, NOTE_LIMIT);
}

export function encodeList(values: readonly string[]): string | null {
  return values.length === 0 ? null : values.join(',');
}

export function isEmptyLog(log: DayLog): boolean {
  return (
    log.flow === null &&
    log.sensations.length === 0 &&
    log.pains.length === 0 &&
    log.painIntensity === null &&
    log.moods.length === 0 &&
    log.discharge === null &&
    normalizeNote(log.note) === ''
  );
}

function oneOf<T extends string>(value: string, options: readonly T[]): T | null {
  return options.find((option) => option === value) ?? null;
}

function intensityOf(stored: string | null, listedWithPains: string | null): PainIntensity | null {
  if (stored) return oneOf(stored, PAIN_INTENSITIES);
  if (!listedWithPains) return null;
  const parts = listedWithPains.split(',').map((part) => part.trim());
  return PAIN_INTENSITIES.find((option) => parts.includes(option)) ?? null;
}

function manyOf<T extends string>(value: string | null, options: readonly T[]): T[] {
  if (!value) return [];
  return options.filter((option) =>
    value
      .split(',')
      .map((part) => part.trim())
      .includes(option),
  );
}

export function parseStoredLog(row: StoredLog): DayLog | null {
  if (!isDateKey(row.date)) return null;
  return {
    date: row.date,
    flow: row.flow ? oneOf(row.flow, FLOWS) : null,
    sensations: manyOf(row.sensations, SENSATIONS),
    pains: manyOf(row.pain, PAINS),
    painIntensity: intensityOf(row.painIntensity, row.pain),
    moods: manyOf(row.mood, MOODS),
    discharge: row.discharge ? oneOf(row.discharge, DISCHARGES) : null,
    note: row.note ?? '',
  };
}
