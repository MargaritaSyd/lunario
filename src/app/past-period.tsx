import { parseISO } from 'date-fns';
import { Redirect, router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '../components/button';
import { DateField } from '../components/fields';
import { Screen } from '../components/screen';
import { useLunario } from '../context/lunario';
import { suggestedPastPeriod } from '../domain/cycles';
import { isDateKey, todayKey } from '../domain/dates';
import { sortCycles } from '../domain/predict';
import { messages } from '../i18n';
import { theme } from '../theme';

export default function PastPeriodScreen() {
  const { settings, cycles, logPastPeriod } = useLunario();
  const today = todayKey();
  const earliest = sortCycles(cycles)[0];
  const suggested = earliest
    ? suggestedPastPeriod(earliest.startDate, settings?.cycleLength ?? 28, settings?.periodLength ?? 5, today)
    : { start: today, end: today };
  const [start, setStart] = useState(suggested.start);
  const [end, setEnd] = useState(suggested.end);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (!settings?.onboardingComplete) return <Redirect href="/onboarding" />;

  async function onSave() {
    if (!isDateKey(start) || !isDateKey(end)) {
      setError(messages.invalidDate);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const result = await logPastPeriod(start, end);
      if (result) {
        setError(messages.cycleError[result]);
        setSaving(false);
        return;
      }
      router.back();
    } catch (cause) {
      console.error(cause);
      setError(messages.saveFailed);
      setSaving(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: messages.addPastPeriod }} />
      <Screen>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.hint}>{messages.pastPeriodHint}</Text>
          <DateField
            label={messages.pastPeriodStarted}
            hint={messages.pastPeriodStartedHint}
            value={start}
            onChange={setStart}
          />
          <DateField
            label={messages.pastPeriodEnded}
            hint={messages.pastPeriodEndedHint}
            value={end}
            onChange={setEnd}
            minimumDate={isDateKey(start) ? parseISO(start) : undefined}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={saving ? messages.saving : messages.savePastPeriod} disabled={saving} onPress={() => void onSave()} />
        </ScrollView>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 16, paddingBottom: 40 },
  hint: { color: theme.muted, fontSize: 15, lineHeight: 22 },
  error: { color: theme.period, fontSize: 15, lineHeight: 22 },
});
