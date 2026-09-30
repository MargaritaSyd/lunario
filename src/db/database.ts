import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

import {
  applyPeriodEnd,
  applyPeriodStart,
  initialCycle,
  removeLatestCycle,
  type CycleError,
} from '../domain/cycles';
import type { DateKey } from '../domain/dates';
import type { OnboardingValue } from '../domain/onboarding';
import type { Cycle } from '../domain/predict';

export type Settings = {
  cycleLength: number;
  periodLength: number;
  showFertileWindow: boolean;
  reminderEnabled: boolean;
  reminderDaysBefore: number;
  onboardingComplete: boolean;
};

type SettingsRow = {
  cycle_length: number;
  period_length: number;
  show_fertile_window: number;
  reminder_enabled: number;
  reminder_days_before: number;
  onboarding_complete: number;
};

type CycleRow = {
  start_date: string;
  end_date: string | null;
};

const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  cycle_length INTEGER NOT NULL,
  period_length INTEGER NOT NULL,
  show_fertile_window INTEGER NOT NULL DEFAULT 1,
  reminder_enabled INTEGER NOT NULL DEFAULT 0,
  reminder_days_before INTEGER NOT NULL DEFAULT 2,
  onboarding_complete INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS cycles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_date TEXT NOT NULL UNIQUE,
  end_date TEXT
);

CREATE TABLE IF NOT EXISTS logs (
  date TEXT PRIMARY KEY,
  flow TEXT,
  pain TEXT,
  mood TEXT,
  discharge TEXT,
  note TEXT
);
`;

export async function openDatabase(): Promise<SQLiteDatabase> {
  const db = await openDatabaseAsync('lunario.db');
  await db.execAsync(SCHEMA);
  return db;
}

function mapSettings(row: SettingsRow): Settings {
  return {
    cycleLength: row.cycle_length,
    periodLength: row.period_length,
    showFertileWindow: row.show_fertile_window === 1,
    reminderEnabled: row.reminder_enabled === 1,
    reminderDaysBefore: row.reminder_days_before,
    onboardingComplete: row.onboarding_complete === 1,
  };
}

export async function loadState(db: SQLiteDatabase): Promise<{ settings: Settings | null; cycles: Cycle[] }> {
  const row = await db.getFirstAsync<SettingsRow>('SELECT * FROM settings WHERE id = 1');
  const cycleRows = await db.getAllAsync<CycleRow>(
    'SELECT start_date, end_date FROM cycles ORDER BY start_date',
  );
  return {
    settings: row ? mapSettings(row) : null,
    cycles: cycleRows.map((cycle) => ({ startDate: cycle.start_date, endDate: cycle.end_date })),
  };
}

async function replaceCycles(db: SQLiteDatabase, cycles: Cycle[]): Promise<void> {
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM cycles');
    for (const cycle of cycles) {
      await db.runAsync('INSERT INTO cycles (start_date, end_date) VALUES (?, ?)', cycle.startDate, cycle.endDate);
    }
  });
}

export async function saveOnboarding(
  db: SQLiteDatabase,
  value: OnboardingValue,
  today: DateKey,
): Promise<void> {
  const cycle = initialCycle(value.lastPeriodStart, value.periodLength, today);
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO settings (
        id, cycle_length, period_length, show_fertile_window,
        reminder_enabled, reminder_days_before, onboarding_complete
      ) VALUES (1, ?, ?, 1, 0, 2, 1)`,
      value.cycleLength,
      value.periodLength,
    );
    await db.runAsync(
      'INSERT INTO cycles (start_date, end_date) VALUES (?, ?)',
      cycle.startDate,
      cycle.endDate,
    );
  });
}

async function persistUpdate(
  db: SQLiteDatabase,
  update: { ok: true; cycles: Cycle[] } | { ok: false; error: CycleError },
): Promise<CycleError | null> {
  if (!update.ok) return update.error;
  await replaceCycles(db, update.cycles);
  return null;
}

export async function savePeriodStart(
  db: SQLiteDatabase,
  cycles: Cycle[],
  date: DateKey,
  today: DateKey,
): Promise<CycleError | null> {
  return persistUpdate(db, applyPeriodStart(cycles, date, today));
}

export async function savePeriodEnd(
  db: SQLiteDatabase,
  cycles: Cycle[],
  date: DateKey,
  today: DateKey,
): Promise<CycleError | null> {
  return persistUpdate(db, applyPeriodEnd(cycles, date, today));
}

export async function saveRemoveLatest(db: SQLiteDatabase, cycles: Cycle[]): Promise<CycleError | null> {
  return persistUpdate(db, removeLatestCycle(cycles));
}

export async function saveFertileWindow(db: SQLiteDatabase, show: boolean): Promise<void> {
  await db.runAsync('UPDATE settings SET show_fertile_window = ? WHERE id = 1', show ? 1 : 0);
}
