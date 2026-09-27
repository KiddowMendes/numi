import { StyleSheet, View } from "react-native";

import { radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";
import { PIN_LENGTH } from "@/lib/pin";

export type PinDotsProps = {
  /** The digits entered so far. Length, not content, is all that is rendered. */
  digits: string;
  style?: object;
};

/**
 * How much of a secret has been typed.
 *
 * Deliberately not a `ProgressDots`: that component says where you are in a
 * flow, this says how much of a code you have entered. Reusing it would put the
 * code length into the flow indicator's accessibility value.
 */
export function PinDots({ digits, style }: PinDotsProps) {
  const theme = useTheme();
  const filled = Math.min(digits.length, PIN_LENGTH);

  return (
    <View
      style={[styles.row, style]}
      accessible
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: PIN_LENGTH, now: filled }}
      accessibilityLabel={`${filled} of ${PIN_LENGTH} digits entered`}
    >
      {Array.from({ length: PIN_LENGTH }, (_, index) => {
        const isFilled = index < filled;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: isFilled ? theme.primary : theme.surfaceSunken,
                borderColor: isFilled ? theme.primary : theme.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
