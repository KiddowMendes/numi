import { StyleSheet, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { useTheme } from "@/hooks/use-theme";

export type RingWatermarkProps = {
  /** Diameter of the ring. */
  size?: number;
  strokeWidth?: number;
  /** Peak opacity. A watermark is a hint, not a mark. */
  opacity?: number;
  /** How far past the right edge the ring bleeds. Negative pulls it inward. */
  right?: number;
  top?: number;
};

/**
 * One oversized ring, bled off the right edge.
 *
 * A single `Circle`. No path, no gradient, no filter — the cost of this
 * component is a backdrop nobody should consciously notice, so anything that
 * could animate or filter is a liability. Static, behind content, and never
 * interactive.
 */
export function RingWatermark({
  size = 300,
  strokeWidth = 24,
  opacity = 0.07,
  right = -90,
  top = 0,
}: RingWatermarkProps) {
  const theme = useTheme();

  return (
    <View pointerEvents="none" style={[styles.anchor, { top, right }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - strokeWidth / 2}
          stroke={theme.primary}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={opacity}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: "absolute",
  },
});
