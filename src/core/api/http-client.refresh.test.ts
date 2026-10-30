import type { AxiosAdapter, InternalAxiosRequestConfig } from 'axios';

import { clearTokens, getTokens, saveTokens } from '@/core/session/token-storage';

import { httpClient } from './http-client';

jest.mock('@/core/config/env', () => ({
  env: { apiUrl: 'http://api.test', googleWebClientId: null, googleIosClientId: null },
}));

type Responder = (config: InternalAxiosRequestConfig) => { status: number; data?: unknown };

function useAdapter(responder: Responder) {
  const calls: InternalAxiosRequestConfig[] = [];
  const adapter: AxiosAdapter = async (config) => {
    calls.push(config);
    const { status, data } = responder(config);
    const response = { status, data, statusText: '', headers: {}, config };
    if (status >= 400) {
      const { AxiosError } = jest.requireActual<typeof import('axios')>('axios');
      throw new AxiosError('error', undefined, config, undefined, response);
    }
    return response;
  };
  httpClient.defaults.adapter = adapter;
  return calls;
}

const authHeader = (config: InternalAxiosRequestConfig) => config.headers.Authorization;

describe('httpClient session refresh', () => {
  beforeEach(async () => {
    await saveTokens({ accessToken: 'old-access', refreshToken: 'old-refresh' }, { persist: false });
  });

  afterEach(async () => {
    await clearTokens();
  });

  it('rotates tokens once for concurrent 401s and retries with the new access token', async () => {
    const calls = useAdapter((config) => {
      if (config.url === '/auth/refresh') {
        return { status: 200, data: { accessToken: 'new-access', refreshToken: 'new-refresh' } };
      }
      return authHeader(config) === 'Bearer new-access'
        ? { status: 200, data: { name: 'Julia' } }
        : { status: 401 };
    });

    const [first, second] = await Promise.all([httpClient.get('/users/me'), httpClient.get('/users/me')]);

    expect(first.data).toEqual({ name: 'Julia' });
    expect(second.data).toEqual({ name: 'Julia' });
    expect(calls.filter((call) => call.url === '/auth/refresh')).toHaveLength(1);
    expect(getTokens()).toEqual({ accessToken: 'new-access', refreshToken: 'new-refresh' });
  });

  it('clears the session when the backend rejects the refresh token', async () => {
    useAdapter(() => ({ status: 401 }));

    await expect(httpClient.get('/users/me')).rejects.toMatchObject({ response: { status: 401 } });
    expect(getTokens()).toBeNull();
  });

  it('does not attach the session or refresh on public routes', async () => {
    const calls = useAdapter(() => ({ status: 401 }));

    await expect(
      httpClient.post('/auth/login', {}, { skipAuth: true }),
    ).rejects.toMatchObject({ response: { status: 401 } });
    expect(calls).toHaveLength(1);
    expect(authHeader(calls[0])).toBeUndefined();
    expect(getTokens()).not.toBeNull();
  });
});
