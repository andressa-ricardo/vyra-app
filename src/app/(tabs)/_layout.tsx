import { Tabs } from 'expo-router/js-tabs';
import Apple from 'lucide-react-native/icons/apple';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Footprints from 'lucide-react-native/icons/footprints';
import House from 'lucide-react-native/icons/house';
import Menu from 'lucide-react-native/icons/menu';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { authColors } from '@/theme';

function tabIcon(Icon: LucideIcon) {
  // As cores ativa/inativa definidas abaixo são strings hex.
  return function TabIcon({ color }: { color: ColorValue }) {
    return <Icon color={color as string} size={22} strokeWidth={1.75} />;
  };
}

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: authColors.primary,
        tabBarActiveBackgroundColor: authColors.surfacePressed,
        tabBarInactiveTintColor: authColors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarAllowFontScaling: false,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: {
          borderRadius: 28,
          marginHorizontal: 2,
          marginVertical: 6,
        },
        tabBarStyle: {
          position: 'absolute',
          bottom: Math.max(insets.bottom, 12),
          left: 16,
          right: 16,
          height: 72,
          paddingHorizontal: 6,
          paddingBottom: 0,
          paddingTop: 0,
          borderTopWidth: 1,
          borderWidth: 1,
          borderColor: authColors.border,
          borderRadius: 36,
          backgroundColor: authColors.surface,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 12,
        },
        sceneStyle: {
          backgroundColor: authColors.background,
          paddingBottom: 84 + Math.max(insets.bottom, 12),
        },
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
