import { useTranslation } from 'react-i18next';
import { Image, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandLogo } from '@/shared/components/brand-logo';
import { FormMessage } from '@/shared/components/form-message';
import { PrimaryButton } from '@/shared/components/primary-button';

export function IntroStep({
  busy,
  messageKey,
  onSkip,
  onStart,
}: {
  busy: boolean;
  messageKey: string | null;
  onSkip: () => void;
  onStart: () => void;
}) {
  const { t } = useTranslation();

  return (
    <SafeAreaView className="flex-1 bg-auth-bg">
      <View className="w-full max-w-[520px] flex-1 gap-6 self-center px-6 pb-4 pt-3">
        <BrandLogo />

        <View className="flex-1 overflow-hidden rounded-[28px] border border-auth-surface bg-[#020A1A]">
          <Image
            accessibilityIgnoresInvertColors
            className="h-full w-full"
            resizeMode="cover"
            source={require('../../../../../assets/images/onboarding-image.jpg')}
          />
        </View>

        <View className="gap-2.5">
          <Text
            accessibilityRole="header"
            className="text-[28px] font-extrabold leading-[33px] tracking-[-0.6px] text-auth-text"
            maxFontSizeMultiplier={1.05}>
            {t('onboarding.intro.title')}
          </Text>
          <Text className="text-sm leading-5 text-auth-muted" maxFontSizeMultiplier={1.05}>
            {t('onboarding.intro.description')}
          </Text>
        </View>

        {messageKey ? <FormMessage message={t(messageKey)} /> : null}

        <View className="gap-1">
          <PrimaryButton label={t('onboarding.intro.start')} loading={busy} onPress={onStart} />
          <Pressable
            accessibilityRole="button"
            className="h-11 items-center justify-center active:opacity-70"
            disabled={busy}
            onPress={onSkip}>
            <Text className="text-[13px] font-semibold text-auth-muted" maxFontSizeMultiplier={1.05}>
              {t('onboarding.intro.skip')}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
