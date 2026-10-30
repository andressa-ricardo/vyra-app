import type { SessionTokens } from './token-storage';

/** Perfil público retornado pelo backend em login, cadastro e `GET /users/me`. */
export type SessionUser = {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: string[];
};

export type AuthSession = SessionTokens & { user: SessionUser };
