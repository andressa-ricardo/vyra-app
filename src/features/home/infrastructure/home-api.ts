import { getCalendars } from 'expo-localization';

import { httpClient } from '@/core/api/http-client';
import type {
  ActivityItem,
  FeedActivity,
  HomeDashboard,
  Page,
  ProgressSummary,
  RunningHistoryLink,
  WorkoutSessionHistoryItem,
  WorkoutSummary,
} from '@/features/home/types/home.types';
import { sumSecondsByWeekday } from '@/features/home/utils/week-activity';

const FEED_SIZE = 5;

function settled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === 'fulfilled' ? result.value : null;
}

/**
 * Monta a home a partir de `/progress` (obrigatório) e enriquece o feed com dados de corrida
 * e musculação. Falhas nessas fontes extras não derrubam a tela; o card só fica sem o detalhe.
 */
export async function getHomeDashboard(): Promise<HomeDashboard> {
  const timeZone = getCalendars()[0]?.timeZone ?? 'UTC';

  const [summary, week, feed] = await Promise.all([
    httpClient
      .get<ProgressSummary>('/progress/summary', { params: { period: 'WEEKLY', timeZone } })
      .then((response) => response.data),
    httpClient
      .get<Page<ActivityItem>>('/progress/history', { params: { period: 'WEEKLY', timeZone, limit: 50 } })
      .then((response) => response.data.items),
    httpClient
      .get<Page<ActivityItem>>('/progress/history', { params: { period: 'YEARLY', timeZone, limit: FEED_SIZE } })
      .then((response) => response.data.items),
  ]);

  // O histórico de cada módulo é ordenado do mais recente, então os primeiros itens cobrem o feed.
  const [workouts, runs, strength] = await Promise.allSettled([
    httpClient
      .get<Page<WorkoutSummary>>('/workouts', { params: { status: 'ACTIVE', limit: 1 } })
      .then((response) => response.data.items),
    httpClient
      .get<Page<RunningHistoryLink>>('/running/history', { params: { limit: FEED_SIZE } })
      .then((response) => response.data.items),
    httpClient
      .get<Page<WorkoutSessionHistoryItem>>('/workout-sessions/history', { params: { limit: FEED_SIZE } })
      .then((response) => response.data.items),
  ]);

  const runByActivity = new Map((settled(runs) ?? []).map((run) => [run.activityId, run.id]));
  const strengthByActivity = new Map((settled(strength) ?? []).map((session) => [session.activityId, session]));

  const enriched = await Promise.all(
    feed.map(async (activity): Promise<FeedActivity> => {
      if (activity.type === 'STRENGTH_TRAINING') {
        const session = strengthByActivity.get(activity.id);
        return session
          ? { ...activity, strength: { totalSets: session.totalSets, totalVolumeGrams: session.totalVolumeGrams } }
          : activity;
      }
      const sessionId = runByActivity.get(activity.id);
      if (!sessionId) return activity;
      const splitPaces = await httpClient
        .get<{ splits: { paceSecondsKm: number }[] }>(`/running/sessions/${sessionId}`)
        .then((response) => response.data.splits.map((split) => split.paceSecondsKm))
        .catch(() => []);
      return { ...activity, running: { sessionId, splitPaces } };
    }),
  );

  return {
    summary,
    weekSeconds: sumSecondsByWeekday(week),
    workout: settled(workouts)?.[0] ?? null,
    feed: enriched,
  };
}
