import { Text, View } from 'react-native';

export function FormMessage({ message }: { message: string }) {
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      className="rounded-xl border border-auth-danger bg-auth-surface p-3">
      <Text className="text-[13px] leading-[18px] text-auth-text" maxFontSizeMultiplier={1.05}>
        {message}
      </Text>
    </View>
  );
}
