import { httpClient } from '@/core/api/http-client';
import type {
  AccountProfile,
  AccountProfileDraft,
} from '@/features/account/types/profile.types';

export async function fetchAccountProfile(): Promise<AccountProfile> {
  const { data } = await httpClient.get<AccountProfile>('/profiles/me');
  return data;
}

export async function updateAccountProfile(
  draft: AccountProfileDraft,
): Promise<AccountProfile> {
  const { data } = await httpClient.patch<AccountProfile>('/profiles/me', draft);
  return data;
}
