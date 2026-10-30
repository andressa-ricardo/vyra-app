import { useState } from 'react';

import { useSession } from '@/core/session/session-provider';
import { getAuthErrorKey } from '@/features/auth/hooks/auth-error-message';
import { loginUser } from '@/features/auth/infrastructure/auth-api';
import type { LoginRequest } from '@/features/auth/types/auth.types';

type LoginState =
  | { status: 'idle' | 'loading'; messageKey: null }
  | { status: 'error'; messageKey: string };

export function useLogin() {
  const { signIn } = useSession();
  const [state, setState] = useState<LoginState>({ status: 'idle', messageKey: null });

  const submit = async (payload: LoginRequest, options: { rememberMe: boolean }) => {
    setState({ status: 'loading', messageKey: null });

    try {
      await signIn(await loginUser(payload), { persist: options.rememberMe });
    } catch (error) {
      setState({
        status: 'error',
        messageKey: getAuthErrorKey(error, { unauthorized: 'auth.login.errors.invalidCredentials' }),
      });
    }
  };

  const clearMessage = () => setState({ status: 'idle', messageKey: null });

  return { ...state, submit, clearMessage };
}
