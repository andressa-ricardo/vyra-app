import { router } from 'expo-router';
import Flag from 'lucide-react-native/icons/flag';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import Trash2 from 'lucide-react-native/icons/trash';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRunningTracker } from '@/features/running/hooks/use-running-tracker';
import { formatDuration, formatPace } from '@/features/running/utils/running-format';
import { authColors } from '@/theme';

export function RunningTrackerScreen() {
  const { t } = useTranslation();
  const tracker = useRunningTracker();
  const coordinates = tracker.points.map(({ latitude, longitude }) => ({ latitude, longitude }));
  const latest = coordinates.at(-1);

  if (tracker.state !== 'ready' || !tracker.session) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-auth-bg px-8">
        <Text className="text-center text-base text-auth-text">
          {tracker.state === 'permission-denied'
            ? t('running.permissionDenied')
            : tracker.state === 'error'
              ? t('running.startError')
              : t('running.preparingGps')}
        </Text>
        {tracker.state !== 'loading' ? (
          <Pressable className="rounded-full bg-auth-surface px-6 py-3" onPress={() => router.back()}>
            <Text className="font-bold text-auth-text">{t('common.back')}</Text>
          </Pressable>
        ) : null}
      </SafeAreaView>
    );
  }

  const confirmFinish = () =>
    Alert.alert(t('running.finishTitle'), t('running.finishMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('running.finish'),
        onPress: () =>
          void tracker.finish().then((confirmed) => {
            if (!confirmed) {
              Alert.alert(t('running.offlineFinishTitle'), t('running.offlineFinishMessage'));
            }
          }),
      },
    ]);

  const confirmDiscard = () =>
    Alert.alert(t('running.discardTitle'), t('running.discardMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('running.discard'), style: 'destructive', onPress: () => void tracker.discard() },
    ]);

  return (
    <View className="flex-1 bg-auth-bg">
      <MapView
        initialRegion={{
          latitude: latest?.latitude ?? -23.5505,
          longitude: latest?.longitude ?? -46.6333,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008,
        }}
        loadingEnabled
        showsUserLocation
        style={StyleSheet.absoluteFill}>
        {coordinates.length > 1 ? (
          <Polyline coordinates={coordinates} strokeColor={authColors.primary} strokeWidth={5} />
        ) : null}
        {latest ? <Marker coordinate={latest} /> : null}
      </MapView>

      <SafeAreaView className="flex-1 justify-between" pointerEvents="box-none">
        <View className="mx-4 flex-row items-center justify-between rounded-full bg-auth-bg/90 px-4 py-3">
          <Text className="font-bold text-auth-text">{t('running.inProgress')}</Text>
          <Text className={tracker.offline ? 'text-xs text-auth-danger' : 'text-xs text-auth-muted'}>
            {tracker.offline ? t('running.offline') : tracker.syncing ? t('running.syncing') : t('running.synced')}
          </Text>
        </View>

        <View className="rounded-t-[32px] bg-auth-bg px-5 pb-7 pt-6">
          <Text className="text-center text-[46px] font-extrabold tracking-[-2px] text-auth-text">
            {(tracker.distanceMeters / 1_000).toFixed(2)}
          </Text>
          <Text className="text-center text-xs font-semibold uppercase tracking-[2px] text-auth-muted">{t('running.kilometers')}</Text>

          <View className="my-6 flex-row">
            <TrackerMetric label={t('running.time')} value={formatDuration(tracker.elapsedSeconds)} />
            <TrackerMetric label={t('running.averagePace')} value={`${formatPace(tracker.averagePaceSecondsKm)} ${t('running.units.pace')}`} />
            <TrackerMetric label={t('running.currentPace')} value={`${formatPace(tracker.currentPaceSecondsKm)} ${t('running.units.pace')}`} />
          </View>

          {tracker.finishPending ? (
            <View className="items-center gap-3">
              <Text className="text-center text-sm text-auth-muted">{t('running.finishPending')}</Text>
              <Pressable
                className="rounded-full bg-auth-primary px-6 py-3 active:opacity-75"
                disabled={tracker.syncing}
                onPress={() => void tracker.retryFinish()}>
                <Text className="font-bold text-white">
                  {tracker.syncing ? t('running.syncing') : t('running.retrySync')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="flex-row items-center justify-center gap-4">
              <RoundButton danger icon={<Trash2 color="white" size={20} />} onPress={confirmDiscard} />
              {tracker.session.status === 'PAUSED' ? (
                <RoundButton large icon={<Play color="white" fill="white" size={26} />} onPress={() => void tracker.resume()} />
              ) : (
                <RoundButton large icon={<Pause color="white" fill="white" size={26} />} onPress={() => void tracker.pause()} />
              )}
              <RoundButton icon={<Flag color="white" size={20} />} onPress={confirmFinish} />
            </View>
          )}

          {tracker.finishPending ? null : (
            <Pressable
              className="mt-4 self-center px-4 py-2"
              onPress={() =>
                void tracker.enableBackground().then((enabled) =>
                  Alert.alert(
                    enabled ? t('running.backgroundEnabledTitle') : t('running.backgroundDeniedTitle'),
                    enabled
                      ? t('running.backgroundEnabledMessage')
                      : t('running.backgroundDeniedMessage'),
                  ),
                )
              }>
              <Text className="text-xs text-auth-muted">{t('running.enableBackground')}</Text>
            </Pressable>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

function TrackerMetric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 items-center border-r border-auth-border last:border-r-0">
      <Text className="text-xs text-auth-muted">{label}</Text>
      <Text className="mt-1 text-base font-bold text-auth-text">{value}</Text>
    </View>
  );
}

function RoundButton({
  danger,
  icon,
  large,
  onPress,
}: {
  danger?: boolean;
  icon: ReactNode;
  large?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      className={`${large ? 'h-[72px] w-[72px] bg-auth-primary' : 'h-12 w-12'} ${danger ? 'bg-auth-danger' : 'bg-auth-surface'} items-center justify-center rounded-full active:opacity-75`}
      onPress={onPress}>
      {icon}
    </Pressable>
  );
}
