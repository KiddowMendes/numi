/**
 * Legacy theme re-exports — all new code should import from '@/constants/tokens'.
 */
import { color, spacing as newSpacing } from './tokens';

/** Backward-compatible Colors object with legacy property names */
export const Colors = {
  light: {
    ...color.light,
    text: color.light.textPrimary,
    backgroundElement: color.light.borderSubtle,
    backgroundSelected: color.light.surface,
  },
  dark: {
    ...color.dark,
    text: color.dark.textPrimary,
    backgroundElement: color.dark.borderSubtle,
    backgroundSelected: color.dark.surface,
  },
} as const;

/** Backward-compatible Spacing aliases */
export const Spacing = {
  half: 2,
  one: newSpacing.xs,
  two: newSpacing.sm,
  three: newSpacing.lg,
  four: newSpacing.xl,
  five: newSpacing['2xl'],
  six: newSpacing['3xl'],
  // Also include new names for convenience
  ...newSpacing,
} as const;

export type ThemeColor = keyof typeof color.light & string;
export { BottomTabInset, MaxContentWidth } from './tokens';
