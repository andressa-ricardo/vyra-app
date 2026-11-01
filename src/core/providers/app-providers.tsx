import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import type { PropsWithChildren } from 'react';
import { I18nextProvider } from 'react-i18next';

import { SessionProvider } from '@/core/session/session-provider';
import { useColorScheme } from '@/shared/hooks/use-color-scheme';
import { colors } from '@/theme';
import { i18n } from '@/i18n';

const lightNavigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.light.primary,
    background: colors.light.background,
    card: colors.light.backgroundElement,
    text: colors.light.text,
    border: colors.light.border,
  },
};

const darkNavigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.dark.primary,
    background: colors.dark.background,
    card: colors.dark.backgroundElement,
    text: colors.dark.text,
    border: colors.dark.border,
  },
};

export function AppProviders({ children }: PropsWithChildren) {
  const colorScheme = useColorScheme();

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={colorScheme === 'dark' ? darkNavigationTheme : lightNavigationTheme}>
        <SessionProvider>{children}</SessionProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
