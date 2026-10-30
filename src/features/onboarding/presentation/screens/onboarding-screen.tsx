import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, BackHandler, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useOnboardingFlow } from '@/features/onboarding/hooks/use-onboarding-flow';
import { ExperiencesStep } from '@/features/onboarding/presentation/components/experiences-step';
import { GoalStep } from '@/features/onboarding/presentation/components/goal-step';
import { IntroStep } from '@/features/onboarding/presentation/components/intro-step';
import { ModalitiesStep } from '@/features/onboarding/presentation/components/modalities-step';
import { PersonalDataStep } from '@/features/onboarding/presentation/components/personal-data-step';
import { SummaryStep } from '@/features/onboarding/presentation/components/summary-step';
import { FormMessage } from '@/shared/components/form-message';
import { PrimaryButton } from '@/shared/components/primary-button';
import { authColors } from '@/theme';

export function OnboardingScreen() {
  const { t } = useTranslation();
  const flow = useOnboardingFlow();
  const { back, step } = flow;

  // No Android, o botão físico volta uma etapa em vez de fechar o app.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (step === 0) return false;
      back();
      return true;
    });
    return () => subscription.remove();
  }, [back, step]);

  if (flow.load.status !== 'ready') {
    return (
      <SafeAreaView className="flex-1 items-center justify-center gap-4 bg-auth-bg px-6">
        {flow.load.status === 'loading' ? (
          <ActivityIndicator accessibilityLabel={t('common.loading')} color={authColors.primary} />
        ) : (
          <View className="w-full max-w-[520px] gap-3">
            <FormMessage message={t('onboarding.errors.load')} />
            <PrimaryButton label={t('onboarding.retry')} onPress={flow.retryLoad} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  const { modalities } = flow.load;

  switch (step) {
    case 0:
      return (
        <IntroStep
          busy={flow.busy}
          messageKey={flow.messageKey}
          onSkip={() => void flow.skip()}
          onStart={() => void flow.start()}
        />
      );
    case 1:
      return <ExperiencesStep flow={flow} />;
    case 2:
      return <ModalitiesStep flow={flow} modalities={modalities} />;
    case 3:
      return <GoalStep flow={flow} />;
    case 4:
      return <PersonalDataStep flow={flow} />;
    case 5:
      return <SummaryStep flow={flow} modalities={modalities} />;
  }
}
