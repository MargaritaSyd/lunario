import { Redirect } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '../components/button';
import { DateField, NumberField } from '../components/fields';
import { Screen } from '../components/screen';
import { useLunario } from '../context/lunario';
import { messages } from '../i18n';
import { addDaysKey, todayKey } from '../domain/dates';
import { parseOnboarding } from '../domain/onboarding';
import { theme } from '../theme';

export default function OnboardingScreen() {
  const { settings, completeOnboarding } = useLunario();
  const [lastPeriodStart, setLastPeriodStart] = useState(() => addDaysKey(todayKey(), -28));
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  if (settings?.onboardingComplete) return <Redirect href="/calendar" />;

  async function onContinue() {
    const parsed = parseOnboarding({ lastPeriodStart, cycleLength, periodLength }, todayKey());
    if (!parsed.ok) {
      setError(messages.onboardingError[parsed.error]);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await completeOnboarding(parsed.value);
    } catch (cause) {
      console.error(cause);
      setError(messages.saveFailed);
      setSaving(false);
    }
  }

  return (
    <Screen includeTop>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.intro}>
          <Text style={styles.title}>{messages.appName}</Text>
          <Text style={styles.subtitle}>{messages.onboardingSubtitle}</Text>
        </View>
        <DateField
          label={messages.lastPeriodStarted}
          hint={messages.lastPeriodHint}
          value={lastPeriodStart}
          onChange={setLastPeriodStart}
        />
        <NumberField
          label={messages.usualCycleLength}
          hint={messages.usualCycleHint}
          value={cycleLength}
          onChangeText={setCycleLength}
        />
        <NumberField
          label={messages.usualBleedingLength}
          hint={messages.usualBleedingHint}
          value={periodLength}
          onChangeText={setPeriodLength}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={saving ? messages.saving : messages.continue} onPress={() => void onContinue()} disabled={saving} />
        <Text style={styles.disclaimer}>{messages.disclaimer}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 20, paddingBottom: 40 },
  intro: { gap: 8, paddingTop: 12 },
  title: { color: theme.text, fontSize: 40, fontWeight: '600' },
  subtitle: { color: theme.muted, fontSize: 16, lineHeight: 24 },
  error: { color: theme.period, fontSize: 15, lineHeight: 22 },
  disclaimer: { color: theme.muted, fontSize: 14, lineHeight: 20 },
});
