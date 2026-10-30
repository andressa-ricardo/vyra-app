import { z } from 'zod';

import { fitnessLevels } from '../types/onboarding.types';
import { parseBirthDate, parseDecimal } from '../utils/personal-data';

type Translate = (key: string) => string;

function decimalInRange(min: number, max: number, message: string) {
  return z.string().refine((value) => {
    const parsed = parseDecimal(value);
    return parsed === null || (parsed >= min && parsed <= max);
  }, message);
}

/** Todos os campos são opcionais, mas o que for preenchido precisa ser aceito pelo backend. */
export function createPersonalDataSchema(t: Translate) {
  return z.object({
    displayName: z.string().trim().max(120, t('onboarding.personal.validation.displayNameMax')),
    birthDate: z.string().refine((value) => {
      if (!value) return true;
      const iso = parseBirthDate(value);
      if (!iso) return false;
      return Number(iso.slice(0, 4)) >= 1900 && new Date(iso) <= new Date();
    }, t('onboarding.personal.validation.birthDate')),
    heightCm: decimalInRange(50, 300, t('onboarding.personal.validation.height')),
    currentWeightKg: decimalInRange(20, 500, t('onboarding.personal.validation.weight')),
    fitnessLevel: z.enum(fitnessLevels).nullable(),
  });
}

export type PersonalDataFormValues = z.infer<ReturnType<typeof createPersonalDataSchema>>;
