import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { OnboardingFlow } from '@/features/onboarding/hooks/use-onboarding-flow';
import { onboardingExperiences } from '@/features/onboarding/types/onboarding.types';
import { authColors } from '@/theme';

import { experienceIcons } from './onboarding-icons';
import { OnboardingLayout, SelectionMark } from './onboarding-layout';

export function ExperiencesStep({ flow }: { flow: OnboardingFlow }) {
  const { t } = useTranslation();

  const toggle = (experience: (typeof onboardingExperiences)[number]) =>
    flow.setExperiences((current) =>
      current.includes(experience)
        ? current.filter((item) => item !== experience)
        : [...current, experience],
    );

  return (
    <OnboardingLayout
      description={t('onboarding.experiences.description')}
      messageKey={flow.messageKey}
      onBack={flow.back}
      onSkip={flow.skip}
      primary={{
        label: t('onboarding.continue'),
        onPress: () => void flow.saveExperiences(),
        disabled: flow.experiences.length === 0,
      }}
      saving={flow.busy}
      step={1}
      title={t('onboarding.experiences.title')}>
      <View className="gap-3">
        {onboardingExperiences.map((experience) => {
          const selected = flow.experiences.includes(experience);
          const Icon = experienceIcons[experience];

          return (
            <Pressable
              key={experience}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              className={[
                'flex-row items-start gap-3.5 rounded-[20px] border p-4 active:opacity-80',
                selected ? 'border-auth-primary bg-auth-primary/10' : 'border-auth-border bg-auth-surface',
              ].join(' ')}
              onPress={() => toggle(experience)}>
              <View
                className={[
                  'h-11 w-11 items-center justify-center rounded-xl',
                  selected ? 'bg-auth-primary' : 'bg-auth-bg/60',
                ].join(' ')}>
                <Icon color={selected ? authColors.text : authColors.muted} size={20} strokeWidth={1.75} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="text-[15px] font-bold leading-5 text-auth-text" maxFontSizeMultiplier={1.05}>
                  {t(`onboarding.experiences.items.${experience}.title`)}
                </Text>
                <Text className="text-[13px] leading-[18px] text-auth-muted" maxFontSizeMultiplier={1.05}>
                  {t(`onboarding.experiences.items.${experience}.description`)}
                </Text>
              </View>
              <SelectionMark selected={selected} />
            </Pressable>
          );
        })}
      </View>
      <Text className="text-center text-xs text-auth-muted" maxFontSizeMultiplier={1.05}>
        {t('onboarding.experiences.hint')}
      </Text>
    </OnboardingLayout>
  );
}
