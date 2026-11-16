import Activity from 'lucide-react-native/icons/activity';
import ChartNoAxesCombined from 'lucide-react-native/icons/chart-no-axes-combined';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Goal from 'lucide-react-native/icons/goal';
import Pencil from 'lucide-react-native/icons/pencil';
import Settings from 'lucide-react-native/icons/settings';
import Sparkles from 'lucide-react-native/icons/sparkles';
import type { LucideIcon } from 'lucide-react-native';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/core/session/session-provider';
import { getInitials } from '@/features/account/utils/initials';
import { useProfile } from '@/features/account/hooks/use-profile';
import { profileAchievements } from '@/features/account/profile-achievements';
import { AchievementBadge } from '@/features/account/presentation/components/achievement-badge';
import {
  EditProfileModal,
  type EditProfileValues,
} from '@/features/account/presentation/components/edit-profile-modal';
import { BackButton } from '@/shared/components/back-button';
import { authColors } from '@/theme';

const menuItems: { key: 'activities' | 'statistics' | 'goals' | 'edit' | 'settings'; Icon: LucideIcon }[] = [
  { key: 'activities', Icon: Activity },
  { key: 'statistics', Icon: ChartNoAxesCombined },
  { key: 'goals', Icon: Goal },
  { key: 'edit', Icon: Pencil },
  { key: 'settings', Icon: Settings },
];

export function ProfileScreen() {
  const { t } = useTranslation();
  const { user } = useSession();
  const profile = useProfile();
  const [editVisible, setEditVisible] = useState(false);
  const [usernameOverride, setUsernameOverride] = useState<string | null>(null);
  const [bioOverride, setBioOverride] = useState<string | null>(null);

  const displayName = profile.profile?.displayName?.trim() || user?.name || t('profile.fallbackName');
  const derivedUsername = user?.email.split('@')[0]?.replace(/[^a-zA-Z0-9._]/g, '') || 'vyra';
  const username = usernameOverride ?? derivedUsername;
  const bio = bioOverride ?? t('profile.defaultBio');
  const editValues = useMemo(
    () => ({ bio, displayName, username }),
    [bio, displayName, username],
  );

  const openUnavailable = () =>
    Alert.alert(t('common.comingSoon'), t('common.comingSoonDescription'));

  const handleMenu = (key: (typeof menuItems)[number]['key']) => {
    if (key === 'activities') return router.navigate('/running');
    if (key === 'edit') return setEditVisible(true);
    if (key === 'settings') return router.push('/more/settings');
    openUnavailable();
  };

  const saveProfile = async (values: EditProfileValues) => {
    const saved = await profile.save({ displayName: values.displayName });
    if (saved) {
      setUsernameOverride(values.username);
      setBioOverride(values.bio);
    } else {
      Alert.alert(t('profile.edit.saveErrorTitle'), t('profile.edit.saveErrorMessage'));
    }
    return saved;
  };

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <View className="w-full max-w-[520px] self-center px-5 pt-1">
        <View className="h-12 flex-row items-center gap-2">
          <BackButton onPress={() => router.back()} />
          <Text className="flex-1 text-[18px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
            {t('profile.title')}
          </Text>
          <Pressable
            accessibilityLabel={t('settings.title')}
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full active:bg-auth-pressed"
            onPress={() => router.push('/more/settings')}>
            <Settings color={authColors.text} size={19} strokeWidth={1.8} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        contentContainerClassName="w-full max-w-[520px] self-center px-5 pb-10"
        showsVerticalScrollIndicator={false}>
        <View className="mt-1 flex-row items-center gap-4">
          <View className="h-16 w-16 items-center justify-center rounded-full border-[3px] border-auth-border bg-auth-primary">
            <Text className="text-[21px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
              {getInitials(displayName)}
            </Text>
          </View>
          <View className="flex-1 gap-1">
            <Text className="text-[19px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05} numberOfLines={1}>
              {displayName}
            </Text>
            <Text className="text-[12px] text-auth-muted" maxFontSizeMultiplier={1.05} numberOfLines={1}>
              @{username}
            </Text>
            <Pressable
              accessibilityRole="button"
              className="mt-1 flex-row items-center gap-2 self-start active:opacity-70"
              onPress={() => setEditVisible(true)}>
              <Pencil color={authColors.primary} size={14} />
              <Text className="text-[12px] font-medium text-auth-primary" maxFontSizeMultiplier={1.05}>
                {t('profile.editProfile')}
              </Text>
            </Pressable>
          </View>
          {profile.loading ? <ActivityIndicator color={authColors.primary} size="small" /> : null}
        </View>

        {profile.error && !profile.loading ? (
          <Pressable
            accessibilityRole="button"
            className="mt-3 rounded-[16px] bg-auth-danger/10 px-4 py-3 active:opacity-75"
            onPress={() => void profile.reload()}>
            <Text className="text-center text-[11px] text-auth-danger" maxFontSizeMultiplier={1.05}>
              {t('profile.loadError')}
            </Text>
          </Pressable>
        ) : null}

        <Text className="mt-5 text-[12px] leading-5 text-auth-muted" maxFontSizeMultiplier={1.05}>
          {bio}
        </Text>

        <View className="mt-4 flex-row border-y border-auth-border py-3">
          <Stat value="127" label={t('profile.stats.activities')} />
          <Stat bordered value="482 km" label={t('profile.stats.distance')} />
          <Stat value="86 h" label={t('profile.stats.time')} />
        </View>

        <View className="mt-6 flex-row items-center justify-between">
          <Text className="text-[15px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
            {t('profile.highlights.title')}
          </Text>
          <Pressable accessibilityRole="button" onPress={openUnavailable}>
            <Text className="text-[11px] text-auth-primary" maxFontSizeMultiplier={1.05}>
              {t('profile.highlights.customize')}
            </Text>
          </Pressable>
        </View>
        <Text className="mt-1 text-[10px] text-auth-muted" maxFontSizeMultiplier={1.05}>
          {t('profile.highlights.description')}
        </Text>
        <View className="mt-4 flex-row gap-2">
          {[profileAchievements[0], profileAchievements[4], profileAchievements[7]].map((achievement) => (
            <AchievementBadge key={achievement.id} achievement={achievement} compact />
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          className="mt-3 h-10 flex-row items-center justify-center gap-2 active:opacity-70"
          onPress={() => router.push('/more/achievements')}>
          <Text className="text-[11px] font-medium text-auth-primary" maxFontSizeMultiplier={1.05}>
            {t('profile.achievements.viewAll')}
          </Text>
          <ChevronRight color={authColors.primary} size={15} />
        </Pressable>

        <View className="mt-2 border-t border-auth-border">
          {menuItems.map(({ key, Icon }) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              className="min-h-[52px] flex-row items-center gap-4 border-b border-auth-border active:bg-auth-pressed"
              onPress={() => handleMenu(key)}>
              <Icon color={authColors.muted} size={17} strokeWidth={1.75} />
              <Text className="flex-1 text-[12px] font-semibold text-auth-text" maxFontSizeMultiplier={1.05}>
                {t(`profile.menu.${key}`)}
              </Text>
              <ChevronRight color={authColors.muted} size={17} />
            </Pressable>
          ))}
        </View>

        <View className="mt-5 flex-row items-center justify-center gap-2 py-2">
          <Sparkles color={authColors.muted} size={16} />
          <Text className="text-[10px] text-auth-muted" maxFontSizeMultiplier={1.05}>
            {t('profile.achievementPreview')}
          </Text>
        </View>
      </ScrollView>

      <EditProfileModal
        initialValues={editValues}
        onClose={() => setEditVisible(false)}
        onSave={saveProfile}
        saving={profile.saving}
        visible={editVisible}
      />
    </SafeAreaView>
  );
}

function Stat({ bordered = false, label, value }: { bordered?: boolean; label: string; value: string }) {
  return (
    <View className={['flex-1 items-center gap-1', bordered ? 'border-x border-auth-border' : ''].join(' ')}>
      <Text className="text-[18px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
        {value}
      </Text>
      <Text className="text-[9px] text-auth-muted" maxFontSizeMultiplier={1.05}>
        {label}
      </Text>
    </View>
  );
}
