import type { ReactNode } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { AppIcon, type IconName } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { motion, radius, spacing, type TextTone } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type TransactionKind = "income" | "expense" | "transfer";

export type TransactionRowProps = {
  title: string;
  /** Already formatted, e.g. `R 120.00`. Never parsed here. */
  amount: string;
  kind: TransactionKind;
  date: string;
  category?: string;
  /** Category accent. The dot is decoration; the label carries the meaning. */
  accentColor?: string;
  icon?: IconName;
  onPress?: () => void;
  style?: ViewStyle;
  trailing?: ReactNode;
};

const TONE: Record<TransactionKind, TextTone> = {
  income: "income",
  expense: "textPrimary",
  transfer: "transfer",
};

const PREFIX: Record<TransactionKind, string> = {
  income: "+",
  expense: "−",
  transfer: "→",
};

const SPOKEN: Record<TransactionKind, string> = {
  income: "Plus",
  expense: "Minus",
  transfer: "Transferred",
};

/**
 * Sign comes from `kind`, never from sniffing the formatted string. An earlier
 * version tested for a leading "R" and painted every expense as income, because
 * `formatCurrency` puts the symbol in front either way.
 */
export function TransactionRow({
  title,
  amount,
  kind,
  date,
  category,
  accentColor,
  icon,
  onPress,
  style,
  trailing,
}: TransactionRowProps) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={`${title}. ${SPOKEN[kind]} ${amount}. ${category ?? ""}. ${date}`
        .replace(/\s+/g, " ")
        .trim()}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed && onPress ? motion.pressOpacity : 1 },
        style,
      ]}
    >
      {icon ? (
        <View
          style={[
            styles.glyph,
            { backgroundColor: accentColor ?? theme.surfaceSunken },
          ]}
        >
          <AppIcon name={icon} size={20} color={theme.surface} weight="bold" />
        </View>
      ) : (
        <View
          style={[
            styles.dot,
            { backgroundColor: accentColor ?? theme.textDisabled },
          ]}
        />
      )}

      <View style={styles.body}>
        <ThemedText type="title" numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="caption" tone="textMuted" numberOfLines={1}>
          {[category, date].filter(Boolean).join(" · ")}
        </ThemedText>
      </View>

      {trailing ?? (
        <ThemedText
          type="amountMd"
          tone={TONE[kind]}
          numberOfLines={1}
          style={styles.amount}
        >
          {`${PREFIX[kind]}${amount}`}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    minHeight: 64,
  },
  glyph: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    marginHorizontal: spacing.lg,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  amount: {
    flexShrink: 0,
  },
});
