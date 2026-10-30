import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View } from 'react-native';

import '../../global.css';

import { AppProviders } from '@/core/providers/app-providers';
import { useSession } from '@/core/session/session-provider';
import {
  OnboardingStatusProvider,
  useOnboardingStatus,
} from '@/features/onboarding/hooks/onboarding-status-provider';

export default function RootLayout() {
  return (
    <AppProviders>
      <OnboardingStatusProvider>
        <StatusBar style="light" />
        <RootNavigator />
      </OnboardingStatusProvider>
    </AppProviders>
  );
}

function RootNavigator() {
  const session = useSession();
  const onboarding = useOnboardingStatus();
  const signedIn = session.status === 'authenticated';
  const resolvingOnboarding = signedIn && (onboarding.status === 'loading' || onboarding.status === 'idle');

  // Só na abertura: espera sessão e onboarding para não piscar a landing.
  // Depois disso o Stack não é desmontado, para não perder a navegação.
  const [booted, setBooted] = useState(false);
  if (!booted && session.status !== 'loading' && !resolvingOnboarding) setBooted(true);
  if (!booted) return <View className="flex-1 bg-auth-bg" />;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#030C1B' } }}>
      {/* Logo após o login, a tela atual permanece até o status do onboarding chegar. */}
      <Stack.Protected guard={!signedIn || resolvingOnboarding}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && onboarding.status === 'pending'}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn && onboarding.status === 'done'}>
        <Stack.Screen name="home" />
      </Stack.Protected>
    </Stack>
  );
}
