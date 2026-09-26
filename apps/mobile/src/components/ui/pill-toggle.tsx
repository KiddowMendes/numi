import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { AppIcon, type IconName } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { motion, radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type PillOption<T extends string> = {
  value: T;
  label: string;
  icon?: IconName;
};

export type PillToggleProps<T extends string> = {
  options: readonly PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** A visible label under the control. Omit for a bare toggle. */
  label?: string;
  style?: ViewStyle;
};

/**
 * A rounded single-choice control. Exactly one segment is filled, and the
 * active one carries an icon as well as colour so selection never depends on
 * hue alone.
 */
export function PillToggle<T extends string>({
  options,
  value,
  onChange,
  label,
  style,
}: PillToggleProps<T>) {
  const theme = useTheme();

  return (
    <View style={style}>
      {label ? (
        <ThemedText type="label" tone="textSecondary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}

      <View
        accessibilityRole="radiogroup"
        accessibilityLabel={label}
        style={[
          styles.track,
          {
            backgroundColor: theme.surfaceSunken,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        {options.map((option) => {
          const active = option.value === value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected: active }}
              accessibilityLabel={option.label}
              style={({ pressed }) => [
                styles.segment,
                {
                  backgroundColor: active ? theme.primary : "transparent",
                  opacity: pressed ? motion.pressOpacity : 1,
                },
              ]}
            >
              {option.icon ? (
                <AppIcon
                  name={option.icon}
                  size={16}
                  color={active ? theme.primaryFg : theme.textSecondary}
                  weight={active ? "fill" : "regular"}
                />
              ) : null}
              <ThemedText
                type="label"
                numberOfLines={1}
                style={{
                  color: active ? theme.primaryFg : theme.textSecondary,
                }}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
  },
  track: {
    flexDirection: "row",
    gap: spacing.xs,
    padding: spacing.xs,
    borderRadius: radius.full,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.full,
    minHeight: 40,
  },
});
