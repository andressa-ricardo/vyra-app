import { normalizeHttpError, type ApiErrorCode } from '@/core/api/http-client';

const defaultKeys: Record<ApiErrorCode, string> = {
  configuration: 'auth.errors.configuration',
  validation: 'auth.errors.validation',
  unauthorized: 'auth.errors.unknown',
  conflict: 'auth.errors.unknown',
  'rate-limited': 'auth.errors.rateLimited',
  unavailable: 'auth.errors.server',
  network: 'auth.errors.network',
  timeout: 'auth.errors.timeout',
  server: 'auth.errors.server',
  unknown: 'auth.errors.unknown',
};

/** Traduz um erro de API em chave i18n, sem expor mensagens técnicas do backend. */
export function getAuthErrorKey(
  error: unknown,
  overrides: Partial<Record<ApiErrorCode, string>> = {},
): string {
  const { code } = normalizeHttpError(error);
  return overrides[code] ?? defaultKeys[code];
}
