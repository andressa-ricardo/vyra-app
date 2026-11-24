import { router, useLocalSearchParams } from 'expo-router';
import Clock3 from 'lucide-react-native/icons/clock-3';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import Square from 'lucide-react-native/icons/square';
import type { LucideIcon } from 'lucide-react-native';
import { createElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ActivityRow } from '@/features/sports/presentation/components/activity-row';
import { formatClock, useActivityFormat } from '@/features/sports/presentation/hooks/use-activity-format';
import { useActivityTimer } from '@/features/sports/presentation/hooks/use-activity-timer';
import { sampleActivities } from '@/features/sports/sample-data';
import { BackButton } from '@/shared/components/back-button';
import { getModalityIcon } from '@/shared/utils/modality-icons';
import { authColors } from '@/theme';

function ActionButton({
  Icon,
  label,
  onPress,
  variant,
}: {
  Icon: LucideIcon;
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary';
}) {
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      className={`h-[52px] flex-1 flex-row items-center justify-center gap-2 rounded-full active:opacity-80 ${
        primary ? 'bg-auth-primary' : 'border border-auth-border bg-auth-surface'
      }`}
      onPress={onPress}
      style={
        primary
          ? { shadowColor: authColors.primary, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 }
          : undefined
      }>
      <Icon color={authColors.text} size={18} strokeWidth={2} />
      <Text className="text-[15px] font-bold text-auth-text" maxFontSizeMultiplier={1.1}>
        {label}
      </Text>
    </Pressable>
  );
}

export function SportDetailScreen() {
  const { t } = useTranslation();
  const { slug, name } = useLocalSearchParams<{ slug: string; name?: string }>();
  const format = useActivityFormat();
  const timer = useActivityTimer();

  const sport = format.sportName(slug, name);
  const sportLower = sport.toLocaleLowerCase();
  const description = t(`sports.items.${slug}.description`, {
    defaultValue: t('sports.detail.defaultDescription'),
  });
  const activities = sampleActivities.filter((activity) => activity.sport === slug);

  const leave = () => {
    if (timer.status === 'idle') return router.back();
    Alert.alert(t('sports.detail.leaveTitle'), t('sports.detail.leaveMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('sports.detail.discard'), style: 'destructive', onPress: () => router.back() },
    ]);
  };

  const finish = () => {
    const wasActive = timer.status === 'active';
    timer.pause();
    Alert.alert(
      t('sports.detail.finishTitle'),
      t('sports.detail.finishMessage', { time: formatClock(timer.elapsedSeconds), sport: sportLower }),
      [
        { text: t('sports.detail.keepGoing'), style: 'cancel', onPress: wasActive ? timer.resume : undefined },
        { text: t('sports.detail.finish'), onPress: timer.reset },
      ],
    );
  };

  const statusText = {
    idle: t('sports.detail.status.idle'),
    active: t('sports.detail.status.active'),
    paused: t('sports.detail.status.paused'),
  }[timer.status];

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <View className="w-full max-w-[520px] flex-row items-center gap-2 self-center px-5 pt-1">
        <BackButton onPress={leave} />
        <Text className="flex-1 text-[17px] font-bold text-auth-text" maxFontSizeMultiplier={1.05} numberOfLines={1}>
          {sport}
        </Text>
      </View>

      <ScrollView
        contentContainerClassName="w-full max-w-[520px] self-center px-5 pb-10 pt-4"
        showsVerticalScrollIndicator={false}>
        <View className="items-center">
          <View className="h-[76px] w-[76px] items-center justify-center rounded-[22px] border border-auth-border bg-[#10264A]">
            {createElement(getModalityIcon(slug), { color: authColors.primary, size: 36, strokeWidth: 1.7 })}
          </View>
          <Text className="mt-4 text-[24px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
            {sport}
          </Text>
          <Text className="mt-1 text-[14px] text-auth-muted">{description}</Text>
          <Text className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-auth-placeholder">
            {t('sports.detail.preview')}
          </Text>
        </View>

        <View className="my-6 h-px bg-auth-border" />

        <View className="items-center">
          <View className="flex-row items-center gap-1.5">
            <Clock3 color={authColors.muted} size={15} strokeWidth={1.8} />
            <Text className="text-[13px] text-auth-muted">{t('sports.detail.activityTime')}</Text>
          </View>
          <Text
            accessibilityLiveRegion="polite"
            className="mt-1 text-[56px] font-extrabold text-auth-text"
            maxFontSizeMultiplier={1}
            style={{ fontVariant: ['tabular-nums'] }}>
            {formatClock(timer.elapsedSeconds)}
          </Text>
          <View className="flex-row items-center gap-1.5">
            {timer.status !== 'idle' ? (
              <View
                className={`h-2 w-2 rounded-full ${timer.status === 'active' ? 'bg-auth-success' : 'bg-auth-placeholder'}`}
              />
            ) : null}
            <Text className="text-[13px] text-auth-muted">{statusText}</Text>
          </View>
        </View>

        <View className="mt-6 flex-row gap-3">
          {timer.status === 'idle' ? (
            <ActionButton
              Icon={Play}
              label={t('sports.detail.start', { sport: sportLower })}
              onPress={timer.start}
              variant="primary"
            />
          ) : (
            <>
              {timer.status === 'active' ? (
                <ActionButton Icon={Pause} label={t('sports.detail.pause')} onPress={timer.pause} variant="secondary" />
              ) : (
                <ActionButton Icon={Play} label={t('sports.detail.resume')} onPress={timer.resume} variant="secondary" />
              )}
              <ActionButton Icon={Square} label={t('sports.detail.finish')} onPress={finish} variant="primary" />
            </>
          )}
        </View>

        <View className="my-6 h-px bg-auth-border" />

        <Text className="mb-3 text-[16px] font-bold text-auth-text">{t('sports.recent.title')}</Text>
        {activities.length ? (
          <View className="gap-2.5">
            {activities.map((activity) => (
              <ActivityRow
                activity={activity}
                key={activity.id}
                onPress={() => Alert.alert(t('common.comingSoon'), t('sports.detail.activityUnavailable'))}
              />
            ))}
          </View>
        ) : (
          <View className="items-center rounded-[18px] border border-dashed border-auth-border px-4 py-6">
            <Text className="text-center text-[13px] text-auth-muted">
              {t('sports.detail.empty', { sport: sportLower })}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
