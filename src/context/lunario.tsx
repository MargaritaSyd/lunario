import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { SQLiteDatabase } from 'expo-sqlite';

import { messages } from '../i18n';
import type { CycleError } from '../domain/cycles';
import { todayKey, type DateKey } from '../domain/dates';
import type { OnboardingValue } from '../domain/onboarding';
import type { Cycle } from '../domain/predict';
import {
  loadState,
  openDatabase,
  saveFertileWindow,
  saveOnboarding,
  savePeriodEnd,
  savePeriodStart,
  saveRemoveLatest,
  type Settings,
} from '../db/database';

type LunarioContextValue = {
  ready: boolean;
  error: string | null;
  settings: Settings | null;
  cycles: Cycle[];
  completeOnboarding: (value: OnboardingValue) => Promise<void>;
  logPeriodStart: (date: DateKey) => Promise<CycleError | null>;
  logPeriodEnd: (date: DateKey) => Promise<CycleError | null>;
  removeLatestPeriod: () => Promise<CycleError | null>;
  setShowFertileWindow: (show: boolean) => Promise<void>;
};

const LunarioContext = createContext<LunarioContextValue | null>(null);

export function LunarioProvider({ children }: { children: ReactNode }) {
  const dbRef = useRef<SQLiteDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [cycles, setCycles] = useState<Cycle[]>([]);

  useEffect(() => {
    let cancelled = false;
    openDatabase()
      .then(async (db) => {
        const snapshot = await loadState(db);
        if (cancelled) return;
        dbRef.current = db;
        setSettings(snapshot.settings);
        setCycles(snapshot.cycles);
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

  const value = useMemo<LunarioContextValue>(() => {
    async function reload(db: SQLiteDatabase) {
      const snapshot = await loadState(db);
      setSettings(snapshot.settings);
      setCycles(snapshot.cycles);
    }

    return {
      ready,
      error,
      settings,
      cycles,
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
      async setShowFertileWindow(show) {
        const db = dbRef.current;
        if (!db) return;
        await saveFertileWindow(db, show);
        await reload(db);
      },
    };
  }, [ready, error, settings, cycles]);

  return <LunarioContext.Provider value={value}>{children}</LunarioContext.Provider>;
}

export function useLunario(): LunarioContextValue {
  const value = useContext(LunarioContext);
  if (!value) throw new Error('useLunario must be used within LunarioProvider.');
  return value;
}
