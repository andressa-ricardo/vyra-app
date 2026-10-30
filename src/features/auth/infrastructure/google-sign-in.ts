import { isRunningInExpoGo } from 'expo';
import { Platform } from 'react-native';

import { env } from '@/core/config/env';

import { FederatedSignInError } from './federated-sign-in-error';

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

let configured = false;

function loadGoogleSignIn(): GoogleSignInModule {
  if (Platform.OS === 'web') throw new FederatedSignInError('not-supported');
  if (isRunningInExpoGo()) throw new FederatedSignInError('requires-dev-build');
  if (!env.googleWebClientId) throw new FederatedSignInError('not-configured');

  // Carregado sob demanda: o módulo nativo não existe no Expo Go e quebraria o app na importação.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('@react-native-google-signin/google-signin') as GoogleSignInModule;
}

/** Abre o seletor de contas do Google. Retorna `null` quando o usuário cancela. */
export async function requestGoogleIdToken(): Promise<string | null> {
  const { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } = loadGoogleSignIn();

  if (!configured) {
    // O ID token terá o client Web como audience; ele precisa estar liberado no backend.
    GoogleSignin.configure({
      webClientId: env.googleWebClientId ?? undefined,
      iosClientId: env.googleIosClientId ?? undefined,
    });
    configured = true;
  }

  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) return null;

    const { idToken } = response.data;
    // A sessão é da VYRA; sair do Google permite escolher outra conta na próxima vez.
    await GoogleSignin.signOut().catch(() => null);
    if (!idToken) throw new FederatedSignInError('provider');
    return idToken;
  } catch (error) {
    if (error instanceof FederatedSignInError) throw error;
    if (
      isErrorWithCode(error) &&
      (error.code === statusCodes.SIGN_IN_CANCELLED || error.code === statusCodes.IN_PROGRESS)
    ) {
      return null;
    }
    throw new FederatedSignInError('provider');
  }
}
