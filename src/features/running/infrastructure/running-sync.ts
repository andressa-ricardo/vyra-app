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
  for (const discard of await readPendingDiscards()) {
    try {
      let serverId = discard.serverId;
      if (!serverId) {
        if (!discard.clientRequestId || !discard.startedAt) {
          await removePendingDiscard(discard);
          continue;
        }
        // Creating with the same clientRequestId is idempotent. If the original response was lost,
        // this recovers the session id before honoring the durable discard intent.
        serverId = (await startRunningSession(discard.clientRequestId, discard.startedAt)).id;
      }
      await discardRunningSession(serverId);
      await removePendingDiscard(discard);
    } catch (error) {
      if (isPermanentFailure(error)) {
        await removePendingDiscard(discard);
        continue;
      }
      throw error;
    }
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
    let result: { accepted: number; duplicates: number; rejected: number };
    try {
      result = await uploadRunningPoints(serverId, batch);
    } catch (error) {
      if (!isPermanentFailure(error)) throw error;
      result = { accepted: 0, duplicates: 0, rejected: batch.length };
    }
    run = await updateLocalRun(localId, (state) => ({
      ...state,
      syncStats: {
        acceptedPoints: (state.syncStats?.acceptedPoints ?? 0) + result.accepted,
        duplicatePoints: (state.syncStats?.duplicatePoints ?? 0) + result.duplicates,
        rejectedPoints: (state.syncStats?.rejectedPoints ?? 0) + result.rejected,
        lastSyncedAt: new Date().toISOString(),
      },
    }));
    if (!run) return null;
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
