import { create, isAxiosError, type AxiosError } from 'axios';

import { clearTokens, getTokens, saveTokens, type SessionTokens } from '@/core/session/token-storage';

import { API_TIMEOUT_MS, getApiBaseUrl } from './api-config';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Não envia o access token nem tenta refresh (rotas públicas de autenticação). */
    skipAuth?: boolean;
    _retried?: boolean;
  }
}

export type ApiErrorCode =
  | 'configuration'
  | 'validation'
  | 'unauthorized'
  | 'conflict'
  | 'rate-limited'
  | 'unavailable'
  | 'network'
  | 'timeout'
  | 'server'
  | 'unknown';

export class ApiError extends Error {
  constructor(
    public readonly code: ApiErrorCode,
    public readonly status?: number,
  ) {
    super(code);
    this.name = 'ApiError';
  }
}

export const httpClient = create({
  timeout: API_TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  const tokens = getTokens();
  if (tokens && !config.skipAuth) {
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

httpClient.interceptors.response.use(undefined, async (error: unknown) => {
  if (!isAxiosError(error) || error.response?.status !== 401) throw error;

  const config = error.config;
  if (!config || config.skipAuth || config._retried || !getTokens()) throw error;

  const refreshed = await refreshSession();
  if (!refreshed) throw error;

  config._retried = true;
  return httpClient(config);
});

let refreshInFlight: Promise<boolean> | null = null;

/**
 * Rotaciona o refresh token. Chamadas simultâneas compartilham a mesma requisição,
 * porque o backend revoga a sessão inteira quando um refresh token é reutilizado.
 */
export function refreshSession(): Promise<boolean> {
  refreshInFlight ??= performRefresh().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

async function performRefresh(): Promise<boolean> {
  const tokens = getTokens();
  if (!tokens) return false;

  try {
    const { data } = await httpClient.post<SessionTokens>(
      '/auth/refresh',
      { refreshToken: tokens.refreshToken },
      { skipAuth: true },
    );
    await saveTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
    return true;
  } catch (error) {
    // Só encerra a sessão quando o backend recusa o token; falha de rede mantém os tokens.
    if (isAxiosError(error) && error.response?.status === 401) await clearTokens();
    return false;
  }
}

export function normalizeHttpError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  if (error instanceof Error && error.message.startsWith('EXPO_PUBLIC_API_URL')) {
    return new ApiError('configuration');
  }

  if (!isAxiosError(error)) return new ApiError('unknown');

  const axiosError = error as AxiosError;
  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
    return new ApiError('timeout');
  }

  if (!axiosError.response) return new ApiError('network');

  const status = axiosError.response.status;
  if (status === 400 || status === 422) return new ApiError('validation', status);
  if (status === 401) return new ApiError('unauthorized', status);
  if (status === 409) return new ApiError('conflict', status);
  if (status === 429) return new ApiError('rate-limited', status);
  if (status === 503) return new ApiError('unavailable', status);
  if (status >= 500) return new ApiError('server', status);

  return new ApiError('unknown', status);
}
