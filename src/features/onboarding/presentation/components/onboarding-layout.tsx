import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ONBOARDING_TOTAL_STEPS } from '@/features/onboarding/types/onboarding.types';
import { BackButton } from '@/shared/components/back-button';
import { FormMessage } from '@/shared/components/form-message';
import { PrimaryButton } from '@/shared/components/primary-button';

type OnboardingLayoutProps = {
  /** Etapa contada pelo backend (1–4); `null` no resumo final. */
  step: number | null;
  title: string;
  description?: string;
  messageKey: string | null;
  saving: boolean;
  onBack: () => void;
  onSkip?: () => void;
  primary: { label: string; onPress: () => void; disabled?: boolean };
  showSecondaryBack?: boolean;
  centered?: boolean;
  hero?: ReactNode;
  children: ReactNode;
};

export function OnboardingLayout({
  centered = false,
  children,
  description,
  hero,
  messageKey,
  onBack,
  onSkip,
  primary,
  saving,
  showSecondaryBack = true,
  step,
  title,
}: OnboardingLayoutProps) {
  const { t } = useTranslation();
  const progress = step === null ? 1 : step / ONBOARDING_TOTAL_STEPS;

  return (
    <SafeAreaView className="flex-1 bg-auth-bg" edges={['top', 'left', 'right', 'bottom']}>
      {/* Android é edge-to-edge: a janela não redimensiona, então "padding" vale para as duas plataformas. */}
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <View className="w-full max-w-[520px] self-center px-5 pt-1">
          <View className="flex-row items-center gap-3">
            <BackButton onPress={onBack} />
            <View
              accessibilityRole="progressbar"
              accessibilityValue={{ min: 0, max: 100, now: Math.round(progress * 100) }}
              className="h-1.5 flex-1 overflow-hidden rounded-full bg-auth-surface">
              <View className="h-full rounded-full bg-auth-primary" style={{ width: `${progress * 100}%` }} />
            </View>
            {onSkip ? (
              <Pressable
                accessibilityRole="button"
                className="px-1 active:opacity-70"
                disabled={saving}
                hitSlop={10}
                onPress={onSkip}>
                <Text className="text-[13px] font-semibold text-auth-muted" maxFontSizeMultiplier={1.05}>
                  {t('onboarding.skip')}
                </Text>
              </Pressable>
            ) : (
              <View className="w-9" />
            )}
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="text-[11px] text-auth-muted" maxFontSizeMultiplier={1.05}>
              {step === null
                ? t('onboarding.done')
                : t('onboarding.stepOf', { step, total: ONBOARDING_TOTAL_STEPS })}
            </Text>
            <Text className="text-[11px] text-auth-muted" maxFontSizeMultiplier={1.05}>
              {saving ? t('onboarding.saving') : t('onboarding.saved')}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerClassName="w-full max-w-[520px] grow self-center gap-5 px-5 pb-6 pt-5"
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {hero}
          <View className={centered ? 'items-center gap-2' : 'gap-2'}>
            <Text
              accessibilityRole="header"
              className={[
                'text-[24px] font-extrabold leading-[30px] tracking-[-0.5px] text-auth-text',
                centered ? 'text-center' : '',
              ].join(' ')}
              maxFontSizeMultiplier={1.05}>
              {title}
            </Text>
            {description ? (
              <Text
                className={['text-sm leading-5 text-auth-muted', centered ? 'text-center' : ''].join(' ')}
                maxFontSizeMultiplier={1.05}>
                {description}
              </Text>
            ) : null}
          </View>

          {messageKey ? <FormMessage message={t(messageKey)} /> : null}
          {children}
        </ScrollView>

        <View className="border-t border-auth-surface">
          <View className="w-full max-w-[520px] flex-row gap-3 self-center px-5 py-4">
            {showSecondaryBack ? (
              <Pressable
                accessibilityRole="button"
                className="h-[50px] items-center justify-center rounded-[22px] border border-auth-border bg-auth-surface px-7 active:bg-auth-pressed"
                disabled={saving}
                onPress={onBack}>
                <Text className="text-sm font-bold text-auth-text" maxFontSizeMultiplier={1.05}>
                  {t('common.back')}
                </Text>
              </Pressable>
            ) : null}
            <View className="flex-1">
              <PrimaryButton
                disabled={primary.disabled}
                label={primary.label}
                loading={saving}
                onPress={primary.onPress}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/** Marcador de seleção usado nos cards: círculo vazio ou preenchido com check. */
export function SelectionMark({ selected }: { selected: boolean }) {
  return (
    <View
      className={[
        'h-[22px] w-[22px] items-center justify-center rounded-full border',
        selected ? 'border-auth-primary bg-auth-primary' : 'border-auth-border',
      ].join(' ')}>
      {selected ? (
        <View className="mb-0.5 h-[5px] w-[9px] rotate-[-45deg] border-b-2 border-l-2 border-auth-text" />
      ) : null}
    </View>
  );
}
