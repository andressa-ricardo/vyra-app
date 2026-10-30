import { useState } from 'react';

import { useSession } from '@/core/session/session-provider';
import { getAuthErrorKey } from '@/features/auth/hooks/auth-error-message';
import { registerUser } from '@/features/auth/infrastructure/auth-api';
import type { RegisterRequest } from '@/features/auth/types/auth.types';

type RegisterState =
  | { status: 'idle' | 'loading'; messageKey: null }
  | { status: 'error'; messageKey: string };

export function useRegister() {
  const { signIn } = useSession();
  const [state, setState] = useState<RegisterState>({ status: 'idle', messageKey: null });

  const submit = async (payload: RegisterRequest) => {
    setState({ status: 'loading', messageKey: null });

    try {
      // O cadastro já devolve a sessão; ao autenticar, as rotas protegidas levam à home.
      await signIn(await registerUser(payload));
      return true;
    } catch (error) {
      setState({
        status: 'error',
        messageKey: getAuthErrorKey(error, { conflict: 'auth.register.errors.emailAlreadyExists' }),
      });
      return false;
    }
  };

  const clearMessage = () => setState({ status: 'idle', messageKey: null });

  return { ...state, submit, clearMessage };
}
