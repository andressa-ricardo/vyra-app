import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type SessionTokens = {
  accessToken: string;
  refreshToken: string;
};

const ACCESS_TOKEN_KEY = 'vyra.session.accessToken';
const REFRESH_TOKEN_KEY = 'vyra.session.refreshToken';

// SecureStore não existe na web; lá a sessão vive apenas em memória.
const canPersist = Platform.OS !== 'web';

let current: SessionTokens | null = null;
let persisted = false;
const clearListeners = new Set<() => void>();

export function getTokens(): SessionTokens | null {
  return current;
}

export async function loadTokens(): Promise<SessionTokens | null> {
  if (!canPersist) return current;

  const [accessToken, refreshToken] = await Promise.all([
    SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
  ]);
  if (!accessToken || !refreshToken) return null;

  current = { accessToken, refreshToken };
  persisted = true;
  return current;
}

/**
 * Substitui os tokens atuais. Com `persist: false` (sem "Lembrar de mim") a sessão
 * vale só enquanto o app estiver aberto. Rotações mantêm a escolha anterior.
 */
export async function saveTokens(tokens: SessionTokens, options?: { persist?: boolean }) {
  current = tokens;
  if (options?.persist !== undefined) persisted = options.persist;
  if (!canPersist) return;

  if (persisted) {
    await Promise.all([
      SecureStore.setItemAsync(ACCESS_TOKEN_KEY, tokens.accessToken),
      SecureStore.setItemAsync(REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  } else {
    await deletePersistedTokens();
  }
}

export async function clearTokens() {
  const hadSession = current !== null;
  current = null;
  persisted = false;
  if (canPersist) await deletePersistedTokens();
  if (hadSession) clearListeners.forEach((listener) => listener());
}

export function onTokensCleared(listener: () => void) {
  clearListeners.add(listener);
  return () => {
    clearListeners.delete(listener);
  };
}

function deletePersistedTokens() {
  return Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}
