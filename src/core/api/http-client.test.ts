import { ApiError, normalizeHttpError } from './http-client';

describe('normalizeHttpError', () => {
  it('normalizes a timeout without exposing the technical message', () => {
    const result = normalizeHttpError({ isAxiosError: true, code: 'ECONNABORTED' });

    expect(result).toBeInstanceOf(ApiError);
    expect(result.code).toBe('timeout');
    expect(result.message).toBe('timeout');
  });

  it.each([
    [400, 'validation'],
    [409, 'conflict'],
    [429, 'rate-limited'],
    [500, 'server'],
  ] as const)('maps HTTP %s to %s', (status, code) => {
    const result = normalizeHttpError({
      isAxiosError: true,
      response: { status },
    });

    expect(result.code).toBe(code);
    expect(result.status).toBe(status);
  });

  it('normalizes requests without a response as network errors', () => {
    expect(normalizeHttpError({ isAxiosError: true }).code).toBe('network');
  });
});
