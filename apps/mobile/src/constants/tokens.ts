/**
 * The platform seam of the design system.
 *
 * `@numi/design-system` holds the values; this module is the only place that
 * knows how they map onto React Native. Two jobs:
 *
 * 1. Resolves a `family` weight token to a real Inter family name. Each weight
 *    is registered as its own file in `app/_layout.tsx`, and Android will not
 *    synthesise a weight from the generic family name, so every type token has
 *    to point at the file matching its own weight.
 * 2. Merges the raw type metrics into complete `TextStyle` objects.
 */

import { Platform, type TextStyle } from "react-native";

import {
  color,
  fontFamilyName,
  radius,
  spacing,
  typography as typeMetrics,
  type ColorPalette,
  type ColorScheme,
  type FontFamilyToken,
  type TypographyToken,
} from "@numi/design-system";

export {
  backgroundGradient,
  categoryAccentKeys,
  categoryAccentOrder,
  categoryAccents,
  color,
  defaultThemePreference,
  duration,
  easing,
  fontFamilyName,
  hitSlopMin,
  iconSize,
  isThemePreference,
  motion,
  motionEasing,
  radius,
  resolveAccentForeground,
  resolveBackgroundGradient,
  resolveCategoryAccent,
  resolveColorScheme,
  shadow,
  spacing,
  themePreferences,
  zIndex,
} from "@numi/design-system";

export type {
  CategoryAccentKey,
  ColorPalette,
  ColorScheme,
  ColorToken,
  IconSizeToken,
  RadiusToken,
  ShadowToken,
  SpacingToken,
  StateToken,
  TextTone,
  ThemePreferenceValue,
  TypographyToken,
  ZIndexToken,
} from "@numi/design-system";

export const screenPadding = spacing.xl;
export const sectionGap = spacing.xl;
export const stackGap = spacing.lg;
export const inlineGap = spacing.sm;
export const hairlineGap = spacing.xs;
export const groupRadius = radius.xl;
export const controlRadius = radius.full;

/** Height the tab bar claims at the bottom of the screen, per platform. */
export const BottomTabInset = Platform.select({
  ios: 58,
  android: 72,
  default: 64,
});

function resolveFamily(family: FontFamilyToken): string {
  const name = fontFamilyName[family];
  return Platform.select({
    ios: name,
    android: name,
    web: `${name}, ui-sans-serif, system-ui, -apple-system, sans-serif`,
    default: name,
  });
}

type ResolvedType = TextStyle & { tabular: boolean };

function resolve(token: TypographyToken): ResolvedType {
  const spec = typeMetrics[token];
  return {
    fontFamily: resolveFamily(spec.family),
    fontSize: spec.fontSize,
    fontWeight: `${spec.weight}`,
    lineHeight: spec.lineHeight,
    ...(spec.tracking !== undefined && { letterSpacing: spec.tracking }),
    ...(spec.tabular && { fontVariant: ["tabular-nums" as const] }),
    tabular: spec.tabular === true,
  };
}

export const typography = Object.fromEntries(
  (Object.keys(typeMetrics) as TypographyToken[]).map((token) => [
    token,
    resolve(token),
  ]),
) as Record<TypographyToken, ResolvedType>;

/** Money is always set in the currency's locale, never with a float intermediate. */
export function formatCents(cents: number, locale = "en-ZA"): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "ZAR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function palette(scheme: ColorScheme): ColorPalette {
  return color[scheme];
}
