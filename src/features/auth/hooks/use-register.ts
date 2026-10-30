import { useCallback, useState } from 'react';

import { normalizeHttpError, type ApiErrorCode } from '@/core/api/http-client';
import { registerUser } from '@/features/auth/infrastructure/auth-api';
import type { RegisterRequest } from '@/features/auth/types/auth.types';

type RegisterState =
  | { status: 'idle'; messageKey: null }
  | { status: 'loading'; messageKey: null }
  | { status: 'success'; messageKey: 'auth.register.success' }
  | { status: 'error'; messageKey: string };

const errorMessageKeys: Record<ApiErrorCode, string> = {
  configuration: 'auth.register.errors.configuration',
  validation: 'auth.register.errors.validation',
  conflict: 'auth.register.errors.emailAlreadyExists',
  'rate-limited': 'auth.register.errors.rateLimited',
  network: 'auth.register.errors.network',
  timeout: 'auth.register.errors.timeout',
  server: 'auth.register.errors.server',
  unknown: 'auth.register.errors.unknown',
};

const initialState: RegisterState = { status: 'idle', messageKey: null };

export function useRegister() {
  const [state, setState] = useState<RegisterState>(initialState);

  const submit = useCallback(async (payload: RegisterRequest) => {
    setState({ status: 'loading', messageKey: null });

    try {
      await registerUser(payload);
      // The API returns tokens, but session persistence intentionally belongs to the next task.
      setState({ status: 'success', messageKey: 'auth.register.success' });
      return true;
    } catch (error) {
      const normalizedError = normalizeHttpError(error);
      setState({ status: 'error', messageKey: errorMessageKeys[normalizedError.code] });
      return false;
    }
  }, []);

  const resetStatus = useCallback(() => setState(initialState), []);

  return { ...state, submit, resetStatus };
}
