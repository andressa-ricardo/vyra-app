import type { AxiosInstance } from 'axios';

import { httpClient } from '@/core/api/http-client';

import type {
  AppleNonceResponse,
  FederatedAuthResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../types/auth.types';

type PostClient = Pick<AxiosInstance, 'post'>;

// Rotas públicas: um 401 aqui é credencial inválida, não access token expirado.
const publicRoute = { skipAuth: true } as const;

export async function registerUser(
  payload: RegisterRequest,
  client: PostClient = httpClient,
): Promise<RegisterResponse> {
  const { data } = await client.post<RegisterResponse>('/auth/register', payload, publicRoute);
  return data;
}

export async function loginUser(
  payload: LoginRequest,
  client: PostClient = httpClient,
): Promise<LoginResponse> {
  const { data } = await client.post<LoginResponse>('/auth/login', payload, publicRoute);
  return data;
}

export async function loginWithGoogle(
  idToken: string,
  client: PostClient = httpClient,
): Promise<FederatedAuthResponse> {
  const { data } = await client.post<FederatedAuthResponse>(
    '/auth/federated/google',
    { idToken },
    publicRoute,
  );
  return data;
}

export async function createAppleNonce(client: PostClient = httpClient): Promise<AppleNonceResponse> {
  const { data } = await client.post<AppleNonceResponse>(
    '/auth/federated/apple/nonce',
    undefined,
    publicRoute,
  );
  return data;
}

export async function loginWithApple(
  payload: { identityToken: string; nonce: string },
  client: PostClient = httpClient,
): Promise<FederatedAuthResponse> {
  const { data } = await client.post<FederatedAuthResponse>(
    '/auth/federated/apple',
    payload,
    publicRoute,
  );
  return data;
}
