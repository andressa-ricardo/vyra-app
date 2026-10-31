import { useFocusEffect, router } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Play from 'lucide-react-native/icons/play';
import Trophy from 'lucide-react-native/icons/trophy';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getRunningDashboard, setWeeklyRunningGoal } from '@/features/running/infrastructure/running-api';
import { syncLocalRun } from '@/features/running/infrastructure/running-sync';
import type {
  RunningHistoryItem,
  RunningRecord,
  RunningStatistics,
} from '@/features/running/types/running.types';
import { formatDuration, formatPace } from '@/features/running/utils/running-format';
import { authColors } from '@/theme';

export function RunningDashboardScreen() {
  const { i18n, t } = useTranslation();
  const [statistics, setStatistics] = useState<RunningStatistics | null>(null);
  const [history, setHistory] = useState<RunningHistoryItem[]>([]);
  const [records, setRecords] = useState<RunningRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [goalKm, setGoalKm] = useState('');

  const load = useCallback(async () => {
    try {
      setError(false);
      // Sends a run finished offline before reading history and statistics.
      await syncLocalRun().catch(() => null);
      const data = await getRunningDashboard();
      setStatistics(data.statistics);
      setHistory(data.history);
      setRecords(data.records);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerClassName="w-full max-w-[520px] self-center gap-5 px-5 pb-28 pt-4"
        refreshControl={
          <RefreshControl refreshing={loading} tintColor={authColors.primary} onRefresh={load} />
        }>
        <View>
          <Text className="text-[13px] text-auth-muted">{t('running.eyebrow')}</Text>
          <Text className="text-[28px] font-extrabold text-auth-text">{t('running.title')}</Text>
        </View>

        <Pressable
          className="h-14 flex-row items-center justify-center gap-3 rounded-[24px] bg-auth-primary active:opacity-80"
          onPress={() => router.push('/run')}>
          <Play color="white" fill="white" size={19} />
          <Text className="text-base font-bold text-white">{t('running.start')}</Text>
        </Pressable>

        {loading && !statistics ? <ActivityIndicator color={authColors.primary} /> : null}
        {error ? (
          <Pressable className="rounded-2xl border border-auth-danger bg-auth-surface p-4" onPress={load}>
            <Text className="text-sm text-auth-text">{t('running.loadError')}</Text>
          </Pressable>
        ) : null}

        {statistics ? (
          <>
            <View className="rounded-[24px] border border-auth-border bg-auth-surface p-5">
              <Text className="text-xs font-semibold uppercase tracking-wider text-auth-muted">{t('running.week')}</Text>
              <Text className="mt-2 text-[34px] font-extrabold text-auth-text">
                {(statistics.distanceMeters / 1_000).toFixed(2)} {t('running.units.kilometers')}
              </Text>
              <View className="mt-4 flex-row gap-3">
                <Metric label={t('running.time')} value={formatDuration(statistics.durationSeconds)} />
                <Metric label={t('running.averagePace')} value={`${formatPace(statistics.averagePaceSecondsKm)} ${t('running.units.pace')}`} />
                <Metric label={t('running.runs')} value={String(statistics.runs)} />
              </View>
              {statistics.goal ? (
                <View className="mt-5 gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-auth-muted">{t('running.weeklyGoal')}</Text>
                    <Text className="text-xs font-semibold text-auth-text">
                      {Math.floor((statistics.goalProgress ?? 0) * 100)}%
                    </Text>
                  </View>
                  <View className="h-2 overflow-hidden rounded-full bg-auth-border">
                    <View
                      className="h-full rounded-full bg-auth-primary"
                      style={{ width: `${Math.min(100, (statistics.goalProgress ?? 0) * 100)}%` }}
                    />
                  </View>
                  <Pressable className="self-start py-1" onPress={() => {
                    setGoalKm(String(statistics.goal!.targetDistanceMeters / 1_000));
                    setGoalOpen(true);
                  }}>
                    <Text className="text-xs font-semibold text-auth-primary">{t('running.editGoal')}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable className="mt-4 self-start" onPress={() => setGoalOpen(true)}>
                  <Text className="text-sm font-semibold text-auth-primary">{t('running.setGoal')}</Text>
                </Pressable>
              )}
            </View>

            <SectionTitle title={t('running.recent')} />
            {history.length ? (
              history.map((run) => (
                <Pressable
                  key={run.id}
                  className="flex-row items-center rounded-2xl border border-auth-border bg-auth-surface p-4 active:bg-auth-pressed"
                  onPress={() =>
                    router.push({ pathname: '/running-summary/[id]', params: { id: run.id } })
                  }>
                  <View className="flex-1">
                    <Text className="font-bold text-auth-text">{run.name}</Text>
                    <Text className="mt-1 text-xs text-auth-muted">
                      {new Date(run.startedAt).toLocaleDateString(i18n.resolvedLanguage)} · {formatDuration(run.activeDurationSeconds)}
                    </Text>
                  </View>
                  <Text className="mr-2 font-bold text-auth-text">{(run.distanceMeters / 1_000).toFixed(2)} {t('running.units.kilometers')}</Text>
                  <ChevronRight color={authColors.muted} size={18} />
                </Pressable>
              ))
            ) : (
              <Text className="text-sm text-auth-muted">{t('running.firstRun')}</Text>
            )}

            <SectionTitle title={t('running.records')} />
            <View className="flex-row flex-wrap gap-3">
              {(['ONE_K', 'FIVE_K', 'TEN_K', 'HALF_MARATHON'] as const).map((distance) => {
                const record = records.find((item) => item.distance === distance);
                const labels = { ONE_K: '1 km', FIVE_K: '5 km', TEN_K: '10 km', HALF_MARATHON: '21,1 km' };
                return (
                  <View key={distance} className="min-w-[46%] flex-1 rounded-2xl bg-auth-surface p-4">
                    <Trophy color={record ? authColors.primary : authColors.placeholder} size={18} />
                    <Text className="mt-2 text-xs text-auth-muted">{labels[distance]}</Text>
                    <Text className="mt-1 text-lg font-extrabold text-auth-text">
                      {record ? formatDuration(record.durationSeconds) : '--:--'}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : null}
      </ScrollView>
      <Modal animationType="fade" transparent visible={goalOpen} onRequestClose={() => setGoalOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/70 px-6">
          <View className="w-full max-w-[420px] gap-4 rounded-[24px] bg-auth-surface p-5">
            <Text className="text-lg font-extrabold text-auth-text">{t('running.goalQuestion')}</Text>
            <TextInput
              className="h-12 rounded-2xl border border-auth-border px-4 text-auth-text"
              inputMode="decimal"
              onChangeText={setGoalKm}
              placeholder={t('running.goalPlaceholder')}
              placeholderTextColor={authColors.placeholder}
              value={goalKm}
            />
            <View className="flex-row gap-3">
              <Pressable className="h-12 flex-1 items-center justify-center rounded-2xl bg-auth-bg" onPress={() => setGoalOpen(false)}>
                <Text className="font-bold text-auth-text">{t('common.cancel')}</Text>
              </Pressable>
              <Pressable
                className="h-12 flex-1 items-center justify-center rounded-2xl bg-auth-primary"
                onPress={() => {
                  const kilometers = Number(goalKm.replace(',', '.'));
                  if (!Number.isFinite(kilometers) || kilometers < 0.1) return;
                  void setWeeklyRunningGoal(Math.round(kilometers * 1_000)).then(async () => {
                    setGoalOpen(false);
                    setLoading(true);
                    await load();
                  });
                }}>
                <Text className="font-bold text-white">{t('running.saveGoal')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="text-[11px] text-auth-muted">{label}</Text>
      <Text className="mt-1 text-sm font-bold text-auth-text">{value}</Text>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text className="mt-1 text-lg font-extrabold text-auth-text">{title}</Text>;
}
