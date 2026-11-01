export type RunningStatus = 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DISCARDED';
export type RunningRecordDistance = 'ONE_K' | 'FIVE_K' | 'TEN_K' | 'HALF_MARATHON';

export interface RunningPoint {
  clientPointId: string;
  recordedAt: string;
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  altitudeM: number | null;
}

export interface RunningSplit {
  kilometer: number;
  durationSeconds: number;
  paceSecondsKm: number;
}

export interface RunningPause {
  pausedAt: string;
  resumedAt: string | null;
}

export interface RunningSession {
  id: string;
  clientRequestId: string;
  activityId: string | null;
  name: string | null;
  status: RunningStatus;
  startedAt: string;
  endedAt: string | null;
  activeDurationSeconds: number;
  distanceMeters: number;
  averagePaceSecondsKm: number | null;
  pauses: RunningPause[];
  points: RunningPoint[];
  splits: RunningSplit[];
  achievedRecords?: RunningRecordDistance[];
}

/** Run kept on the device while running; synchronized to the backend when there is connection. */
export interface LocalRunningState {
  /** Idempotency key of the run, also used as the local id before the backend id is known. */
  clientRequestId: string;
  serverId: string | null;
  startedAt: string;
  status: 'ACTIVE' | 'PAUSED';
  pauses: RunningPause[];
  /** Pause/resume events not yet confirmed by the backend, in order. */
  pendingActions: { type: 'pause' | 'resume'; at: string }[];
  /** Set when the user finished the run; cleared after the backend confirms. */
  finish: { endedAt: string; name: string } | null;
  /**
   * Distance known so far and the last point counted, so the background task can keep the
   * lock screen status up to date without loading the whole route.
   */
  live?: { distanceMeters: number; lastPoint: RunningPoint };
}

export interface RunningHistoryItem {
  id: string;
  activityId: string;
  name: string;
  startedAt: string;
  endedAt: string;
  activeDurationSeconds: number;
  distanceMeters: number;
  averagePaceSecondsKm: number | null;
}

export interface RunningStatistics {
  period: 'WEEKLY' | 'MONTHLY';
  distanceMeters: number;
  durationSeconds: number;
  runs: number;
  averagePaceSecondsKm: number | null;
  goal: { period: 'WEEKLY' | 'MONTHLY'; targetDistanceMeters: number } | null;
  goalProgress: number | null;
}

export interface RunningRecord {
  distance: RunningRecordDistance;
  durationSeconds: number;
  activityId: string;
  achievedAt: string;
}
