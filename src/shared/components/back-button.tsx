import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

export function BackButton({ onPress }: { onPress: () => void }) {
  const { t } = useTranslation();

  return (
    <Pressable
      accessibilityLabel={t('common.back')}
      accessibilityRole="button"
      className="h-9 w-9 justify-center active:opacity-70"
      hitSlop={12}
      onPress={onPress}>
      <View className="ml-[5px] h-[11px] w-[11px] rotate-45 border-b-2 border-l-2 border-auth-text" />
    </Pressable>
  );
}
