import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

import {
  deleteAll as deleteAllRows,
  loadState,
  openDatabase,
  saveDayLog,
  saveFertileWindow,
  saveOnboarding,
  savePastPeriod,
  savePeriodEnd,
  savePeriodStart,
  saveReminder,
  saveRemoveLatest,
  saveRemovePast,
  type Settings,
} from '../db/database';
import type { CycleError } from '../domain/cycles';
import { todayKey, type DateKey } from '../domain/dates';
import type { DayLog } from '../domain/log';
import type { OnboardingValue } from '../domain/onboarding';
import { predict, type Cycle } from '../domain/predict';
import { clampReminderDays } from '../domain/reminder';
import { messages, reminderLabel } from '../i18n';
import { cancelReminder, ensureNotificationPermission, syncReminder } from '../notifications/reminder';

type ReminderError = 'denied' | 'invalid';

type LunarioContextValue = {
  ready: boolean;
  error: string | null;
  settings: Settings | null;
  cycles: Cycle[];
  logs: DayLog[];
  completeOnboarding: (value: OnboardingValue) => Promise<void>;
  logPeriodStart: (date: DateKey) => Promise<CycleError | null>;
  logPeriodEnd: (date: DateKey) => Promise<CycleError | null>;
  removeLatestPeriod: () => Promise<CycleError | null>;
  logPastPeriod: (start: DateKey, end: DateKey) => Promise<CycleError | null>;
  removePastPeriod: (start: DateKey) => Promise<CycleError | null>;
  setShowFertileWindow: (show: boolean) => Promise<void>;
  saveLog: (log: DayLog) => Promise<void>;
  setReminder: (enabled: boolean, daysBefore: number) => Promise<ReminderError | null>;
  deleteEverything: () => Promise<void>;
};

const LunarioContext = createContext<LunarioContextValue | null>(null);

export function LunarioProvider({ children }: { children: ReactNode }) {
  const dbRef = useRef<SQLiteDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [logs, setLogs] = useState<DayLog[]>([]);

  useEffect(() => {
    let cancelled = false;
    openDatabase()
      .then(async (db) => {
        const snapshot = await loadState(db);
        if (cancelled) return;
        dbRef.current = db;
        setSettings(snapshot.settings);
        setCycles(snapshot.cycles);
        setLogs(snapshot.logs);
        setReady(true);
      })
      .catch((cause: unknown) => {
        console.error(cause);
        if (cancelled) return;
        setError(messages.databaseError);
        setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !settings?.onboardingComplete) return;
    const prediction = predict(cycles, settings, todayKey());
    void syncReminder({
      enabled: settings.reminderEnabled,
      daysBefore: settings.reminderDaysBefore,
      nextStart: prediction?.nextStart ?? null,
      late: prediction?.late ?? false,
      today: todayKey(),
      title: messages.reminderTitle,
      body: reminderLabel(settings.reminderDaysBefore),
      channelName: messages.reminderChannel,
    }).catch((cause: unknown) => {
      console.error(cause);
    });
  }, [ready, settings, cycles]);

  const value = useMemo<LunarioContextValue>(() => {
    async function reload(db: SQLiteDatabase) {
      const snapshot = await loadState(db);
      setSettings(snapshot.settings);
      setCycles(snapshot.cycles);
      setLogs(snapshot.logs);
    }

    return {
      ready,
      error,
      settings,
      cycles,
      logs,
      async completeOnboarding(next) {
        const db = dbRef.current;
        if (!db) throw new Error('Database is not open.');
        await saveOnboarding(db, next, todayKey());
        await reload(db);
      },
      async logPeriodStart(date) {
        const db = dbRef.current;
        if (!db) return null;
        const result = await savePeriodStart(db, cycles, date, todayKey());
        if (!result) await reload(db);
        return result;
      },
      async logPeriodEnd(date) {
        const db = dbRef.current;
        if (!db) return null;
        const result = await savePeriodEnd(db, cycles, date, todayKey());
        if (!result) await reload(db);
        return result;
      },
      async removeLatestPeriod() {
        const db = dbRef.current;
        if (!db) return null;
        const result = await saveRemoveLatest(db, cycles);
        if (!result) await reload(db);
        return result;
      },
      async logPastPeriod(start, end) {
        const db = dbRef.current;
        if (!db) return null;
        const result = await savePastPeriod(db, cycles, start, end, todayKey());
        if (!result) await reload(db);
        return result;
      },
      async removePastPeriod(start) {
        const db = dbRef.current;
        if (!db) return null;
        const result = await saveRemovePast(db, cycles, start);
        if (!result) await reload(db);
        return result;
      },
      async setShowFertileWindow(show) {
        const db = dbRef.current;
        if (!db) return;
        await saveFertileWindow(db, show);
        await reload(db);
      },
      async saveLog(log) {
        const db = dbRef.current;
        if (!db) return;
        await saveDayLog(db, log, todayKey());
        await reload(db);
      },
      async setReminder(enabled, daysBefore) {
        const db = dbRef.current;
        if (!db) return null;
        const days = clampReminderDays(daysBefore);
        if (days === null) return 'invalid';
        if (enabled) {
          const granted = await ensureNotificationPermission();
          if (!granted) return 'denied';
        }
        await saveReminder(db, enabled, days);
        await reload(db);
        return null;
      },
      async deleteEverything() {
        const db = dbRef.current;
        if (!db) return;
        await cancelReminder();
        await deleteAllRows(db);
        await reload(db);
      },
    };
  }, [ready, error, settings, cycles, logs]);

  return <LunarioContext.Provider value={value}>{children}</LunarioContext.Provider>;
}

export function useLunario(): LunarioContextValue {
  const value = useContext(LunarioContext);
  if (!value) throw new Error('useLunario must be used within LunarioProvider.');
  return value;
}
