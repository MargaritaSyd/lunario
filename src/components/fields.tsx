import DateTimePicker from '@react-native-community/datetimepicker';
import { format, parseISO } from 'date-fns';
import { useState, type ReactNode } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { endOfToday, formatDateKey, isDateKey } from '../domain/dates';
import { theme } from '../theme';

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function NumberField({
  label,
  hint,
  value,
  onChangeText,
}: {
  label: string;
  hint: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={2}
        style={styles.input}
        placeholderTextColor={theme.muted}
      />
    </Field>
  );
}

export function DateField({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Field label={label} hint={hint}>
      {Platform.OS === 'web' ? (
        <TextInput
          value={value}
          onChangeText={onChange}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="YYYY-MM-DD"
          placeholderTextColor={theme.muted}
          style={styles.input}
        />
      ) : (
        <>
          <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.input}>
            <Text style={styles.inputText}>{isDateKey(value) ? formatDateKey(value) : value}</Text>
          </Pressable>
          {open ? (
            <DateTimePicker
              value={isDateKey(value) ? parseISO(value) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={endOfToday()}
              onValueChange={(_event, date) => {
                if (Platform.OS === 'android') setOpen(false);
                onChange(format(date, 'yyyy-MM-dd'));
              }}
              onDismiss={() => setOpen(false)}
            />
          ) : null}
        </>
      )}
    </Field>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { color: theme.text, fontSize: 16, fontWeight: '600' },
  hint: { color: theme.muted, fontSize: 14, lineHeight: 20 },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.elevated,
    color: theme.text,
    fontSize: 16,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  inputText: { color: theme.text, fontSize: 16 },
});
