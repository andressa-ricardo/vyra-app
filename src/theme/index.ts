import './global.css';

import { Platform } from 'react-native';

export { colors, palette, type ColorSchemeName, type ThemeColor, type ThemeColors } from './colors';
export { spacing } from './spacing';
export { fonts } from './typography';

// Compatibility names retained while the starter UI is replaced by product features.
export { colors as Colors } from './colors';
export { fonts as Fonts } from './typography';
export { spacing as Spacing } from './spacing';

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
