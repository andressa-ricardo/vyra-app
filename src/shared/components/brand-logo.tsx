import { Text, View } from 'react-native';

export function BrandLogo() {
  return (
    <View accessibilityLabel="VYRA" className="flex-row items-center gap-3">
      <View className="h-7 w-7">
        <View className="absolute left-[7px] top-px h-[25px] w-[3px] rotate-[-31deg] rounded-sm bg-auth-primary" />
        <View className="absolute right-[7px] top-px h-[25px] w-[3px] rotate-[31deg] rounded-sm bg-auth-primary" />
      </View>
      <Text
        className="text-[22px] font-extrabold tracking-[5px] text-auth-text"
        maxFontSizeMultiplier={1.05}>
        VYRA
      </Text>
    </View>
  );
}
