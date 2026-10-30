import { router } from 'expo-router';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useRegister } from '@/features/auth/hooks/use-register';
import { AuthBackButton } from '@/features/auth/presentation/components/auth-ui';
import { RegisterForm } from '@/features/auth/presentation/components/register-form';
import type { RegisterFormValues } from '@/features/auth/schemas/register.schema';

export function RegisterScreen() {
  const { t } = useTranslation();
  const { status, messageKey, submit } = useRegister();

  const handleSubmit = ({
    acceptTerms: _acceptTerms,
    confirmPassword: _confirmPassword,
    ...payload
  }: RegisterFormValues) => submit(payload);

  const showUnavailable = () =>
    Alert.alert(t('common.comingSoon'), t('auth.socialUnavailable'));

  return (
    <SafeAreaView className="flex-1 bg-auth-bg">
      {/* Android é edge-to-edge: a janela não redimensiona, então "padding" vale para as duas plataformas. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          contentContainerClassName="w-full max-w-[520px] grow self-center gap-5 px-6 pb-6 pt-1"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <AuthBackButton onPress={() => router.replace('/')} />

          <View className="gap-2">
            <Text
              className="text-[26px] font-extrabold leading-[32px] tracking-[-0.5px] text-auth-text"
              maxFontSizeMultiplier={1.05}>
              {t('auth.register.title')}
            </Text>
            <Text className="text-sm leading-5 text-auth-muted" maxFontSizeMultiplier={1.05}>
              {t('auth.register.shortDescription')}
            </Text>
          </View>

          {messageKey ? (
            <View
              accessibilityLiveRegion="polite"
              className={[
                'rounded-xl border bg-auth-surface p-3',
                status === 'success' ? 'border-auth-success' : 'border-auth-danger',
              ].join(' ')}>
              <Text className="text-[13px] leading-[18px] text-auth-text" maxFontSizeMultiplier={1.05}>
                {t(messageKey)}
              </Text>
            </View>
          ) : null}

          <RegisterForm
            isSubmitting={status === 'loading'}
            onSocialPress={showUnavailable}
            onSubmit={handleSubmit}
          />

          <View className="mt-auto flex-row items-center justify-center pt-2">
            <Text className="text-sm text-auth-muted" maxFontSizeMultiplier={1.05}>
              {t('auth.register.hasAccount')}{' '}
            </Text>
            <Pressable
              accessibilityRole="link"
              className="active:opacity-70"
              hitSlop={8}
              onPress={() => router.replace('/login')}>
              <Text className="text-sm font-semibold text-auth-primary" maxFontSizeMultiplier={1.05}>
                {t('auth.welcome.login')}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
