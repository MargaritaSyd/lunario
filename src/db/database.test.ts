import { blankLog } from '../domain/log';
import {
  deleteAll,
  loadState,
  prepareDatabase,
  saveDayLog,
  saveFertileWindow,
  saveOnboarding,
  savePeriodStart,
  saveReminder,
} from './database';
import { memoryDatabase } from './memory-database';

const today = '2026-09-30';

describe('prepareDatabase', () => {
  it('adds the newer log columns and keeps rows written with the first schema', async () => {
    const db = memoryDatabase();
    await db.execAsync(`
      CREATE TABLE logs (
        date TEXT PRIMARY KEY,
        flow TEXT,
        pain TEXT,
        mood TEXT,
        discharge TEXT,
        note TEXT
      );
    `);
    await db.runAsync(
      'INSERT INTO logs (date, flow, pain, mood, discharge, note) VALUES (?, ?, ?, ?, ?, ?)',
      '2026-09-01',
      'light',
      'cramps',
      'calm',
      'sticky',
      'antes',
    );
    await db.runAsync(
      'INSERT INTO logs (date, flow, pain, mood, discharge, note) VALUES (?, ?, ?, ?, ?, ?)',
      'yesterday',
      'heavy',
      null,
      null,
      null,
      null,
    );

    await prepareDatabase(db);
    await prepareDatabase(db);

    const columns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(logs)');
    expect(columns.map((column) => column.name)).toEqual(
      expect.arrayContaining(['sensations', 'pain_intensity']),
    );
    expect(await loadState(db)).toMatchObject({
      settings: null,
      cycles: [],
      logs: [
        {
          date: '2026-09-01',
          flow: 'light',
          sensations: [],
          pains: ['cramps'],
          painIntensity: null,
          moods: ['calm'],
          discharge: 'sticky',
          note: 'antes',
        },
      ],
    });
  });
});

describe('saved state', () => {
  it('round-trips onboarding, a day log, and the settings toggles', async () => {
    const db = memoryDatabase();
    await prepareDatabase(db);
    await saveOnboarding(db, { lastPeriodStart: '2026-09-01', cycleLength: 28, periodLength: 5 }, today);

    await saveDayLog(
      db,
      {
        ...blankLog('2026-09-02'),
        flow: 'medium',
        sensations: ['nausea'],
        pains: ['cramps', 'low-back'],
        painIntensity: 'moderate',
        moods: ['calm'],
        discharge: 'sticky',
        note: '  hola  ',
      },
      today,
    );
    await saveDayLog(db, { ...blankLog('2026-09-03'), flow: 'heavy', note: 'primero' }, today);
    await saveDayLog(db, { ...blankLog('2026-09-03'), note: '   ' }, today);
    await saveDayLog(db, { ...blankLog('2026-10-01'), flow: 'light' }, today);
    await saveDayLog(db, { ...blankLog('2026-02-31'), flow: 'light' }, today);
    await saveFertileWindow(db, false);
    await saveReminder(db, true, 3);

    expect(await loadState(db)).toEqual({
      settings: {
        cycleLength: 28,
        periodLength: 5,
        showFertileWindow: false,
        reminderEnabled: true,
        reminderDaysBefore: 3,
        onboardingComplete: true,
      },
      cycles: [{ startDate: '2026-09-01', endDate: '2026-09-05' }],
      logs: [
        {
          ...blankLog('2026-09-02'),
          flow: 'medium',
          sensations: ['nausea'],
          pains: ['cramps', 'low-back'],
          painIntensity: 'moderate',
          moods: ['calm'],
          discharge: 'sticky',
          note: 'hola',
        },
      ],
    });
  });

  it('persists a new period start and leaves the database unchanged when the start is rejected', async () => {
    const db = memoryDatabase();
    await prepareDatabase(db);
    await saveOnboarding(db, { lastPeriodStart: '2026-09-28', cycleLength: 28, periodLength: 5 }, today);

    const before = await loadState(db);
    expect(before.cycles).toEqual([{ startDate: '2026-09-28', endDate: null }]);
    expect(await savePeriodStart(db, before.cycles, '2026-10-01', today)).toBe('future');
    expect(await loadState(db)).toEqual(before);

    expect(await savePeriodStart(db, before.cycles, '2026-09-30', today)).toBeNull();
    expect((await loadState(db)).cycles).toEqual([
      { startDate: '2026-09-28', endDate: '2026-09-29' },
      { startDate: '2026-09-30', endDate: null },
    ]);
  });

  it('deletes settings, cycles, and logs together', async () => {
    const db = memoryDatabase();
    await prepareDatabase(db);
    await saveOnboarding(db, { lastPeriodStart: '2026-09-01', cycleLength: 28, periodLength: 5 }, today);
    await saveDayLog(db, { ...blankLog('2026-09-02'), flow: 'light' }, today);

    await deleteAll(db);

    expect(await loadState(db)).toEqual({ settings: null, cycles: [], logs: [] });
  });
});
