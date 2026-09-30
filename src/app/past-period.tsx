import { parseISO } from 'date-fns';
import { Redirect, router, Stack } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '../components/button';
import { DateField } from '../components/fields';
import { Screen } from '../components/screen';
import { useLunario } from '../context/lunario';
import { addDaysKey, isDateKey, todayKey } from '../domain/dates';
import { sortCycles } from '../domain/predict';
import { messages } from '../i18n';
import { theme } from '../theme';

function suggestedPastPeriod(startDate: string, periodLength: number, earliestStart: string): { start: string; end: string } {
  const today = todayKey();
  let start = startDate > today ? today : startDate;
  let end = addDaysKey(start, periodLength - 1);
  if (end >= earliestStart) end = addDaysKey(earliestStart, -1);
  if (end < start) end = start;
  if (end > today) end = today;
  return { start, end };
}

export default function PastPeriodScreen() {
  const { settings, cycles, logPastPeriod } = useLunario();
  const earliest = sortCycles(cycles)[0];
  const suggested = earliest
    ? suggestedPastPeriod(addDaysKey(earliest.startDate, -(settings?.cycleLength ?? 28)), settings?.periodLength ?? 5, earliest.startDate)
    : { start: todayKey(), end: todayKey() };
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
