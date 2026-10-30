import { useEffect, useState } from 'react';

import { useSession } from '@/core/session/session-provider';
import type { AuthSession } from '@/core/session/session.types';
import { getAuthErrorKey } from '@/features/auth/hooks/auth-error-message';
import { isAppleSignInAvailable, requestAppleIdentityToken } from '@/features/auth/infrastructure/apple-sign-in';
import { createAppleNonce, loginWithApple, loginWithGoogle } from '@/features/auth/infrastructure/auth-api';
import { FederatedSignInError } from '@/features/auth/infrastructure/federated-sign-in-error';
import { requestGoogleIdToken } from '@/features/auth/infrastructure/google-sign-in';
import type { FederatedProvider } from '@/features/auth/types/auth.types';

const sdkErrorKeys: Record<FederatedSignInError['code'], string> = {
  'requires-dev-build': 'auth.federated.errors.requiresDevBuild',
  'not-configured': 'auth.federated.errors.unavailable',
  'not-supported': 'auth.federated.errors.notSupported',
  provider: 'auth.federated.errors.provider',
};

async function authenticateWithGoogle(): Promise<AuthSession | null> {
  const idToken = await requestGoogleIdToken();
  return idToken ? loginWithGoogle(idToken) : null;
}

async function authenticateWithApple(): Promise<AuthSession | null> {
  const { nonce } = await createAppleNonce();
  const identityToken = await requestAppleIdentityToken(nonce);
  return identityToken ? loginWithApple({ identityToken, nonce }) : null;
}

export function useFederatedSignIn() {
  const { signIn } = useSession();
  const [pending, setPending] = useState<FederatedProvider | null>(null);
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    let active = true;
    void isAppleSignInAvailable()
      .catch(() => false)
      .then((available) => {
        if (active) setAppleAvailable(available);
      });
    return () => {
      active = false;
    };
  }, []);

  const start = async (provider: FederatedProvider) => {
    if (pending) return;
    setPending(provider);
    setMessageKey(null);

    try {
      const session = provider === 'google' ? await authenticateWithGoogle() : await authenticateWithApple();
      // `null` = o usuário cancelou no provedor; não é erro.
      if (session) await signIn(session);
    } catch (error) {
      setMessageKey(
        error instanceof FederatedSignInError
          ? sdkErrorKeys[error.code]
          : getAuthErrorKey(error, {
              // O backend não auto-vincula: o e-mail já pertence a uma conta com senha.
              conflict: 'auth.federated.errors.linkRequired',
              unauthorized: 'auth.federated.errors.provider',
              unavailable: 'auth.federated.errors.unavailable',
            }),
      );
    } finally {
      setPending(null);
    }
  };

  const clearMessage = () => setMessageKey(null);

  return { appleAvailable, pending, messageKey, start, clearMessage };
}
