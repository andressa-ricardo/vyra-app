export type ActivityType = 'RUNNING' | 'STRENGTH_TRAINING';

type ProgressTotals = {
  activityCount: number;
  activeDurationSeconds: number;
  distanceMeters: number;
  activeDays: number;
};

/** `GET /progress/summary`. */
export type ProgressSummary = ProgressTotals & {
  period: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  timeZone: string;
  from: string;
  to: string;
  byType: (ProgressTotals & { type: ActivityType })[];
};

/** Item de `GET /progress/history` (Activity canônica). */
export type ActivityItem = {
  id: string;
  type: ActivityType;
  name: string;
  startedAt: string;
  endedAt: string;
  activeDurationSeconds: number;
  distanceMeters: number | null;
  averagePaceSecondsKm: number | null;
};

export type Page<T> = { items: T[]; total: number; page: number; limit: number };

/** Item de `GET /workouts`. */
export type WorkoutSummary = {
  id: string;
  name: string;
  description: string | null;
  status: 'ACTIVE' | 'ARCHIVED';
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Item de `GET /workout-sessions/history`. */
export type WorkoutSessionHistoryItem = {
  id: string;
  workoutId: string;
  activityId: string;
  workoutName: string;
  startedAt: string;
  endedAt: string;
  activeDurationSeconds: number;
  totalSets: number;
  totalRepetitions: number;
  totalVolumeGrams: number;
};

/** Item de `GET /running/history`; usado só para ligar a Activity à sessão de corrida. */
export type RunningHistoryLink = { id: string; activityId: string };

/** Activity do feed com os dados extras de cada modalidade, quando disponíveis. */
export type FeedActivity = ActivityItem & {
  running?: { sessionId: string; splitPaces: number[] };
  strength?: { totalSets: number; totalVolumeGrams: number };
};

export type HomeDashboard = {
  summary: ProgressSummary;
  /** Segundos ativos por dia da semana atual, de segunda (0) a domingo (6). */
  weekSeconds: number[];
  workout: WorkoutSummary | null;
  feed: FeedActivity[];
};
