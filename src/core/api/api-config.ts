import { env } from '@/core/config/env';

export const API_PREFIX = '/api/v1';
export const API_TIMEOUT_MS = 10_000;

export function getApiBaseUrl(): string {
  if (!env.apiUrl) {
    throw new Error('EXPO_PUBLIC_API_URL is not configured');
  }

  const origin = env.apiUrl.replace(/\/+$/, '');
  const baseUrl = origin.endsWith(API_PREFIX) ? origin : `${origin}${API_PREFIX}`;

  try {
    const parsedUrl = new URL(baseUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) throw new Error();
  } catch {
    throw new Error('EXPO_PUBLIC_API_URL is invalid');
  }

  return baseUrl;
}
