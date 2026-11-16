import Bike from 'lucide-react-native/icons/bike';
import Dumbbell from 'lucide-react-native/icons/dumbbell';
import Flame from 'lucide-react-native/icons/flame';
import Footprints from 'lucide-react-native/icons/footprints';
import Route from 'lucide-react-native/icons/route';
import SportShoe from 'lucide-react-native/icons/sport-shoe';
import Sunrise from 'lucide-react-native/icons/sunrise';
import Trophy from 'lucide-react-native/icons/trophy';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { Achievement } from '@/features/account/types/profile.types';
import { authColors, metricColors } from '@/theme';

const icons: Record<Achievement['icon'], LucideIcon> = {
  bike: Bike,
  dumbbell: Dumbbell,
  flame: Flame,
  route: Route,
  shoe: SportShoe,
  steps: Footprints,
  sun: Sunrise,
  trophy: Trophy,
};

const rarityColors: Record<Achievement['rarity'], string> = {
  common: authColors.muted,
  rare: authColors.primary,
  legendary: metricColors.warning,
};

export function AchievementBadge({
  achievement,
  compact = false,
}: {
  achievement: Achievement;
  compact?: boolean;
}) {
  const { t } = useTranslation();
  const Icon = icons[achievement.icon];
  const color = rarityColors[achievement.rarity];
  const locked = achievement.state === 'locked';

  return (
    <View
      className={[
        'flex-1 items-center rounded-[20px] border border-auth-border bg-auth-surface px-2',
        compact ? 'min-h-[156px] py-3' : 'min-h-[238px] justify-center py-5',
        locked ? 'opacity-45' : '',
      ].join(' ')}>
      <View className={compact ? 'mb-3 h-[70px] w-[70px] items-center' : 'mb-5 h-[96px] w-[96px] items-center'}>
        <View className="absolute top-0 h-8 w-4 -rotate-12 bg-auth-primary/70" />
        <View className="absolute top-0 h-8 w-4 translate-x-3 rotate-12 bg-auth-primary/70" />
        <View
          className={[
            'absolute bottom-0 items-center justify-center rounded-full border-[3px] bg-auth-pressed',
            compact ? 'h-[58px] w-[58px]' : 'h-[78px] w-[78px]',
          ].join(' ')}
          style={{ borderColor: color }}>
          <Icon color={color} size={compact ? 29 : 39} strokeWidth={1.8} />
        </View>
      </View>

      <Text
        className="text-center text-[12px] font-extrabold text-auth-text"
        maxFontSizeMultiplier={1.05}
        numberOfLines={2}>
        {t(`profile.achievements.items.${achievement.id}.title`)}
      </Text>
      <Text
        className="mt-2 text-center text-[10px]"
        maxFontSizeMultiplier={1.05}
        style={{ color }}>
        {t(`profile.achievements.rarity.${achievement.rarity}`)}
      </Text>
      {!compact ? (
        <>
          <Text
            className="mt-2 text-center text-[11px] leading-4 text-auth-muted"
            maxFontSizeMultiplier={1.05}
            numberOfLines={3}>
            {t(`profile.achievements.items.${achievement.id}.description`)}
          </Text>
          <Text
            className={[
              'mt-3 text-[10px] font-semibold',
              locked ? 'text-auth-placeholder' : 'text-auth-success',
            ].join(' ')}
            maxFontSizeMultiplier={1.05}>
            {locked
              ? t('profile.achievements.locked')
              : t('profile.achievements.unlocked')}
          </Text>
        </>
      ) : null}
    </View>
  );
}
