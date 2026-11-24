import { router, type Href } from 'expo-router';
import Bell from 'lucide-react-native/icons/bell';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Flame from 'lucide-react-native/icons/flame';
import Play from 'lucide-react-native/icons/play';
import Plus from 'lucide-react-native/icons/plus';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSession } from '@/core/session/session-provider';
import { useHomeDashboard } from '@/features/home/hooks/use-home-dashboard';
import { ActivityCard } from '@/features/home/presentation/components/activity-card';
import { SmoothLineChart } from '@/features/home/presentation/components/smooth-line-chart';
import type { HomeDashboard } from '@/features/home/types/home.types';
import { durationParts, formatKilometers } from '@/features/home/utils/activity-format';
import { formatLongDate, getFirstName, getGreetingKey } from '@/features/home/utils/greeting';
import { nameInitials, weekdayInitials } from '@/features/home/utils/week-activity';
import { authColors, metricColors } from '@/theme';

// Os tipos gerados listam a raiz como `/sports/index` por causa da rota irmã `[slug]`;
// em tempo de execução `/sports` abre a tela índice da aba.
const SPORTS_TAB = '/sports' as Href;

function Stat({ label, parts }: { label: string; parts: { value: string; unit?: string }[] }) {
  return (
    <View className="flex-1">
      <Text className="text-[12px] text-auth-muted">{label}</Text>
      <Text className="mt-0.5 text-auth-text" maxFontSizeMultiplier={1.05} numberOfLines={1}>
        {parts.map((part, index) => (
          <Text key={index}>
            <Text className="text-[22px] font-extrabold">{part.value}</Text>
            {part.unit ? <Text className="text-[12px] text-auth-muted">{part.unit}{index < parts.length - 1 ? ' ' : ''}</Text> : null}
          </Text>
        ))}
      </Text>
    </View>
  );
}

function WeekCard({ data }: { data: HomeDashboard }) {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'pt-BR';
  const { summary, weekSeconds } = data;

  return (
    <View className="rounded-[22px] border border-auth-border bg-auth-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-[12px] font-semibold uppercase tracking-wider text-auth-muted">{t('home.week.title')}</Text>
        {summary.activeDays > 0 ? (
          <View className="flex-row items-center gap-1">
            <Flame color={metricColors.calories} size={14} strokeWidth={2} />
            <Text className="text-[12px] font-bold" style={{ color: metricColors.calories }}>
              {t('home.week.activeDays', { count: summary.activeDays })}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="mt-3 flex-row gap-3">
        <Stat label={t('home.week.activities')} parts={[{ value: String(summary.activityCount) }]} />
        <Stat label={t('home.week.time')} parts={durationParts(summary.activeDurationSeconds)} />
        <Stat
          label={t('home.week.distance')}
          parts={[{ value: formatKilometers(summary.distanceMeters, locale, 1), unit: 'km' }]}
        />
      </View>

      <View className="mt-4">
        <SmoothLineChart dots height={72} values={weekSeconds} />
        <View className="mt-2 flex-row justify-between px-1">
          {weekdayInitials(locale).map((day, index) => (
            <Text className="w-4 text-center text-[11px] text-auth-muted" key={index}>
              {day}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}

function WorkoutCard({ workout }: { workout: NonNullable<HomeDashboard['workout']> }) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityLabel={t('home.workout.start', { name: workout.name })}
      accessibilityRole="button"
      className="flex-row items-center rounded-[22px] border border-auth-border bg-[#10264A] p-4 active:opacity-80"
      onPress={() => router.push('/workouts')}>
      <View className="h-12 w-12 items-center justify-center rounded-[14px] bg-auth-surface">
        <Dumbbell color={authColors.primary} size={22} strokeWidth={1.8} />
      </View>
      <View className="ml-3 flex-1 pr-2">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-auth-primary">{t('home.workout.eyebrow')}</Text>
        <Text className="mt-0.5 text-[17px] font-extrabold text-auth-text" numberOfLines={1}>
          {workout.name}
        </Text>
        <Text className="mt-0.5 text-[12px] text-auth-muted">
          {t('home.workout.exercises', { count: workout.itemCount })}
        </Text>
      </View>
      <View className="h-12 w-12 items-center justify-center rounded-full bg-auth-primary">
        <Play color={authColors.text} fill={authColors.text} size={18} />
      </View>
    </Pressable>
  );
}

export function HomeScreen() {
  const { i18n, t } = useTranslation();
  const { user } = useSession();
  const home = useHomeDashboard();
  const now = new Date();
  const locale = i18n.resolvedLanguage ?? 'pt-BR';
  const userName = user?.name ?? '';

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerClassName="w-full max-w-[520px] self-center px-5 pb-10 pt-4"
        refreshControl={
          <RefreshControl refreshing={home.refreshing} tintColor={authColors.primary} onRefresh={home.refresh} />
        }
        showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between gap-3">
          <View className="flex-1 gap-0.5">
            <Text className="text-[13px] text-auth-muted" maxFontSizeMultiplier={1.05}>
              {formatLongDate(now, locale)}
            </Text>
            <Text
              accessibilityRole="header"
              className="text-[22px] font-extrabold text-auth-text"
              maxFontSizeMultiplier={1.05}
              numberOfLines={1}>
              {t(getGreetingKey(now), { name: getFirstName(userName) })}
            </Text>
          </View>

          <Pressable
            accessibilityLabel={t('home.notifications')}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full border border-auth-border bg-auth-surface active:bg-auth-pressed"
            onPress={() => Alert.alert(t('common.comingSoon'), t('home.notificationsUnavailable'))}>
            <Bell color={authColors.text} size={19} strokeWidth={1.8} />
          </Pressable>
          <Pressable
            accessibilityLabel={t('home.profile')}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full border border-auth-border bg-[#183A70] active:opacity-80"
            onPress={() => router.push('/more/profile')}>
            <Text className="text-[14px] font-bold text-auth-primary">{nameInitials(userName)}</Text>
          </Pressable>
        </View>

        {home.loading && !home.data ? <ActivityIndicator className="mt-12" color={authColors.primary} /> : null}

        {home.error && !home.data ? (
          <Pressable
            accessibilityRole="button"
            className="mt-6 rounded-[18px] border border-auth-danger bg-auth-surface p-4 active:bg-auth-pressed"
            onPress={home.retry}>
            <Text className="text-[13px] text-auth-text">{t('home.loadError')}</Text>
          </Pressable>
        ) : null}

        {home.data ? (
          <>
            <View className="mt-5">
              <WeekCard data={home.data} />
            </View>

            {home.data.workout ? (
              <View className="mt-4">
                <WorkoutCard workout={home.data.workout} />
              </View>
            ) : null}

            <Text className="mb-3 mt-7 text-[16px] font-bold text-auth-text">{t('home.feed.title')}</Text>
            {home.data.feed.length ? (
              <View className="gap-3">
                {home.data.feed.map((activity) => (
                  <ActivityCard activity={activity} key={activity.id} userName={userName} />
                ))}
              </View>
            ) : (
              <View className="items-center rounded-[18px] border border-dashed border-auth-border px-4 py-6">
                <Text className="text-center text-[13px] text-auth-muted">{t('home.feed.empty')}</Text>
              </View>
            )}

            <Pressable
              accessibilityRole="button"
              className="mt-5 h-[52px] flex-row items-center justify-center gap-2 rounded-full border border-auth-border bg-auth-surface active:bg-auth-pressed"
              onPress={() => router.navigate(SPORTS_TAB)}>
              <Plus color={authColors.text} size={18} strokeWidth={2} />
              <Text className="text-[15px] font-bold text-auth-text">{t('home.logActivity')}</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
