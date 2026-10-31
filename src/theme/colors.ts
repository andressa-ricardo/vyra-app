export const palette = {
  blue500: '#3B82F6',
  blue600: '#2563EB',
  blue400: '#60A5FA',
  white: '#FFFFFF',
  black: '#000000',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  gray200: '#E2E8F0',
  gray400: '#94A3B8',
  gray600: '#475569',
  gray800: '#1E293B',
  gray900: '#0F172A',
  red500: '#EF4444',
  green500: '#22C55E',
} as const;

export const authColors = {
  background: '#030C1B',
  surface: '#111E32',
  surfacePressed: '#182942',
  border: '#263A55',
  primary: palette.blue500,
  text: palette.white,
  muted: '#91BCE4',
  placeholder: '#6888A8',
  danger: '#F87171',
  success: '#4ADE80',
} as const;

/** Cores de destaque das métricas de atividade; o azul continua sendo o `authColors.primary`. */
export const metricColors = {
  calories: '#F97316',
  time: '#22C55E',
  pace: '#A855F7',
  elevation: '#22C55E',
  start: '#22C55E',
  warning: '#FACC15',
} as const;

export const colors = {
  light: {
    primary: palette.blue600,
    onPrimary: palette.white,
    text: palette.gray900,
    textSecondary: palette.gray600,
    background: palette.white,
    backgroundElement: palette.gray100,
    backgroundSelected: palette.gray200,
    border: palette.gray200,
    error: palette.red500,
    success: palette.green500,
  },
  dark: {
    primary: palette.blue400,
    onPrimary: palette.gray900,
    text: palette.gray50,
    textSecondary: palette.gray400,
    background: palette.black,
    backgroundElement: palette.gray900,
    backgroundSelected: palette.gray800,
    border: palette.gray800,
    error: palette.red500,
    success: palette.green500,
  },
} as const;

export type ColorSchemeName = keyof typeof colors;
export type ThemeColors = (typeof colors)[ColorSchemeName];
export type ThemeColor = keyof ThemeColors;
