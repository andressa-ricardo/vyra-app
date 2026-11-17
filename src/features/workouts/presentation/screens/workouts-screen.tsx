import Building from 'lucide-react-native/icons/building';
import ChartNoAxesColumnIncreasing from 'lucide-react-native/icons/chart-no-axes-column-increasing';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Clock3 from 'lucide-react-native/icons/clock-3';
import Play from 'lucide-react-native/icons/play';
import Plus from 'lucide-react-native/icons/plus';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { authColors } from '@/theme';

type WorkoutName = 'upperA' | 'lowerA' | 'push' | 'pull' | 'legs' | 'fullBody';

type WorkoutTemplate = {
  exerciseCount: number;
  id: string;
  lastPerformed: 'threeDays' | 'fiveDays' | 'oneWeek' | 'twoWeeks' | 'never';
  minutes: number;
  name: WorkoutName;
  today?: boolean;
};

const workouts: WorkoutTemplate[] = [
  {
    id: 'upper-a',
    name: 'upperA',
    exerciseCount: 5,
    minutes: 55,
    lastPerformed: 'threeDays',
    today: true,
  },
  {
    id: 'lower-a',
    name: 'lowerA',
    exerciseCount: 4,
    minutes: 50,
    lastPerformed: 'fiveDays',
  },
  { id: 'push', name: 'push', exerciseCount: 5, minutes: 60, lastPerformed: 'oneWeek' },
  { id: 'pull', name: 'pull', exerciseCount: 3, minutes: 45, lastPerformed: 'oneWeek' },
  { id: 'legs', name: 'legs', exerciseCount: 3, minutes: 50, lastPerformed: 'twoWeeks' },
  { id: 'full-body', name: 'fullBody', exerciseCount: 4, minutes: 40, lastPerformed: 'never' },
];

const history: {
  date: 'oct16' | 'oct14' | 'oct11';
  minutes: number;
  name: WorkoutName;
  volume: string;
}[] = [
  { name: 'upperA', date: 'oct16', minutes: 52, volume: '6.240' },
  { name: 'lowerA', date: 'oct14', minutes: 48, volume: '8.910' },
  { name: 'push', date: 'oct11', minutes: 61, volume: '5.870' },
];

function Shortcut({
  Icon,
  label,
  onPress,
}: {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[58px] flex-1 flex-row items-center justify-center gap-3 rounded-[28px] bg-auth-surface px-3 active:bg-auth-pressed"
      onPress={onPress}>
      <Icon color={authColors.primary} size={22} strokeWidth={1.8} />
      <Text className="text-[16px] font-bold text-auth-text" maxFontSizeMultiplier={1.1}>
        {label}
      </Text>
    </Pressable>
  );
}

function WorkoutCard({ item, onPress }: { item: WorkoutTemplate; onPress: () => void }) {
  const { t } = useTranslation();
  const name = t(`workouts.templates.${item.name}`);

  return (
    <Pressable
      accessibilityLabel={t('workouts.start', { name })}
      accessibilityRole="button"
      className={`min-h-[90px] flex-row items-center rounded-[26px] border px-4 py-4 active:bg-auth-pressed ${
        item.today ? 'border-auth-primary bg-auth-pressed' : 'border-transparent bg-auth-surface'
      }`}
      onPress={onPress}>
      <View className="flex-1 pr-3">
        <View className="flex-row items-center gap-2">
          <Text className="text-[18px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
            {name}
          </Text>
          {item.today ? (
            <View className="rounded-full bg-[#183A70] px-2 py-1">
              <Text className="text-[11px] font-bold text-auth-primary">{t('workouts.today')}</Text>
            </View>
          ) : null}
        </View>
        <Text className="mt-1 text-[16px] text-auth-muted" maxFontSizeMultiplier={1.1}>
          {t('workouts.exerciseCount', { count: item.exerciseCount })} · {t('workouts.duration', { minutes: item.minutes })} ·{' '}
          {t(`workouts.lastPerformed.${item.lastPerformed}`)}
        </Text>
      </View>
      <View
        className={`h-12 w-12 items-center justify-center rounded-full border ${
          item.today ? 'border-auth-primary bg-auth-primary' : 'border-auth-border bg-auth-pressed'
        }`}>
        <Play color={authColors.text} fill={authColors.text} size={19} strokeWidth={1.8} />
      </View>
    </Pressable>
  );
}

export function WorkoutsScreen() {
  const { t } = useTranslation();
  const openUnavailable = () => Alert.alert(t('common.comingSoon'), t('workouts.unavailable'));

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerClassName="w-full max-w-[520px] self-center px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between">
          <Text className="text-[31px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
            {t('workouts.title')}
          </Text>
          <Pressable
            accessibilityLabel={t('workouts.add')}
            accessibilityRole="button"
            className="h-12 w-12 items-center justify-center rounded-full bg-auth-primary active:opacity-80"
            onPress={openUnavailable}>
            <Plus color={authColors.text} size={27} strokeWidth={1.8} />
          </Pressable>
        </View>

        <View className="mt-6 flex-row gap-3">
          <Shortcut
            Icon={ChartNoAxesColumnIncreasing}
            label={t('workouts.shortcuts.exercises')}
            onPress={openUnavailable}
          />
          <Shortcut Icon={Building} label={t('workouts.shortcuts.gym')} onPress={openUnavailable} />
        </View>

        <Text className="mb-4 mt-9 text-[18px] font-extrabold text-auth-text">{t('workouts.sections.mine')}</Text>
        <View className="gap-3">
          {workouts.map((workout) => (
            <WorkoutCard item={workout} key={workout.id} onPress={openUnavailable} />
          ))}
        </View>

        <Text className="mb-4 mt-9 text-[18px] font-extrabold text-auth-text">{t('workouts.sections.coach')}</Text>
        <Pressable
          accessibilityRole="button"
          className="min-h-[90px] flex-row items-center rounded-[26px] bg-auth-surface px-5 py-4 active:bg-auth-pressed"
          onPress={openUnavailable}>
          <View className="flex-1 pr-3">
            <Text className="text-[18px] font-extrabold text-auth-text">{t('workouts.coachPlan.title')}</Text>
            <Text className="mt-1 text-[15px] text-auth-muted">
              {t('workouts.coachPlan.updated', { coach: 'Rafael Costa', date: '12/10' })}
            </Text>
          </View>
          <ChevronRight color={authColors.muted} size={24} strokeWidth={1.8} />
        </Pressable>

        <Text className="mb-4 mt-9 text-[18px] font-extrabold text-auth-text">{t('workouts.sections.history')}</Text>
        <View className="overflow-hidden rounded-[26px] bg-auth-surface">
          {history.map((entry, index) => (
            <View
              className={`min-h-[76px] flex-row items-center px-5 py-3 ${index > 0 ? 'border-t border-auth-border' : ''}`}
              key={`${entry.name}-${entry.date}`}>
              <Clock3 color={authColors.muted} size={22} strokeWidth={1.75} />
              <View className="ml-4 flex-1">
                <Text className="text-[16px] font-bold text-auth-text">{t(`workouts.templates.${entry.name}`)}</Text>
                <Text className="text-[14px] text-auth-muted">{t(`workouts.historyDates.${entry.date}`)}</Text>
              </View>
              <Text className="text-right text-[14px] text-auth-muted">
                {t('workouts.historyMetric', { minutes: entry.minutes, volume: entry.volume })}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
