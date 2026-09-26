export const iconSize = {
  dot: 12,
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 44,
} as const;

export type IconSizeToken = keyof typeof iconSize;

export const zIndex = {
  base: 0,
  sticky: 10,
  overlay: 50,
  sheet: 100,
  dock: 200,
  modal: 300,
  toast: 400,
} as const;

export type ZIndexToken = keyof typeof zIndex;

/** Minimum comfortable touch target, per WCAG 2.5.5 and the component spec. */
export const hitSlopMin = 48;
