import {
  StyleSheet,
  View,
  useWindowDimensions,
  type ColorValue,
  type ViewStyle,
} from "react-native";
import { LinearGradient, type LinearGradientProps } from "expo-linear-gradient";

export type RadialGlowProps = {
  /** Any resolved colour from the palette. */
  color: string;
  /** Peak intensity at the top edge. Kept low — this is atmosphere, not a surface. */
  opacity?: number;
  /** Fraction of the window height the glow occupies. */
  extent?: number;
  style?: ViewStyle;
};

/**
 * Applies an alpha channel to a palette colour.
 *
 * Every token in `color.light` / `color.dark` is a 6-digit hex, but `overlay` is
 * already an `rgba()` string, so both shapes have to survive this.
 */
function withAlpha(color: string, alpha: number): ColorValue {
  if (color.startsWith("rgb")) {
    return color.replace(/rgba?\(([^)]+)\)/, (_match, inner: string) => {
      const [r, g, b] = inner.split(",").map((part) => part.trim());
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    });
  }

  const hex = color.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * A soft light source at one edge of a screen.
 *
 * Static, non-interactive, and capped low. In light mode the page base is
 * already close to `#eef2f8`; pushing this any harder puts body text back under
 * 4.5:1, which `01_Tokens.md` treats as non-negotiable.
 *
 * Height comes from the window rather than `onLayout`: the band is absolutely
 * positioned, so laying it out to measure it would measure zero and deadlock.
 */
export function RadialGlow({
  color,
  opacity = 0.12,
  extent = 0.35,
  style,
}: RadialGlowProps) {
  const { height: windowHeight } = useWindowDimensions();

  const gradientProps: LinearGradientProps = {
    colors: [
      withAlpha(color, opacity),
      withAlpha(color, opacity * 0.35),
      withAlpha(color, 0),
    ],
    locations: [0, 0.55, 1],
    start: { x: 0.5, y: 0 },
    end: { x: 0.5, y: 1 },
  };

  return (
    <View
      pointerEvents="none"
      style={[styles.band, { height: windowHeight * extent }, style]}
    >
      <LinearGradient {...gradientProps} style={styles.fill} />
    </View>
  );
}

const styles = StyleSheet.create({
  band: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  fill: {
    flex: 1,
  },
});
