import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { useLunario, LunarioProvider } from '../context/lunario';
import { messages } from '../i18n';
import { theme } from '../theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootNavigator() {
  const { ready, error } = useLunario();

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  if (error) {
    return (
      <View style={styles.error}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.bg },
          headerTintColor: theme.text,
          headerTitleStyle: { color: theme.text },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.bg },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="calendar" options={{ title: messages.appName }} />
        <Stack.Screen name="day/[date]" options={{ title: messages.day }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <LunarioProvider>
      <RootNavigator />
    </LunarioProvider>
  );
}

const styles = StyleSheet.create({
  error: { flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 24 },
  errorText: { color: theme.text, fontSize: 16, textAlign: 'center' },
});
