import { Link } from 'expo-router';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { BrandLogo } from '@/features/auth/presentation/components/auth-ui';
import { changeLanguage } from '@/i18n';
import { authColors, fonts, spacing } from '@/theme';

export function WelcomeScreen() {
  const { i18n, t } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'pt-BR';

  return (
    <ImageBackground
      resizeMode="cover"
      source={require('../../../../../assets/images/welcome-athlete.jpg')}
      style={styles.background}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topRow}>
          <BrandLogo />
          <Pressable
            accessibilityLabel={t('common.language')}
            accessibilityRole="button"
            onPress={() => void changeLanguage(activeLanguage === 'en' ? 'pt-BR' : 'en')}
            style={({ pressed }) => [styles.languageButton, pressed && styles.pressed]}>
            <Text style={styles.languageText}>{activeLanguage === 'en' ? 'PT' : 'EN'}</Text>
          </Pressable>
        </View>

        <View style={styles.bottomContent}>
          <View style={styles.copy}>
            <Text style={styles.title}>{t('auth.welcome.title')}</Text>
            <Text style={styles.description}>{t('auth.welcome.description')}</Text>
          </View>

          <View style={styles.actions}>
            <Link href="/register" asChild>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
                <Text style={styles.primaryLabel}>{t('auth.welcome.createAccount')}</Text>
              </Pressable>
            </Link>
            <Link href="/login" asChild>
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
                <Text style={styles.secondaryLabel}>{t('auth.welcome.login')}</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: authColors.background },
  safeArea: { flex: 1, justifyContent: 'space-between', paddingHorizontal: spacing.four, paddingTop: spacing.three, paddingBottom: spacing.two },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  languageButton: { minWidth: 42, minHeight: 36, borderWidth: 1, borderColor: 'rgba(255,255,255,0.32)', borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(3,12,27,0.42)' },
  languageText: { color: authColors.text, fontFamily: fonts.sans, fontSize: 12, fontWeight: '700' },
  bottomContent: { gap: spacing.five },
  copy: { gap: 14 },
  title: { maxWidth: 350, color: authColors.text, fontFamily: fonts.sans, fontSize: 32, lineHeight: 37, fontWeight: '800', letterSpacing: -0.8 },
  description: { color: authColors.muted, fontFamily: fonts.sans, fontSize: 16, lineHeight: 23 },
  actions: { gap: 12 },
  primaryButton: { minHeight: 54, borderRadius: 24, backgroundColor: authColors.primary, alignItems: 'center', justifyContent: 'center' },
  secondaryButton: { minHeight: 54, borderRadius: 24, borderWidth: 1, borderColor: authColors.border, backgroundColor: authColors.surface, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { color: authColors.text, fontFamily: fonts.sans, fontSize: 16, fontWeight: '700' },
  secondaryLabel: { color: authColors.text, fontFamily: fonts.sans, fontSize: 16, fontWeight: '700' },
  pressed: { opacity: 0.76 },
});
