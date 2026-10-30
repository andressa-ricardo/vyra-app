import { z } from 'zod';

type Translate = (key: string) => string;

export function createRegisterSchema(t: Translate) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(1, t('auth.register.validation.nameRequired'))
        .min(2, t('auth.register.validation.nameMin'))
        .max(120, t('auth.register.validation.nameMax')),
      email: z
        .string()
        .trim()
        .min(1, t('auth.register.validation.emailRequired'))
        .max(254, t('auth.register.validation.emailMax'))
        .email(t('auth.register.validation.emailInvalid')),
      password: z
        .string()
        .min(1, t('auth.register.validation.passwordRequired'))
        .min(8, t('auth.register.validation.passwordMin'))
        .max(128, t('auth.register.validation.passwordMax'))
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
          t('auth.register.validation.passwordRules'),
        ),
      confirmPassword: z
        .string()
        .min(1, t('auth.register.validation.confirmPasswordRequired')),
      acceptTerms: z.boolean().refine(Boolean, {
        message: t('auth.register.validation.termsRequired'),
      }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.register.validation.passwordMismatch'),
      path: ['confirmPassword'],
    });
}

export type RegisterFormValues = z.infer<ReturnType<typeof createRegisterSchema>>;
