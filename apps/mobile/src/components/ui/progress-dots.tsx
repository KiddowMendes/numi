import { StyleSheet, View } from "react-native";

import { radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type ProgressDotsProps = {
  total: number;
  current: number;
  label?: string;
};

/** Two dots and a bar. Enough to say "one more thing" without counting. */
export function ProgressDots({ total, current, label }: ProgressDotsProps) {
  const theme = useTheme();

  return (
    <View
      style={styles.wrap}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: total, now: current + 1 }}
      accessibilityLabel={label ?? `Step ${current + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor:
                  done || active ? theme.primary : theme.surfaceSunken,
                width: active ? 22 : 8,
                borderColor: active ? theme.primary : "transparent",
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  dot: {
    height: 8,
    borderRadius: radius.full,
  },
});
