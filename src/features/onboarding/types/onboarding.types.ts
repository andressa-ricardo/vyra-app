export type OnboardingStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';

export const onboardingExperiences = [
  'PERSONAL_FITNESS',
  'TRAINER',
  'NUTRITIONIST',
  'GYM_MANAGEMENT',
] as const;
export type OnboardingExperience = (typeof onboardingExperiences)[number];

export const primaryGoals = [
  'BUILD_MUSCLE',
  'LOSE_FAT',
  'IMPROVE_ENDURANCE',
  'GENERAL_FITNESS',
  'MAINTAIN_HEALTH',
  'IMPROVE_SPORT_PERFORMANCE',
  'BUILD_HEALTHY_ROUTINE',
  'IMPROVE_MOBILITY',
  'TRACK_PROGRESS',
  'EXPLORE_APP',
] as const;
export type PrimaryGoal = (typeof primaryGoals)[number];

export const fitnessLevels = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const;
export type FitnessLevel = (typeof fitnessLevels)[number];

/** Total de etapas contadas pelo backend (`ONBOARDING_TOTAL_STEPS`). */
export const ONBOARDING_TOTAL_STEPS = 4;

export type OnboardingView = {
  status: OnboardingStatus;
  currentStep: number;
  selectedExperiences: OnboardingExperience[];
  progress: number;
  canResume: boolean;
};

export type SportModality = {
  id: string;
  slug: string;
  name: string;
  category: string;
  sortOrder: number;
};

/** `GET /profiles/me`. Campos decimais chegam como string. */
export type Profile = {
  displayName: string | null;
  birthDate: string | null;
  heightCm: string | number | null;
  currentWeightKg: string | number | null;
  fitnessLevel: FitnessLevel | null;
  primaryGoal: PrimaryGoal | null;
  sportModalityIds: string[];
};

export type ProfileUpdate = {
  displayName?: string | null;
  birthDate?: string | null;
  heightCm?: number | null;
  currentWeightKg?: number | null;
  fitnessLevel?: FitnessLevel | null;
  primaryGoal?: PrimaryGoal | null;
  sportModalityIds?: string[];
};

export type OnboardingUpdate = {
  currentStep?: number;
  selectedExperiences?: OnboardingExperience[];
  profile?: ProfileUpdate;
};
