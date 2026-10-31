import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  LocalRunningState,
  RunningPoint,
} from '@/features/running/types/running.types';

// The local run is the source of truth while running; the backend is updated asynchronously so the
// app keeps working (start, pause, resume, finish) without connection.
const LOCAL_RUN_KEY = '@vyra/running/local-run';
const PENDING_DISCARDS_KEY = '@vyra/running/pending-discards';
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
  return (await readJson<RunningPoint[]>(queueKey(localRunId))) ?? [];
}

export async function appendRunningPoints(localRunId: string, points: RunningPoint[]) {
  if (!points.length) return;
  await serialize(async () => {
    const current = await readRunningPointQueue(localRunId);
    const known = new Set(current.map((point) => point.clientPointId));
    const merged = [...current, ...points.filter((point) => !known.has(point.clientPointId))];
    await AsyncStorage.setItem(queueKey(localRunId), JSON.stringify(merged));
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

export async function readPendingDiscards() {
  return (await readJson<string[]>(PENDING_DISCARDS_KEY)) ?? [];
}

export function addPendingDiscard(sessionId: string) {
  return serialize(async () => {
    const current = await readPendingDiscards();
    if (!current.includes(sessionId)) {
      await AsyncStorage.setItem(PENDING_DISCARDS_KEY, JSON.stringify([...current, sessionId]));
    }
  });
}

export function removePendingDiscard(sessionId: string) {
  return serialize(async () => {
    const current = await readPendingDiscards();
    await AsyncStorage.setItem(
      PENDING_DISCARDS_KEY,
      JSON.stringify(current.filter((id) => id !== sessionId)),
    );
  });
}
