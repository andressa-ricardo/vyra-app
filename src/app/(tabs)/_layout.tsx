import { Tabs } from 'expo-router';
import { Apple, Dumbbell, Footprints, House, Menu, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';

import { authColors } from '@/theme';

function tabIcon(Icon: LucideIcon) {
  // As cores ativa/inativa definidas abaixo são strings hex.
  return function TabIcon({ color }: { color: ColorValue }) {
    return <Icon color={color as string} size={22} strokeWidth={1.75} />;
  };
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: authColors.primary,
        tabBarInactiveTintColor: authColors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarAllowFontScaling: false,
        tabBarStyle: {
          backgroundColor: authColors.background,
          borderTopColor: authColors.surface,
        },
        sceneStyle: { backgroundColor: authColors.background },
      }}>
      <Tabs.Screen name="home" options={{ title: t('tabs.home'), tabBarIcon: tabIcon(House) }} />
      <Tabs.Screen
        name="workouts"
        options={{ title: t('tabs.workouts'), tabBarIcon: tabIcon(Dumbbell) }}
      />
      <Tabs.Screen
        name="running"
        options={{ title: t('tabs.running'), tabBarIcon: tabIcon(Footprints) }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{ title: t('tabs.nutrition'), tabBarIcon: tabIcon(Apple) }}
      />
      <Tabs.Screen name="more" options={{ title: t('tabs.more'), tabBarIcon: tabIcon(Menu) }} />
    </Tabs>
  );
}
