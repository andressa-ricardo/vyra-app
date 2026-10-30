import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { authColors } from '@/theme';

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

export function AuthBackButton({ onPress }: { onPress: () => void }) {
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

type AuthTextFieldProps = TextInputProps & {
  error?: string;
  label: string;
  password?: boolean;
};

export function AuthTextField({
  error,
  label,
  onBlur,
  onFocus,
  password = false,
  ...props
}: AuthTextFieldProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <View className="gap-1.5">
      <Text className="text-xs font-medium text-auth-muted" maxFontSizeMultiplier={1.05}>
        {label}
      </Text>
      <View
        className={[
          'h-[48px] flex-row items-center rounded-[22px] border bg-auth-surface px-4',
          error ? 'border-auth-danger' : focused ? 'border-auth-primary' : 'border-auth-border',
        ].join(' ')}>
        <TextInput
          {...props}
          accessibilityLabel={label}
          className="h-full flex-1 p-0 text-[14px] text-auth-text"
          maxFontSizeMultiplier={1.05}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          placeholderTextColor={authColors.placeholder}
          secureTextEntry={password && !passwordVisible}
          selectionColor={authColors.primary}
        />
        {password ? (
          <Pressable
            accessibilityLabel={
              passwordVisible ? t('common.hidePassword') : t('common.showPassword')
            }
            accessibilityRole="button"
            className="ml-2 p-1 active:opacity-70"
            hitSlop={10}
            onPress={() => setPasswordVisible((current) => !current)}>
            <EyeIcon crossed={passwordVisible} />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text
          accessibilityLiveRegion="polite"
          className="text-[11px] leading-4 text-auth-danger"
          maxFontSizeMultiplier={1.05}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  loading = false,
  onPress,
}: {
  label: string;
  loading?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: loading }}
      className="h-[50px] items-center justify-center rounded-[22px] bg-auth-primary active:opacity-75 disabled:opacity-70"
      disabled={loading}
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

export function SocialButtons({ onPress }: { onPress: () => void }) {
  return (
    <View className="flex-row gap-3">
      <SocialButton
        iconSource={require('../../../../../assets/images/tabIcons/google.webp')}
        label="Google"
        onPress={onPress}
      />
      <SocialButton
        iconSource={require('../../../../../assets/images/tabIcons/apple.webp')}
        label="Apple"
        onPress={onPress}
      />
    </View>
  );
}

function SocialButton({
  iconSource,
  label,
  onPress,
}: {
  iconSource: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      className="h-[50px] flex-1 flex-row items-center justify-center gap-2.5 rounded-[20px] border border-auth-border bg-auth-surface active:bg-auth-pressed"
      onPress={onPress}>
      <Image className="h-5 w-5" resizeMode="contain" source={iconSource} />
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

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <View className="h-3 w-[18px] items-center justify-center rounded-[10px] border-2 border-auth-placeholder">
      <View className="h-1 w-1 rounded-full bg-auth-placeholder" />
      {crossed ? (
        <View className="absolute h-[1.5px] w-[22px] rotate-[-40deg] bg-auth-placeholder" />
      ) : null}
    </View>
  );
}
