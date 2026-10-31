import * as Crypto from 'expo-crypto';
import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import {
  getActiveRunningSession,
  getRunningSession,
} from '@/features/running/infrastructure/running-api';
import { RUNNING_LOCATION_TASK } from '@/features/running/infrastructure/background-location-task';
import {
  addPendingDiscard,
  appendRunningPoints,
  clearLocalRun,
  readLocalRun,
  readPendingDiscards,
  readRunningPointQueue,
  saveLocalRun,
  updateLocalRun,
} from '@/features/running/infrastructure/running-storage';
import { syncLocalRun } from '@/features/running/infrastructure/running-sync';
import type {
  LocalRunningState,
  RunningPoint,
  RunningSession,
} from '@/features/running/types/running.types';
import {
  activeSeconds,
  currentPace,
  distanceBetween,
  mergePoints,
  routeDistance,
  toRunningPoint,
} from '@/features/running/utils/running-format';
import { i18n } from '@/i18n';

type TrackerState = 'loading' | 'ready' | 'permission-denied' | 'error';

const SYNC_INTERVAL_MS = 15_000;
const MAX_ACCURACY_M = 100;
const MAX_SPEED_M_S = 15;

const locationOptions = {
  accuracy: Location.Accuracy.BestForNavigation,
  distanceInterval: 5,
  timeInterval: 3_000,
};

function fromServer(session: RunningSession): LocalRunningState {
  return {
    clientRequestId: session.clientRequestId,
    serverId: session.id,
    startedAt: session.startedAt,
    status: session.status === 'PAUSED' ? 'PAUSED' : 'ACTIVE',
    pauses: session.pauses,
    pendingActions: [],
    finish: null,
  };
}

/** Restores the run kept on the device, adopts the one active on the server, or starts a new one. */
async function loadOrCreateRun(): Promise<{ run: LocalRunningState; serverPoints: RunningPoint[] }> {
  const local = await readLocalRun();
  if (local) {
    const serverPoints = local.serverId
      ? await getRunningSession(local.serverId)
          .then((session) => session.points)
          .catch(() => [])
      : [];
    return { run: local, serverPoints };
  }

  const [active, discarded] = await Promise.all([
    getActiveRunningSession().catch(() => null),
    readPendingDiscards(),
  ]);
  const run =
    active && !discarded.includes(active.id)
      ? fromServer(active)
      : {
          clientRequestId: Crypto.randomUUID(),
          serverId: null,
          startedAt: new Date().toISOString(),
          status: 'ACTIVE' as const,
          pauses: [],
          pendingActions: [],
          finish: null,
        };
  await saveLocalRun(run);
  return { run, serverPoints: run.serverId ? (active?.points ?? []) : [] };
}

async function stopBackgroundUpdates() {
  if (await Location.hasStartedLocationUpdatesAsync(RUNNING_LOCATION_TASK)) {
    await Location.stopLocationUpdatesAsync(RUNNING_LOCATION_TASK);
  }
}

async function startBackgroundUpdates() {
  if (await Location.hasStartedLocationUpdatesAsync(RUNNING_LOCATION_TASK)) return;
  await Location.startLocationUpdatesAsync(RUNNING_LOCATION_TASK, {
    ...locationOptions,
    pausesUpdatesAutomatically: false,
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: i18n.t('running.notificationTitle'),
      notificationBody: i18n.t('running.notificationBody'),
      killServiceOnDestroy: false,
    },
  });
}

export function useRunningTracker() {
  const [state, setState] = useState<TrackerState>('loading');
  const [run, setRun] = useState<LocalRunningState | null>(null);
  const [points, setPoints] = useState<RunningPoint[]>([]);
  const [now, setNow] = useState(() => Date.now());
  const [syncing, setSyncing] = useState(false);
  const [offline, setOffline] = useState(false);
  const runRef = useRef<LocalRunningState | null>(null);
  const pointsRef = useRef<RunningPoint[]>([]);

  const applyRun = useCallback((next: LocalRunningState | null) => {
    runRef.current = next;
    setRun(next);
  }, []);

  const applyPoints = useCallback((next: RunningPoint[]) => {
    pointsRef.current = next;
    setPoints(next);
  }, []);

  const goToSummary = useCallback(async (completed: RunningSession) => {
    await stopBackgroundUpdates();
    router.replace({ pathname: '/running-summary/[id]', params: { id: completed.id } });
  }, []);

  /** Pushes pending data to the backend; the UI never waits on it while running. */
  const sync = useCallback(async () => {
    setSyncing(true);
    try {
      const completed = await syncLocalRun();
      setOffline(false);
      const stored = await readLocalRun();
      if (stored && stored.clientRequestId === runRef.current?.clientRequestId) applyRun(stored);
      if (completed) await goToSummary(completed);
      return true;
    } catch {
      setOffline(true);
      return false;
    } finally {
      setSyncing(false);
    }
  }, [applyRun, goToSummary]);

  /** Includes points written by the background task while the screen was not visible. */
  const reloadQueuedPoints = useCallback(async () => {
    const current = runRef.current;
    if (!current) return;
    const queued = await readRunningPointQueue(current.clientRequestId);
    applyPoints(mergePoints(pointsRef.current, queued));
  }, [applyPoints]);

  useEffect(() => {
    let active = true;
    let subscription: Location.LocationSubscription | null = null;

    const initialize = async () => {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (permission.status !== 'granted') {
          if (active) setState('permission-denied');
          return;
        }

        const { run: loaded, serverPoints } = await loadOrCreateRun();
        const queued = await readRunningPointQueue(loaded.clientRequestId);
        if (!active) return;
        applyRun(loaded);
        applyPoints(mergePoints(serverPoints, queued));
        setState('ready');
        void sync();
        if (loaded.finish) return;

        const background = await Location.getBackgroundPermissionsAsync();
        if (background.status === 'granted') await startBackgroundUpdates();

        subscription = await Location.watchPositionAsync(locationOptions, (location) => {
          const current = runRef.current;
          if (!current || current.status !== 'ACTIVE' || current.finish) return;
          const point = toRunningPoint(location);
          if (point.accuracyM !== null && point.accuracyM > MAX_ACCURACY_M) return;
          const previous = pointsRef.current.at(-1);
          if (previous) {
            const seconds =
              (new Date(point.recordedAt).getTime() - new Date(previous.recordedAt).getTime()) /
              1_000;
            if (seconds <= 0 || distanceBetween(previous, point) / seconds > MAX_SPEED_M_S) return;
          }
          void appendRunningPoints(current.clientRequestId, [point]);
          applyPoints([...pointsRef.current, point]);
        });
        if (!active) subscription.remove();
      } catch {
        if (active) setState('error');
      }
    };

    void initialize();
    return () => {
      active = false;
      subscription?.remove();
    };
  }, [applyPoints, applyRun, sync]);

  useEffect(() => {
    if (run?.status !== 'ACTIVE' || run.finish) return;
    const timer = setInterval(() => setNow(Date.now()), 1_000);
    return () => clearInterval(timer);
  }, [run?.status, run?.finish]);

  const runId = run?.clientRequestId;
  useEffect(() => {
    if (!runId) return;
    const timer = setInterval(() => void sync(), SYNC_INTERVAL_MS);
    const listener = AppState.addEventListener('change', (status) => {
      if (status !== 'active') return;
      setNow(Date.now());
      void reloadQueuedPoints();
      void sync();
    });
    return () => {
      clearInterval(timer);
      listener.remove();
    };
  }, [runId, reloadQueuedPoints, sync]);

  const pause = async () => {
    const current = runRef.current;
    if (!current || current.status !== 'ACTIVE' || current.finish) return;
    const at = new Date().toISOString();
    applyRun(
      await updateLocalRun(current.clientRequestId, (stored) => ({
        ...stored,
        status: 'PAUSED',
        pauses: [...stored.pauses, { pausedAt: at, resumedAt: null }],
        pendingActions: [...stored.pendingActions, { type: 'pause', at }],
      })),
    );
    setNow(Date.now());
    void sync();
  };

  const resume = async () => {
    const current = runRef.current;
    if (!current || current.status !== 'PAUSED' || current.finish) return;
    const at = new Date().toISOString();
    applyRun(
      await updateLocalRun(current.clientRequestId, (stored) => ({
        ...stored,
        status: 'ACTIVE',
        pauses: stored.pauses.map((pause) => (pause.resumedAt ? pause : { ...pause, resumedAt: at })),
        pendingActions: [...stored.pendingActions, { type: 'resume', at }],
      })),
    );
    setNow(Date.now());
    void sync();
  };

  const enableBackground = async () => {
    const permission = await Location.requestBackgroundPermissionsAsync();
    if (permission.status !== 'granted') return false;
    await startBackgroundUpdates();
    return true;
  };

  /**
   * The end time is fixed on the device, so finishing offline does not count the waiting time.
   * Resolves false when the backend could not be reached yet; `retryFinish` or the next app start
   * completes it.
   */
  const finish = async () => {
    const current = runRef.current;
    if (!current) return false;
    if (!current.finish) {
      const endedAt = new Date().toISOString();
      applyRun(
        await updateLocalRun(current.clientRequestId, (stored) => ({
          ...stored,
          finish: { endedAt, name: i18n.t('running.defaultName') },
        })),
      );
      setNow(new Date(endedAt).getTime());
    }
    await stopBackgroundUpdates();
    return sync();
  };

  const discard = async () => {
    const current = runRef.current;
    if (!current) return;
    if (current.serverId) await addPendingDiscard(current.serverId);
    await clearLocalRun(current.clientRequestId);
    applyRun(null);
    await stopBackgroundUpdates();
    void syncLocalRun().catch(() => undefined);
    router.replace('/running');
  };

  const pauses = run?.pauses ?? [];
  const reference = run?.finish ? new Date(run.finish.endedAt).getTime() : now;
  const elapsedSeconds = run ? activeSeconds(run.startedAt, pauses, reference) : 0;
  const distanceMeters = routeDistance(points, pauses);
  const averagePaceSecondsKm =
    distanceMeters >= 10 ? Math.round(elapsedSeconds / (distanceMeters / 1_000)) : null;

  return {
    state,
    session: run,
    points,
    elapsedSeconds,
    distanceMeters,
    averagePaceSecondsKm,
    currentPaceSecondsKm: run?.status === 'ACTIVE' ? currentPace(points) : null,
    finishPending: Boolean(run?.finish),
    syncing,
    offline,
    pause,
    resume,
    finish,
    retryFinish: sync,
    discard,
    enableBackground,
  };
}
