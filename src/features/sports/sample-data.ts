// Dados de exemplo até existir um contrato de atividades multiesporte no backend
// (hoje `/progress/history` só cobre RUNNING e STRENGTH_TRAINING).

export const weeklySummary = { activities: 5, durationMinutes: 222, goalActivities: 6 };

export type SampleActivity = {
  daysAgo: number;
  distanceMeters?: number;
  durationSeconds?: number;
  id: string;
  name: 'morningRun' | 'upperBody' | 'sundayRide' | 'eveningWalk' | 'poolSession';
  /** Slug do catálogo `GET /sport-modalities`. */
  sport: string;
  time: [hours: number, minutes: number];
};

export const sampleActivities: SampleActivity[] = [
  { id: '1', name: 'morningRun', sport: 'running', daysAgo: 0, time: [7, 12], distanceMeters: 8_040, durationSeconds: 2_652 },
  { id: '2', name: 'upperBody', sport: 'strength-training', daysAgo: 1, time: [18, 30], durationSeconds: 3_120 },
  { id: '3', name: 'sundayRide', sport: 'cycling', daysAgo: 2, time: [8, 0], distanceMeters: 18_600 },
  { id: '4', name: 'eveningWalk', sport: 'walking', daysAgo: 3, time: [19, 15], distanceMeters: 3_200 },
  { id: '5', name: 'poolSession', sport: 'swimming', daysAgo: 4, time: [6, 30], distanceMeters: 1_200 },
];
