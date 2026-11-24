import Activity from 'lucide-react-native/icons/activity';
import Bike from 'lucide-react-native/icons/bike';
import CircleDashed from 'lucide-react-native/icons/circle-dashed';
import CircleDot from 'lucide-react-native/icons/circle-dot';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import EighthNotes from 'lucide-react-native/icons/eighth-notes';
import Flame from 'lucide-react-native/icons/flame';
import Flower2 from 'lucide-react-native/icons/flower-2';
import Footprints from 'lucide-react-native/icons/footprints';
import PersonStanding from 'lucide-react-native/icons/person-standing';
import Shield from 'lucide-react-native/icons/shield';
import Swords from 'lucide-react-native/icons/swords';
import Trophy from 'lucide-react-native/icons/trophy';
import Volleyball from 'lucide-react-native/icons/volleyball';
import WavesHorizontal from 'lucide-react-native/icons/waves-horizontal';
import type { LucideIcon } from 'lucide-react-native';

/** Ícones por slug do catálogo `GET /sport-modalities`, usados no onboarding e em Esportes. */
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
