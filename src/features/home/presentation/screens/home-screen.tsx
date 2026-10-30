import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/core/session/session-provider';
import { formatLongDate, getFirstName, getGreetingKey } from '@/features/home/utils/greeting';

export function HomeScreen() {
  const { i18n, t } = useTranslation();
  const { user } = useSession();
  const now = new Date();
  const locale = i18n.resolvedLanguage ?? 'pt-BR';

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="w-full max-w-[520px] self-center px-6 pb-6 pt-4">
        <View className="flex-row items-center justify-between gap-4">
          <View className="flex-1 gap-1">
            <Text className="text-[13px] text-auth-muted" maxFontSizeMultiplier={1.05}>
              {formatLongDate(now, locale)}
            </Text>
            <Text
              accessibilityRole="header"
              className="text-[22px] font-extrabold leading-[28px] tracking-[-0.4px] text-auth-text"
              maxFontSizeMultiplier={1.05}
              numberOfLines={1}>
              {t(getGreetingKey(now), { name: user ? getFirstName(user.name) : '' })}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={t('home.notifications')}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full bg-auth-surface active:bg-auth-pressed"
            onPress={() => Alert.alert(t('common.comingSoon'), t('home.notificationsUnavailable'))}>
            <BellIcon />
            <View className="absolute right-[11px] top-[10px] h-2 w-2 rounded-full border border-auth-surface bg-auth-primary" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BellIcon() {
  return (
    <View className="items-center">
      <View className="h-[13px] w-[14px] rounded-t-[7px] border-[1.75px] border-b-0 border-auth-text" />
      <View className="h-[1.75px] w-[18px] rounded-full bg-auth-text" />
      <View className="mt-[1.5px] h-[3px] w-[6px] rounded-b-full bg-auth-text" />
    </View>
  );
}
