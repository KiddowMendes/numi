import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { AppIcon, type IconName } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { iconSize, radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

/** Geometry of the leading glyph well, the category dot, and the hairline gaps. */
const GLYPH = 30;
const DOT = 12;
const NO_GLYPH = 2;

export type GroupRowProps = {
  label: string;
  onPress?: () => void;
  /** Leading glyph. Falls back to no icon when omitted. */
  icon?: IconName;
  /** A coloured dot instead of a glyph, for categories. */
  dotColor?: string;
  /** Right-hand text, e.g. an amount. */
  value?: string;
  valueTone?:
    | "textPrimary"
    | "textSecondary"
    | "textMuted"
    | "income"
    | "expense";
  /** Sits between the value and the chevron, e.g. a status badge. */
  accessory?: ReactNode;
  /** Right-hand glyph, e.g. a chevron. Not shown if `value` is set. */
  trailingIcon?: IconName;
  detail?: string;
  disabled?: boolean;
  isLast?: boolean;
  style?: ViewStyle;
};

/**
 * One row of a grouped list, the iOS Settings shape: hairline inset from the
 * left so the divider never touches the gutter, and never a card of its own.
 */
export function GroupRow({
  label,
  onPress,
  icon,
  dotColor,
  value,
  valueTone = "textSecondary",
  accessory,
  trailingIcon = "forward",
  detail,
  disabled,
  isLast,
  style,
}: GroupRowProps) {
  const theme = useTheme();
  const showTrailing =
    value === undefined &&
    accessory === undefined &&
    trailingIcon !== undefined;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={value ? `${label}, ${value}` : label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }: { pressed: boolean }) => [
        styles.row,
        {
          backgroundColor: pressed ? theme.surfaceSunken : "transparent",
          opacity: disabled ? 0.45 : 1,
        },
        !isLast && {
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: theme.borderSubtle,
        },
        style,
      ]}
    >
      {dotColor ? (
        <View style={[styles.dot, { backgroundColor: dotColor }]} />
      ) : icon ? (
        <View style={[styles.glyph, { backgroundColor: theme.surfaceSunken }]}>
          <AppIcon name={icon} size={iconSize.sm} color={theme.textSecondary} />
        </View>
      ) : (
        <View style={styles.leadingSpacer} />
      )}

      <View style={styles.body}>
        <ThemedText type="title" numberOfLines={1}>
          {label}
        </ThemedText>
        {detail ? (
          <ThemedText type="caption" tone="textMuted" numberOfLines={2}>
            {detail}
          </ThemedText>
        ) : null}
      </View>

      {value !== undefined ? (
        <ThemedText
          type="amountMd"
          tone={valueTone}
          numberOfLines={1}
          style={styles.value}
        >
          {value}
        </ThemedText>
      ) : null}

      {accessory ? <View style={styles.accessory}>{accessory}</View> : null}

      {showTrailing ? (
        <AppIcon
          name={trailingIcon}
          size={iconSize.sm}
          color={theme.textDisabled}
        />
      ) : null}
    </Pressable>
  );
}

/** A rounded container that clips its rows and draws the outer border. */
export function GroupList({
  children,
  label,
  style,
}: {
  children: ReactNode;
  label?: string;
  style?: ViewStyle;
}) {
  const theme = useTheme();
  const items = Array.isArray(children) ? children : [children];

  return (
    <View style={style}>
      {label ? (
        <ThemedText type="overline" tone="textMuted" style={styles.groupLabel}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.group,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {items.map((child, index) => (
          <View key={index} style={index > 0 ? styles.rowSpacer : undefined}>
            {child}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth * 2,
    overflow: "hidden",
  },
  groupLabel: {
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    minHeight: 56,
  },
  rowSpacer: {
    marginLeft: spacing.lg + GLYPH,
  },
  glyph: {
    width: GLYPH,
    height: GLYPH,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: DOT,
    height: DOT,
    borderRadius: radius.full,
    // Centres the dot in the same column the glyph occupies.
    marginLeft: (GLYPH - DOT) / 2,
    marginRight: (GLYPH - DOT) / 2,
  },
  leadingSpacer: {
    width: NO_GLYPH,
  },
  body: {
    flex: 1,
    gap: spacing["3xs"],
  },
  value: {
    flexShrink: 0,
  },
  accessory: {
    flexShrink: 0,
  },
});
