import { Platform } from 'react-native';

import type { DateKey } from '../domain/dates';
import { reminderDate, reminderTrigger } from '../domain/reminder';

const CHANNEL_ID = 'period-reminder';

type NotificationApi = {
  getPermissionsAsync: () => Promise<{ granted: boolean }>;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
  cancelAllScheduledNotificationsAsync: () => Promise<void>;
  setNotificationChannelAsync: (channelId: string, channel: { name: string; importance: number }) => Promise<unknown>;
  scheduleNotificationAsync: (request: {
    content: { title: string; body: string };
    trigger: { type: string; date: Date; channelId: string };
  }) => Promise<string>;
  dateTrigger: string;
  importanceDefault: number;
};

let loading: Promise<NotificationApi | null> | null = null;

/**
 * The package entry also loads remote-push modules that Expo Go does not ship.
 * Local scheduling only needs these files.
 */
function loadNotifications(): Promise<NotificationApi | null> {
  if (loading) return loading;
  loading = (async () => {
    try {
      const [handler, permissions, cancel, channel, schedule, types, importance] = await Promise.all([
        import('expo-notifications/build/NotificationsHandler'),
        import('expo-notifications/build/NotificationPermissions'),
        import('expo-notifications/build/cancelAllScheduledNotificationsAsync'),
        import('expo-notifications/build/setNotificationChannelAsync'),
        import('expo-notifications/build/scheduleNotificationAsync'),
        import('expo-notifications/build/Notifications.types'),
        import('expo-notifications/build/NotificationChannelManager.types'),
      ]);
      handler.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
      return {
        getPermissionsAsync: permissions.getPermissionsAsync,
        requestPermissionsAsync: permissions.requestPermissionsAsync,
        cancelAllScheduledNotificationsAsync: cancel.cancelAllScheduledNotificationsAsync,
        setNotificationChannelAsync: channel.setNotificationChannelAsync,
        scheduleNotificationAsync: schedule.scheduleNotificationAsync,
        dateTrigger: types.SchedulableTriggerInputTypes.DATE,
        importanceDefault: importance.AndroidImportance.DEFAULT,
      };
    } catch (cause) {
      console.error(cause);
      return null;
    }
  })();
  return loading;
}

export async function ensureNotificationPermission(): Promise<boolean> {
  const notifications = await loadNotifications();
  if (!notifications) return false;
  const current = await notifications.getPermissionsAsync();
  if (current.granted) return true;
  const next = await notifications.requestPermissionsAsync();
  return next.granted;
}

export async function cancelReminder(): Promise<void> {
  const notifications = await loadNotifications();
  if (!notifications) return;
  await notifications.cancelAllScheduledNotificationsAsync();
}

export async function syncReminder(input: {
  enabled: boolean;
  daysBefore: number;
  nextStart: DateKey | null;
  late: boolean;
  today: DateKey;
  title: string;
  body: string;
  channelName: string;
}): Promise<void> {
  await cancelReminder();
  if (!input.enabled || !input.nextStart) return;

  const notifications = await loadNotifications();
  if (!notifications) return;

  const permission = await notifications.getPermissionsAsync();
  if (!permission.granted) return;

  const when = reminderTrigger(reminderDate(input.nextStart, input.daysBefore, input.today, input.late));
  if (!when) return;

  if (Platform.OS === 'android') {
    await notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: input.channelName,
      importance: notifications.importanceDefault,
    });
  }

  await notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body },
    trigger: {
      type: notifications.dateTrigger,
      date: when,
      channelId: CHANNEL_ID,
    },
  });
}
