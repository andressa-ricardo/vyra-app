import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AuthBackButton,
  AuthDivider,
  AuthTextField,
  Checkbox,
  PrimaryButton,
  SocialButtons,
} from '@/features/auth/presentation/components/auth-ui';

export function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const showUnavailable = () => Alert.alert(t('common.comingSoon'), t('auth.login.unavailable'));

  return (
    <SafeAreaView className="flex-1 bg-auth-bg">
      {/* Android é edge-to-edge: a janela não redimensiona, então "padding" vale para as duas plataformas. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerClassName="w-full max-w-[520px] grow self-center gap-6 px-6 pb-6 pt-1"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AuthBackButton onPress={() => router.replace('/')} />

          <View className="gap-2">
            <Text
              className="text-[26px] font-extrabold leading-[32px] tracking-[-0.5px] text-auth-text"
              maxFontSizeMultiplier={1.05}>
              {t('auth.login.title')}
            </Text>
            <Text className="text-sm leading-5 text-auth-muted" maxFontSizeMultiplier={1.05}>
              {t('auth.login.description')}
            </Text>
          </View>

          <View className="gap-4">
            <AuthTextField
              autoCapitalize="none"
              autoComplete="email"
              inputMode="email"
              keyboardType="email-address"
              label={t('auth.register.email')}
              onChangeText={setEmail}
              placeholder={t('auth.register.emailPlaceholder')}
              returnKeyType="next"
              textContentType="emailAddress"
              value={email}
            />
            <AuthTextField
              autoCapitalize="none"
              autoComplete="current-password"
              label={t('auth.register.password')}
              onChangeText={setPassword}
              onSubmitEditing={showUnavailable}
              password
              placeholder="••••••••"
              returnKeyType="done"
              textContentType="password"
              value={password}
            />

            <View className="flex-row items-center justify-between gap-3">
              <Checkbox
                checked={rememberMe}
                label={t('auth.login.rememberMe')}
                onPress={() => setRememberMe((current) => !current)}
              />
              <Pressable
                accessibilityRole="button"
                className="active:opacity-70"
                hitSlop={8}
                onPress={showUnavailable}>
                <Text className="text-xs text-auth-primary" maxFontSizeMultiplier={1.05}>
                  {t('auth.login.forgotPassword')}
                </Text>
              </Pressable>
            </View>

            <View className="mt-1">
              <PrimaryButton label={t('auth.login.submit')} onPress={showUnavailable} />
            </View>
          </View>

          <AuthDivider label={t('auth.login.continueWith')} />
          <SocialButtons onPress={showUnavailable} />

          <View className="mt-auto flex-row items-center justify-center pt-2">
            <Text className="text-sm text-auth-muted" maxFontSizeMultiplier={1.05}>
              {t('auth.login.noAccount')}{' '}
            </Text>
            <Pressable
              accessibilityRole="link"
              className="active:opacity-70"
              hitSlop={8}
              onPress={() => router.replace('/register')}>
              <Text className="text-sm font-semibold text-auth-primary" maxFontSizeMultiplier={1.05}>
                {t('auth.welcome.createAccount')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
