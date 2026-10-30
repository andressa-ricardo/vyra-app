import {
  Activity,
  Apple,
  Bike,
  Building2,
  CalendarCheck,
  CircleDashed,
  CircleDot,
  Compass,
  Dumbbell,
  Flame,
  Flower2,
  Footprints,
  Heart,
  HeartPulse,
  Music,
  PersonStanding,
  Shield,
  Swords,
  TrendingUp,
  Trophy,
  Volleyball,
  Waves,
  type LucideIcon,
} from 'lucide-react-native';

import type { OnboardingExperience, PrimaryGoal } from '../../types/onboarding.types';

export const experienceIcons: Record<OnboardingExperience, LucideIcon> = {
  PERSONAL_FITNESS: Activity,
  TRAINER: Dumbbell,
  NUTRITIONIST: Apple,
  GYM_MANAGEMENT: Building2,
};

export const goalIcons: Record<PrimaryGoal, LucideIcon> = {
  BUILD_MUSCLE: Dumbbell,
  LOSE_FAT: Flame,
  IMPROVE_ENDURANCE: HeartPulse,
  GENERAL_FITNESS: Activity,
  MAINTAIN_HEALTH: Heart,
  IMPROVE_SPORT_PERFORMANCE: Trophy,
  BUILD_HEALTHY_ROUTINE: CalendarCheck,
  IMPROVE_MOBILITY: PersonStanding,
  TRACK_PROGRESS: TrendingUp,
  EXPLORE_APP: Compass,
};

const modalityIcons: Record<string, LucideIcon> = {
  'strength-training': Dumbbell,
  running: Footprints,
  walking: PersonStanding,
  calisthenics: Activity,
  cycling: Bike,
  swimming: Waves,
  pilates: CircleDot,
  yoga: Flower2,
  crossfit: Flame,
  'jiu-jitsu': Shield,
  'other-martial-arts': Swords,
  dance: Music,
  football: CircleDashed,
  basketball: Volleyball,
  'other-sports': Trophy,
};

/** Modalidades novas no catálogo do backend recebem um ícone genérico. */
export function getModalityIcon(slug: string): LucideIcon {
  return modalityIcons[slug] ?? Trophy;
}
