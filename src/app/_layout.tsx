import * as SplashScreen from 'expo-splash-screen';

import { AppProviders } from '@/core/providers/app-providers';
import { AnimatedSplashOverlay } from '@/features/starter/presentation/components/animated-icon';
import AppTabs from '@/features/starter/presentation/components/app-tabs';

SplashScreen.preventAutoHideAsync();

export default function TabLayout() {
  return (
    <AppProviders>
      <AnimatedSplashOverlay />
      <AppTabs />
    </AppProviders>
  );
}
