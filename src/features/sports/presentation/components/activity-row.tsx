import ChevronRight from 'lucide-react-native/icons/chevron-right';
import type { LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useActivityFormat } from '@/features/sports/presentation/hooks/use-activity-format';
import type { SampleActivity } from '@/features/sports/sample-data';
import { getModalityIcon } from '@/shared/utils/modality-icons';
import { authColors } from '@/theme';

export function IconBadge({ Icon, square = false }: { Icon: LucideIcon; square?: boolean }) {
  return (
    <View
      className={`h-9 w-9 items-center justify-center bg-[#183A70] ${square ? 'rounded-xl' : 'rounded-full'}`}>
      <Icon color={authColors.primary} size={17} strokeWidth={1.8} />
    </View>
  );
}

export function ActivityRow({ activity, onPress }: { activity: SampleActivity; onPress: () => void }) {
  const { t } = useTranslation();
  const format = useActivityFormat();

  return (
    <Pressable
      accessibilityRole="button"
      className="min-h-[72px] flex-row items-center rounded-[18px] border border-auth-border bg-auth-surface px-3.5 py-3 active:bg-auth-pressed"
      onPress={onPress}>
      <IconBadge Icon={getModalityIcon(activity.sport)} />
      <View className="ml-3 flex-1 pr-2">
        <Text className="text-[14px] font-bold text-auth-text" maxFontSizeMultiplier={1.1}>
          {t(`sports.recent.names.${activity.name}`)}
        </Text>
        <Text className="mt-0.5 text-[12px] text-auth-muted">{format.details(activity)}</Text>
        <Text className="mt-0.5 text-[11px] text-auth-muted">{format.when(activity)}</Text>
      </View>
      <ChevronRight color={authColors.muted} size={17} strokeWidth={1.8} />
    </Pressable>
  );
}
