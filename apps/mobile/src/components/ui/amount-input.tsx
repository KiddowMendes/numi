import { forwardRef } from "react";
import { Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing, typography } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type AmountInputProps = {
  value: string;
  onChangeText?: (text: string) => void;
  label?: string;
  error?: string;
  /** Rand-only in v1: integers, with optional cents. No sign, no separators. */
  currency?: string;
  size?: "md" | "lg";
  style?: ViewStyle;
};

export const AmountInput = forwardRef<
  React.ComponentRef<typeof View>,
  AmountInputProps
>(
  (
    { value, onChangeText, label, error, currency = "R", size = "lg", style },
    ref,
  ) => {
    const theme = useTheme();

    const append = (key: string) => {
      const next = key === "del" ? value.slice(0, -1) : value + key;
      // Only digits and a single decimal point, at most two decimal places.
      if (!/^\d*\.?\d{0,2}$/.test(next)) return;
      onChangeText?.(next);
    };

    const borderColor = error ? theme.stateAlert : theme.border;
    const type = size === "lg" ? typography.amountHero : typography.amountLg;

    return (
      <View ref={ref} style={style}>
        {label ? (
          <ThemedText type="label" tone="textSecondary" style={styles.label}>
            {label}
          </ThemedText>
        ) : null}

        <View
          style={[
            styles.shell,
            { borderColor, backgroundColor: theme.surface },
          ]}
        >
          <View
            style={styles.readout}
            accessible
            accessibilityLabel={
              value ? `${currency} ${value}` : "No amount entered"
            }
          >
            <ThemedText type="amountMd" tone="textMuted">
              {currency}
            </ThemedText>
            <ThemedText
              type={size === "lg" ? "amountHero" : "amountLg"}
              tone={value ? "textPrimary" : "textDisabled"}
              numberOfLines={1}
              adjustsFontSizeToFit
              style={type}
            >
              {value || "0"}
            </ThemedText>
          </View>
        </View>

        {error ? (
          <ThemedText type="caption" tone="stateAlert" style={styles.message}>
            {error}
          </ThemedText>
        ) : null}

        <View style={styles.keypad}>
          {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "del"].map(
            (key) => (
              <Pressable
                key={key}
                onPress={() => append(key)}
                accessibilityRole="button"
                accessibilityLabel={
                  key === "del" ? "Delete" : key === "." ? "Decimal point" : key
                }
                style={({ pressed }) => [
                  styles.key,
                  {
                    backgroundColor: pressed
                      ? theme.surfaceSunken
                      : theme.surface,
                  },
                  { borderColor: theme.borderSubtle },
                ]}
              >
                {key === "del" ? (
                  <AppIcon
                    name="remove"
                    size={20}
                    color={theme.textSecondary}
                  />
                ) : (
                  <ThemedText type="heading2">{key}</ThemedText>
                )}
              </Pressable>
            ),
          )}
        </View>
      </View>
    );
  },
);

AmountInput.displayName = "AmountInput";

const styles = StyleSheet.create({
  label: {
    marginBottom: spacing.sm,
  },
  shell: {
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  readout: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
  },
  message: {
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  keypad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  key: {
    flexGrow: 1,
    flexBasis: "30%",
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
