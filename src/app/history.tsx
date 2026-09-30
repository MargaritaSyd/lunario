import { Redirect, Stack } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Screen } from '../components/screen';
import { useLunario } from '../context/lunario';
import { averageCycleLength, cycleHistory } from '../domain/history';
import { cycleLengthLabel, dateLocale, messages } from '../i18n';
import { fill } from '../i18n/language';
import { formatDateKey } from '../domain/dates';
import { theme } from '../theme';

export default function HistoryScreen() {
  const { settings, cycles } = useLunario();
  if (!settings?.onboardingComplete) return <Redirect href="/onboarding" />;

  const average = averageCycleLength(cycles);
  const entries = cycleHistory(cycles);

  return (
    <>
      <Stack.Screen options={{ title: messages.history }} />
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
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
  summary: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, gap: 4 },
  label: { color: theme.muted, fontSize: 13 },
  value: { color: theme.text, fontSize: 16, lineHeight: 22 },
  card: { backgroundColor: theme.surface, borderRadius: 12, padding: 14, gap: 4 },
  date: { color: theme.text, fontSize: 16, fontWeight: '600' },
  detail: { color: theme.muted, fontSize: 15 },
  disclaimer: { color: theme.muted, fontSize: 14, lineHeight: 20, marginTop: 8 },
});
