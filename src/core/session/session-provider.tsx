import { createContext, use, useEffect, useState, type PropsWithChildren } from 'react';

import { normalizeHttpError } from '@/core/api/http-client';

import { fetchCurrentUser, revokeSession } from './session-api';
import type { AuthSession, SessionUser } from './session.types';
import { clearTokens, getTokens, loadTokens, onTokensCleared, saveTokens } from './token-storage';

type SessionState =
  | { status: 'loading'; user: null }
  | { status: 'authenticated'; user: SessionUser }
  | { status: 'unauthenticated'; user: null };

type SessionContextValue = SessionState & {
  signIn: (session: AuthSession, options?: { persist?: boolean }) => Promise<void>;
  signOut: () => Promise<void>;
};

const signedOut: SessionState = { status: 'unauthenticated', user: null };

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<SessionState>({ status: 'loading', user: null });

  useEffect(() => {
    let active = true;
    // Disparado quando o backend recusa o refresh token (sessão expirada ou revogada).
    const unsubscribe = onTokensCleared(() => setState(signedOut));

    void restoreSession().then((user) => {
      if (active) setState(user ? { status: 'authenticated', user } : signedOut);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const signIn = async (
    { user, accessToken, refreshToken }: AuthSession,
    options?: { persist?: boolean },
  ) => {
    await saveTokens({ accessToken, refreshToken }, { persist: options?.persist ?? true });
    setState({ status: 'authenticated', user });
  };

  const signOut = async () => {
    const tokens = getTokens();
    if (tokens) {
      // O logout do backend é idempotente; falhas de rede não impedem sair localmente.
      await revokeSession(tokens.refreshToken).catch(() => undefined);
    }
    await clearTokens();
    setState(signedOut);
  };

  return <SessionContext value={{ ...state, signIn, signOut }}>{children}</SessionContext>;
}

export function useSession() {
  const context = use(SessionContext);
  if (!context) throw new Error('useSession must be used within SessionProvider');
  return context;
}

async function restoreSession(): Promise<SessionUser | null> {
  try {
    if (!(await loadTokens())) return null;
    return await fetchCurrentUser();
  } catch (error) {
    // Sem rede o usuário volta ao login, mas os tokens ficam para a próxima abertura.
    const { code } = normalizeHttpError(error);
    if (!['network', 'timeout', 'configuration'].includes(code)) await clearTokens();
    return null;
  }
}
