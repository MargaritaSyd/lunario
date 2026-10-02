import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import { cancelReminder, ensureNotificationPermission, syncReminder } from './reminder';

jest.mock('expo', () => ({
  isRunningInExpoGo: jest.fn(() => false),
}));

const inExpoGo = isRunningInExpoGo as jest.MockedFunction<typeof isRunningInExpoGo>;

type NotificationApi = {
  getPermissionsAsync: jest.Mock<Promise<{ granted: boolean }>, []>;
  requestPermissionsAsync: jest.Mock<Promise<{ granted: boolean }>, []>;
  cancelAllScheduledNotificationsAsync: jest.Mock<Promise<void>, []>;
  setNotificationChannelAsync: jest.Mock<Promise<void>, [string, { name: string; importance: number }]>;
  scheduleNotificationAsync: jest.Mock<Promise<string>, [object]>;
  dateTrigger: string;
  importanceDefault: number;
};

function notifications(granted = true): { api: NotificationApi; load: () => Promise<NotificationApi> } {
  const api: NotificationApi = {
    getPermissionsAsync: jest.fn(async () => ({ granted })),
    requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
    cancelAllScheduledNotificationsAsync: jest.fn(async () => undefined),
    setNotificationChannelAsync: jest.fn(async () => undefined),
    scheduleNotificationAsync: jest.fn(async () => '1'),
    dateTrigger: 'date',
    importanceDefault: 3,
  };
  return { api, load: async () => api };
}

const reminder = {
  enabled: true,
  daysBefore: 2,
  nextStart: '2026-10-10' as const,
  late: false,
  today: '2026-09-30' as const,
  title: 'Lunario',
  body: 'soon',
  channelName: 'Recordatorios',
};

describe('ensureNotificationPermission', () => {
  it('asks only when the current permission is missing', async () => {
    const granted = notifications(true);
    await expect(ensureNotificationPermission(granted.load)).resolves.toBe(true);
    expect(granted.api.requestPermissionsAsync).not.toHaveBeenCalled();

    const missing = notifications(false);
    await expect(ensureNotificationPermission(missing.load)).resolves.toBe(true);
    expect(missing.api.requestPermissionsAsync).toHaveBeenCalledTimes(1);

    const denied = notifications(false);
    denied.api.requestPermissionsAsync.mockResolvedValue({ granted: false });
    await expect(ensureNotificationPermission(denied.load)).resolves.toBe(false);

    await expect(ensureNotificationPermission(async () => null)).resolves.toBe(false);
  });
});

describe('cancelReminder', () => {
  it('ignores a phone that cannot clear notifications', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const api = notifications().api;
    api.cancelAllScheduledNotificationsAsync.mockRejectedValue(new Error('nope'));

    await expect(cancelReminder(async () => api)).resolves.toBeUndefined();
    await expect(cancelReminder(async () => null)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('syncReminder', () => {
  const originalOs = Platform.OS;

  afterEach(() => {
    Platform.OS = originalOs;
    inExpoGo.mockReturnValue(false);
  });

  it('cancels and does not schedule when the reminder is off, late, or not allowed', async () => {
    const off = notifications();
    await syncReminder({ ...reminder, enabled: false }, off.load);
    expect(off.api.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
    expect(off.api.scheduleNotificationAsync).not.toHaveBeenCalled();

    const missing = notifications();
    await syncReminder({ ...reminder, nextStart: null }, missing.load);
    expect(missing.api.scheduleNotificationAsync).not.toHaveBeenCalled();

    const late = notifications();
    await syncReminder({ ...reminder, late: true }, late.load);
    expect(late.api.scheduleNotificationAsync).not.toHaveBeenCalled();

    const denied = notifications(false);
    await syncReminder(reminder, denied.load);
    expect(denied.api.scheduleNotificationAsync).not.toHaveBeenCalled();

    await expect(syncReminder(reminder, async () => null)).resolves.toBeUndefined();
  });

  it('schedules 9:00 local time two days before the estimate', async () => {
    Platform.OS = 'ios';
    const { api, load } = notifications();

    await syncReminder(reminder, load);

    expect(api.setNotificationChannelAsync).not.toHaveBeenCalled();
    const request = api.scheduleNotificationAsync.mock.calls[0][0] as {
      content: { title: string; body: string };
      trigger: { type: string; date: Date; channelId?: string };
    };
    expect(request.content).toEqual({ title: 'Lunario', body: 'soon' });
    expect(request.trigger).toMatchObject({ type: 'date', channelId: undefined });
    expect(request.trigger.date.getFullYear()).toBe(2026);
    expect(request.trigger.date.getMonth()).toBe(9);
    expect(request.trigger.date.getDate()).toBe(8);
    expect(request.trigger.date.getHours()).toBe(9);
  });

  it('creates the Android channel outside Expo Go and skips it inside', async () => {
    Platform.OS = 'android';
    const outside = notifications();
    await syncReminder(reminder, outside.load);
    expect(outside.api.setNotificationChannelAsync).toHaveBeenCalledWith('period-reminder', {
      name: 'Recordatorios',
      importance: 3,
    });
    expect(outside.api.scheduleNotificationAsync.mock.calls[0][0]).toMatchObject({
      trigger: { channelId: 'period-reminder' },
    });

    inExpoGo.mockReturnValue(true);
    const inside = notifications();
    await syncReminder(reminder, inside.load);
    expect(inside.api.setNotificationChannelAsync).not.toHaveBeenCalled();
    expect(inside.api.scheduleNotificationAsync.mock.calls[0][0]).toMatchObject({
      trigger: { channelId: undefined },
    });
  });

  it('swallows a scheduling failure', async () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { api, load } = notifications();
    api.scheduleNotificationAsync.mockRejectedValue(new Error('nope'));

    await expect(syncReminder(reminder, load)).resolves.toBeUndefined();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
