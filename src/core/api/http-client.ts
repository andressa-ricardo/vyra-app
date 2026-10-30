import { create, isAxiosError, type AxiosError } from 'axios';

import { API_TIMEOUT_MS, getApiBaseUrl } from './api-config';

export type ApiErrorCode =
  | 'configuration'
  | 'validation'
  | 'conflict'
  | 'rate-limited'
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

httpClient.interceptors.request.use((config) => ({
  ...config,
  baseURL: getApiBaseUrl(),
}));

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
  if (status === 409) return new ApiError('conflict', status);
  if (status === 429) return new ApiError('rate-limited', status);
  if (status >= 500) return new ApiError('server', status);

  return new ApiError('unknown', status);
}
