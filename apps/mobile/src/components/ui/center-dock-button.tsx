import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { AppIcon, type IconName } from "@/components/app-icon";
import { motion, radius, shadow, spacing, zIndex } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type CenterDockButtonProps = {
  icon?: IconName;
  onPress?: () => void;
  label: string;
  accessibilityHint?: string;
  /** Lift the button clear of the tab bar. */
  offset?: number;
  style?: ViewStyle;
};

const SIZE = 66;

/**
 * The single primary action on a screen, docked centre-bottom and floating
 * above the tab bar. There is only ever one of these per screen — two primary
 * actions is a decision the user should not have to make.
 */
export function CenterDockButton({
  icon = "add",
  onPress,
  label,
  accessibilityHint,
  offset = 0,
  style,
}: CenterDockButtonProps) {
  const theme = useTheme();

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom: offset }, style]}
    >
      <View style={[styles.halo, { backgroundColor: theme.background }]} />
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [
          styles.button,
          shadow.lg,
          {
            backgroundColor: theme.primary,
            opacity: pressed ? motion.pressOpacity : 1,
            transform: [{ scale: pressed ? motion.pressScale : 1 }],
          },
        ]}
      >
        <AppIcon name={icon} size={30} color={theme.primaryFg} weight="bold" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: zIndex.dock + 1,
  },
  halo: {
    position: "absolute",
    top: -10,
    width: SIZE + spacing.lg,
    height: SIZE + spacing.lg,
    borderRadius: radius.full,
  },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
});
