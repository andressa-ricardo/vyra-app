import type { AuthSession } from '@/core/session/session.types';

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterResponse = AuthSession;
export type LoginResponse = AuthSession;

export type FederatedAuthResponse = AuthSession & {
  isNewUser: boolean;
  onboarding: { status: string };
};

export type AppleNonceResponse = {
  nonce: string;
  expiresAt: string;
};

export type FederatedProvider = 'google' | 'apple';
