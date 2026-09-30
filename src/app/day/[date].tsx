import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../../components/button';
import { Screen } from '../../components/screen';
import { useLunario } from '../../context/lunario';
import { dateLocale, messages } from '../../i18n';
import { applyPeriodEnd, applyPeriodStart, type CycleError } from '../../domain/cycles';
import { formatDateKey, isDateKey, todayKey } from '../../domain/dates';
import { markDay, predict, sortCycles } from '../../domain/predict';
import { theme } from '../../theme';

function param(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default function DayScreen() {
  const { date: dateParam } = useLocalSearchParams<{ date: string | string[] }>();
  const date = param(dateParam);
  const { settings, cycles, logPeriodStart, logPeriodEnd, removeLatestPeriod } = useLunario();
  const [today] = useState(todayKey);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!settings?.onboardingComplete) return <Redirect href="/onboarding" />;
  if (!isDateKey(date)) {
    return (
      <Screen>
        <Text style={styles.invalid}>{messages.invalidDate}</Text>
      </Screen>
    );
  }

  const mark = markDay(cycles, settings, today, date);
  const prediction = predict(cycles, settings, today);
  const latest = sortCycles(cycles).at(-1);
  const canStart = applyPeriodStart(cycles, date, today).ok;
  const canEnd = applyPeriodEnd(cycles, date, today).ok;
  const canRemove = latest?.startDate === date;

  const facts = [
    mark.period ? messages.period : null,
    mark.predicted ? messages.predictedPeriod : null,
    mark.ovulation ? messages.estimatedOvulation : null,
    mark.fertile ? messages.estimatedFertileWindow : null,
    prediction?.late && date === prediction.nextStart ? messages.periodLate : null,
  ].filter((fact): fact is string => fact !== null);

  async function run(action: () => Promise<CycleError | null>) {
    setSaving(true);
    setError(null);
    try {
      const result = await action();
      if (result) setError(messages.cycleError[result]);
    } catch (cause) {
      console.error(cause);
      setError(messages.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  function onRemove() {
    Alert.alert(messages.removePeriodTitle, messages.removePeriodBody, [
      { text: messages.cancel, style: 'cancel' },
      { text: messages.remove, style: 'destructive', onPress: () => void run(removeLatestPeriod) },
    ]);
  }

  return (
    <>
      <Stack.Screen options={{ title: formatDateKey(date, messages.dateWithYear, dateLocale) }} />
      <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.facts}>
          {facts.length > 0 ? (
            facts.map((fact) => (
              <Text key={fact} style={styles.fact}>
                {fact}
              </Text>
            ))
          ) : (
            <Text style={styles.quiet}>{messages.nothingThisDay}</Text>
          )}
        </View>
        <View style={styles.actions}>
          {canStart ? (
            <Button label={messages.periodStarted} disabled={saving} onPress={() => void run(() => logPeriodStart(date))} />
          ) : null}
          {canEnd ? (
            <Button
              label={messages.periodEnded}
              variant="secondary"
              disabled={saving}
              onPress={() => void run(() => logPeriodEnd(date))}
            />
          ) : null}
          {canRemove ? (
            <Button label={messages.removePeriod} variant="danger" disabled={saving} onPress={onRemove} />
          ) : null}
          {!canStart && !canEnd && date > today ? (
            <Text style={styles.quiet}>{messages.logThroughToday}</Text>
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <Text style={styles.disclaimer}>{messages.disclaimer}</Text>
      </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  invalid: { color: theme.text, fontSize: 16, padding: 20 },
  facts: { gap: 8 },
  fact: { color: theme.text, fontSize: 18, fontWeight: '600' },
  quiet: { color: theme.muted, fontSize: 16, lineHeight: 24 },
  actions: { gap: 12 },
  error: { color: theme.period, fontSize: 15, lineHeight: 22 },
  disclaimer: { color: theme.muted, fontSize: 14, lineHeight: 20 },
});

