import { forwardRef, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type ViewStyle,
} from "react-native";

import { radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type AmountInputProps = {
  value: string;
  onChangeText?: (text: string) => void;
  currency?: string;
  error?: string;
  style?: ViewStyle;
  placeholder?: string;
};

export const AmountInput = forwardRef<TextInput, AmountInputProps>(
  (
    { value, onChangeText, currency = "R", error, style, placeholder = "0.00" },
    ref,
  ) => {
    const theme = useTheme();
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? theme.stateAlert
      : focused
        ? theme.primary
        : theme.border;

    return (
      <View
        style={[
          styles.container,
          { borderColor, backgroundColor: theme.surfaceRaised },
          style,
        ]}
      >
        <View style={[styles.badge, { borderRightColor: theme.borderSubtle }]}>
          <Text style={[styles.currency, { color: theme.textMuted }]}>
            {currency}
          </Text>
        </View>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={(t) => onChangeText?.(t.replace(/[^0-9.]/g, ""))}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={theme.textDisabled}
          style={[styles.input, { color: theme.textPrimary }]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </View>
    );
  },
);
AmountInput.displayName = "AmountInput";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderWidth: 1,
    borderRadius: radius.md,
    overflow: "hidden",
  },
  badge: {
    alignSelf: "stretch",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    borderRightWidth: 1,
  },
  currency: { fontFamily: "Inter", fontSize: 16, fontWeight: "600" },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: spacing.lg,
    fontFamily: "Inter",
    fontSize: 22,
    fontWeight: "700",
    fontVariant: ["tabular-nums"],
  },
});
