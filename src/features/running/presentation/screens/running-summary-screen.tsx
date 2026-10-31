import { router, useLocalSearchParams } from 'expo-router';
import Check from 'lucide-react-native/icons/check';
import Trophy from 'lucide-react-native/icons/trophy';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MapView, { Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import {
  getRunningSession,
  renameRunningActivity,
} from '@/features/running/infrastructure/running-api';
import type { RunningSession } from '@/features/running/types/running.types';
import { formatDuration, formatPace } from '@/features/running/utils/running-format';
import { authColors } from '@/theme';

export function RunningSummaryScreen() {
  const { i18n, t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<RunningSession | null>(null);
  const [name, setName] = useState(() => t('running.defaultName'));
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

  const coordinates = session.points.map(({ latitude, longitude }) => ({ latitude, longitude }));
  const first = coordinates[0];
  const conclude = async () => {
    if (session.activityId && name.trim() && name.trim() !== session.name) {
      setSaving(true);
      await renameRunningActivity(session.activityId, name.trim()).finally(() => setSaving(false));
    }
    router.replace('/running');
  };

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right']}>
      <ScrollView contentContainerClassName="w-full max-w-[520px] self-center gap-5 pb-10">
        <View className="px-5 pt-3">
          <Text className="text-xs font-semibold uppercase tracking-wider text-auth-primary">{t('running.completed')}</Text>
          <TextInput
            className="mt-1 border-b border-auth-border py-2 text-[28px] font-extrabold text-auth-text"
            maxFontSizeMultiplier={1.05}
            maxLength={120}
            onChangeText={setName}
            placeholder={t('running.namePlaceholder')}
            placeholderTextColor={authColors.placeholder}
            value={name}
          />
          <Text className="mt-2 text-sm text-auth-muted">
            {new Date(session.startedAt).toLocaleString(i18n.resolvedLanguage)}
          </Text>
        </View>

        <View className="mx-5 h-56 overflow-hidden rounded-[24px] bg-auth-surface">
          {first ? (
            <MapView
              initialRegion={{ ...first, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
              pitchEnabled={false}
              rotateEnabled={false}
              scrollEnabled={false}
              style={StyleSheet.absoluteFill}
              zoomEnabled={false}>
              <Polyline coordinates={coordinates} strokeColor={authColors.primary} strokeWidth={5} />
            </MapView>
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-sm text-auth-muted">{t('running.noRoute')}</Text>
            </View>
          )}
        </View>

        <View className="mx-5 rounded-[24px] bg-auth-surface p-5">
          <Text className="text-[34px] font-extrabold text-auth-text">
            {(session.distanceMeters / 1_000).toFixed(2)} {t('running.units.kilometers')}
          </Text>
          <View className="mt-4 flex-row">
            <SummaryMetric label={t('running.time')} value={formatDuration(session.activeDurationSeconds)} />
            <SummaryMetric label={t('running.averagePace')} value={`${formatPace(session.averagePaceSecondsKm)} ${t('running.units.pace')}`} />
          </View>
        </View>

        {session.achievedRecords?.length ? (
          <View className="mx-5 flex-row items-center gap-3 rounded-2xl border border-auth-primary bg-auth-surface p-4">
            <Trophy color={authColors.primary} size={22} />
            <Text className="flex-1 font-bold text-auth-text">
              {t('running.newRecord', { records: session.achievedRecords.join(', ') })}
            </Text>
          </View>
        ) : null}

        <View className="mx-5">
          <Text className="mb-3 text-lg font-extrabold text-auth-text">{t('running.splits')}</Text>
          {session.splits.length ? (
            session.splits.map((split) => (
              <View key={split.kilometer} className="flex-row border-b border-auth-border py-3">
                <Text className="flex-1 text-auth-muted">Km {split.kilometer}</Text>
                <Text className="font-bold text-auth-text">{formatPace(split.paceSecondsKm)} {t('running.units.pace')}</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-auth-muted">{t('running.firstSplit')}</Text>
          )}
        </View>

        <Pressable
          className="mx-5 h-14 flex-row items-center justify-center gap-2 rounded-[24px] bg-auth-primary active:opacity-80"
          disabled={saving}
          onPress={() => void conclude()}>
          <Check color="white" size={20} />
          <Text className="font-bold text-white">{saving ? t('running.saving') : t('running.save')}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="text-xs text-auth-muted">{label}</Text>
      <Text className="mt-1 text-base font-bold text-auth-text">{value}</Text>
    </View>
  );
}
