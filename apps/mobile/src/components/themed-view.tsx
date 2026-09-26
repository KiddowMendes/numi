import { View, type ViewProps, type ViewStyle } from "react-native";

import { color, type ColorToken } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";

export type ThemedViewProps = Omit<ViewProps, "style"> & {
  /** A colour role from the palette. */
  surface?: ColorToken;
  style?: ViewStyle | ViewStyle[];
  children?: React.ReactNode;
};

/**
 * A View that picks its background from the active palette. Use sparingly —
 * most layout should be transparent so the screen gradient shows through.
 */
export function ThemedView({
  surface = "background",
  style,
  children,
  ...rest
}: ThemedViewProps) {
  const mode = useThemeMode();
  return (
    <View style={[{ backgroundColor: color[mode][surface] }, style]} {...rest}>
      {children}
    </View>
  );
}
