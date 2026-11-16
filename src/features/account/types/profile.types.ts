export type AccountProfile = {
  displayName: string | null;
  avatarUrl: string | null;
};

export type AccountProfileDraft = {
  displayName: string;
};

export type AchievementCategory = 'all' | 'running' | 'strength' | 'cycling' | 'walking';
export type AchievementState = 'unlocked' | 'locked';

export type Achievement = {
  id: string;
  category: Exclude<AchievementCategory, 'all'>;
  rarity: 'common' | 'rare' | 'legendary';
  state: AchievementState;
  icon: 'shoe' | 'sun' | 'steps' | 'dumbbell' | 'bike' | 'flame' | 'trophy' | 'route';
};
