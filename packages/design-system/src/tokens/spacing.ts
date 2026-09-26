/** Base unit 4px. Every value is a multiple of 4. */
export const spacing = {
  none: 0,
  /** The one step below the 4px base unit, for hairlines and tight icon gaps. */
  "3xs": 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
  "4xl": 72,
} as const;

export type SpacingToken = keyof typeof spacing;

/** Horizontal page gutter. Every screen uses this so edges line up. */
export const screenPadding = spacing.xl;
export const sectionGap = spacing.xl;
export const stackGap = spacing.lg;
export const inlineGap = spacing.sm;
export const hairlineGap = spacing.xs;
