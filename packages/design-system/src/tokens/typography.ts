/**
 * Typography metrics. Deliberately free of any React Native import: the
 * package is consumed by both apps, so font *family resolution* lives in the
 * platform layer (`apps/mobile/src/constants/tokens.ts`). `family` names the
 * weight; the platform maps it to a real loaded file.
 */

export const fontFamilyName = {
  regular: "Inter",
  medium: "Inter-Medium",
  semiBold: "Inter-SemiBold",
  bold: "Inter-Bold",
} as const;

export type FontFamilyToken = keyof typeof fontFamilyName;
export type FontWeightToken = 400 | 500 | 600 | 700;

type TypeSpec = {
  family: FontFamilyToken;
  weight: FontWeightToken;
  fontSize: number;
  lineHeight: number;
  /** Letter spacing in points. Amounts get 0 so digits stay vertically aligned. */
  tracking?: number;
  /** Money only. Tabular figures stop the number jittering as it counts. */
  tabular?: boolean;
};

const typeSpecs = {
  display: {
    family: "bold",
    weight: 700,
    fontSize: 40,
    lineHeight: 44,
    tracking: -1.2,
    tabular: true,
  },
  amountHero: {
    family: "bold",
    weight: 700,
    fontSize: 32,
    lineHeight: 35,
    tracking: -0.8,
    tabular: true,
  },
  heading1: {
    family: "bold",
    weight: 700,
    fontSize: 24,
    lineHeight: 29,
    tracking: -0.4,
  },
  heading2: {
    family: "semiBold",
    weight: 600,
    fontSize: 18,
    lineHeight: 23,
    tracking: -0.2,
  },
  title: { family: "semiBold", weight: 600, fontSize: 16, lineHeight: 22 },
  body: { family: "regular", weight: 400, fontSize: 16, lineHeight: 24 },
  label: { family: "medium", weight: 500, fontSize: 14, lineHeight: 20 },
  caption: { family: "medium", weight: 500, fontSize: 12, lineHeight: 17 },
  overline: {
    family: "semiBold",
    weight: 600,
    fontSize: 11,
    lineHeight: 14,
    tracking: 1.4,
  },
  amountLg: {
    family: "bold",
    weight: 700,
    fontSize: 22,
    lineHeight: 26,
    tabular: true,
  },
  amountMd: {
    family: "semiBold",
    weight: 600,
    fontSize: 16,
    lineHeight: 19,
    tabular: true,
  },
  amountSm: {
    family: "semiBold",
    weight: 600,
    fontSize: 14,
    lineHeight: 17,
    tabular: true,
  },
  button: {
    family: "semiBold",
    weight: 600,
    fontSize: 16,
    lineHeight: 20,
    tracking: -0.1,
  },
} as const satisfies Record<string, TypeSpec>;

/**
 * Widened on purpose. Keeping the literal shape would make `spec.tracking` a
 * type error on the tokens that do not set it, so every consumer would need a
 * cast. The values are still exactly what is written above.
 */
export const typography: Record<keyof typeof typeSpecs, TypeSpec> = typeSpecs;

export type TypographyToken = keyof typeof typeSpecs;

/** The type tokens that carry a single number and must never wrap. */
export const amountTokens = [
  "display",
  "amountHero",
  "amountLg",
  "amountMd",
  "amountSm",
] as const satisfies readonly TypographyToken[];
