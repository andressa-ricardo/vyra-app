import type { AxiosInstance } from 'axios';

import { httpClient } from '@/core/api/http-client';

import type { RegisterRequest, RegisterResponse } from '../types/auth.types';

type PostClient = Pick<AxiosInstance, 'post'>;

export async function registerUser(
  payload: RegisterRequest,
  client: PostClient = httpClient,
): Promise<RegisterResponse> {
  const { data } = await client.post<RegisterResponse>('/auth/register', payload);
  return data;
}
