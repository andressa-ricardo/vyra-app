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

  // Destino explícito de cada redirecionamento: sem ele, abrir o app logado em `/`
  // (rota de boas-vindas) cai em "Unmatched Route", pois o grupo de abas não tem `/`.
  const signedInHome = onboarding.status === 'pending' ? '/onboarding' : '/home';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#030C1B' } }}>
      {/* Logo após o login, a tela atual permanece até o status do onboarding chegar. */}
      <Stack.Protected guard={!signedIn || resolvingOnboarding} redirectTo={signedInHome}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected
        guard={signedIn && onboarding.status === 'pending'}
        redirectTo={signedIn ? '/home' : '/'}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected
        guard={signedIn && onboarding.status === 'done'}
        redirectTo={signedIn ? '/onboarding' : '/'}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
    </Stack>
  );
}
