import { getCalendars } from 'expo-localization';

import { httpClient } from '@/core/api/http-client';
import type {
  RunningHistoryItem,
  RunningPoint,
  RunningRecord,
  RunningSession,
  RunningStatistics,
} from '@/features/running/types/running.types';

export async function startRunningSession(clientRequestId: string, startedAt: string) {
  const { data } = await httpClient.post<RunningSession>('/running/sessions', {
    clientRequestId,
    startedAt,
  });
  return data;
}

export async function getActiveRunningSession() {
  const { data } = await httpClient.get<RunningSession | null>('/running/sessions/active');
  return data || null;
}

export async function getRunningSession(id: string) {
  const { data } = await httpClient.get<RunningSession>(`/running/sessions/${id}`);
  return data;
}

export async function uploadRunningPoints(id: string, points: RunningPoint[]) {
  const { data } = await httpClient.post<{ accepted: number; duplicates: number; rejected: number }>(
    `/running/sessions/${id}/points`,
    { points },
  );
  return data;
}

export async function pauseRunningSession(id: string, at: string) {
  await httpClient.post(`/running/sessions/${id}/pause`, { at });
}

export async function resumeRunningSession(id: string, at: string) {
  await httpClient.post(`/running/sessions/${id}/resume`, { at });
}

export async function finishRunningSession(id: string, name: string, endedAt: string) {
  const { data } = await httpClient.post<RunningSession>(`/running/sessions/${id}/finish`, {
    name,
    endedAt,
  });
  return data;
}

export async function discardRunningSession(id: string) {
  await httpClient.delete(`/running/sessions/${id}`);
}

export async function getRunningDashboard() {
  const timeZone = getCalendars()[0]?.timeZone ?? 'UTC';
  const [statistics, history, records] = await Promise.all([
    httpClient.get<RunningStatistics>('/running/statistics', {
      params: { period: 'WEEKLY', timeZone },
    }),
    httpClient.get<{ items: RunningHistoryItem[] }>('/running/history', {
      params: { page: 1, limit: 5 },
    }),
    httpClient.get<RunningRecord[]>('/running/records'),
  ]);
  return { statistics: statistics.data, history: history.data.items, records: records.data };
}

export async function renameRunningActivity(activityId: string, name: string) {
  await httpClient.patch(`/running/activities/${activityId}`, { name });
}

export async function setWeeklyRunningGoal(targetDistanceMeters: number) {
  const { data } = await httpClient.put<{ period: 'WEEKLY'; targetDistanceMeters: number }>(
    '/running/goal',
    { period: 'WEEKLY', targetDistanceMeters },
  );
  return data;
}

/** Peso do perfil, usado apenas para estimar calorias. */
export async function getBodyWeightKg() {
  const { data } = await httpClient.get<{ currentWeightKg: string | number | null }>('/profiles/me');
  const weight = Number(data.currentWeightKg);
  return data.currentWeightKg !== null && Number.isFinite(weight) && weight > 0 ? weight : null;
}
