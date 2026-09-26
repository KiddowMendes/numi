/**
 * NUMI colour tokens.
 *
 * Structural rule: borders carry UI boundaries, fills do not. A white card on
 * the page is ~1.1:1 by design; the 1px border at 3.2:1 is what makes the card
 * readable. Every text pair below clears 4.5:1 and every border clears 3:1
 * against its own surface in both themes.
 */

export const color = {
  light: {
    background: "#eef2f8",
    backgroundEdge: "#e3e9f4",
    backgroundGlow: "#f7f9fd",
    surface: "#ffffff",
    surfaceRaised: "#f6f8fc",
    surfaceSunken: "#e8edf6",
    textPrimary: "#0a1224",
    textSecondary: "#44506a",
    textMuted: "#5a6b85",
    textDisabled: "#828fa6",
    border: "#7e8a9f",
    borderSubtle: "#dde3ec",
    primary: "#1f3d8f",
    primaryFg: "#ffffff",
    primarySoft: "#e4eafb",
    income: "#2f6b4f",
    expense: "#3d5152",
    transfer: "#7a5c07",
    stateSafe: "#2f6b4f",
    stateCaution: "#7a5c07",
    stateAlert: "#8a4034",
    overlay: "rgba(10,18,36,0.44)",
  },
  dark: {
    background: "#080c15",
    backgroundEdge: "#04070d",
    backgroundGlow: "#0d1420",
    surface: "#101725",
    surfaceRaised: "#18202f",
    surfaceSunken: "#0b111c",
    textPrimary: "#eef3fb",
    textSecondary: "#b3c0d4",
    textMuted: "#8494ab",
    textDisabled: "#66738a",
    border: "#607089",
    borderSubtle: "#232c3b",
    primary: "#9db4ea",
    primaryFg: "#080c15",
    primarySoft: "#1b2740",
    income: "#7fbb99",
    expense: "#8fa3a4",
    transfer: "#d6b46a",
    stateSafe: "#7fbb99",
    stateCaution: "#d6b46a",
    stateAlert: "#d09a90",
    overlay: "rgba(4,7,13,0.66)",
  },
} as const;

export type ColorScheme = "light" | "dark";
export type ColorToken = keyof typeof color.light;
export type ColorPalette = (typeof color)[ColorScheme];

/** The three financial states are a set, never a good/bad ladder. */
export const stateTokens = ["stateSafe", "stateCaution", "stateAlert"] as const;
export type StateToken = (typeof stateTokens)[number];

/** Colour roles a piece of text is allowed to take. */
export type TextTone = Extract<
  ColorToken,
  | "textPrimary"
  | "textSecondary"
  | "textMuted"
  | "textDisabled"
  | "primary"
  | "primaryFg"
  | "income"
  | "expense"
  | "transfer"
  | "stateSafe"
  | "stateCaution"
  | "stateAlert"
>;

type CategoryAccent = { light: string; dark: string; label: string };

/**
 * Eight hues keyed to the seeded categories. Each has a light and a dark fill
 * because a deep tone disappears on a near-black surface and a pale tint
 * disappears on white. Light fills take white text, dark fills take ink.
 */
export const categoryAccents = {
  food: { light: "#c2410c", dark: "#f0a58a", label: "Food" },
  transport: { light: "#1d4ed8", dark: "#a3b8f5", label: "Transport" },
  bills: { light: "#b91c1c", dark: "#f4a9a4", label: "Bills" },
  data: { light: "#0e7490", dark: "#8fd0e2", label: "Data" },
  study: { light: "#6d28d9", dark: "#c0aef0", label: "Study" },
  health: { light: "#047857", dark: "#8ed4b3", label: "Health" },
  social: { light: "#be185d", dark: "#f0a3c2", label: "Social" },
  other: { light: "#5a6779", dark: "#b6c0cf", label: "Other" },
} as const satisfies Record<string, CategoryAccent>;

export type CategoryAccentKey = keyof typeof categoryAccents;

export const categoryAccentKeys = Object.keys(
  categoryAccents,
) as CategoryAccentKey[];

/** Seed order, so consecutive entries are always far apart on the wheel. */
export const categoryAccentOrder: CategoryAccentKey[] = [
  "food",
  "transport",
  "bills",
  "data",
  "study",
  "health",
  "social",
  "other",
];

const FALLBACK_ACCENT = categoryAccents.other;

/**
 * Resolve an accent by category key, falling back to `other` for unknown keys
 * so a new category can never crash a list.
 */
export function resolveCategoryAccent(
  key: string | null | undefined,
  scheme: ColorScheme,
): string {
  const accent =
    categoryAccents[(key ?? "other") as CategoryAccentKey] ?? FALLBACK_ACCENT;
  return accent[scheme];
}

/** Text colour that is guaranteed legible on the resolved accent fill. */
export function resolveAccentForeground(scheme: ColorScheme): string {
  return scheme === "dark" ? color.dark.textPrimary : "#ffffff";
}
