import { Pressable, StyleSheet, Text } from 'react-native';

import { theme } from '../theme';

type Variant = 'primary' | 'secondary' | 'danger';

export function Button({
  label,
  onPress,
  disabled = false,
  variant = 'primary',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: Variant;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : variant === 'danger' ? styles.danger : styles.secondary,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text
        style={[
          styles.label,
          variant === 'primary' ? styles.primaryLabel : variant === 'danger' ? styles.dangerLabel : styles.secondaryLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primary: { backgroundColor: theme.accent },
  secondary: { backgroundColor: theme.elevated, borderWidth: 1, borderColor: theme.border },
  danger: { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.period },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
  label: { fontSize: 16, fontWeight: '600' },
  primaryLabel: { color: theme.onAccent },
  secondaryLabel: { color: theme.text },
  dangerLabel: { color: theme.period },
});
