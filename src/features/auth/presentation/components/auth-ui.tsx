import type { ReactNode } from 'react';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';

import type { FederatedProvider } from '@/features/auth/types/auth.types';
import { authColors } from '@/theme';

export function AuthDivider({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-3">
      <View className="h-px flex-1 bg-auth-border" />
      <Text className="text-[11px] text-auth-muted" maxFontSizeMultiplier={1.05}>
        {label}
      </Text>
      <View className="h-px flex-1 bg-auth-border" />
    </View>
  );
}

export function SocialButtons({
  appleAvailable,
  onPress,
  pending,
}: {
  appleAvailable: boolean;
  onPress: (provider: FederatedProvider) => void;
  pending: FederatedProvider | null;
}) {
  return (
    <View className="flex-row gap-3">
      <SocialButton
        disabled={pending !== null}
        iconSource={require('../../../../../assets/images/tabIcons/google.webp')}
        label="Google"
        loading={pending === 'google'}
        onPress={() => onPress('google')}
      />
      {appleAvailable ? (
        <SocialButton
          disabled={pending !== null}
          iconSource={require('../../../../../assets/images/tabIcons/apple.webp')}
          label="Apple"
          loading={pending === 'apple'}
          onPress={() => onPress('apple')}
        />
      ) : null}
    </View>
  );
}

function SocialButton({
  disabled,
  iconSource,
  label,
  loading,
  onPress,
}: {
  disabled: boolean;
  iconSource: number;
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled }}
      className="h-[50px] flex-1 flex-row items-center justify-center gap-2.5 rounded-[20px] border border-auth-border bg-auth-surface active:bg-auth-pressed disabled:opacity-60"
      disabled={disabled}
      onPress={onPress}>
      {loading ? (
        <ActivityIndicator color={authColors.text} size="small" />
      ) : (
        <Image className="h-5 w-5" resizeMode="contain" source={iconSource} />
      )}
      <Text className="text-sm font-bold text-auth-text" maxFontSizeMultiplier={1.05}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Checkbox({
  checked,
  label,
  onPress,
}: {
  checked: boolean;
  label: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      className="flex-1 flex-row items-start gap-2.5 active:opacity-75"
      onPress={onPress}>
      <View
        className={[
          'mt-px h-[18px] w-[18px] items-center justify-center rounded-full border',
          checked ? 'border-auth-primary bg-auth-primary' : 'border-auth-border',
        ].join(' ')}>
        {checked ? (
          <View className="h-1 w-2 rotate-[-45deg] border-b-2 border-l-2 border-auth-text" />
        ) : null}
      </View>
      <Text
        className="flex-1 text-xs leading-[18px] text-auth-muted"
        maxFontSizeMultiplier={1.05}>
        {label}
      </Text>
    </Pressable>
  );
}

