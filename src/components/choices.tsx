import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

export function Choices<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T | null;
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (value: T | null) => void;
}) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = value === option;
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onChange(selected ? null : option)}
              style={[styles.chip, selected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipLabel, selected ? styles.chipLabelSelected : null]}>{labels[option]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MultiChoices<T extends string>({
  label,
  values,
  options,
  labels,
  onChange,
}: {
  label: string;
  values: readonly T[];
  options: readonly T[];
  labels: Record<T, string>;
  onChange: (values: T[]) => void;
}) {
  function toggle(option: T) {
    const next = values.includes(option) ? values.filter((item) => item !== option) : [...values, option];
    onChange(options.filter((item) => next.includes(item)));
  }

  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <Pressable
              key={option}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => toggle(option)}
              style={[styles.chip, selected ? styles.chipSelected : null]}
            >
              <Text style={[styles.chipLabel, selected ? styles.chipLabelSelected : null]}>{labels[option]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  label: { color: theme.text, fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: theme.accent, borderColor: theme.accent },
  chipLabel: { color: theme.text, fontSize: 15 },
  chipLabelSelected: { color: theme.onAccent, fontWeight: '600' },
});
