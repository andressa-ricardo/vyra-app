import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

import {
  AuthBackButton,
  AuthDivider,
  AuthTextField,
  Checkbox,
  PrimaryButton,
  SocialButtons,
} from '@/features/auth/presentation/components/auth-ui';
import { authColors, fonts, spacing } from '@/theme';

export function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const showUnavailable = () => Alert.alert(t('common.comingSoon'), t('auth.login.unavailable'));

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <AuthBackButton onPress={() => router.replace('/')} />

          <View style={styles.heading}>
            <Text style={styles.title}>{t('auth.login.title')}</Text>
            <Text style={styles.description}>{t('auth.login.description')}</Text>
          </View>

          <View style={styles.form}>
            <AuthTextField
              autoCapitalize="none"
              autoComplete="email"
              inputMode="email"
              keyboardType="email-address"
              label={t('auth.register.email')}
              onChangeText={setEmail}
              placeholder={t('auth.register.emailPlaceholder')}
              textContentType="emailAddress"
              value={email}
            />
            <AuthTextField
              autoCapitalize="none"
              autoComplete="current-password"
              label={t('auth.register.password')}
              onChangeText={setPassword}
              password
              placeholder="••••••••"
              textContentType="password"
              value={password}
            />

            <View style={styles.optionsRow}>
              <Checkbox
                checked={rememberMe}
                label={t('auth.login.rememberMe')}
                onPress={() => setRememberMe((current) => !current)}
              />
              <Pressable accessibilityRole="button" onPress={showUnavailable}>
                <Text style={styles.link}>{t('auth.login.forgotPassword')}</Text>
              </Pressable>
            </View>

            <PrimaryButton label={t('auth.login.submit')} onPress={showUnavailable} />
          </View>

          <AuthDivider label={t('auth.login.continueWith')} />
          <SocialButtons onPress={showUnavailable} />

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{t('auth.login.noAccount')} </Text>
            <Pressable accessibilityRole="link" onPress={() => router.replace('/register')}>
              <Text style={styles.link}>{t('auth.welcome.createAccount')}</Text>
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
  content: { width: '100%', maxWidth: 520, minHeight: '100%', alignSelf: 'center', paddingHorizontal: 26, paddingTop: 4, paddingBottom: spacing.four, gap: spacing.five },
  heading: { gap: 8, marginTop: 2 },
  title: { color: authColors.text, fontFamily: fonts.sans, fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: -0.5 },
  description: { color: authColors.muted, fontFamily: fonts.sans, fontSize: 16, lineHeight: 23 },
  form: { gap: 18, marginTop: 4 },
  optionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.three },
  link: { color: authColors.primary, fontFamily: fonts.sans, fontSize: 14, lineHeight: 20 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  footerText: { color: authColors.muted, fontFamily: fonts.sans, fontSize: 14 },
});
