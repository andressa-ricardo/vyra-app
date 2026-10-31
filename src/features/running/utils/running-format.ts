import type { LocationObject } from 'expo-location';

import type { RunningPause, RunningPoint } from '@/features/running/types/running.types';

const EARTH_RADIUS_M = 6_371_000;

export function createLocationPointId(timestamp: number, latitude: number, longitude: number) {
  return `gps-${Math.round(timestamp)}-${latitude.toFixed(5)}-${longitude.toFixed(5)}`;
}

export function toRunningPoint(location: LocationObject): RunningPoint {
  return {
    clientPointId: createLocationPointId(
      location.timestamp,
      location.coords.latitude,
      location.coords.longitude,
    ),
    recordedAt: new Date(location.timestamp).toISOString(),
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracyM: location.coords.accuracy,
    altitudeM: location.coords.altitude,
  };
}

/** Merges route points by id, ordered by time (server points + points still queued on the device). */
export function mergePoints(...sources: RunningPoint[][]) {
  const byId = new Map<string, RunningPoint>();
  for (const point of sources.flat()) byId.set(point.clientPointId, point);
  return [...byId.values()].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );
}

/** Active time derived from timestamps, so it stays correct after the app was in background. */
export function activeSeconds(startedAt: string, pauses: RunningPause[], now: number) {
  const paused = pauses.reduce((sum, pause) => {
    const end = pause.resumedAt ? new Date(pause.resumedAt).getTime() : now;
    return sum + Math.max(0, end - new Date(pause.pausedAt).getTime());
  }, 0);
  return Math.max(0, Math.floor((now - new Date(startedAt).getTime() - paused) / 1_000));
}

export function distanceBetween(a: RunningPoint, b: RunningPoint) {
  const radians = Math.PI / 180;
  const lat = (b.latitude - a.latitude) * radians;
  const lon = (b.longitude - a.longitude) * radians;
  const value =
    Math.sin(lat / 2) ** 2 +
    Math.cos(a.latitude * radians) *
      Math.cos(b.latitude * radians) *
      Math.sin(lon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(value));
}

/** Route length; like the backend, segments overlapping a pause are not counted. */
export function routeDistance(points: RunningPoint[], pauses: RunningPause[] = []) {
  return points.reduce((sum, point, index) => {
    if (!index) return sum;
    const previous = points[index - 1];
    const from = new Date(previous.recordedAt).getTime();
    const to = new Date(point.recordedAt).getTime();
    const overlapsPause = pauses.some(
      (pause) =>
        new Date(pause.pausedAt).getTime() <= to &&
        (pause.resumedAt ? new Date(pause.resumedAt).getTime() : Infinity) >= from,
    );
    return overlapsPause ? sum : sum + distanceBetween(previous, point);
  }, 0);
}

export function currentPace(points: RunningPoint[]) {
  const latest = points.at(-1);
  if (!latest) return null;
  const cutoff = new Date(latest.recordedAt).getTime() - 30_000;
  const window = points.filter((point) => new Date(point.recordedAt).getTime() >= cutoff);
  if (window.length < 2) return null;
  const meters = routeDistance(window);
  const seconds =
    (new Date(window.at(-1)!.recordedAt).getTime() - new Date(window[0].recordedAt).getTime()) /
    1_000;
  return meters >= 10 && seconds > 0 ? Math.round(seconds / (meters / 1_000)) : null;
}

export function formatDuration(seconds: number) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = Math.max(0, Math.floor(seconds % 60));
  return [hours, minutes, remaining].map((value) => String(value).padStart(2, '0')).join(':');
}

export function formatPace(seconds: number | null) {
  if (!seconds || !Number.isFinite(seconds)) return '--:--';
  return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`;
}

export function formatDistanceKm(meters: number, locale?: string) {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(meters / 1_000);
}

export function formatDecimal(value: number | null, locale?: string, digits = 1) {
  if (value === null || !Number.isFinite(value)) return '--';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits }).format(value);
}
