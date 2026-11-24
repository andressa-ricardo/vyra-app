import Activity from 'lucide-react-native/icons/activity';
import Apple from 'lucide-react-native/icons/apple';
import BuildingComplex from 'lucide-react-native/icons/building-complex';
import CalendarCheck from 'lucide-react-native/icons/calendar-check';
import Compass from 'lucide-react-native/icons/compass';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Flame from 'lucide-react-native/icons/flame';
import Heart from 'lucide-react-native/icons/heart';
import HeartPulse from 'lucide-react-native/icons/heart-pulse';
import PersonStanding from 'lucide-react-native/icons/person-standing';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import Trophy from 'lucide-react-native/icons/trophy';
import type { LucideIcon } from 'lucide-react-native';

import type { OnboardingExperience, PrimaryGoal } from '../../types/onboarding.types';

export const experienceIcons: Record<OnboardingExperience, LucideIcon> = {
  PERSONAL_FITNESS: Activity,
  TRAINER: Dumbbell,
  NUTRITIONIST: Apple,
  GYM_MANAGEMENT: BuildingComplex,
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
