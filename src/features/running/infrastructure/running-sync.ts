import { isAxiosError } from 'axios';

import {
  discardRunningSession,
  finishRunningSession,
  pauseRunningSession,
  resumeRunningSession,
  startRunningSession,
  uploadRunningPoints,
} from '@/features/running/infrastructure/running-api';
import {
  clearLocalRun,
  readLocalRun,
  readPendingDiscards,
  readRunningPointQueue,
  removePendingDiscard,
  removeRunningPoints,
  updateLocalRun,
} from '@/features/running/infrastructure/running-storage';
import type { RunningSession } from '@/features/running/types/running.types';

const BATCH_SIZE = 200;
let inFlight: Promise<RunningSession | null> | null = null;

/** Client errors that will not succeed on retry; the operation is dropped instead of blocking the queue. */
function isPermanentFailure(error: unknown) {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  return status !== undefined && [400, 403, 404, 409, 422].includes(status);
}

async function ignorePermanentFailure(operation: () => Promise<unknown>) {
  try {
    await operation();
  } catch (error) {
    if (!isPermanentFailure(error)) throw error;
  }
}

async function flushPendingDiscards() {
  for (const sessionId of await readPendingDiscards()) {
    await ignorePermanentFailure(() => discardRunningSession(sessionId));
    await removePendingDiscard(sessionId);
  }
}

async function synchronize(): Promise<RunningSession | null> {
  await flushPendingDiscards();

  let run = await readLocalRun();
  if (!run) return null;
  const localId = run.clientRequestId;

  if (!run.serverId) {
    // Idempotent by clientRequestId, so retrying after a lost response is safe.
    const created = await startRunningSession(localId, run.startedAt);
    run = await updateLocalRun(localId, (state) => ({ ...state, serverId: created.id }));
    if (!run) return null;
  }
  const serverId = run.serverId!;

  for (;;) {
    const batch = (await readRunningPointQueue(localId)).slice(0, BATCH_SIZE);
    if (!batch.length) break;
    await ignorePermanentFailure(() => uploadRunningPoints(serverId, batch));
    await removeRunningPoints(
      localId,
      batch.map((point) => point.clientPointId),
    );
  }

  for (const action of run.pendingActions) {
    await ignorePermanentFailure(() =>
      action.type === 'pause'
        ? pauseRunningSession(serverId, action.at)
        : resumeRunningSession(serverId, action.at),
    );
    // Actions are only appended, so the confirmed one is always the first pending entry.
    run = await updateLocalRun(localId, (state) => {
      const [first, ...rest] = state.pendingActions;
      return first?.type === action.type && first.at === action.at
        ? { ...state, pendingActions: rest }
        : state;
    });
    if (!run) return null;
  }

  if (!run.finish) return null;
  const { name, endedAt } = run.finish;
  try {
    const completed = await finishRunningSession(serverId, name, endedAt);
    await clearLocalRun(localId);
    return completed;
  } catch (error) {
    // The run no longer exists or was discarded on the server: keeping it would block new runs.
    if (isPermanentFailure(error)) await clearLocalRun(localId);
    throw error;
  }
}

/**
 * Sends the device run to the backend: start, GPS points, pauses/resumes and finish, in order.
 * Resolves with the completed session once a pending finish is confirmed. A call made while a sync
 * is running waits for it and then runs again, so changes made meanwhile (e.g. finish) are sent.
 */
export function syncLocalRun(): Promise<RunningSession | null> {
  if (inFlight) {
    return inFlight.catch(() => null).then(() => syncLocalRun());
  }
  inFlight = synchronize().finally(() => {
    inFlight = null;
  });
  return inFlight;
}
