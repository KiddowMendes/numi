/**
 * NUMI Design System Tokens
 * Derived from docs/playbook/04_Design_System/01_Tokens.md
 *
 * All component code references these tokens — no hardcoded values.
 */

import { Platform } from 'react-native';

// ─── Color ───────────────────────────────────────────────────────────

export const color = {
  light: {
    background: '#d9e5fd',
    surface: '#e6f2ff',
    surfaceRaised: '#f4ffff',
    textPrimary: '#010728',
    textSecondary: '#35476e',
    textMuted: '#50638c',
    textDisabled: '#6c80ab',
    border: '#6c80ab',
    borderSubtle: '#899ecb',
    primary: '#2d457d',
    primaryFg: '#f4ffff',
    income: '#3d7055',
    expense: '#3d5152',
    transfer: '#5b4404',
    stateSafe: '#3d7055',
    stateCaution: '#5b4404',
    stateAlert: '#87544b',
  },
  dark: {
    background: '#01030e',
    surface: '#050a1a',
    surfaceRaised: '#0e1626',
    textPrimary: '#dbf2ff',
    textSecondary: '#9bb1de',
    textMuted: '#6c80ab',
    textDisabled: '#35476e',
    border: '#35476e',
    borderSubtle: '#1c2c51',
    primary: '#92b0f1',
    primaryFg: '#01030e',
    income: '#78ac90',
    expense: '#758b8c',
    transfer: '#ceac64',
    stateSafe: '#78ac90',
    stateCaution: '#ceac64',
    stateAlert: '#c68e85',
  },
} as const;

export type ColorToken = keyof typeof color.light;

/** 8 category accent swatches — purple-violet family (~290°) */
export const categoryColors = [
  '#e8d5f2',
  '#d4b3e6',
  '#b08dd0',
  '#8c67ba',
  '#6841a4',
  '#4a2d82',
  '#2c1960',
  '#0e053e',
] as const;

// ─── Typography ──────────────────────────────────────────────────────

const fontFamily = Platform.select({
  ios: 'Inter',
  android: 'Inter',
  web: 'Inter, ui-sans-serif, system-ui, sans-serif',
  default: 'Inter',
});

export const typography = {
  amountHero: {
    fontFamily,
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 35,
    fontVariant: ['tabular-nums'],
  },
  heading1: {
    fontFamily,
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 29,
  },
  heading2: {
    fontFamily,
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 23,
  },
  title: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily,
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 17,
  },
  amountLg: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 26,
    fontVariant: ['tabular-nums'],
  },
  amountMd: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 19,
    fontVariant: ['tabular-nums'],
  },
  amountSm: {
    fontFamily,
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 17,
    fontVariant: ['tabular-nums'],
  },
} as const;

export type TypographyToken = keyof typeof typography;

// ─── Spacing ─────────────────────────────────────────────────────────
// Base unit: 4px. All values are multiples of 4.

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export type SpacingToken = keyof typeof spacing;

// ─── Border Radius ───────────────────────────────────────────────────

export const radius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;

// ─── Shadows / Elevation ─────────────────────────────────────────────

export const shadow = {
  none: undefined,
  sm: {
    shadowColor: '#01030e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#01030e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: '#01030e',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 8,
  },
} as const;

export type ShadowToken = keyof typeof shadow;

// ─── Motion / Animation ──────────────────────────────────────────────

export const motion = {
  instant: 100,
  fast: 200,
  default: 300,
  slow: 500,
} as const;

// ─── Icon Sizes ──────────────────────────────────────────────────────

export const iconSize = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
} as const;

// ─── Z-Index ─────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  sticky: 10,
  overlay: 50,
  sheet: 100,
  modal: 200,
  toast: 300,
  fab: 400,
} as const;

// ─── Layout Helpers ──────────────────────────────────────────────────

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
