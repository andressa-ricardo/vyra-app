import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import ptBR from './locales/pt-BR.json';
import { defaultLanguage, resolveDeviceLanguage, type SupportedLanguage } from './config';

const resources = {
  'pt-BR': { translation: ptBR },
  en: { translation: en },
} as const;

const i18n = createInstance();

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveDeviceLanguage(),
  fallbackLng: defaultLanguage,
  supportedLngs: Object.keys(resources),
  interpolation: { escapeValue: false },
});

export function changeLanguage(language: SupportedLanguage) {
  return i18n.changeLanguage(language);
}

export { i18n };
