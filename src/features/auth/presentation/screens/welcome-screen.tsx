import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { changeLanguage } from '@/i18n';
import { BrandLogo } from '@/shared/components/brand-logo';

export function WelcomeScreen() {
  const { i18n, t } = useTranslation();
  const activeLanguage = i18n.resolvedLanguage === 'en' ? 'en' : 'pt-BR';

  return (
    <View className="flex-1 bg-auth-bg">
      <Image
        accessibilityIgnoresInvertColors
        className="absolute inset-0 h-full w-full"
        resizeMode="cover"
        source={require('../../../../../assets/images/welcome-athlete.jpg')}
      />
      <SafeAreaView className="flex-1 justify-between px-6 pb-2 pt-3">
        <View className="flex-row items-center justify-between">
          <BrandLogo />
          <Pressable
            accessibilityLabel={t('common.language')}
            accessibilityRole="button"
            className="h-9 min-w-[42px] items-center justify-center rounded-full border border-white/30 bg-auth-bg/40 px-3 active:opacity-70"
            onPress={() => void changeLanguage(activeLanguage === 'en' ? 'pt-BR' : 'en')}>
            <Text className="text-xs font-bold text-auth-text" maxFontSizeMultiplier={1.05}>
              {activeLanguage === 'en' ? 'PT' : 'EN'}
            </Text>
          </Pressable>
        </View>

        <View className="gap-6">
          <View className="gap-2.5">
            <Text
              className="max-w-[330px] text-[28px] font-extrabold leading-[33px] tracking-[-0.6px] text-auth-text"
              maxFontSizeMultiplier={1.05}>
              {t('auth.welcome.title')}
            </Text>
            <Text
              className="text-sm leading-5 text-auth-muted"
              maxFontSizeMultiplier={1.05}>
              {t('auth.welcome.description')}
            </Text>
          </View>

          <View className="gap-2.5">
            <Pressable
              accessibilityRole="button"
              className="h-[50px] items-center justify-center rounded-[22px] bg-auth-primary active:opacity-75"
              onPress={() => router.navigate('/register')}>
              <Text className="text-sm font-bold text-auth-text" maxFontSizeMultiplier={1.05}>
                {t('auth.welcome.createAccount')}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              className="h-[50px] items-center justify-center rounded-[22px] border border-auth-border bg-auth-surface active:bg-auth-pressed"
              onPress={() => router.navigate('/login')}>
              <Text className="text-sm font-bold text-auth-text" maxFontSizeMultiplier={1.05}>
                {t('auth.welcome.login')}
              </Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
