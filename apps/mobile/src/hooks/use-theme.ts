import { useColorScheme as useSystemColorScheme } from "react-native";

import { useStore } from "@/store/store";
import {
  color,
  resolveColorScheme,
  type ColorPalette,
  type ColorScheme,
} from "@/constants/tokens";

export { useColorScheme } from "react-native";

/**
 * The single source of truth for which palette is in play. It honours the
 * choice the user made during onboarding; `system` follows the OS.
 */
export function useThemeMode(): ColorScheme {
  const preference = useStore((s) => s.themePreference);
  const systemScheme = useSystemColorScheme();
  return resolveColorScheme(preference, systemScheme);
}

export function useTheme(): ColorPalette {
  return color[useThemeMode()];
}
