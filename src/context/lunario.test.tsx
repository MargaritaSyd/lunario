import { act } from 'react';
import { create } from 'react-test-renderer';

import { openDatabase } from '../db/database';
import { addDaysKey, todayKey } from '../domain/dates';
import { predict, type Cycle } from '../domain/predict';
import { messages, reminderLabel } from '../i18n';
import { cancelReminder, ensureNotificationPermission, syncReminder } from '../notifications/reminder';
import { LunarioProvider, useLunario } from './lunario';

jest.mock('../notifications/reminder', () => ({
  ensureNotificationPermission: jest.fn(async () => true),
  cancelReminder: jest.fn(async () => undefined),
  syncReminder: jest.fn(async () => undefined),
}));

jest.mock('../db/database', () => {
  const actual = jest.requireActual<typeof import('../db/database')>('../db/database');
  const { memoryDatabase } = jest.requireActual<typeof import('../db/memory-database')>('../db/memory-database');
  return {
    ...actual,
    openDatabase: jest.fn(async () => {
      const db = memoryDatabase();
      await actual.prepareDatabase(db);
      return db;
    }),
  };
});

const permission = ensureNotificationPermission as jest.MockedFunction<typeof ensureNotificationPermission>;
const cancel = cancelReminder as jest.MockedFunction<typeof cancelReminder>;
const schedule = syncReminder as jest.MockedFunction<typeof syncReminder>;
const open = openDatabase as jest.MockedFunction<typeof openDatabase>;

type Lunario = ReturnType<typeof useLunario>;

let current: Lunario | null = null;
let renderer: { unmount(): void } | null = null;

function Harness() {
  current = useLunario();
  return null;
}

function state(): Lunario {
  if (!current) throw new Error('Lunario is not mounted.');
  return current;
}

async function mount(): Promise<void> {
  await act(async () => {
    renderer = create(
      <LunarioProvider>
        <Harness />
      </LunarioProvider>,
    );
  });
  for (let attempt = 0; attempt < 10 && !current?.ready; attempt += 1) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  }
}

async function finishOnboarding(): Promise<string> {
  await mount();
  const start = addDaysKey(todayKey(), -40);
  await act(async () => {
    await state().completeOnboarding({ lastPeriodStart: start, cycleLength: 28, periodLength: 5 });
  });
  return start;
}

function currentPrediction() {
  const { cycles, settings } = state();
  if (!settings) throw new Error('Onboarding is not complete.');
  const prediction = predict(cycles, settings, todayKey());
  if (!prediction) throw new Error('Expected a prediction.');
  return prediction;
}

describe('LunarioProvider', () => {
  beforeEach(() => {
    permission.mockReset();
    permission.mockResolvedValue(true);
    cancel.mockReset();
    cancel.mockResolvedValue(undefined);
    schedule.mockReset();
    schedule.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (renderer) {
      act(() => {
        renderer?.unmount();
      });
    }
    renderer = null;
    current = null;
  });

  it('waits until onboarding before scheduling a reminder', async () => {
    await mount();

    expect(state().ready).toBe(true);
    expect(state().error).toBeNull();
    expect(state().settings).toBeNull();
    expect(schedule).not.toHaveBeenCalled();
  });

  it('saves onboarding and schedules the estimate with the reminder off', async () => {
    const start = await finishOnboarding();
    const prediction = currentPrediction();

    expect(state().cycles).toEqual([{ startDate: start, endDate: addDaysKey(start, 4) }]);
    expect(schedule).toHaveBeenCalledWith({
      enabled: false,
      daysBefore: 2,
      nextStart: prediction.nextStart,
      late: prediction.late,
      today: todayKey(),
      title: messages.reminderTitle,
      body: reminderLabel(2),
      channelName: messages.reminderChannel,
    });
  });

  it('rejects an invalid lead time and a denied permission without saving either', async () => {
    await finishOnboarding();
    const scheduled = schedule.mock.calls.length;

    await act(async () => {
      expect(await state().setReminder(true, 8)).toBe('invalid');
    });
    expect(permission).not.toHaveBeenCalled();
    expect(state().settings?.reminderEnabled).toBe(false);
    expect(schedule).toHaveBeenCalledTimes(scheduled);

    permission.mockResolvedValue(false);
    await act(async () => {
      expect(await state().setReminder(true, 2)).toBe('denied');
    });
    expect(permission).toHaveBeenCalledTimes(1);
    expect(state().settings?.reminderEnabled).toBe(false);
    expect(schedule).toHaveBeenCalledTimes(scheduled);
  });

  it('turns the reminder on and reschedules from the new period', async () => {
    await finishOnboarding();

    await act(async () => {
      expect(await state().setReminder(true, 2)).toBeNull();
    });
    expect(state().settings).toMatchObject({ reminderEnabled: true, reminderDaysBefore: 2 });
    expect(schedule).toHaveBeenLastCalledWith(
      expect.objectContaining({
        enabled: true,
        daysBefore: 2,
        nextStart: currentPrediction().nextStart,
        body: reminderLabel(2),
      }),
    );

    const today = todayKey();
    await act(async () => {
      expect(await state().logPeriodStart(today)).toBeNull();
    });
    expect(state().cycles.map((cycle: Cycle) => cycle.startDate)).toContain(today);
    expect(schedule).toHaveBeenLastCalledWith(
      expect.objectContaining({ enabled: true, nextStart: currentPrediction().nextStart }),
    );

    const cycles = state().cycles;
    const calls = schedule.mock.calls.length;
    await act(async () => {
      expect(await state().logPeriodStart(addDaysKey(today, 1))).toBe('future');
    });
    expect(state().cycles).toEqual(cycles);
    expect(schedule).toHaveBeenCalledTimes(calls);
  });

  it('cancels the reminder and clears the phone when everything is deleted', async () => {
    await finishOnboarding();
    const calls = schedule.mock.calls.length;

    await act(async () => {
      await state().deleteEverything();
    });

    expect(cancel).toHaveBeenCalledTimes(1);
    expect(schedule).toHaveBeenCalledTimes(calls);
    expect(state().settings).toBeNull();
    expect(state().cycles).toEqual([]);
    expect(state().logs).toEqual([]);
  });

  it('reports a database error and does not schedule a reminder', async () => {
    open.mockRejectedValueOnce(new Error('disk'));
    const error = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    await mount();

    expect(state().ready).toBe(true);
    expect(state().error).toBe(messages.databaseError);
    expect(schedule).not.toHaveBeenCalled();
    error.mockRestore();
  });

  it('requires the provider', () => {
    function Orphan() {
      useLunario();
      return null;
    }

    expect(() => {
      act(() => {
        create(<Orphan />);
      });
    }).toThrow('useLunario must be used within LunarioProvider.');
  });
});
