import { httpClient } from '@/core/api/http-client';

import type { SessionUser } from './session.types';

export async function fetchCurrentUser(): Promise<SessionUser> {
  const { data } = await httpClient.get<SessionUser>('/users/me');
  return data;
}

export async function revokeSession(refreshToken: string): Promise<void> {
  await httpClient.post('/auth/logout', { refreshToken }, { skipAuth: true });
}
