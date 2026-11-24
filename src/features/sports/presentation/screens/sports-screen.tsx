import { router } from 'expo-router';
import Activity from 'lucide-react-native/icons/activity';
import ArrowUpRight from 'lucide-react-native/icons/arrow-up-right';
import Bike from 'lucide-react-native/icons/bike';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Footprints from 'lucide-react-native/icons/footprints';
import LayoutGrid from 'lucide-react-native/icons/layout-grid';
import PersonStanding from 'lucide-react-native/icons/person-standing';
import Target from 'lucide-react-native/icons/target';
import Waves from 'lucide-react-native/icons/waves-horizontal';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authColors } from '@/theme';

type SportId = 'running' | 'strength' | 'walking' | 'cycling' | 'swimming';

const sportIcons: Record<SportId, LucideIcon> = {
  running: Footprints,
  strength: Dumbbell,
  walking: PersonStanding,
  cycling: Bike,
  swimming: Waves,
};

// Dados de exemplo até existir um contrato de atividades multiesporte no backend.
const weeklySummary = { activities: 5, durationMinutes: 222, goalActivities: 6 };

type RecentActivity = {
  daysAgo: number;
  distanceKm?: number;
  durationSeconds?: number;
  id: string;
  name: 'morningRun' | 'upperBody' | 'sundayRide' | 'eveningWalk';
  sport: SportId;
  time: [hours: number, minutes: number];
};

const recentActivities: RecentActivity[] = [
  { id: '1', name: 'morningRun', sport: 'running', daysAgo: 0, time: [7, 12], distanceKm: 8.04, durationSeconds: 2652 },
  { id: '2', name: 'upperBody', sport: 'strength', daysAgo: 1, time: [18, 30], durationSeconds: 3120 },
  { id: '3', name: 'sundayRide', sport: 'cycling', daysAgo: 2, time: [8, 0], distanceKm: 18.6 },
  { id: '4', name: 'eveningWalk', sport: 'walking', daysAgo: 3, time: [19, 15], distanceKm: 3.2 },
];

function stripDot(value: string) {
  return value.replace(/\.$/, '');
}

function useActivityFormat() {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage;

  const distance = (km: number) =>
    `${km.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} km`;

  const duration = (seconds: number) => {
    const hours = Math.floor(seconds / 3_600);
    const minutes = Math.floor((seconds % 3_600) / 60);
    const rest = seconds % 60;
    const pad = (value: number) => String(value).padStart(2, '0');
    return hours ? `${hours}:${pad(minutes)}:${pad(rest)}` : `${pad(minutes)}:${pad(rest)}`;
  };

  const when = ({ daysAgo, time }: RecentActivity) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(time[0], time[1], 0, 0);
    const clock = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    let day: string;
    if (daysAgo === 0) day = t('sports.recent.today');
    else if (daysAgo === 1) day = t('sports.recent.yesterday');
    else {
      const weekday = stripDot(date.toLocaleDateString(locale, { weekday: 'short' }));
      const month = stripDot(date.toLocaleDateString(locale, { month: 'short' }));
      day = `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${date.getDate()} ${month}`;
    }
    return `${day} · ${clock}`;
  };

  return { distance, duration, when };
}

function IconBadge({ Icon, square = false }: { Icon: LucideIcon; square?: boolean }) {
  return (
    <View
      className={`h-9 w-9 items-center justify-center bg-[#183A70] ${square ? 'rounded-xl' : 'rounded-full'}`}>
      <Icon color={authColors.primary} size={17} strokeWidth={1.8} />
    </View>
  );
}

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
        <IconBadge Icon={sportIcons[sport]} />
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
  const format = useActivityFormat();
  const showComingSoon = () => Alert.alert(t('common.comingSoon'), t('sports.unavailable'));

  const openSport = (sport: SportId) => {
    if (sport === 'running') return router.push('/sports/running');
    if (sport === 'strength') return router.push('/workouts');
    showComingSoon();
  };

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
            <SportCard sport="strength" onPress={() => openSport('strength')} />
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
              onPress={showComingSoon}>
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
          {recentActivities.map((activity) => {
            const details = [
              t(`sports.items.${activity.sport}.title`),
              activity.distanceKm !== undefined ? format.distance(activity.distanceKm) : null,
              activity.durationSeconds !== undefined
                ? activity.distanceKm !== undefined
                  ? format.duration(activity.durationSeconds)
                  : t('sports.recent.minutes', { count: Math.round(activity.durationSeconds / 60) })
                : null,
            ].filter(Boolean);

            return (
              <Pressable
                accessibilityRole="button"
                className="min-h-[72px] flex-row items-center rounded-[18px] border border-auth-border bg-auth-surface px-3.5 py-3 active:bg-auth-pressed"
                key={activity.id}
                onPress={() => openSport(activity.sport)}>
                <IconBadge Icon={sportIcons[activity.sport]} />
                <View className="ml-3 flex-1 pr-2">
                  <Text className="text-[14px] font-bold text-auth-text" maxFontSizeMultiplier={1.1}>
                    {t(`sports.recent.names.${activity.name}`)}
                  </Text>
                  <Text className="mt-0.5 text-[12px] text-auth-muted">{details.join(' · ')}</Text>
                  <Text className="mt-0.5 text-[11px] text-auth-muted">{format.when(activity)}</Text>
                </View>
                <ChevronRight color={authColors.muted} size={17} strokeWidth={1.8} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
