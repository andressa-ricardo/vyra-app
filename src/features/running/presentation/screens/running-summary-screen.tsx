import { router, useLocalSearchParams } from 'expo-router';
import ArrowLeft from 'lucide-react-native/icons/arrow-left';
import Check from 'lucide-react-native/icons/check';
import Clock from 'lucide-react-native/icons/clock';
import Flame from 'lucide-react-native/icons/flame';
import Footprints from 'lucide-react-native/icons/footprints';
import Mountain from 'lucide-react-native/icons/mountain';
import Pencil from 'lucide-react-native/icons/pencil';
import Route from 'lucide-react-native/icons/route';
import ShareIcon from 'lucide-react-native/icons/share';
import Timer from 'lucide-react-native/icons/timer';
import Trophy from 'lucide-react-native/icons/trophy';
import Zap from 'lucide-react-native/icons/zap';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Share, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBodyWeight } from '@/features/running/hooks/use-body-weight';
import {
  getRunningSession,
  renameRunningActivity,
} from '@/features/running/infrastructure/running-api';
import { MetricCard } from '@/features/running/presentation/components/metric-card';
import { RouteMap } from '@/features/running/presentation/components/route-map';
import type { RunningSession, RunningSplit } from '@/features/running/types/running.types';
import {
  formatDistanceKm,
  formatDuration,
  formatPace,
} from '@/features/running/utils/running-format';
import {
  elevationGain,
  elevationProfile,
  estimateCalories,
  fastestSplit,
} from '@/features/running/utils/running-metrics';
import { authColors, metricColors } from '@/theme';

type ChartTab = 'pace' | 'elevation';

export function RunningSummaryScreen() {
  const { i18n, t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const weightKg = useBodyWeight();
  const [session, setSession] = useState<RunningSession | null>(null);
  const [name, setName] = useState(() => t('running.defaultName'));
  const [editingName, setEditingName] = useState(false);
  const [tab, setTab] = useState<ChartTab>('pace');
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) return;
    void getRunningSession(id)
      .then((data) => {
        setSession(data);
        setName(data.name ?? t('running.defaultName'));
      })
      .catch(() => setLoadError(true));
  }, [attempt, id, t]);

  if (!session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-auth-bg px-8">
        {loadError ? (
          <Pressable
            className="rounded-2xl border border-auth-danger bg-auth-surface p-4"
            onPress={() => {
              setLoadError(false);
              setAttempt((value) => value + 1);
            }}>
            <Text className="text-center text-sm text-auth-text">{t('running.loadError')}</Text>
          </Pressable>
        ) : (
          <ActivityIndicator color={authColors.primary} />
        )}
      </SafeAreaView>
    );
  }

  const locale = i18n.resolvedLanguage;
  const coordinates = session.points.map(({ latitude, longitude }) => ({ latitude, longitude }));
  const distance = formatDistanceKm(session.distanceMeters, locale);
  const duration = formatDuration(session.activeDurationSeconds);
  const pace = formatPace(session.averagePaceSecondsKm);
  const calories = estimateCalories(session.distanceMeters, weightKg);
  const elevation = elevationGain(session.points);
  const best = fastestSplit(session.splits);
  const startedAt = new Date(session.startedAt);
  const dateLabel = [
    startedAt.toLocaleDateString(locale, {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    startedAt.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
  ].join(' • ');

  const conclude = async () => {
    const trimmed = name.trim();
    if (session.activityId && trimmed && trimmed !== session.name) {
      setSaving(true);
      await renameRunningActivity(session.activityId, trimmed).finally(() => setSaving(false));
    }
    router.replace('/running');
  };

  const share = () =>
    void Share.share({
      message: t('running.shareMessage', {
        name: name.trim() || t('running.defaultName'),
        distance,
        duration,
        pace,
      }),
    });

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right', 'bottom']}>
      <View className="w-full max-w-[520px] flex-row items-center justify-between self-center px-5 py-2">
        <Pressable
          accessibilityLabel={t('common.back')}
          accessibilityRole="button"
          className="h-11 w-11 items-center justify-center rounded-full bg-auth-surface active:opacity-75"
          onPress={() => router.replace('/running')}>
          <ArrowLeft color={authColors.text} size={20} />
        </Pressable>
        <Text accessibilityRole="header" className="text-lg font-bold text-auth-text" maxFontSizeMultiplier={1.1}>
          {t('running.summaryTitle')}
        </Text>
        <View className="h-11 w-11" />
      </View>

      <ScrollView
        contentContainerClassName="w-full max-w-[520px] self-center gap-4 px-5 pb-6 pt-2"
        keyboardShouldPersistTaps="handled">
        <View className="flex-row items-center gap-3.5 rounded-[20px] bg-auth-surface p-3.5">
          <View className="h-14 w-14 items-center justify-center rounded-2xl bg-auth-primary/15">
            <Footprints color={authColors.primary} size={26} />
          </View>
          <View className="flex-1">
            {editingName ? (
              <TextInput
                autoFocus
                className="border-b border-auth-primary py-1 text-lg font-bold text-auth-text"
                maxFontSizeMultiplier={1.05}
                maxLength={120}
                onBlur={() => setEditingName(false)}
                onChangeText={setName}
                onSubmitEditing={() => setEditingName(false)}
                placeholder={t('running.namePlaceholder')}
                placeholderTextColor={authColors.placeholder}
                returnKeyType="done"
                value={name}
              />
            ) : (
              <Text className="text-lg font-bold text-auth-text" maxFontSizeMultiplier={1.1} numberOfLines={1}>
                {name.trim() || t('running.defaultName')}
              </Text>
            )}
            <Text className="mt-0.5 text-[13px] capitalize text-auth-muted" maxFontSizeMultiplier={1.1}>
              {dateLabel}
            </Text>
          </View>
          <Pressable
            accessibilityLabel={t('running.editName')}
            accessibilityRole="button"
            className="h-11 w-11 items-center justify-center rounded-full border border-auth-border active:opacity-75"
            onPress={() => setEditingName((value) => !value)}>
            {editingName ? (
              <Check color={authColors.primary} size={18} />
            ) : (
              <Pencil color={authColors.text} size={17} />
            )}
          </Pressable>
        </View>

        <View className="h-40 overflow-hidden rounded-[20px] bg-auth-surface">
          {coordinates.length ? (
            <RouteMap coordinates={coordinates} />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-auth-muted">{t('running.noRoute')}</Text>
            </View>
          )}
        </View>

        <View className="gap-px overflow-hidden rounded-[20px] bg-auth-bg">
          <View className="flex-row gap-px">
            <MetricCard
              color={authColors.primary}
              icon={Route}
              label={t('running.distance')}
              unit={t('running.units.kilometers')}
              value={distance}
              variant="cell"
            />
            <MetricCard color={metricColors.time} icon={Clock} label={t('running.totalTime')} value={duration} variant="cell" />
            <MetricCard
              color={metricColors.pace}
              icon={Timer}
              label={t('running.averagePace')}
              unit={t('running.units.pace')}
              value={pace}
              variant="cell"
            />
          </View>
          <View className="flex-row gap-px">
            <MetricCard
              color={metricColors.calories}
              icon={Flame}
              label={t('running.calories')}
              unit={t('running.units.kcal')}
              value={calories === null ? '--' : String(calories)}
              variant="cell"
            />
            <MetricCard
              color={authColors.primary}
              icon={Zap}
              label={t('running.bestSplit')}
              unit={t('running.units.pace')}
              value={formatPace(best?.paceSecondsKm ?? null)}
              variant="cell"
            />
            <MetricCard
              color={metricColors.elevation}
              icon={Mountain}
              label={t('running.elevationGain')}
              unit={t('running.units.meters')}
              value={elevation === null ? '--' : String(elevation)}
              variant="cell"
            />
          </View>
        </View>

        {session.achievedRecords?.length ? (
          <View className="flex-row items-center gap-3 rounded-2xl border border-auth-primary bg-auth-surface p-4">
            <Trophy color={metricColors.warning} size={22} />
            <Text className="flex-1 font-bold text-auth-text">
              {t('running.newRecord', { records: session.achievedRecords.join(', ') })}
            </Text>
          </View>
        ) : null}

        <View accessibilityRole="tablist" className="flex-row rounded-2xl bg-auth-surface p-1">
          {(['pace', 'elevation'] as const).map((key) => {
            const selected = tab === key;
            return (
              <Pressable
                key={key}
                accessibilityRole="tab"
                accessibilityState={{ selected }}
                className={[
                  'h-10 flex-1 items-center justify-center rounded-xl',
                  selected ? 'bg-auth-primary' : '',
                ].join(' ')}
                onPress={() => setTab(key)}>
                <Text
                  className={['text-sm font-semibold', selected ? 'text-white' : 'text-auth-muted'].join(' ')}
                  maxFontSizeMultiplier={1.1}>
                  {t(`running.charts.${key}`)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {tab === 'pace' ? (
          <PaceChart splits={session.splits} />
        ) : (
          <ElevationChart profile={elevationProfile(session.points)} />
        )}
      </ScrollView>

      <View className="w-full max-w-[520px] flex-row gap-3 self-center px-5 pb-2 pt-3">
        <Pressable
          accessibilityRole="button"
          className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-[20px] border border-auth-border bg-auth-surface active:opacity-80"
          onPress={share}>
          <ShareIcon color={authColors.text} size={19} />
          <Text className="text-base font-semibold text-auth-text">{t('running.share')}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityState={{ busy: saving, disabled: saving }}
          className="h-14 flex-1 flex-row items-center justify-center gap-2 rounded-[20px] bg-auth-primary active:opacity-80"
          disabled={saving}
          onPress={() => void conclude()}>
          <Check color="white" size={20} />
          <Text className="text-base font-bold text-white">
            {saving ? t('running.saving') : t('running.save')}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PaceChart({ splits }: { splits: RunningSplit[] }) {
  const { t } = useTranslation();
  if (!splits.length) {
    return <Text className="text-sm text-auth-muted">{t('running.firstSplit')}</Text>;
  }

  const paces = splits.map(({ paceSecondsKm }) => paceSecondsKm);
  const [fastest, slowest] = [Math.min(...paces), Math.max(...paces)];

  return (
    <View className="gap-2.5">
      <Text className="text-[15px] font-semibold text-auth-text">{t('running.pacePerKm')}</Text>
      {splits.map((split) => {
        const isBest = split.paceSecondsKm === fastest;
        // Barra maior = km mais rápido; a escala realça a diferença entre os splits.
        const width = 45 + 55 * ((slowest - split.paceSecondsKm) / (slowest - fastest || 1));
        return (
          <View
            key={split.kilometer}
            accessible
            accessibilityLabel={`${split.kilometer} ${t('running.units.kilometers')}, ${formatPace(split.paceSecondsKm)} ${t('running.units.pace')}`}
            className="flex-row items-center gap-3">
            <Text className={['w-11 text-xs', isBest ? 'font-bold text-auth-text' : 'text-auth-muted'].join(' ')}>
              {split.kilometer} {t('running.units.kilometers')}
            </Text>
            <View className="h-3 flex-1 overflow-hidden rounded-full bg-auth-surface">
              <View
                className={['h-full rounded-full', isBest ? 'bg-auth-primary' : 'bg-auth-border'].join(' ')}
                style={{ width: `${width}%` }}
              />
            </View>
            <Text className={['w-11 text-right text-xs', isBest ? 'font-bold text-auth-text' : 'text-auth-muted'].join(' ')}>
              {formatPace(split.paceSecondsKm)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ElevationChart({ profile }: { profile: number[] }) {
  const { t } = useTranslation();
  if (!profile.length) {
    return <Text className="text-sm text-auth-muted">{t('running.noElevation')}</Text>;
  }

  const [lowest, highest] = [Math.min(...profile), Math.max(...profile)];
  const range = highest - lowest || 1;

  return (
    <View className="gap-2.5">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-[15px] font-semibold text-auth-text">{t('running.elevationProfile')}</Text>
        <Text className="text-xs text-auth-muted">
          {Math.round(lowest)}–{Math.round(highest)} {t('running.units.meters')}
        </Text>
      </View>
      <View
        accessible
        accessibilityLabel={`${t('running.elevationProfile')}: ${Math.round(lowest)}–${Math.round(highest)} ${t('running.units.meters')}`}
        className="h-32 flex-row items-end gap-1 rounded-2xl bg-auth-surface px-3 pb-3 pt-4">
        {profile.map((altitude, index) => (
          <View
            key={index}
            className="flex-1 rounded-t-sm"
            style={{
              backgroundColor: metricColors.elevation,
              opacity: 0.85,
              height: `${15 + 85 * ((altitude - lowest) / range)}%`,
            }}
          />
        ))}
      </View>
    </View>
  );
}
