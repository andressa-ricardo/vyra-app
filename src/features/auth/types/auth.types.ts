export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  roles: string[];
};

export type RegisterResponse = {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
};
