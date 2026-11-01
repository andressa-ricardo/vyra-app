import Bell from 'lucide-react-native/icons/bell';
import BuildingComplex from 'lucide-react-native/icons/building-complex';
import CalendarDays from 'lucide-react-native/icons/calendar-days';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import CircleQuestionMark from 'lucide-react-native/icons/circle-question-mark';
import Crown from 'lucide-react-native/icons/crown';
import LogOut from 'lucide-react-native/icons/log-out';
import Settings from 'lucide-react-native/icons/settings';
import Stethoscope from 'lucide-react-native/icons/stethoscope';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import Trophy from 'lucide-react-native/icons/trophy';
import User from 'lucide-react-native/icons/user';
import type { LucideIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/core/session/session-provider';
import { getInitials } from '@/features/account/utils/initials';
import { authColors } from '@/theme';

const menuItems: { key: string; Icon: LucideIcon }[] = [
  { key: 'profile', Icon: User },
  { key: 'progress', Icon: TrendingUp },
  { key: 'gym', Icon: BuildingComplex },
  { key: 'professionals', Icon: Stethoscope },
  { key: 'appointments', Icon: CalendarDays },
  { key: 'achievements', Icon: Trophy },
  { key: 'premium', Icon: Crown },
  { key: 'notifications', Icon: Bell },
  { key: 'settings', Icon: Settings },
  { key: 'help', Icon: CircleQuestionMark },
];

export function MoreScreen() {
  const { t } = useTranslation();
  const { signOut, user } = useSession();
  const [signingOut, setSigningOut] = useState(false);

  const showComingSoon = () => Alert.alert(t('common.comingSoon'), t('common.comingSoonDescription'));

  const handleMenuPress = (key: string) => {
    if (key === 'settings') {
      router.push('/more/settings');
      return;
    }

    showComingSoon();
  };

  const confirmSignOut = () =>
    Alert.alert(t('more.signOutConfirm.title'), t('more.signOutConfirm.message'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('more.signOut'),
        style: 'destructive',
        onPress: () => {
          setSigningOut(true);
          // Ao encerrar a sessão, as rotas protegidas levam de volta à tela inicial.
          void signOut();
        },
      },
    ]);

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="w-full max-w-[520px] gap-4 self-center px-4 pb-6 pt-4">
        <Pressable
          accessibilityRole="button"
          className="flex-row items-center gap-4 rounded-[20px] px-1 py-2 active:opacity-80"
          onPress={showComingSoon}>
          <View className="h-[60px] w-[60px] items-center justify-center rounded-full bg-auth-primary">
            <Text className="text-xl font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
              {user ? getInitials(user.name) : ''}
            </Text>
          </View>
          <View className="flex-1 gap-0.5">
            <Text
              className="text-[19px] font-extrabold text-auth-text"
              maxFontSizeMultiplier={1.05}
              numberOfLines={1}>
              {user?.name}
            </Text>
            <Text className="text-[13px] text-auth-muted" maxFontSizeMultiplier={1.05} numberOfLines={1}>
              {user?.email}
            </Text>
          </View>
          <ChevronRight color={authColors.muted} size={20} />
        </Pressable>

        <View className="overflow-hidden rounded-[20px] bg-auth-surface">
          {menuItems.map(({ key, Icon }, index) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              className={[
                'h-[52px] flex-row items-center gap-3.5 px-4 active:bg-auth-pressed',
                index > 0 ? 'border-t border-auth-border/60' : '',
              ].join(' ')}
              onPress={() => handleMenuPress(key)}>
              <Icon color={authColors.muted} size={20} strokeWidth={1.75} />
              <Text className="flex-1 text-[15px] text-auth-text" maxFontSizeMultiplier={1.05}>
                {t(`more.items.${key}`)}
              </Text>
              <ChevronRight color={authColors.muted} size={18} />
            </Pressable>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: signingOut, disabled: signingOut }}
          className="h-[52px] flex-row items-center gap-3.5 rounded-[20px] bg-auth-surface px-4 active:bg-auth-pressed"
          disabled={signingOut}
          onPress={confirmSignOut}>
          {signingOut ? (
            <ActivityIndicator color={authColors.danger} size="small" />
          ) : (
            <LogOut color={authColors.danger} size={20} strokeWidth={1.75} />
          )}
          <Text className="text-[15px] font-semibold text-auth-danger" maxFontSizeMultiplier={1.05}>
            {t('more.signOut')}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
