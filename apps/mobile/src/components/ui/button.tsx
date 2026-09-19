import { forwardRef, type ReactNode } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  type PressableProps,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type CallbackArg = { pressed: boolean; hovered?: boolean };

export type ButtonProps = Omit<PressableProps, "children"> & {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
};

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
      style,
      ...rest
    },
    ref,
  ) => {
    const theme = useTheme();

    const isDisabled = disabled || loading;

    const getContainerStyle = (pressed: boolean): ViewStyle => ({
      ...styles.base,
      ...styles[`size_${size}`],
      borderRadius: radius.md,
      opacity: isDisabled ? 0.4 : pressed ? 0.85 : 1,
      ...(variant === "primary" && {
        backgroundColor: theme.primary,
      }),
      ...(variant === "secondary" && {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: theme.primary,
      }),
      ...(variant === "ghost" && {
        backgroundColor: "transparent",
      }),
      ...(pressed && { transform: [{ scale: 0.98 }] }),
    });

    const labelColor =
      variant === "primary"
        ? theme.primaryFg
        : variant === "secondary"
          ? theme.primary
          : theme.textSecondary;

    return (
      <Pressable
        ref={ref}
        disabled={isDisabled}
        style={({ pressed }: CallbackArg) => getContainerStyle(pressed)}
        {...rest}
      >
        {loading ? (
          <ActivityIndicator size="small" color={labelColor} />
        ) : (
          <>
            {icon}
            <ThemedText
              type={variant === "ghost" ? "label" : "title"}
              style={[styles.label, { color: labelColor }]}
            >
              {children}
            </ThemedText>
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
    gap: spacing.sm,
  },
  size_sm: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    minHeight: 36,
  },
  size_md: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  size_lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    minHeight: 52,
  },
  label: {
    flexShrink: 1,
  },
});
