import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View, type TextInputProps } from 'react-native';

import { authColors } from '@/theme';

type TextFieldProps = TextInputProps & {
  error?: string;
  label: string;
  password?: boolean;
};

export function TextField({
  error,
  label,
  onBlur,
  onFocus,
  password = false,
  ...props
}: TextFieldProps) {
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
