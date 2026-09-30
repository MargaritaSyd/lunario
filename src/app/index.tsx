import { Redirect } from 'expo-router';

import { useLunario } from '../context/lunario';

export default function Index() {
  const { settings } = useLunario();
  if (!settings?.onboardingComplete) return <Redirect href="/onboarding" />;
  return <Redirect href="/calendar" />;
}
