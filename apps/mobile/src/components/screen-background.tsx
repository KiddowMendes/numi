import type { ReactNode } from "react";
import {
  StyleSheet,
  View,
  type ColorValue,
  type ViewStyle,
} from "react-native";
import { LinearGradient, type LinearGradientProps } from "expo-linear-gradient";

import { resolveBackgroundGradient } from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";

export type ScreenBackgroundProps = {
  children?: ReactNode;
  style?: ViewStyle | ViewStyle[];
};

/**
 * Every screen sits on this. The gradient is atmosphere only — it stays within
 * a few points of luminance of the base background, so contrast is unaffected
 * and cards keep reading as white-on-tint via their 1px border.
 */
export function ScreenBackground({ children, style }: ScreenBackgroundProps) {
  const mode = useThemeMode();
  const colors = resolveBackgroundGradient(mode);

  const gradientProps: LinearGradientProps = {
    colors: colors.map((stop) => stop.color) as unknown as readonly [
      ColorValue,
      ColorValue,
      ColorValue,
    ],
    locations: colors.map((stop) => stop.location) as unknown as readonly [
      number,
      number,
      number,
    ],
    start: { x: 0.1, y: 0 },
    end: { x: 0.9, y: 1 },
  };

  return (
    <LinearGradient {...gradientProps} style={[styles.fill, style]}>
      <View style={styles.fill}>{children}</View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
