import { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import {
  DISCHARGES,
  FLOWS,
  MOODS,
  NOTE_LIMIT,
  PAINS,
  PAIN_INTENSITIES,
  SENSATIONS,
  normalizeNote,
  type DayLog,
} from '../domain/log';
import { messages } from '../i18n';
import { theme } from '../theme';
import { Button } from './button';
import { Choices, MultiChoices } from './choices';
import { Field } from './fields';

function sameList(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((item, index) => item === right[index]);
}

function sameLog(a: DayLog, b: DayLog): boolean {
  return (
    a.flow === b.flow &&
    sameList(a.sensations, b.sensations) &&
    sameList(a.pains, b.pains) &&
    a.painIntensity === b.painIntensity &&
    sameList(a.moods, b.moods) &&
    a.discharge === b.discharge &&
    normalizeNote(a.note) === normalizeNote(b.note)
  );
}

export function LogForm({ saved, onSave }: { saved: DayLog; onSave: (log: DayLog) => Promise<void> }) {
  const [draft, setDraft] = useState(saved);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const snapshot = JSON.stringify(saved);

  useEffect(() => {
    setDraft(JSON.parse(snapshot) as DayLog);
  }, [snapshot]);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      await onSave({ ...draft, note: normalizeNote(draft.note) });
    } catch (cause) {
      console.error(cause);
      setError(messages.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.form}>
      <Choices
        label={messages.flow}
        value={draft.flow}
        options={FLOWS}
        labels={messages.flowOption}
        onChange={(flow) => setDraft((current) => ({ ...current, flow }))}
      />
      <MultiChoices
        label={messages.sensations}
        values={draft.sensations}
        options={SENSATIONS}
        labels={messages.sensationOption}
        onChange={(sensations) => setDraft((current) => ({ ...current, sensations }))}
      />
      <MultiChoices
        label={messages.pain}
        values={draft.pains}
        options={PAINS}
        labels={messages.painOption}
        onChange={(pains) => setDraft((current) => ({ ...current, pains }))}
      />
      <Choices
        label={messages.painIntensity}
        value={draft.painIntensity}
        options={PAIN_INTENSITIES}
        labels={messages.painIntensityOption}
        onChange={(painIntensity) => setDraft((current) => ({ ...current, painIntensity }))}
      />
      <MultiChoices
        label={messages.mood}
        values={draft.moods}
        options={MOODS}
        labels={messages.moodOption}
        onChange={(moods) => setDraft((current) => ({ ...current, moods }))}
      />
      <Choices
        label={messages.discharge}
        value={draft.discharge}
        options={DISCHARGES}
        labels={messages.dischargeOption}
        onChange={(discharge) => setDraft((current) => ({ ...current, discharge }))}
      />
      <Field label={messages.note} hint={messages.noteHint}>
        <TextInput
          value={draft.note}
          onChangeText={(note) => setDraft((current) => ({ ...current, note }))}
          multiline
          maxLength={NOTE_LIMIT}
          textAlignVertical="top"
          style={styles.note}
          placeholderTextColor={theme.muted}
        />
      </Field>
      <Button label={saving ? messages.saving : messages.saveLog} disabled={saving || sameLog(draft, saved)} onPress={() => void save()} />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  note: {
    minHeight: 96,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.elevated,
    color: theme.text,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  error: { color: theme.period, fontSize: 15, lineHeight: 22 },
});
