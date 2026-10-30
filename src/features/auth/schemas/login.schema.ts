import { z } from 'zod';

type Translate = (key: string) => string;

export function createLoginSchema(t: Translate) {
  return z.object({
    email: z
      .string()
      .trim()
      .min(1, t('auth.register.validation.emailRequired'))
      .max(254, t('auth.register.validation.emailMax'))
      .email(t('auth.register.validation.emailInvalid')),
    password: z
      .string()
      .min(1, t('auth.register.validation.passwordRequired'))
      .max(128, t('auth.register.validation.passwordMax')),
    rememberMe: z.boolean(),
  });
}

export type LoginFormValues = z.infer<ReturnType<typeof createLoginSchema>>;
