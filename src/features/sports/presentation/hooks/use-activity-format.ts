import { useTranslation } from 'react-i18next';

import type { SampleActivity } from '@/features/sports/sample-data';

/** Esportes cuja distância é exibida em metros, e não em quilômetros. */
const metersSports = new Set(['swimming']);

function stripDot(value: string) {
  return value.replace(/\.$/, '');
}

function pad(value: number) {
  return String(value).padStart(2, '0');
}

export function formatClock(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return hours ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`;
}

export function useActivityFormat() {
  const { i18n, t } = useTranslation();
  const locale = i18n.resolvedLanguage;

  const sportName = (slug: string, fallback?: string) =>
    t(`modalities.items.${slug}`, { defaultValue: fallback ?? slug });

  const distance = (meters: number, sport: string) =>
    metersSports.has(sport)
      ? `${meters.toLocaleString(locale)} m`
      : `${(meters / 1_000).toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 2 })} km`;

  const when = ({ daysAgo, time }: SampleActivity) => {
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

  /** Ex.: "Corrida · 8,04 km · 44:12". */
  const details = (activity: SampleActivity) => {
    const parts = [sportName(activity.sport)];
    if (activity.distanceMeters !== undefined) parts.push(distance(activity.distanceMeters, activity.sport));
    if (activity.durationSeconds !== undefined) {
      parts.push(
        activity.distanceMeters !== undefined
          ? formatClock(activity.durationSeconds)
          : t('sports.recent.minutes', { count: Math.round(activity.durationSeconds / 60) }),
      );
    }
    return parts.join(' · ');
  };

  return { details, sportName, when };
}
