import { Redirect, router, Stack } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/screen';
import { useLunario } from '../context/lunario';
import { averageCycleLength, cycleHistory } from '../domain/history';
import { cycleLengthLabel, dateLocale, messages } from '../i18n';
import { fill } from '../i18n/language';
import { formatDateKey } from '../domain/dates';
import { theme } from '../theme';

export default function HistoryScreen() {
  const { settings, cycles, removePastPeriod } = useLunario();
  if (!settings?.onboardingComplete) return <Redirect href="/onboarding" />;

  const average = averageCycleLength(cycles);
  const entries = cycleHistory(cycles);
  const latestStart = entries[0]?.startDate;

  function onRemove(start: string) {
    Alert.alert(messages.removePastTitle, messages.removePastBody, [
      { text: messages.cancel, style: 'cancel' },
      {
        text: messages.removePastPeriod,
        style: 'destructive',
        onPress: () => {
          void removePastPeriod(start).then((result) => {
            if (result) Alert.alert(messages.cycleError[result]);
          });
        },
      },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: messages.history }} />
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable accessibilityRole="button" onPress={() => router.push('./past-period')} style={styles.addButton}>
            <Text style={styles.addLabel}>{messages.addPastPeriod}</Text>
          </Pressable>
          <View style={styles.summary}>
            <Text style={styles.label}>{messages.averageCycle}</Text>
            <Text style={styles.value}>{average === null ? messages.historyEmpty : cycleLengthLabel(average)}</Text>
          </View>
          {entries.map((entry) => (
            <View key={entry.startDate} style={styles.card}>
              <Text style={styles.date}>{formatDateKey(entry.startDate, messages.dateWithYear, dateLocale)}</Text>
              <Text style={styles.detail}>
                {entry.bleedingDays === null ? messages.ongoing : fill(messages.bleedingValue, { count: entry.bleedingDays })}
              </Text>
              {entry.cycleDays !== null ? (
                <Text style={styles.detail}>{cycleLengthLabel(entry.cycleDays)}</Text>
              ) : null}
              {entry.startDate !== latestStart ? (
                <Pressable accessibilityRole="button" onPress={() => onRemove(entry.startDate)} style={styles.removeButton}>
                  <Text style={styles.removeLabel}>{messages.removePastPeriod}</Text>
                </Pressable>
              ) : null}
            </View>
          ))}
          <Text style={styles.disclaimer}>{messages.disclaimer}</Text>
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12, paddingBottom: 40 },
  addButton: { minHeight: 44, justifyContent: 'center' },
  addLabel: { color: theme.focus, fontSize: 16, fontWeight: '600' },
  summary: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, gap: 4 },
  label: { color: theme.muted, fontSize: 13 },
  value: { color: theme.text, fontSize: 16, lineHeight: 22 },
  card: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, gap: 4 },
  date: { color: theme.text, fontSize: 16, fontWeight: '600' },
  detail: { color: theme.muted, fontSize: 15 },
  removeButton: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  removeLabel: { color: theme.period, fontSize: 15, fontWeight: '600' },
  disclaimer: { color: theme.muted, fontSize: 14, lineHeight: 20, marginTop: 8 },
});
