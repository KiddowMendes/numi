import { Pressable, StyleSheet, type ViewStyle } from "react-native";

import { AppIcon, type IconName } from "@/components/app-icon";
import { motion, radius, shadow } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type CircleActionButtonProps = {
  icon: IconName;
  onPress?: () => void;
  label: string;
  /** `solid` for the one primary action on a screen, `soft` for the rest. */
  tone?: "solid" | "soft" | "plain";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
};

const DIM = { sm: 44, md: 52, lg: 60 } as const;

/**
 * A round icon button. Press feedback is opacity only — a scale bounce would
 * read as playful, and this is a money tool.
 */
export function CircleActionButton({
  icon,
  onPress,
  label,
  tone = "soft",
  size = "md",
  disabled,
  style,
  accessibilityHint,
}: CircleActionButtonProps) {
  const theme = useTheme();
  const dim = DIM[size];

  const background =
    tone === "solid"
      ? theme.primary
      : tone === "soft"
        ? theme.primarySoft
        : "transparent";
  const foreground = tone === "solid" ? theme.primaryFg : theme.primary;
  const borderColor = tone === "plain" ? theme.border : theme.borderSubtle;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.base,
        {
          width: dim,
          height: dim,
          borderRadius: radius.full,
          backgroundColor: background,
          borderColor: borderColor,
          borderWidth: tone === "plain" ? StyleSheet.hairlineWidth * 2 : 0,
          opacity: disabled ? 0.4 : pressed ? motion.pressOpacity : 1,
        },
        tone === "solid" ? shadow.md : null,
        style,
      ]}
    >
      <AppIcon
        name={icon}
        size={size === "sm" ? 20 : 24}
        color={foreground}
        weight={tone === "solid" ? "bold" : "regular"}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
  },
});
