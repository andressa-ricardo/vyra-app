import { router } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useRegister } from '@/features/auth/hooks/use-register';
import { AuthBackButton } from '@/features/auth/presentation/components/auth-ui';
import { RegisterForm } from '@/features/auth/presentation/components/register-form';
import type { RegisterFormValues } from '@/features/auth/schemas/register.schema';
import { authColors, fonts, spacing } from '@/theme';

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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AuthBackButton onPress={() => router.replace('/')} />

          <View style={styles.heading}>
            <Text style={styles.title}>{t('auth.register.title')}</Text>
            <Text style={styles.description}>{t('auth.register.shortDescription')}</Text>
          </View>

          {messageKey ? (
            <View
              accessibilityLiveRegion="polite"
              style={[
                styles.message,
                status === 'success' ? styles.messageSuccess : styles.messageError,
              ]}>
              <Text style={styles.messageText}>{t(messageKey)}</Text>
            </View>
          ) : null}

          <RegisterForm
            isSubmitting={status === 'loading'}
            onSocialPress={showUnavailable}
            onSubmit={handleSubmit}
          />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('auth.register.hasAccount')} </Text>
            <Pressable accessibilityRole="link" onPress={() => router.replace('/login')}>
              <Text style={styles.link}>{t('auth.welcome.login')}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1, backgroundColor: authColors.background },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 26,
    paddingTop: 4,
    paddingBottom: spacing.four,
    gap: spacing.four,
  },
  heading: { gap: 8, marginBottom: spacing.two },
  title: {
    color: authColors.text,
    fontFamily: fonts.sans,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  description: {
    color: authColors.muted,
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 23,
  },
  message: {
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: authColors.surface,
    padding: 12,
  },
  messageSuccess: { borderColor: authColors.success },
  messageError: { borderColor: authColors.danger },
  messageText: {
    color: authColors.text,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.one,
  },
  footerText: { color: authColors.muted, fontFamily: fonts.sans, fontSize: 14 },
  link: { color: authColors.primary, fontFamily: fonts.sans, fontSize: 14 },
});
