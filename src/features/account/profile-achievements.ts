import type { Achievement } from '@/features/account/types/profile.types';

export const profileAchievements: Achievement[] = [
  { id: 'firstKm', category: 'running', rarity: 'common', state: 'unlocked', icon: 'shoe' },
  { id: 'earlyBird', category: 'walking', rarity: 'common', state: 'unlocked', icon: 'sun' },
  { id: 'firstSteps', category: 'walking', rarity: 'common', state: 'unlocked', icon: 'steps' },
  { id: 'firstSet', category: 'strength', rarity: 'common', state: 'unlocked', icon: 'dumbbell' },
  { id: 'tenKClub', category: 'running', rarity: 'rare', state: 'unlocked', icon: 'route' },
  { id: 'firstRide', category: 'cycling', rarity: 'common', state: 'unlocked', icon: 'bike' },
  { id: 'sevenDayStreak', category: 'running', rarity: 'rare', state: 'unlocked', icon: 'flame' },
  { id: 'marathoner', category: 'running', rarity: 'legendary', state: 'unlocked', icon: 'trophy' },
  { id: 'fiftyKm', category: 'running', rarity: 'rare', state: 'locked', icon: 'route' },
  { id: 'centuryRide', category: 'cycling', rarity: 'legendary', state: 'locked', icon: 'bike' },
];
