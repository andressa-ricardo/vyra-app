import { useCallback, useEffect, useState } from 'react';

import { normalizeHttpError, type ApiErrorCode } from '@/core/api/http-client';
import {
  fetchAccountProfile,
  updateAccountProfile,
} from '@/features/account/infrastructure/profile-api';
import type {
  AccountProfile,
  AccountProfileDraft,
} from '@/features/account/types/profile.types';

type ProfileState = {
  error: ApiErrorCode | null;
  loading: boolean;
  profile: AccountProfile | null;
  saving: boolean;
};

export function useProfile() {
  const [state, setState] = useState<ProfileState>({
    error: null,
    loading: true,
    profile: null,
    saving: false,
  });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, error: null, loading: true }));
    try {
      const profile = await fetchAccountProfile();
      setState((current) => ({ ...current, loading: false, profile }));
    } catch (error) {
      setState((current) => ({
        ...current,
        error: normalizeHttpError(error).code,
        loading: false,
      }));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (draft: AccountProfileDraft) => {
    setState((current) => ({ ...current, error: null, saving: true }));
    try {
      const profile = await updateAccountProfile(draft);
      setState((current) => ({ ...current, profile, saving: false }));
      return true;
    } catch (error) {
      setState((current) => ({
        ...current,
        error: normalizeHttpError(error).code,
        saving: false,
      }));
      return false;
    }
  };

  return { ...state, reload: load, save };
}
