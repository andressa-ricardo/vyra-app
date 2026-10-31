import Info from 'lucide-react-native/icons/info';
import Sparkles from 'lucide-react-native/icons/sparkles';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import type { OnboardingFlow } from '@/features/onboarding/hooks/use-onboarding-flow';
import type { SportModality } from '@/features/onboarding/types/onboarding.types';
import { authColors } from '@/theme';

import { OnboardingLayout } from './onboarding-layout';

export function SummaryStep({
  flow,
  modalities,
}: {
  flow: OnboardingFlow;
  modalities: SportModality[];
}) {
  const { t } = useTranslation();
  const selectedModalities = modalities.filter(({ id }) => flow.modalityIds.includes(id));
  const hasProfessionalExperience = flow.experiences.some(
    (experience) => experience !== 'PERSONAL_FITNESS',
  );

  const sections = [
    {
      title: t('onboarding.summary.experiences'),
      items: flow.experiences.map((experience) =>
        t(`onboarding.experiences.items.${experience}.title`),
      ),
    },
    {
      title: t('onboarding.summary.modalities'),
      items: selectedModalities.map((modality) =>
        t(`onboarding.modalities.items.${modality.slug}`, { defaultValue: modality.name }),
      ),
    },
    {
      title: t('onboarding.summary.goal'),
      items: flow.primaryGoal ? [t(`onboarding.goal.items.${flow.primaryGoal}`)] : [],
    },
  ].filter((section) => section.items.length > 0);

  return (
    <OnboardingLayout
      centered
      description={t('onboarding.summary.description')}
      hero={
        <View className="items-center pt-2">
          <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-auth-primary/15">
            <Sparkles color={authColors.primary} size={30} strokeWidth={1.75} />
          </View>
        </View>
      }
      messageKey={flow.messageKey}
      onBack={flow.back}
      primary={{ label: t('onboarding.summary.enter'), onPress: () => void flow.complete() }}
      saving={flow.busy}
      showSecondaryBack={false}
      step={null}
      title={t('onboarding.summary.title')}>
      {sections.length > 0 ? (
        <View className="overflow-hidden rounded-[20px] bg-auth-surface">
          {sections.map((section, index) => (
            <View
              key={section.title}
              className={['gap-2 p-4', index > 0 ? 'border-t border-auth-border' : ''].join(' ')}>
              <Text
                className="text-[11px] font-semibold uppercase tracking-[1px] text-auth-muted"
                maxFontSizeMultiplier={1.05}>
                {section.title}
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {section.items.map((item) => (
                  <View key={item} className="rounded-full bg-auth-bg/70 px-3 py-1.5">
                    <Text className="text-xs font-semibold text-auth-text" maxFontSizeMultiplier={1.05}>
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {hasProfessionalExperience ? (
        <View className="flex-row gap-2.5 px-1">
          <Info color={authColors.muted} size={16} />
          <Text className="flex-1 text-xs leading-[18px] text-auth-muted" maxFontSizeMultiplier={1.05}>
            {t('onboarding.summary.professionalNote')}
          </Text>
        </View>
      ) : null}
    </OnboardingLayout>
  );
}
