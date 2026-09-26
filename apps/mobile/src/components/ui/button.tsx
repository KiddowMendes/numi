import { forwardRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { AppIcon, type IconName } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { motion, radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = Omit<PressableProps, "children" | "style"> & {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  iconPosition?: "leading" | "trailing";
  fullWidth?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
};

const SIZES = {
  sm: {
    minHeight: 40,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  md: {
    minHeight: 48,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  lg: {
    minHeight: 56,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
} as const;

/**
 * Press feedback is opacity only. The one primary action per screen gets
 * `primary`; everything else is secondary or ghost, and a `danger` variant is
 * for destructive confirmation inside a sheet.
 */
export const Button = forwardRef<
  React.ComponentRef<typeof Pressable>,
  ButtonProps
>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      icon,
      iconPosition = "leading",
      fullWidth = true,
      style,
      accessibilityHint,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();
    const isInert = disabled || loading;
    const dim = SIZES[size];

    const background =
      variant === "primary"
        ? theme.primary
        : variant === "danger"
          ? theme.stateAlert
          : "transparent";

    const foreground =
      variant === "primary" || variant === "danger"
        ? theme.primaryFg
        : variant === "secondary"
          ? theme.primary
          : theme.textSecondary;

    return (
      <Pressable
        ref={ref}
        disabled={isInert}
        accessibilityRole="button"
        accessibilityLabel={children}
        accessibilityHint={accessibilityHint}
        accessibilityState={{ disabled: !!disabled, busy: loading }}
        style={({ pressed }: { pressed: boolean }) => [
          styles.base,
          dim,
          {
            backgroundColor: background,
            borderColor:
              variant === "secondary" ? theme.primary : "transparent",
            borderWidth:
              variant === "secondary" ? StyleSheet.hairlineWidth * 2 : 0,
            alignSelf: fullWidth ? "stretch" : "flex-start",
            opacity: disabled ? 0.4 : pressed ? motion.pressOpacity : 1,
          },
          style,
        ]}
        {...rest}
      >
        {loading ? (
          // Spinner replaces the label but the height holds, so nothing shifts.
          <View style={styles.spinner}>
            <ActivityIndicator size="small" color={foreground} />
          </View>
        ) : (
          <>
            {icon && iconPosition === "leading" ? (
              <AppIcon name={icon} size={18} color={foreground} weight="bold" />
            ) : null}
            <ThemedText
              type="button"
              numberOfLines={1}
              style={{ color: foreground }}
            >
              {children}
            </ThemedText>
            {icon && iconPosition === "trailing" ? (
              <AppIcon name={icon} size={18} color={foreground} weight="bold" />
            ) : null}
          </>
        )}
      </Pressable>
    );
  },
);

Button.displayName = "Button";

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },
  spinner: {
    minHeight: 20,
    justifyContent: "center",
  },
});
