import type { ColorScheme } from "./tokens";

export type ThemePreference = ThemePreferenceValue;
export type ThemePreferenceValue = "light" | "dark" | "system";

/**
 * The user picks light or dark during onboarding. `system` is available later in
 * Settings and is never the default, per the locked token spec.
 */
export const themePreferences: readonly {
  value: ThemePreferenceValue;
  label: string;
  description: string;
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Brightest. Best in direct sun.",
  },
  { value: "dark", label: "Dark", description: "Easier on the eyes at night." },
  {
    value: "system",
    label: "Match device",
    description: "Follows your phone setting.",
  },
] as const;

export const defaultThemePreference: ThemePreferenceValue = "light";

export function isThemePreference(
  value: unknown,
): value is ThemePreferenceValue {
  return value === "light" || value === "dark" || value === "system";
}

export function resolveColorScheme(
  preference: ThemePreferenceValue,
  systemScheme: ColorScheme | "unspecified" | null | undefined,
): ColorScheme {
  if (preference === "light" || preference === "dark") return preference;
  return systemScheme === "dark" ? "dark" : "light";
}
