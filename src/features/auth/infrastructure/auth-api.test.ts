import type { AxiosInstance } from 'axios';

import { registerUser } from './auth-api';

describe('registerUser', () => {
  it('posts only the fields accepted by the real backend contract', async () => {
    const payload = { name: 'Ana Silva', email: 'ana@example.com', password: 'Strong123' };
    const response = {
      user: {
        id: 'user-id',
        name: payload.name,
        email: payload.email,
        status: 'ACTIVE' as const,
        emailVerifiedAt: null,
        createdAt: '2026-10-30T00:00:00.000Z',
        updatedAt: '2026-10-30T00:00:00.000Z',
        roles: ['USER'],
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    };
    const post = jest.fn().mockResolvedValue({ data: response });
    const client = { post } as unknown as Pick<AxiosInstance, 'post'>;

    await expect(registerUser(payload, client)).resolves.toEqual(response);
    expect(post).toHaveBeenCalledWith('/auth/register', payload);
  });
});
