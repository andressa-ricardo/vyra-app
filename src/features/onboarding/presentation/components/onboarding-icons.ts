import Activity from 'lucide-react-native/icons/activity';
import Apple from 'lucide-react-native/icons/apple';
import Bike from 'lucide-react-native/icons/bike';
import BuildingComplex from 'lucide-react-native/icons/building-complex';
import CalendarCheck from 'lucide-react-native/icons/calendar-check';
import CircleDashed from 'lucide-react-native/icons/circle-dashed';
import CircleDot from 'lucide-react-native/icons/circle-dot';
import Compass from 'lucide-react-native/icons/compass';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Flame from 'lucide-react-native/icons/flame';
import Flower2 from 'lucide-react-native/icons/flower-2';
import Footprints from 'lucide-react-native/icons/footprints';
import Heart from 'lucide-react-native/icons/heart';
import HeartPulse from 'lucide-react-native/icons/heart-pulse';
import EighthNotes from 'lucide-react-native/icons/eighth-notes';
import PersonStanding from 'lucide-react-native/icons/person-standing';
import Shield from 'lucide-react-native/icons/shield';
import Swords from 'lucide-react-native/icons/swords';
import TrendingUp from 'lucide-react-native/icons/trending-up';
import Trophy from 'lucide-react-native/icons/trophy';
import Volleyball from 'lucide-react-native/icons/volleyball';
import WavesHorizontal from 'lucide-react-native/icons/waves-horizontal';
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

const modalityIcons: Record<string, LucideIcon> = {
  'strength-training': Dumbbell,
  running: Footprints,
  walking: PersonStanding,
  calisthenics: Activity,
  cycling: Bike,
  swimming: WavesHorizontal,
  pilates: CircleDot,
  yoga: Flower2,
  crossfit: Flame,
  'jiu-jitsu': Shield,
  'other-martial-arts': Swords,
  dance: EighthNotes,
  football: CircleDashed,
  basketball: Volleyball,
  'other-sports': Trophy,
};

/** Modalidades novas no catálogo do backend recebem um ícone genérico. */
export function getModalityIcon(slug: string): LucideIcon {
  return modalityIcons[slug] ?? Trophy;
}
