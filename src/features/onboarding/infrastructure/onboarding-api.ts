import { httpClient } from '@/core/api/http-client';

import type {
  OnboardingUpdate,
  OnboardingView,
  Profile,
  SportModality,
} from '../types/onboarding.types';

export async function fetchOnboarding(): Promise<OnboardingView> {
  const { data } = await httpClient.get<OnboardingView>('/onboarding/me');
  return data;
}

export async function updateOnboarding(payload: OnboardingUpdate): Promise<OnboardingView> {
  const { data } = await httpClient.patch<OnboardingView>('/onboarding/me', payload);
  return data;
}

export async function completeOnboarding(): Promise<OnboardingView> {
  const { data } = await httpClient.post<OnboardingView>('/onboarding/me/complete');
  return data;
}

export async function skipOnboarding(): Promise<OnboardingView> {
  const { data } = await httpClient.post<OnboardingView>('/onboarding/me/skip');
  return data;
}

export async function fetchProfile(): Promise<Profile> {
  const { data } = await httpClient.get<Profile>('/profiles/me');
  return data;
}

export async function fetchSportModalities(): Promise<SportModality[]> {
  const { data } = await httpClient.get<SportModality[]>('/sport-modalities');
  return data;
}
