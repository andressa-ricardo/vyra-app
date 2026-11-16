import Sparkles from 'lucide-react-native/icons/sparkles';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { profileAchievements } from '@/features/account/profile-achievements';
import { AchievementBadge } from '@/features/account/presentation/components/achievement-badge';
import type {
  AchievementCategory,
  AchievementState,
} from '@/features/account/types/profile.types';
import { BackButton } from '@/shared/components/back-button';
import { authColors } from '@/theme';

const categories: AchievementCategory[] = ['all', 'running', 'strength', 'cycling', 'walking'];
const states: ('all' | AchievementState)[] = ['all', 'unlocked', 'locked'];

export function AchievementsScreen() {
  const { t } = useTranslation();
  const [category, setCategory] = useState<AchievementCategory>('all');
  const [state, setState] = useState<'all' | AchievementState>('all');
  const achievements = profileAchievements.filter(
    (achievement) =>
      (category === 'all' || achievement.category === category) &&
      (state === 'all' || achievement.state === state),
  );

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <View className="w-full max-w-[520px] self-center px-4 pt-1">
        <View className="h-12 flex-row items-center gap-2">
          <BackButton onPress={() => router.back()} />
          <Text className="flex-1 text-[18px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
            {t('profile.achievements.title')}
          </Text>
          <Sparkles color={authColors.text} size={18} />
        </View>
      </View>

      <ScrollView contentContainerClassName="w-full max-w-[520px] self-center px-4 pb-10" showsVerticalScrollIndicator={false}>
        <Text className="mt-2 text-[12px] text-auth-muted" maxFontSizeMultiplier={1.05}>
          {t('profile.achievements.subtitle')}
        </Text>
        <View className="mt-5 border-y border-auth-border py-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[18px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
              {t('profile.achievements.progressCount', { count: 12, total: 30 })}
            </Text>
            <Text className="text-[15px] font-bold text-auth-primary">40%</Text>
          </View>
          <View className="mt-4 h-1 overflow-hidden rounded-full bg-auth-border">
            <View className="h-full w-[40%] rounded-full bg-auth-primary" />
          </View>
          <Text className="mt-2 text-[9px] text-auth-muted" maxFontSizeMultiplier={1.05}>
            {t('profile.achievements.progressDescription', { progress: 40 })}
          </Text>
        </View>

        <ScrollView className="-mx-4 mt-4" contentContainerClassName="gap-2 px-4" horizontal showsHorizontalScrollIndicator={false}>
          {categories.map((item) => (
            <FilterChip
              key={item}
              active={category === item}
              label={t(`profile.achievements.categories.${item}`)}
              onPress={() => setCategory(item)}
            />
          ))}
        </ScrollView>

        <View className="mt-4 flex-row rounded-[20px] bg-auth-surface p-1">
          {states.map((item) => (
            <Pressable
              key={item}
              accessibilityRole="button"
              accessibilityState={{ selected: state === item }}
              className={[
                'h-9 flex-1 items-center justify-center rounded-[16px]',
                state === item ? 'bg-auth-pressed' : '',
              ].join(' ')}
              onPress={() => setState(item)}>
              <Text className="text-[10px] font-semibold text-auth-text" maxFontSizeMultiplier={1.05}>
                {t(`profile.achievements.states.${item}`)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="mb-3 mt-5 text-[10px] text-auth-muted" maxFontSizeMultiplier={1.05}>
          {t('profile.achievements.total', {
            count: category === 'all' && state === 'all' ? 30 : achievements.length,
          })}
        </Text>
        {achievements.length ? (
          <View className="flex-row flex-wrap gap-3">
            {achievements.map((achievement) => (
              <View key={achievement.id} className="w-[48%]">
                <AchievementBadge achievement={achievement} />
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center rounded-[20px] bg-auth-surface px-6 py-10">
            <Text className="text-center text-sm text-auth-muted">{t('profile.achievements.empty')}</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      className={[
        'h-8 items-center justify-center rounded-full border px-4',
        active ? 'border-auth-primary bg-auth-primary' : 'border-auth-border bg-auth-surface',
      ].join(' ')}
      onPress={onPress}>
      <Text className="text-[10px] font-semibold text-auth-text" maxFontSizeMultiplier={1.05}>
        {label}
      </Text>
    </Pressable>
  );
}
