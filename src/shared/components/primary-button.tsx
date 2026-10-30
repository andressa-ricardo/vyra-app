import { ActivityIndicator, Pressable, Text } from 'react-native';

import { authColors } from '@/theme';

export function PrimaryButton({
  disabled = false,
  label,
  loading = false,
  onPress,
}: {
  disabled?: boolean;
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  const inactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: inactive }}
      className="h-[50px] items-center justify-center rounded-[22px] bg-auth-primary active:opacity-75 disabled:opacity-50"
      disabled={inactive}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={authColors.text} />
      ) : (
        <Text className="text-sm font-bold text-auth-text" maxFontSizeMultiplier={1.05}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
