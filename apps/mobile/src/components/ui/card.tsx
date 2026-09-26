import type { ReactNode } from "react";
import { Pressable, StyleSheet, type ViewStyle } from "react-native";

import { motion, radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type CardTone = "plain" | "raised" | "outline" | "accent";
export type CardPadding = "none" | "sm" | "md" | "lg";

export type CardProps = {
  children?: ReactNode;
  onPress?: () => void;
  tone?: CardTone;
  padding?: CardPadding;
  style?: ViewStyle | ViewStyle[];
  /** Announced instead of the contents when the card is a single link. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
};

const PADDING: Record<CardPadding, ViewStyle> = {
  none: {},
  sm: { padding: spacing.md },
  md: { padding: spacing.lg },
  lg: { padding: spacing.xl },
};

/**
 * The base container. The 1px border is load-bearing: a white card on the
 * light page is only ~1.1:1, so the border at 3.2:1 is what makes the edge
 * visible. Never remove it in favour of a fill change.
 */
export function Card({
  children,
  onPress,
  tone = "outline",
  padding = "md",
  style,
  accessibilityLabel,
  accessibilityHint,
}: CardProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        {
          backgroundColor:
            tone === "accent"
              ? theme.primarySoft
              : tone === "plain"
                ? "transparent"
                : theme.surface,
          borderColor: tone === "outline" ? theme.border : theme.borderSubtle,
          opacity: pressed ? motion.pressOpacity : 1,
        },
        PADDING[padding],
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
