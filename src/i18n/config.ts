import { getLocales } from 'expo-localization';

export const supportedLanguages = ['pt-BR', 'en'] as const;
export type SupportedLanguage = (typeof supportedLanguages)[number];

export const defaultLanguage: SupportedLanguage = 'pt-BR';

export function resolveDeviceLanguage(): SupportedLanguage {
  const languageCode = getLocales()[0]?.languageCode?.toLowerCase();

  return languageCode === 'en' ? 'en' : defaultLanguage;
}

export function isSupportedLanguage(value: string): value is SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage);
}
