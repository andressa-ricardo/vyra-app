import { router } from 'expo-router';
import Flame from 'lucide-react-native/icons/flame';
import Gauge from 'lucide-react-native/icons/gauge';
import Layers from 'lucide-react-native/icons/layers';
import LocateFixed from 'lucide-react-native/icons/locate-fixed';
import Lock from 'lucide-react-native/icons/lock';
import LockOpen from 'lucide-react-native/icons/lock-open';
import Mountain from 'lucide-react-native/icons/mountain';
import Pause from 'lucide-react-native/icons/pause';
import Play from 'lucide-react-native/icons/play';
import Satellite from 'lucide-react-native/icons/satellite';
import Square from 'lucide-react-native/icons/square';
import X from 'lucide-react-native/icons/x';
import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, Text, View } from 'react-native';
import type MapView from 'react-native-maps';
import type { MapType } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useBodyWeight } from '@/features/running/hooks/use-body-weight';
import { useRunningTracker } from '@/features/running/hooks/use-running-tracker';
import { MetricCard } from '@/features/running/presentation/components/metric-card';
import { RouteMap } from '@/features/running/presentation/components/route-map';
import {
  formatDecimal,
  formatDistanceKm,
  formatDuration,
  formatPace,
} from '@/features/running/utils/running-format';
import {
  averageSpeedKmh,
  elevationGain,
  estimateCalories,
  gpsSignal,
  type GpsSignal,
} from '@/features/running/utils/running-metrics';
import { authColors, metricColors } from '@/theme';

const signalColors: Record<GpsSignal, string> = {
  searching: authColors.muted,
  strong: metricColors.start,
  medium: metricColors.warning,
  weak: authColors.danger,
};

/** Faixas sobrepostas que dissolvem o mapa no fundo da tela. */
const FADE_STEPS = [0.15, 0.35, 0.6, 0.85];

export function RunningTrackerScreen() {
  const { i18n, t } = useTranslation();
  const tracker = useRunningTracker();
  const weightKg = useBodyWeight();
  const mapRef = useRef<MapView>(null);
  const [following, setFollowing] = useState(true);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [locked, setLocked] = useState(false);

  const coordinates = tracker.points.map(({ latitude, longitude }) => ({ latitude, longitude }));
  const latest = coordinates.at(-1);
  const latitude = latest?.latitude;
  const longitude = latest?.longitude;

  useEffect(() => {
    if (!following || latitude === undefined || longitude === undefined) return;
    mapRef.current?.animateCamera({ center: { latitude, longitude } }, { duration: 400 });
  }, [following, latitude, longitude]);

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

  const locale = i18n.resolvedLanguage;
  const paused = tracker.session.status === 'PAUSED';
  const signal = gpsSignal(tracker.points.at(-1));
  const elevation = elevationGain(tracker.points);
  const calories = estimateCalories(tracker.distanceMeters, weightKg);

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

  const enableBackground = () =>
    void tracker.enableBackground().then((enabled) =>
      Alert.alert(
        enabled ? t('running.backgroundEnabledTitle') : t('running.backgroundDeniedTitle'),
        enabled ? t('running.backgroundEnabledMessage') : t('running.backgroundDeniedMessage'),
      ),
    );

  return (
    <View className="flex-1 bg-auth-bg">
      <View className="flex-1">
        <RouteMap
          coordinates={coordinates}
          interactive={!locked}
          mapRef={mapRef}
          mapType={mapType}
          onPanDrag={() => setFollowing(false)}
        />

        <View className="absolute inset-x-0 bottom-0" pointerEvents="none">
          {FADE_STEPS.map((opacity) => (
            <View key={opacity} className="h-4 bg-auth-bg" style={{ opacity }} />
          ))}
        </View>

        <SafeAreaView className="flex-1 justify-between px-4" edges={['top']} pointerEvents="box-none">
          <View className="flex-row items-start justify-between pt-2" pointerEvents="box-none">
            <MapButton
              disabled={locked || tracker.finishPending}
              icon={X}
              label={t('running.discard')}
              onPress={confirmDiscard}
            />
            <View className="items-end gap-2" pointerEvents="none">
              <View className="flex-row items-center gap-2 rounded-full bg-auth-bg/85 px-4 py-2.5">
                <Satellite color={signalColors[signal]} size={16} />
                <Text className="text-[13px] font-semibold text-auth-text" maxFontSizeMultiplier={1.1}>
                  {t(`running.gps.${signal}`)}
                </Text>
              </View>
              {tracker.offline || tracker.syncing ? (
                <View className="rounded-full bg-auth-bg/85 px-3 py-1.5">
                  <Text
                    className={['text-[11px] font-semibold', tracker.offline ? 'text-auth-danger' : 'text-auth-muted'].join(' ')}
                    maxFontSizeMultiplier={1.1}>
                    {tracker.offline ? t('running.offline') : t('running.syncing')}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          <View className="items-end gap-3 pb-8" pointerEvents="box-none">
            <MapButton
              disabled={locked}
              icon={Layers}
              label={t('running.mapLayers')}
              onPress={() => setMapType((type) => (type === 'standard' ? 'hybrid' : 'standard'))}
            />
            <MapButton
              active={following}
              disabled={locked || !latest}
              icon={LocateFixed}
              label={t('running.recenter')}
              onPress={() => setFollowing(true)}
            />
          </View>
        </SafeAreaView>
      </View>

      <SafeAreaView className="w-full max-w-[520px] self-center px-5 pb-2" edges={['bottom']}>
        <Text
          className={['text-center text-sm', paused ? 'font-semibold' : 'text-auth-muted'].join(' ')}
          maxFontSizeMultiplier={1.1}
          style={paused ? { color: metricColors.warning } : undefined}>
          {paused ? t('running.paused') : t('running.distance')}
        </Text>
        <Text
          accessibilityLabel={`${formatDistanceKm(tracker.distanceMeters, locale)} ${t('running.kilometers')}`}
          className="text-center text-[64px] font-extrabold leading-[72px] tracking-[-2px] text-auth-text"
          maxFontSizeMultiplier={1}>
          {formatDistanceKm(tracker.distanceMeters, locale)}
        </Text>
        <Text className="-mt-1 text-center text-base text-auth-text" maxFontSizeMultiplier={1.1}>
          {t('running.units.kilometers')}
        </Text>

        <View className="mt-4 flex-row">
          <LiveMetric label={t('running.time')} value={formatDuration(tracker.elapsedSeconds)} />
          <LiveMetric
            divider
            label={t('running.currentPace')}
            unit={t('running.units.pace')}
            value={formatPace(tracker.currentPaceSecondsKm)}
          />
          <LiveMetric
            divider
            label={t('running.averagePace')}
            unit={t('running.units.pace')}
            value={formatPace(tracker.averagePaceSecondsKm)}
          />
        </View>

        <View className="mt-4 flex-row gap-2.5">
          <MetricCard
            color={metricColors.calories}
            icon={Flame}
            label={t('running.calories')}
            unit={t('running.units.kcal')}
            value={calories === null ? '--' : String(calories)}
          />
          <MetricCard
            color={authColors.primary}
            icon={Gauge}
            label={t('running.averageSpeed')}
            unit={t('running.units.speed')}
            value={formatDecimal(averageSpeedKmh(tracker.distanceMeters, tracker.elapsedSeconds), locale)}
          />
          <MetricCard
            color={metricColors.elevation}
            icon={Mountain}
            label={t('running.elevationGain')}
            unit={t('running.units.meters')}
            value={elevation === null ? '--' : String(elevation)}
          />
        </View>

        {tracker.finishPending ? (
          <View className="mt-5 items-center gap-3">
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
        ) : locked ? (
          <View className="mt-5 items-center gap-2">
            <Pressable
              accessibilityHint={t('running.unlockHint')}
              accessibilityLabel={t('running.unlock')}
              accessibilityRole="button"
              className="h-[72px] w-[72px] items-center justify-center rounded-full border border-auth-border bg-auth-surface active:opacity-75"
              delayLongPress={600}
              onLongPress={() => setLocked(false)}>
              <LockOpen color={authColors.text} size={26} />
            </Pressable>
            <Text className="text-[13px] text-auth-muted" maxFontSizeMultiplier={1.1}>
              {t('running.unlockHint')}
            </Text>
          </View>
        ) : (
          <View className="mt-5 flex-row items-start justify-around">
            <ControlButton icon={Lock} label={t('running.lock')} onPress={() => setLocked(true)} />
            <ControlButton
              filled
              icon={paused ? Play : Pause}
              label={paused ? t('running.resume') : t('running.pause')}
              primary
              onPress={() => void (paused ? tracker.resume() : tracker.pause())}
            />
            <ControlButton filled icon={Square} label={t('running.finish')} onPress={confirmFinish} />
          </View>
        )}

        {tracker.finishPending || locked ? null : (
          <Pressable className="mt-1 self-center px-4 py-2" onPress={enableBackground}>
            <Text className="text-xs text-auth-muted">{t('running.enableBackground')}</Text>
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}

function LiveMetric({
  divider,
  label,
  unit,
  value,
}: {
  divider?: boolean;
  label: string;
  unit?: string;
  value: string;
}) {
  return (
    <View
      accessible
      accessibilityLabel={[label, value, unit].filter(Boolean).join(' ')}
      className={['flex-1 items-center', divider ? 'border-l border-auth-border' : ''].join(' ')}>
      <Text className="text-2xl font-extrabold text-auth-text" maxFontSizeMultiplier={1.05}>
        {value}
      </Text>
      <Text className="text-[13px] text-auth-muted" maxFontSizeMultiplier={1.1}>
        {label}
      </Text>
      {unit ? (
        <Text className="text-[11px] text-auth-placeholder" maxFontSizeMultiplier={1.1}>
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

function ControlButton({
  filled,
  icon: Icon,
  label,
  onPress,
  primary,
}: {
  filled?: boolean;
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <View className="w-24 items-center gap-2">
      <Pressable
        accessibilityLabel={label}
        accessibilityRole="button"
        className={[
          'items-center justify-center rounded-full active:opacity-75',
          primary
            ? 'h-[84px] w-[84px] bg-auth-primary'
            : 'mt-2 h-[68px] w-[68px] border border-auth-border bg-auth-surface',
        ].join(' ')}
        style={
          primary
            ? { shadowColor: authColors.primary, shadowOpacity: 0.5, shadowRadius: 18, elevation: 10 }
            : undefined
        }
        onPress={onPress}>
        <Icon
          color="white"
          fill={filled ? 'white' : 'transparent'}
          size={primary ? 32 : 24}
          strokeWidth={filled ? 1.5 : 2}
        />
      </Pressable>
      <Text className="text-[13px] font-semibold text-auth-text" maxFontSizeMultiplier={1.1}>
        {label}
      </Text>
    </View>
  );
}

function MapButton({
  active,
  disabled,
  icon: Icon,
  label,
  onPress,
}: {
  active?: boolean;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled, selected: active }}
      className={[
        'h-12 w-12 items-center justify-center rounded-full border border-auth-border bg-auth-bg/85 active:opacity-75',
        disabled ? 'opacity-50' : '',
      ].join(' ')}
      disabled={disabled}
      onPress={onPress}>
      <Icon color={active ? authColors.primary : authColors.text} size={20} />
    </Pressable>
  );
}
