import { useTranslation } from 'react-i18next';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useRegister } from '@/features/auth/hooks/use-register';
import { RegisterForm } from '@/features/auth/presentation/components/register-form';
import type { RegisterFormValues } from '@/features/auth/schemas/register.schema';
import { changeLanguage } from '@/i18n';
import type { SupportedLanguage } from '@/i18n/config';
import { useTheme } from '@/shared/hooks/use-theme';
import { fonts, spacing } from '@/theme';

export function RegisterScreen() {
  const { i18n, t } = useTranslation();
  const theme = useTheme();
  const { status, messageKey, submit } = useRegister();
  const activeLanguage: SupportedLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'pt-BR';

  const handleSubmit = ({ confirmPassword: _confirmPassword, ...payload }: RegisterFormValues) =>
    submit(payload);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled">
          <View style={styles.languageSection}>
            <Text style={[styles.languageLabel, { color: theme.textSecondary }]}>
              {t('common.language')}
            </Text>
            <View style={styles.languageControls}>
              <LanguageButton
                active={activeLanguage === 'pt-BR'}
                label="PT-BR"
                onPress={() => void changeLanguage('pt-BR')}
              />
              <LanguageButton
                active={activeLanguage === 'en'}
                label="EN"
                onPress={() => void changeLanguage('en')}
              />
            </View>
          </View>

          <View style={styles.heading}>
            <Text style={[styles.eyebrow, { color: theme.primary }]}>
              {t('auth.register.eyebrow')}
            </Text>
            <Text style={[styles.title, { color: theme.text }]}>{t('auth.register.title')}</Text>
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {t('auth.register.description')}
            </Text>
          </View>

          {messageKey ? (
            <View
              accessibilityLiveRegion="polite"
              style={[
                styles.message,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: status === 'success' ? theme.success : theme.error,
                },
              ]}>
              <Text style={[styles.messageText, { color: theme.text }]}>{t(messageKey)}</Text>
            </View>
          ) : null}

          <RegisterForm isSubmitting={status === 'loading'} onSubmit={handleSubmit} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type LanguageButtonProps = {
  active: boolean;
  label: string;
  onPress: () => void;
};

function LanguageButton({ active, label, onPress }: LanguageButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.languageButton,
        {
          backgroundColor: active ? theme.primary : theme.backgroundElement,
          borderColor: active ? theme.primary : theme.border,
        },
        pressed && styles.pressed,
      ]}>
      <Text style={[styles.languageButtonText, { color: active ? theme.onPrimary : theme.text }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: spacing.four,
    paddingVertical: spacing.four,
    gap: spacing.four,
  },
  languageSection: {
    alignItems: 'flex-end',
    gap: spacing.one,
  },
  languageLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
  },
  languageControls: {
    flexDirection: 'row',
    gap: spacing.two,
  },
  languageButton: {
    minWidth: 64,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.two,
  },
  languageButtonText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: { opacity: 0.72 },
  heading: { gap: spacing.two },
  eyebrow: {
    fontFamily: fonts.sans,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  title: {
    fontFamily: fonts.sans,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '700',
  },
  description: {
    fontFamily: fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  message: {
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.three,
  },
  messageText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
});
