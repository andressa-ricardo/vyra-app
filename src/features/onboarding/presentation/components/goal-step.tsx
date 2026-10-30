import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import type { OnboardingFlow } from '@/features/onboarding/hooks/use-onboarding-flow';
import { primaryGoals } from '@/features/onboarding/types/onboarding.types';
import { authColors } from '@/theme';

import { goalIcons } from './onboarding-icons';
import { OnboardingLayout, SelectionMark } from './onboarding-layout';

export function GoalStep({ flow }: { flow: OnboardingFlow }) {
  const { t } = useTranslation();

  return (
    <OnboardingLayout
      description={t('onboarding.goal.description')}
      messageKey={flow.messageKey}
      onBack={flow.back}
      onSkip={flow.skip}
      primary={{
        label: t('onboarding.continue'),
        onPress: () => void flow.saveGoal(),
        disabled: flow.primaryGoal === null,
      }}
      saving={flow.busy}
      step={3}
      title={t('onboarding.goal.title')}>
      <View accessibilityRole="radiogroup" className="gap-2.5">
        {primaryGoals.map((goal) => {
          const selected = flow.primaryGoal === goal;
          const Icon = goalIcons[goal];

          return (
            <Pressable
              key={goal}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              className={[
                'flex-row items-center gap-3 rounded-[18px] border px-4 py-3 active:opacity-80',
                selected ? 'border-auth-primary bg-auth-primary/10' : 'border-auth-border bg-auth-surface',
              ].join(' ')}
              onPress={() => flow.setPrimaryGoal(goal)}>
              <View
                className={[
                  'h-9 w-9 items-center justify-center rounded-[10px]',
                  selected ? 'bg-auth-primary' : 'bg-auth-bg/60',
                ].join(' ')}>
                <Icon color={selected ? authColors.text : authColors.muted} size={18} strokeWidth={1.75} />
              </View>
              <Text
                className="flex-1 text-sm font-semibold leading-5 text-auth-text"
                maxFontSizeMultiplier={1.05}>
                {t(`onboarding.goal.items.${goal}`)}
              </Text>
              <SelectionMark selected={selected} />
            </Pressable>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
