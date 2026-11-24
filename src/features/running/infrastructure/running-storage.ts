import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  LocalRunningState,
  PendingRunningDiscard,
  RunningPoint,
} from '@/features/running/types/running.types';
import {
  compactRunningPoints,
  filterRunningPoints,
} from '@/features/running/utils/running-format';

// The local run is the source of truth while running; the backend is updated asynchronously so the
// app keeps working (start, pause, resume, finish) without connection.
const LOCAL_RUN_KEY = '@vyra/running/local-run';
const PENDING_DISCARDS_KEY = '@vyra/running/pending-discards';
const MAX_QUEUED_POINTS = 10_000;
const COMPACTED_QUEUE_SIZE = 7_500;
const queueKey = (localRunId: string) => `@vyra/running/queue/${localRunId}`;
let mutation: Promise<unknown> = Promise.resolve();

/** Serializes read-modify-write cycles shared by the UI and the background location task. */
function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const next = mutation.then(operation, operation);
  mutation = next.catch(() => undefined);
  return next;
}

async function readJson<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function readLocalRun() {
  return readJson<LocalRunningState>(LOCAL_RUN_KEY);
}

export function saveLocalRun(state: LocalRunningState) {
  return serialize(() => AsyncStorage.setItem(LOCAL_RUN_KEY, JSON.stringify(state)));
}

/** Applies `update` to the stored run; returns null when the run no longer exists. */
export function updateLocalRun(
  clientRequestId: string,
  update: (state: LocalRunningState) => LocalRunningState,
) {
  return serialize(async () => {
    const current = await readLocalRun();
    if (!current || current.clientRequestId !== clientRequestId) return null;
    const next = update(current);
    await AsyncStorage.setItem(LOCAL_RUN_KEY, JSON.stringify(next));
    return next;
  });
}

export function clearLocalRun(clientRequestId: string) {
  return serialize(async () => {
    const current = await readLocalRun();
    if (current?.clientRequestId === clientRequestId) await AsyncStorage.removeItem(LOCAL_RUN_KEY);
    await AsyncStorage.removeItem(queueKey(clientRequestId));
  });
}

export async function readRunningPointQueue(localRunId: string): Promise<RunningPoint[]> {
  const stored = await readJson<unknown>(queueKey(localRunId));
  if (!Array.isArray(stored)) return [];
  return filterRunningPoints(stored).points;
}

export async function appendRunningPoints(localRunId: string, points: RunningPoint[]) {
  if (!points.length) return { compacted: 0, rejected: 0 };
  return serialize(async () => {
    const current = await readRunningPointQueue(localRunId);
    const filtered = filterRunningPoints([...current, ...points]);
    const stored =
      filtered.points.length > MAX_QUEUED_POINTS
        ? compactRunningPoints(filtered.points, COMPACTED_QUEUE_SIZE)
        : filtered.points;
    await AsyncStorage.setItem(queueKey(localRunId), JSON.stringify(stored));
    return {
      compacted: filtered.points.length - stored.length,
      rejected: filtered.rejected,
    };
  });
}

export async function removeRunningPoints(localRunId: string, clientPointIds: string[]) {
  await serialize(async () => {
    const removed = new Set(clientPointIds);
    const current = await readRunningPointQueue(localRunId);
    await AsyncStorage.setItem(
      queueKey(localRunId),
      JSON.stringify(current.filter((point) => !removed.has(point.clientPointId))),
    );
  });
}

export async function readPendingDiscards(): Promise<PendingRunningDiscard[]> {
  const stored = await readJson<unknown>(PENDING_DISCARDS_KEY);
  if (!Array.isArray(stored)) return [];
  return stored.flatMap((value): PendingRunningDiscard[] => {
    // Migrates the previous format, which stored only a server session id.
    if (typeof value === 'string') {
      return [{ clientRequestId: null, serverId: value, startedAt: null }];
    }
    if (!value || typeof value !== 'object') return [];
    const candidate = value as Partial<PendingRunningDiscard>;
    const clientRequestId =
      typeof candidate.clientRequestId === 'string' ? candidate.clientRequestId : null;
    const serverId = typeof candidate.serverId === 'string' ? candidate.serverId : null;
    const startedAt = typeof candidate.startedAt === 'string' ? candidate.startedAt : null;
    return clientRequestId || serverId ? [{ clientRequestId, serverId, startedAt }] : [];
  });
}

export function addPendingDiscard(discard: PendingRunningDiscard) {
  return serialize(async () => {
    const current = await readPendingDiscards();
    const exists = current.some(
      (item) =>
        (discard.serverId && item.serverId === discard.serverId) ||
        (discard.clientRequestId && item.clientRequestId === discard.clientRequestId),
    );
    if (!exists) {
      await AsyncStorage.setItem(PENDING_DISCARDS_KEY, JSON.stringify([...current, discard]));
    }
  });
}

export function removePendingDiscard(discard: PendingRunningDiscard) {
  return serialize(async () => {
    const current = await readPendingDiscards();
    await AsyncStorage.setItem(
      PENDING_DISCARDS_KEY,
      JSON.stringify(
        current.filter(
          (item) =>
            !(
              (discard.serverId && item.serverId === discard.serverId) ||
              (discard.clientRequestId && item.clientRequestId === discard.clientRequestId)
            ),
        ),
      ),
    );
  });
}
