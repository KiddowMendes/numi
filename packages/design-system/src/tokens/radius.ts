export const radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 26,
  "2xl": 34,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

/** iOS settings-style group: one rounded container, hairline between rows. */
export const groupRadius = radius.xl;
export const controlRadius = radius.full;
