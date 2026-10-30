import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

import '../../global.css';

import { AppProviders } from '@/core/providers/app-providers';
import { useSession } from '@/core/session/session-provider';

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="light" />
      <RootNavigator />
    </AppProviders>
  );
}

function RootNavigator() {
  const { status } = useSession();

  // Evita mostrar a tela de boas-vindas por um instante enquanto a sessão é restaurada.
  if (status === 'loading') return <View className="flex-1 bg-auth-bg" />;

  const signedIn = status === 'authenticated';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#030C1B' } }}>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="home" />
      </Stack.Protected>
    </Stack>
  );
}
