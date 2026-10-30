import { useEffect, useState } from 'react';

import { normalizeHttpError } from '@/core/api/http-client';
import { useOnboardingStatus } from '@/features/onboarding/hooks/onboarding-status-provider';
import {
  completeOnboarding,
  fetchProfile,
  fetchSportModalities,
  skipOnboarding,
  updateOnboarding,
} from '@/features/onboarding/infrastructure/onboarding-api';
import type { PersonalDataFormValues } from '@/features/onboarding/schemas/personal-data.schema';
import {
  ONBOARDING_TOTAL_STEPS,
  type OnboardingExperience,
  type OnboardingUpdate,
  type PrimaryGoal,
  type SportModality,
} from '@/features/onboarding/types/onboarding.types';
import {
  formatBirthDate,
  formatDecimal,
  parseBirthDate,
  parseDecimal,
} from '@/features/onboarding/utils/personal-data';

/** 0 = boas-vindas, 1–4 = etapas contadas pelo backend, 5 = resumo. */
export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5;

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; modalities: SportModality[] };

const emptyPersonalData: PersonalDataFormValues = {
  displayName: '',
  birthDate: '',
  heightCm: '',
  currentWeightKg: '',
  fitnessLevel: null,
};

function errorKey(error: unknown) {
  const { code } = normalizeHttpError(error);
  return code === 'network' || code === 'timeout' ? 'onboarding.errors.network' : 'onboarding.errors.save';
}

export function useOnboardingFlow() {
  const gate = useOnboardingStatus();
  const resumeFrom = gate.onboarding?.status === 'IN_PROGRESS' ? gate.onboarding.currentStep : 0;

  const [load, setLoad] = useState<LoadState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const [step, setStep] = useState<OnboardingStep>(
    Math.min(Math.max(resumeFrom, 0), ONBOARDING_TOTAL_STEPS) as OnboardingStep,
  );
  const [experiences, setExperiences] = useState<OnboardingExperience[]>(
    gate.onboarding?.selectedExperiences ?? [],
  );
  const [modalityIds, setModalityIds] = useState<string[]>([]);
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [personalData, setPersonalData] = useState<PersonalDataFormValues>(emptyPersonalData);
  const [busy, setBusy] = useState(false);
  const [messageKey, setMessageKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    // O perfil preenche o que já foi salvo, permitindo retomar o fluxo.
    Promise.all([fetchSportModalities(), fetchProfile()])
      .then(([modalities, profile]) => {
        if (!active) return;
        setModalityIds(profile.sportModalityIds);
        setPrimaryGoal(profile.primaryGoal);
        setPersonalData({
          displayName: profile.displayName ?? '',
          birthDate: formatBirthDate(profile.birthDate),
          heightCm: formatDecimal(profile.heightCm),
          currentWeightKg: formatDecimal(profile.currentWeightKg),
          fitnessLevel: profile.fitnessLevel,
        });
        setLoad({
          status: 'ready',
          modalities: [...modalities].sort((a, b) => a.sortOrder - b.sortOrder),
        });
      })
      .catch(() => {
        if (active) setLoad({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [attempt]);

  const run = async (action: () => Promise<unknown>, onSuccess: () => void) => {
    if (busy) return;
    setBusy(true);
    setMessageKey(null);
    try {
      await action();
      onSuccess();
    } catch (error) {
      setMessageKey(errorKey(error));
    } finally {
      setBusy(false);
    }
  };

  const saveAndGo = (payload: OnboardingUpdate, next: OnboardingStep) =>
    run(() => updateOnboarding(payload), () => setStep(next));

  return {
    load,
    step,
    busy,
    messageKey,
    experiences,
    modalityIds,
    primaryGoal,
    personalData,
    setExperiences,
    setModalityIds,
    setPrimaryGoal,
    retryLoad: () => {
      setLoad({ status: 'loading' });
      setAttempt((current) => current + 1);
    },
    back: () => {
      setMessageKey(null);
      setStep((current) => (current > 0 ? ((current - 1) as OnboardingStep) : current));
    },
    start: () => saveAndGo({ currentStep: 1 }, 1),
    saveExperiences: () => saveAndGo({ currentStep: 2, selectedExperiences: experiences }, 2),
    saveModalities: () =>
      saveAndGo({ currentStep: 3, profile: { sportModalityIds: modalityIds } }, 3),
    saveGoal: () => saveAndGo({ currentStep: 4, profile: { primaryGoal } }, 4),
    savePersonalData: (values: PersonalDataFormValues) => {
      setPersonalData(values);
      // Campo vazio vira `null`, o que também limpa um valor salvo anteriormente.
      return saveAndGo(
        {
          currentStep: 4,
          profile: {
            displayName: values.displayName.trim() || null,
            birthDate: values.birthDate ? parseBirthDate(values.birthDate) : null,
            heightCm: parseDecimal(values.heightCm),
            currentWeightKg: parseDecimal(values.currentWeightKg),
            fitnessLevel: values.fitnessLevel,
          },
        },
        5,
      );
    },
    complete: () => run(completeOnboarding, gate.finish),
    skip: () => run(skipOnboarding, gate.finish),
  };
}

export type OnboardingFlow = ReturnType<typeof useOnboardingFlow>;
