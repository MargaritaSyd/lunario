import { type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { theme } from '../theme';

export function Screen({
  children,
  includeTop = false,
  style,
}: {
  children: ReactNode;
  includeTop?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const edges: Edge[] = includeTop ? ['top', 'bottom'] : ['bottom'];
  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <View style={[styles.frame, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  frame: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
});
