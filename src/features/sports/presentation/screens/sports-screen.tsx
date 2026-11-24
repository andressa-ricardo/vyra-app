import { router } from 'expo-router';
import Activity from 'lucide-react-native/icons/activity';
import ArrowUpRight from 'lucide-react-native/icons/arrow-up-right';
import LayoutGrid from 'lucide-react-native/icons/layout-grid';
import Target from 'lucide-react-native/icons/target';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityRow, IconBadge } from '@/features/sports/presentation/components/activity-row';
import { openSport } from '@/features/sports/presentation/open-sport';
import { sampleActivities, weeklySummary } from '@/features/sports/sample-data';
import { getModalityIcon } from '@/shared/utils/modality-icons';
import { authColors } from '@/theme';

/** Slugs do catálogo `GET /sport-modalities` em destaque no hub. */
type SportId = 'running' | 'strength-training' | 'walking' | 'cycling' | 'swimming';

function SportCard({ sport, onPress }: { sport: SportId; onPress: () => void }) {
  const { t } = useTranslation();
  const title = t(`sports.items.${sport}.title`);

  return (
    <Pressable
      accessibilityLabel={title}
      accessibilityRole="button"
      className="min-h-[96px] flex-1 rounded-[18px] border border-auth-border bg-auth-surface p-3 active:bg-auth-pressed"
      onPress={onPress}>
      <View className="flex-row items-start justify-between">
        <IconBadge Icon={getModalityIcon(sport)} />
        <ArrowUpRight color={authColors.muted} size={15} strokeWidth={1.8} />
      </View>
      <Text className="mt-2 text-[14px] font-bold text-auth-text" maxFontSizeMultiplier={1.1}>
        {title}
      </Text>
      <Text className="mt-1 text-[11px] text-auth-muted" maxFontSizeMultiplier={1.15}>
        {t(`sports.items.${sport}.description`)}
      </Text>
    </Pressable>
  );
}

export function SportsScreen() {
  const { t } = useTranslation();
  const showComingSoon = () => Alert.alert(t('common.comingSoon'), t('sports.unavailable'));

  const hours = Math.floor(weeklySummary.durationMinutes / 60);
  const minutes = weeklySummary.durationMinutes % 60;
  const progress = Math.min(1, weeklySummary.activities / weeklySummary.goalActivities);

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerClassName="w-full max-w-[520px] self-center px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={false}>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-[26px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
              {t('sports.title')}
            </Text>
            <Text className="mt-0.5 text-[13px] text-auth-muted">{t('sports.subtitle')}</Text>
          </View>
          <Pressable
            accessibilityLabel={t('sports.activityLog')}
            accessibilityRole="button"
            className="h-10 w-10 items-center justify-center rounded-full border border-auth-border bg-auth-surface active:bg-auth-pressed"
            onPress={showComingSoon}>
            <Activity color={authColors.primary} size={17} strokeWidth={1.8} />
          </Pressable>
        </View>

        <View className="mt-5 rounded-[20px] border border-auth-border bg-auth-surface p-4">
          <View className="flex-row items-center justify-between">
            <Text className="text-[12px] text-auth-muted">{t('sports.week.title')}</Text>
            <Target color={authColors.primary} size={16} strokeWidth={1.8} />
          </View>

          <View className="mt-2 flex-row items-center">
            <View className="flex-1 flex-row items-baseline gap-2">
              <Text className="text-[24px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
                {weeklySummary.activities}
              </Text>
              <Text className="text-[13px] text-auth-muted">
                {t('sports.week.activities', { count: weeklySummary.activities })}
              </Text>
            </View>
            <View className="mx-3 h-10 w-px bg-auth-border" />
            <View className="flex-1">
              <Text className="text-[20px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
                {t('sports.week.duration', { hours, minutes })}
              </Text>
              <Text className="text-[11px] text-auth-muted">{t('sports.week.durationLabel')}</Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between">
            <Text className="text-[12px] text-auth-muted">{t('sports.week.goal')}</Text>
            <Text className="text-[12px] text-auth-muted">
              <Text className="font-bold text-auth-text">{weeklySummary.activities}</Text>
              {t('sports.week.goalProgress', { count: weeklySummary.goalActivities })}
            </Text>
          </View>
          <View
            accessibilityRole="progressbar"
            accessibilityValue={{ min: 0, max: weeklySummary.goalActivities, now: weeklySummary.activities }}
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-auth-border">
            <View className="h-full rounded-full bg-auth-primary" style={{ width: `${progress * 100}%` }} />
          </View>
        </View>

        <Text className="mb-3 mt-6 text-[16px] font-bold text-auth-text">{t('sports.choose')}</Text>
        <View className="gap-3">
          <View className="flex-row gap-3">
            <SportCard sport="running" onPress={() => openSport('running')} />
            <SportCard sport="strength-training" onPress={() => openSport('strength-training')} />
          </View>
          <View className="flex-row gap-3">
            <SportCard sport="walking" onPress={() => openSport('walking')} />
            <SportCard sport="cycling" onPress={() => openSport('cycling')} />
          </View>
          <View className="flex-row gap-3">
            <SportCard sport="swimming" onPress={() => openSport('swimming')} />
            <Pressable
              accessibilityLabel={t('sports.items.more.title')}
              accessibilityRole="button"
              className="min-h-[96px] flex-1 justify-between rounded-[18px] border border-dashed border-auth-border p-3 active:bg-auth-pressed"
              onPress={() => router.push('/sports/modalities')}>
              <IconBadge Icon={LayoutGrid} square />
              <View>
                <Text className="text-[14px] font-bold text-auth-text" maxFontSizeMultiplier={1.1}>
                  {t('sports.items.more.title')}
                </Text>
                <Text className="mt-1 text-[11px] text-auth-muted" maxFontSizeMultiplier={1.15}>
                  {t('sports.items.more.description')}
                </Text>
              </View>
            </Pressable>
          </View>
        </View>

        <View className="mb-3 mt-6 flex-row items-center justify-between">
          <Text className="text-[16px] font-bold text-auth-text">{t('sports.recent.title')}</Text>
          <Pressable accessibilityRole="button" hitSlop={10} onPress={showComingSoon}>
            <Text className="text-[13px] font-semibold text-auth-primary">{t('sports.recent.seeAll')}</Text>
          </Pressable>
        </View>
        <View className="gap-2.5">
          {sampleActivities.slice(0, 4).map((activity) => (
            <ActivityRow activity={activity} key={activity.id} onPress={() => openSport(activity.sport)} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
