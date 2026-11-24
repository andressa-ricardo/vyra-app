import {
  AxiosError,
  AxiosHeaders,
  type AxiosAdapter,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';

type JsonObject = Record<string, unknown>;

type MockUser = {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE';
  emailVerifiedAt: string;
  createdAt: string;
  updatedAt: string;
  roles: string[];
};

type MockPoint = {
  clientPointId: string;
  recordedAt: string;
  latitude: number;
  longitude: number;
  accuracyM: number | null;
  altitudeM: number | null;
};

type MockRun = {
  id: string;
  clientRequestId: string;
  activityId: string | null;
  name: string | null;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  startedAt: string;
  endedAt: string | null;
  activeDurationSeconds: number;
  distanceMeters: number;
  averagePaceSecondsKm: number | null;
  pauses: { pausedAt: string; resumedAt: string | null }[];
  points: MockPoint[];
  splits: { kilometer: number; durationSeconds: number; paceSecondsKm: number }[];
  achievedRecords: string[];
};

const now = new Date().toISOString();
let user: MockUser = {
  id: 'mock-user-1',
  name: 'Andressa Silva',
  email: 'andressa@vyra.app',
  status: 'ACTIVE',
  emailVerifiedAt: now,
  createdAt: now,
  updatedAt: now,
  roles: ['USER'],
};

let onboarding = {
  status: 'COMPLETED',
  currentStep: 4,
  selectedExperiences: ['PERSONAL_FITNESS'],
  progress: 100,
  canResume: false,
};

let profile: JsonObject = {
  displayName: 'Andressa',
  avatarUrl: null,
  birthDate: '1998-05-12',
  heightCm: '168',
  currentWeightKg: '68.5',
  fitnessLevel: 'INTERMEDIATE',
  primaryGoal: 'GENERAL_FITNESS',
  sportModalityIds: ['mock-modality-running', 'mock-modality-strength'],
};

const sportModalities = [
  ['mock-modality-strength', 'strength-training', 'Musculação', 'FITNESS'],
  ['mock-modality-running', 'running', 'Corrida', 'ENDURANCE'],
  ['mock-modality-walking', 'walking', 'Caminhada', 'ENDURANCE'],
  ['mock-modality-calisthenics', 'calisthenics', 'Calistenia', 'FITNESS'],
  ['mock-modality-cycling', 'cycling', 'Ciclismo', 'ENDURANCE'],
  ['mock-modality-swimming', 'swimming', 'Natação', 'AQUATIC'],
  ['mock-modality-pilates', 'pilates', 'Pilates', 'MIND_BODY'],
  ['mock-modality-yoga', 'yoga', 'Yoga', 'MIND_BODY'],
  ['mock-modality-crossfit', 'crossfit', 'CrossFit', 'FITNESS'],
  ['mock-modality-jiu-jitsu', 'jiu-jitsu', 'Jiu-jítsu', 'COMBAT'],
  ['mock-modality-martial-arts', 'other-martial-arts', 'Outras artes marciais', 'COMBAT'],
  ['mock-modality-dance', 'dance', 'Dança', 'DANCE'],
  ['mock-modality-football', 'football', 'Futebol', 'TEAM'],
  ['mock-modality-basketball', 'basketball', 'Basquete', 'TEAM'],
  ['mock-modality-other', 'other-sports', 'Outros esportes', 'OTHER'],
].map(([id, slug, name, category], sortOrder) => ({ id, slug, name, category, sortOrder }));

const mockWorkouts = [
  {
    id: 'mock-workout-upper-a',
    name: 'Superior A',
    description: 'Peito, ombros e tríceps',
    status: 'ACTIVE',
    itemCount: 5,
    createdAt: now,
    updatedAt: now,
  },
];

const mockStrengthSessions = [
  ['mock-strength-1', 'Superior A', 1, 3_120, 18, 186, 6_240_000],
  ['mock-strength-2', 'Inferior A', 3, 2_880, 16, 160, 8_910_000],
].map(([id, workoutName, daysAgo, activeDurationSeconds, totalSets, totalRepetitions, totalVolumeGrams]) => {
  const endedAt = new Date(Date.now() - Number(daysAgo) * 86_400_000);
  return {
    id: String(id),
    workoutId: 'mock-workout-upper-a',
    activityId: `mock-activity-${id}`,
    workoutName: String(workoutName),
    startedAt: new Date(endedAt.getTime() - Number(activeDurationSeconds) * 1_000).toISOString(),
    endedAt: endedAt.toISOString(),
    activeDurationSeconds: Number(activeDurationSeconds),
    totalSets: Number(totalSets),
    totalRepetitions: Number(totalRepetitions),
    totalVolumeGrams: Number(totalVolumeGrams),
  };
});

type MockActivity = {
  id: string;
  type: 'RUNNING' | 'STRENGTH_TRAINING';
  name: string;
  startedAt: string;
  endedAt: string;
  activeDurationSeconds: number;
  distanceMeters: number | null;
  averagePaceSecondsKm: number | null;
};

let weeklyGoal = 15_000;
const runs = new Map<string, MockRun>();

seedRuns();

/**
 * Backend local determinístico para desenvolvimento visual. Ele implementa os mesmos contratos
 * HTTP usados pelo app e nunca abre conexão de rede.
 */
export const mockApiAdapter: AxiosAdapter = async (config) => {
  const method = config.method?.toUpperCase() ?? 'GET';
  const path = normalizePath(config.url);

  if (method === 'POST' && path === '/auth/register') {
    const payload = readBody<{ name?: string; email?: string }>(config);
    user = {
      ...user,
      name: payload.name?.trim() || user.name,
      email: payload.email?.trim().toLowerCase() || user.email,
      updatedAt: new Date().toISOString(),
    };
    onboarding = {
      status: 'NOT_STARTED',
      currentStep: 0,
      selectedExperiences: [],
      progress: 0,
      canResume: false,
    };
    profile = {
      displayName: null,
      avatarUrl: null,
      birthDate: null,
      heightCm: null,
      currentWeightKg: null,
      fitnessLevel: null,
      primaryGoal: null,
      sportModalityIds: [],
    };
    return respond(config, createSession());
  }

  if (method === 'POST' && path === '/auth/login') {
    const payload = readBody<{ email?: string }>(config);
    if (payload.email?.trim()) user = { ...user, email: payload.email.trim().toLowerCase() };
    return respond(config, createSession());
  }

  if (method === 'POST' && path === '/auth/federated/apple/nonce') {
    return respond(config, {
      nonce: 'mock-apple-nonce',
      expiresAt: new Date(Date.now() + 5 * 60_000).toISOString(),
    });
  }

  if (
    method === 'POST' &&
    (path === '/auth/federated/google' || path === '/auth/federated/apple')
  ) {
    return respond(config, {
      ...createSession(),
      isNewUser: false,
      onboarding: { status: onboarding.status },
    });
  }

  if (method === 'POST' && path === '/auth/refresh') return respond(config, createTokens());
  if (method === 'POST' && path === '/auth/logout') return respond(config, undefined, 204);
  if (method === 'GET' && path === '/users/me') return respond(config, user);

  if (method === 'GET' && path === '/onboarding/me') return respond(config, onboarding);
  if (method === 'PATCH' && path === '/onboarding/me') {
    const payload = readBody<{
      currentStep?: number;
      selectedExperiences?: string[];
      profile?: JsonObject;
    }>(config);
    if (payload.profile) profile = { ...profile, ...payload.profile };
    const currentStep = payload.currentStep ?? onboarding.currentStep;
    onboarding = {
      ...onboarding,
      status: 'IN_PROGRESS',
      currentStep,
      selectedExperiences: payload.selectedExperiences ?? onboarding.selectedExperiences,
      progress: Math.min(100, Math.round((currentStep / 4) * 100)),
      canResume: true,
    };
    return respond(config, onboarding);
  }
  if (method === 'POST' && path === '/onboarding/me/complete') {
    onboarding = { ...onboarding, status: 'COMPLETED', currentStep: 4, progress: 100, canResume: false };
    return respond(config, onboarding);
  }
  if (method === 'POST' && path === '/onboarding/me/skip') {
    onboarding = { ...onboarding, status: 'SKIPPED', canResume: false };
    return respond(config, onboarding);
  }
  if (method === 'GET' && path === '/profiles/me') return respond(config, profile);
  if (method === 'PATCH' && path === '/profiles/me') {
    const payload = readBody<JsonObject>(config);
    profile = { ...profile, ...payload };
    return respond(config, profile);
  }
  if (method === 'GET' && path === '/sport-modalities') return respond(config, sportModalities);

  if (method === 'GET' && path === '/progress/summary') {
    const activities = activitiesInPeriod(config.params?.period);
    const totals = (items: MockActivity[]) => ({
      activityCount: items.length,
      activeDurationSeconds: items.reduce((total, item) => total + item.activeDurationSeconds, 0),
      distanceMeters: items.reduce((total, item) => total + (item.distanceMeters ?? 0), 0),
      activeDays: new Set(items.map((item) => new Date(item.startedAt).toDateString())).size,
    });
    const types = [...new Set(activities.map((item) => item.type))];
    return respond(config, {
      period: config.params?.period ?? 'MONTHLY',
      timeZone: config.params?.timeZone ?? 'UTC',
      from: periodStart(config.params?.period).toISOString(),
      to: new Date().toISOString(),
      ...totals(activities),
      byType: types.map((type) => ({ type, ...totals(activities.filter((item) => item.type === type)) })),
    });
  }

  if (method === 'GET' && path === '/progress/history') {
    const limit = Number(config.params?.limit ?? 20);
    const page = Number(config.params?.page ?? 1);
    const activities = activitiesInPeriod(config.params?.period);
    return respond(config, {
      items: activities.slice((page - 1) * limit, page * limit),
      total: activities.length,
      page,
      limit,
      totalPages: Math.ceil(activities.length / limit),
    });
  }

  if (method === 'GET' && path === '/workouts') {
    return respond(config, { items: mockWorkouts, total: mockWorkouts.length, page: 1, limit: 20 });
  }

  if (method === 'GET' && path === '/workout-sessions/history') {
    const items = [...mockStrengthSessions].sort((left, right) => right.startedAt.localeCompare(left.startedAt));
    return respond(config, { items, total: items.length, page: 1, limit: 20, totalPages: 1 });
  }

  if (method === 'GET' && path === '/running/statistics') {
    const completed = completedRuns();
    const distanceMeters = completed.reduce((total, run) => total + run.distanceMeters, 0);
    const durationSeconds = completed.reduce((total, run) => total + run.activeDurationSeconds, 0);
    return respond(config, {
      period: 'WEEKLY',
      distanceMeters,
      durationSeconds,
      runs: completed.length,
      averagePaceSecondsKm: distanceMeters
        ? Math.round(durationSeconds / (distanceMeters / 1_000))
        : null,
      goal: { period: 'WEEKLY', targetDistanceMeters: weeklyGoal },
      goalProgress: weeklyGoal ? Math.min(1, distanceMeters / weeklyGoal) : null,
    });
  }

  if (method === 'GET' && path === '/running/history') {
    const items = completedRuns()
      .sort((left, right) => right.startedAt.localeCompare(left.startedAt))
      .slice(0, 5)
      .map(toHistoryItem);
    return respond(config, { items, total: items.length, page: 1, limit: 5 });
  }

  if (method === 'GET' && path === '/running/records') {
    const first = completedRuns()[0];
    return respond(
      config,
      first
        ? [
            {
              distance: 'ONE_K',
              durationSeconds: 342,
              activityId: first.activityId,
              achievedAt: first.endedAt,
            },
            {
              distance: 'FIVE_K',
              durationSeconds: 1_745,
              activityId: first.activityId,
              achievedAt: first.endedAt,
            },
          ]
        : [],
    );
  }

  if (method === 'PUT' && path === '/running/goal') {
    const payload = readBody<{ targetDistanceMeters?: number }>(config);
    weeklyGoal = payload.targetDistanceMeters ?? weeklyGoal;
    return respond(config, { period: 'WEEKLY', targetDistanceMeters: weeklyGoal });
  }

  if (method === 'POST' && path === '/running/sessions') {
    const payload = readBody<{ clientRequestId?: string; startedAt?: string }>(config);
    const existing = [...runs.values()].find(
      (run) => run.clientRequestId === payload.clientRequestId,
    );
    if (existing) return respond(config, existing);
    const id = `mock-run-${Date.now()}`;
    const run: MockRun = {
      id,
      clientRequestId: payload.clientRequestId ?? id,
      activityId: null,
      name: null,
      status: 'ACTIVE',
      startedAt: payload.startedAt ?? new Date().toISOString(),
      endedAt: null,
      activeDurationSeconds: 0,
      distanceMeters: 0,
      averagePaceSecondsKm: null,
      pauses: [],
      points: [],
      splits: [],
      achievedRecords: [],
    };
    runs.set(id, run);
    return respond(config, run, 201);
  }

  if (method === 'GET' && path === '/running/sessions/active') {
    return respond(
      config,
      [...runs.values()].find((run) => run.status === 'ACTIVE' || run.status === 'PAUSED') ?? null,
    );
  }

  const pointsMatch = path.match(/^\/running\/sessions\/([^/]+)\/points$/);
  if (method === 'POST' && pointsMatch) {
    const run = requireRun(config, pointsMatch[1]);
    const payload = readBody<{ points?: MockPoint[] }>(config);
    const incoming = payload.points ?? [];
    const known = new Set(run.points.map((point) => point.clientPointId));
    const accepted = incoming.filter((point) => !known.has(point.clientPointId));
    run.points.push(...accepted);
    updateRunMetrics(run);
    return respond(config, {
      accepted: accepted.length,
      duplicates: incoming.length - accepted.length,
      rejected: 0,
    });
  }

  const actionMatch = path.match(/^\/running\/sessions\/([^/]+)\/(pause|resume|finish)$/);
  if (method === 'POST' && actionMatch) {
    const run = requireRun(config, actionMatch[1]);
    const action = actionMatch[2];
    const payload = readBody<{ at?: string; endedAt?: string; name?: string }>(config);
    if (action === 'pause') {
      run.status = 'PAUSED';
      run.pauses.push({ pausedAt: payload.at ?? new Date().toISOString(), resumedAt: null });
      return respond(config, run);
    }
    if (action === 'resume') {
      run.status = 'ACTIVE';
      const pause = [...run.pauses].reverse().find((item) => item.resumedAt === null);
      if (pause) pause.resumedAt = payload.at ?? new Date().toISOString();
      return respond(config, run);
    }
    run.status = 'COMPLETED';
    run.name = payload.name?.trim() || 'Corrida';
    run.endedAt = payload.endedAt ?? new Date().toISOString();
    run.activityId = `mock-activity-${run.id}`;
    updateRunMetrics(run);
    return respond(config, run);
  }

  const sessionMatch = path.match(/^\/running\/sessions\/([^/]+)$/);
  if (method === 'GET' && sessionMatch) return respond(config, requireRun(config, sessionMatch[1]));
  if (method === 'DELETE' && sessionMatch) {
    runs.delete(sessionMatch[1]);
    return respond(config, undefined, 204);
  }

  const activityMatch = path.match(/^\/running\/activities\/([^/]+)$/);
  if (method === 'PATCH' && activityMatch) {
    const payload = readBody<{ name?: string }>(config);
    const run = [...runs.values()].find((item) => item.activityId === activityMatch[1]);
    if (run && payload.name?.trim()) run.name = payload.name.trim();
    return respond(config, run ?? null);
  }

  return reject(config, 404, `Mock route not implemented: ${method} ${path}`);
};

function normalizePath(url?: string) {
  const pathname = new URL(url ?? '/', 'http://vyra.mock').pathname;
  return pathname.replace(/^\/api\/v1/, '') || '/';
}

function readBody<T>(config: InternalAxiosRequestConfig): T {
  if (typeof config.data === 'string') return JSON.parse(config.data) as T;
  return (config.data ?? {}) as T;
}

function respond<T>(
  config: InternalAxiosRequestConfig,
  data: T,
  status = 200,
): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status === 204 ? 'No Content' : 'OK',
    headers: new AxiosHeaders(),
    config,
  };
}

function reject(
  config: InternalAxiosRequestConfig,
  status: number,
  message: string,
): never {
  const response = respond(config, { statusCode: status, message }, status);
  throw new AxiosError(message, AxiosError.ERR_BAD_REQUEST, config, undefined, response);
}

function createTokens() {
  return {
    accessToken: `mock-access-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
  };
}

function createSession() {
  return { user, ...createTokens() };
}

function requireRun(config: InternalAxiosRequestConfig, id: string) {
  const run = runs.get(id);
  if (!run) return reject(config, 404, 'Mock running session not found');
  return run;
}

/** Início do período corrente no fuso do aparelho; a semana começa na segunda, como no backend. */
function periodStart(period?: string) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (period === 'WEEKLY') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  else if (period === 'YEARLY') start.setMonth(0, 1);
  else start.setDate(1);
  return start;
}

function activitiesInPeriod(period?: string): MockActivity[] {
  const from = periodStart(period).getTime();
  const runningActivities: MockActivity[] = completedRuns().map((run) => ({
    id: run.activityId ?? run.id,
    type: 'RUNNING',
    name: run.name ?? 'Corrida',
    startedAt: run.startedAt,
    endedAt: run.endedAt ?? run.startedAt,
    activeDurationSeconds: run.activeDurationSeconds,
    distanceMeters: run.distanceMeters,
    averagePaceSecondsKm: run.averagePaceSecondsKm,
  }));
  const strengthActivities: MockActivity[] = mockStrengthSessions.map((session) => ({
    id: session.activityId,
    type: 'STRENGTH_TRAINING',
    name: session.workoutName,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    activeDurationSeconds: session.activeDurationSeconds,
    distanceMeters: null,
    averagePaceSecondsKm: null,
  }));
  return [...runningActivities, ...strengthActivities]
    .filter((activity) => Date.parse(activity.startedAt) >= from)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

function completedRuns() {
  return [...runs.values()].filter((run) => run.status === 'COMPLETED');
}

function toHistoryItem(run: MockRun) {
  return {
    id: run.id,
    activityId: run.activityId,
    name: run.name ?? 'Corrida',
    startedAt: run.startedAt,
    endedAt: run.endedAt,
    activeDurationSeconds: run.activeDurationSeconds,
    distanceMeters: run.distanceMeters,
    averagePaceSecondsKm: run.averagePaceSecondsKm,
  };
}

function updateRunMetrics(run: MockRun) {
  run.distanceMeters = Math.round(calculateDistance(run.points));
  if (run.endedAt) {
    const elapsed = Math.max(
      1,
      Math.round((Date.parse(run.endedAt) - Date.parse(run.startedAt)) / 1_000),
    );
    run.activeDurationSeconds = elapsed;
  }
  run.averagePaceSecondsKm = run.distanceMeters
    ? Math.round(run.activeDurationSeconds / (run.distanceMeters / 1_000))
    : null;
  const completeKilometers = Math.floor(run.distanceMeters / 1_000);
  run.splits = Array.from({ length: completeKilometers }, (_, index) => ({
    kilometer: index + 1,
    durationSeconds: run.averagePaceSecondsKm ?? 0,
    paceSecondsKm: run.averagePaceSecondsKm ?? 0,
  }));
}

function calculateDistance(points: MockPoint[]) {
  let total = 0;
  for (let index = 1; index < points.length; index += 1) {
    total += haversine(points[index - 1], points[index]);
  }
  return total;
}

function haversine(left: MockPoint, right: MockPoint) {
  const earthRadius = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(right.latitude - left.latitude);
  const longitudeDelta = toRadians(right.longitude - left.longitude);
  const leftLatitude = toRadians(left.latitude);
  const rightLatitude = toRadians(right.latitude);
  const value =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(leftLatitude) * Math.cos(rightLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function seedRuns() {
  const seeds = [
    ['mock-run-1', 'Corrida no parque', 5_240, 1_842, 2],
    ['mock-run-2', 'Treino leve', 3_180, 1_170, 4],
    ['mock-run-3', 'Longão de domingo', 8_100, 3_030, 6],
  ] as const;
  for (const [id, name, distanceMeters, durationSeconds, daysAgo] of seeds) {
    const endedAt = new Date(Date.now() - daysAgo * 86_400_000);
    const startedAt = new Date(endedAt.getTime() - durationSeconds * 1_000);
    runs.set(id, {
      id,
      clientRequestId: id,
      activityId: `mock-activity-${id}`,
      name,
      status: 'COMPLETED',
      startedAt: startedAt.toISOString(),
      endedAt: endedAt.toISOString(),
      activeDurationSeconds: durationSeconds,
      distanceMeters,
      averagePaceSecondsKm: Math.round(durationSeconds / (distanceMeters / 1_000)),
      pauses: [],
      points: [],
      splits: Array.from({ length: Math.floor(distanceMeters / 1_000) }, (_, index) => ({
        kilometer: index + 1,
        durationSeconds: Math.round(durationSeconds / (distanceMeters / 1_000)),
        paceSecondsKm: Math.round(durationSeconds / (distanceMeters / 1_000)),
      })),
      achievedRecords: [],
    });
  }
}
