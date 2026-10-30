import { createRegisterSchema } from './register.schema';

const schema = createRegisterSchema((key) => key);

describe('register schema', () => {
  const validValues = {
    name: 'Ana Silva',
    email: 'ana@example.com',
    password: 'Strong123',
    confirmPassword: 'Strong123',
    acceptTerms: true,
  };

  it('accepts the backend registration contract', () => {
    expect(schema.safeParse(validValues).success).toBe(true);
  });

  it('rejects a password without the required character groups', () => {
    const result = schema.safeParse({ ...validValues, password: 'weakpass', confirmPassword: 'weakpass' });

    expect(result.success).toBe(false);
  });

  it('rejects a different password confirmation', () => {
    const result = schema.safeParse({ ...validValues, confirmPassword: 'Different123' });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });

  it('requires acceptance of terms', () => {
    expect(schema.safeParse({ ...validValues, acceptTerms: false }).success).toBe(false);
  });
});
