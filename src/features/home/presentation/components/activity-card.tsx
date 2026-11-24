import { router } from 'expo-router';
import ChevronRight from 'lucide-react-native/icons/chevron-right';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Footprints from 'lucide-react-native/icons/footprints';
import Share2 from 'lucide-react-native/icons/share-2';
import { useTranslation } from 'react-i18next';
import { Pressable, Share, Text, View } from 'react-native';

import { SmoothLineChart } from '@/features/home/presentation/components/smooth-line-chart';
import type { FeedActivity } from '@/features/home/types/home.types';
import {
  daysAgo,
  durationParts,
  formatClock,
  formatKilometers,
  formatPace,
  formatVolumeKg,
} from '@/features/home/utils/activity-format';
import { nameInitials } from '@/features/home/utils/week-activity';
import { authColors } from '@/theme';

function stripDot(value: string) {
  return value.replace(/\.$/, '');
}

function useWhen() {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'pt-BR';

  return (iso: string) => {
    const date = new Date(iso);
    const clock = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    const diff = daysAgo(iso);
    if (diff === 0) return `${t('home.feed.today')} · ${clock}`;
    if (diff === 1) return `${t('home.feed.yesterday')} · ${clock}`;
    const weekday = stripDot(date.toLocaleDateString(locale, { weekday: 'short' }));
    const month = stripDot(date.toLocaleDateString(locale, { month: 'short' }));
    return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${date.getDate()} ${month} · ${clock}`;
  };
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1">
      <Text className="text-[11px] text-auth-muted">{label}</Text>
      <Text className="mt-0.5 text-[15px] font-bold text-auth-text" maxFontSizeMultiplier={1.1} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export function ActivityCard({ activity, userName }: { activity: FeedActivity; userName: string }) {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage ?? 'pt-BR';
  const when = useWhen();
  const running = activity.type === 'RUNNING';
  const TypeIcon = running ? Footprints : Dumbbell;
  const typeLabel = t(`home.feed.types.${activity.type}`);
  const empty = '—';

  const duration = running
    ? formatClock(activity.activeDurationSeconds)
    : durationParts(activity.activeDurationSeconds).map((part) => `${part.value} ${part.unit}`).join(' ');

  const metrics = running
    ? [
        {
          label: t('home.feed.metrics.distance'),
          value: activity.distanceMeters != null ? `${formatKilometers(activity.distanceMeters, locale)} km` : empty,
        },
        { label: t('home.feed.metrics.time'), value: duration },
        {
          label: t('home.feed.metrics.pace'),
          value: activity.averagePaceSecondsKm != null ? `${formatPace(activity.averagePaceSecondsKm)} /km` : empty,
        },
      ]
    : [
        { label: t('home.feed.metrics.time'), value: duration },
        {
          label: t('home.feed.metrics.sets'),
          value: activity.strength ? String(activity.strength.totalSets) : empty,
        },
        {
          label: t('home.feed.metrics.volume'),
          value: activity.strength ? `${formatVolumeKg(activity.strength.totalVolumeGrams, locale)} kg` : empty,
        },
      ];

  // Ritmo menor é mais rápido: invertido para a curva subir quando o km foi mais rápido.
  const paces = activity.running?.splitPaces ?? [];
  const sessionId = activity.running?.sessionId;
  const open = sessionId
    ? () => router.push({ pathname: '/running-summary/[id]', params: { id: sessionId } })
    : undefined;

  const share = () =>
    void Share.share({
      message: [activity.name, typeLabel, ...metrics.filter((metric) => metric.value !== empty).map((metric) => `${metric.label}: ${metric.value}`)].join(
        '\n',
      ),
    });

  return (
    <View className="rounded-[22px] border border-auth-border bg-auth-surface">
      <Pressable
        accessibilityRole={open ? 'button' : undefined}
        className="px-4 pb-3 pt-4 active:opacity-80"
        disabled={!open}
        onPress={open}>
        <View className="flex-row items-center">
          <View className="h-9 w-9 items-center justify-center rounded-full bg-[#183A70]">
            <Text className="text-[12px] font-bold text-auth-primary">{nameInitials(userName)}</Text>
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-[14px] font-bold text-auth-text" numberOfLines={1}>
              {userName}
            </Text>
            <View className="mt-0.5 flex-row items-center gap-1">
              <TypeIcon color={authColors.muted} size={12} strokeWidth={1.8} />
              <Text className="text-[11px] text-auth-muted" numberOfLines={1}>
                {typeLabel} · {when(activity.startedAt)}
              </Text>
            </View>
          </View>
          {open ? <ChevronRight color={authColors.muted} size={17} strokeWidth={1.8} /> : null}
        </View>

        <Text className="mt-3 text-[18px] font-extrabold text-auth-text" maxFontSizeMultiplier={1.1}>
          {activity.name}
        </Text>
        <View className="mt-2 flex-row gap-3">
          {metrics.map((metric) => (
            <Metric key={metric.label} label={metric.label} value={metric.value} />
          ))}
        </View>
      </Pressable>

      {paces.length >= 2 ? (
        <View className="mx-4 border-t border-auth-border pt-3">
          <Text className="mb-2 text-[11px] text-auth-muted">{t('home.feed.paceChart')}</Text>
          <View className="overflow-hidden rounded-[14px] bg-auth-bg/60">
            <SmoothLineChart grid height={96} padding={14} values={paces.map((pace) => -pace)} />
          </View>
        </View>
      ) : null}

      <View className="mt-1 flex-row justify-end px-2 pb-2">
        <Pressable
          accessibilityLabel={t('home.feed.share')}
          accessibilityRole="button"
          className="h-10 w-10 items-center justify-center rounded-full active:bg-auth-pressed"
          onPress={share}>
          <Share2 color={authColors.muted} size={18} strokeWidth={1.8} />
        </Pressable>
      </View>
    </View>
  );
}
