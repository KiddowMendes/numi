type ShadowSpec = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

/** Flat by default. Elevation is reserved for overlays and interactive layers. */
export const shadow = {
  none: undefined,
  sm: {
    shadowColor: "#0a1224",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  } satisfies ShadowSpec,
  md: {
    shadowColor: "#0a1224",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  } satisfies ShadowSpec,
  lg: {
    shadowColor: "#0a1224",
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 32,
    elevation: 10,
  } satisfies ShadowSpec,
} as const;

export type ShadowToken = keyof typeof shadow;
