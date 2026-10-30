import * as AppleAuthentication from 'expo-apple-authentication';
import { CryptoDigestAlgorithm, digestStringAsync } from 'expo-crypto';
import { Platform } from 'react-native';

import { FederatedSignInError } from './federated-sign-in-error';

export function isAppleSignInAvailable(): Promise<boolean> {
  if (Platform.OS !== 'ios') return Promise.resolve(false);
  return AppleAuthentication.isAvailableAsync();
}

/**
 * A Apple recebe o SHA-256 (hex) do nonce emitido pelo backend; o backend recebe o
 * nonce bruto e compara. Retorna `null` quando o usuário cancela.
 */
export async function requestAppleIdentityToken(rawNonce: string): Promise<string | null> {
  const hashedNonce = await digestStringAsync(CryptoDigestAlgorithm.SHA256, rawNonce);

  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) throw new FederatedSignInError('provider');
    return credential.identityToken;
  } catch (error) {
    if (error instanceof FederatedSignInError) throw error;
    if ((error as { code?: string }).code === 'ERR_REQUEST_CANCELED') return null;
    throw new FederatedSignInError('provider');
  }
}
