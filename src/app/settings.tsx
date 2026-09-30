import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { Button } from '../components/button';
import { NumberField } from '../components/fields';
import { Screen } from '../components/screen';
import { useLunario } from '../context/lunario';
import { todayKey } from '../domain/dates';
import { buildExport } from '../domain/export';
import { clampReminderDays } from '../domain/reminder';
import { shareJson } from '../export/share';
import { messages } from '../i18n';
import { theme } from '../theme';

export default function SettingsScreen() {
  const { settings, cycles, logs, setShowFertileWindow, setReminder, deleteEverything } = useLunario();
  const [daysText, setDaysText] = useState(String(settings?.reminderDaysBefore ?? 2));
  const [daysError, setDaysError] = useState(false);
  const [denied, setDenied] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  useEffect(() => {
    if (settings) setDaysText(String(settings.reminderDaysBefore));
  }, [settings]);

  if (!settings?.onboardingComplete) return <Redirect href="/onboarding" />;

  function onDaysChange(text: string) {
    setDaysText(text);
    if (text.trim() === '') {
      setDaysError(false);
      return;
    }
    const days = clampReminderDays(Number(text));
    setDaysError(days === null);
    if (days === null || days === settings?.reminderDaysBefore) return;
    void setReminder(settings?.reminderEnabled ?? false, days);
  }

  function onDelete() {
    Alert.alert(messages.deleteAllTitle, messages.deleteAllBody, [
      { text: messages.cancel, style: 'cancel' },
      { text: messages.deleteAll, style: 'destructive', onPress: () => void deleteEverything() },
    ]);
  }

  async function onExport() {
    if (!settings) return;
    setExporting(true);
    setExportError(null);
    try {
      const today = todayKey();
      const document = buildExport({ exportedOn: today, settings, cycles, logs });
      await shareJson(`lunario-${today}.json`, `${JSON.stringify(document, null, 2)}\n`);
    } catch (cause) {
      console.error(cause);
      setExportError(messages.exportFailed);
    } finally {
      setExporting(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: messages.settings }} />
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{messages.fertileWindow}</Text>
              <Switch
                accessibilityLabel={messages.fertileWindow}
                value={settings.showFertileWindow}
                onValueChange={(value) => void setShowFertileWindow(value)}
                trackColor={{ false: theme.border, true: theme.fertile }}
                thumbColor={theme.surface}
              />
            </View>
          </View>
          <View style={styles.card}>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>{messages.reminder}</Text>
              <Switch
                accessibilityLabel={messages.reminder}
                value={settings.reminderEnabled}
                onValueChange={(value) => {
                  setDenied(false);
                  const days = clampReminderDays(Number(daysText)) ?? settings.reminderDaysBefore;
                  void setReminder(value, days).then((result) => {
                    if (result === 'denied') setDenied(true);
                  });
                }}
                trackColor={{ false: theme.border, true: theme.fertile }}
                thumbColor={theme.surface}
              />
            </View>
            <Text style={styles.hint}>{messages.reminderHint}</Text>
            <NumberField label={messages.daysBefore} hint={messages.daysBeforeHint} value={daysText} onChangeText={onDaysChange} />
            {daysError ? <Text style={styles.error}>{messages.reminderDaysError}</Text> : null}
            {denied ? <Text style={styles.error}>{messages.notificationsDenied}</Text> : null}
          </View>
          <View style={styles.card}>
            <Button label={exporting ? messages.saving : messages.exportData} disabled={exporting} onPress={() => void onExport()} />
            <Text style={styles.hint}>{messages.exportHint}</Text>
            {exportError ? <Text style={styles.error}>{exportError}</Text> : null}
          </View>
          <Button label={messages.deleteAll} variant="danger" onPress={onDelete} />
          <Text style={styles.disclaimer}>{messages.disclaimer}</Text>
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  card: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, gap: 12 },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  switchLabel: { color: theme.text, fontSize: 16, flex: 1 },
  hint: { color: theme.muted, fontSize: 14, lineHeight: 20 },
  error: { color: theme.period, fontSize: 15, lineHeight: 22 },
  disclaimer: { color: theme.muted, fontSize: 14, lineHeight: 20 },
});
