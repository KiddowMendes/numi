import { Platform, Pressable, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";

import { AppIcon } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type PinPadProps = {
  onDigitPress: (digit: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
  style?: object;
};

const KEYS = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "",
  "0",
  "del",
] as const;

/**
 * `expo-haptics` has no web implementation. Firing it there is a no-op at best
 * and a warning at worst, and the pad is reachable on web via `expo start --web`.
 */
function tapFeedback() {
  if (Platform.OS === "web") return;
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
}

/**
 * Twelve keys, always visible. The OS keyboard is never summoned — a 4-digit
 * code is four taps, and a keyboard is a second layout to dismiss afterwards.
 */
export function PinPad({
  onDigitPress,
  onBackspace,
  disabled,
  style,
}: PinPadProps) {
  const theme = useTheme();

  return (
    <View style={[styles.pad, style]} accessibilityLabel="PIN entry pad">
      {KEYS.map((key, index) => {
        if (key === "") {
          return <View key={index} style={styles.key} />;
        }

        const isBackspace = key === "del";

        return (
          <Pressable
            key={index}
            onPress={() => {
              if (disabled) return;
              if (isBackspace) {
                // No haptic on backspace. It is pressed often and corrected
                // often; buzzing on it is noise.
                onBackspace();
                return;
              }
              tapFeedback();
              onDigitPress(key);
            }}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={isBackspace ? "Delete" : key}
            accessibilityState={{ disabled: Boolean(disabled) }}
            style={({ pressed }) => [
              styles.key,
              {
                borderColor: theme.border,
                backgroundColor: pressed
                  ? theme.surfaceSunken
                  : theme.surfaceRaised,
              },
              disabled && { opacity: 0.4 },
            ]}
          >
            {isBackspace ? (
              <AppIcon name="remove" size={22} color={theme.textSecondary} />
            ) : (
              <ThemedText
                type="amountLg"
                tone={disabled ? "textDisabled" : "textPrimary"}
              >
                {key}
              </ThemedText>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  key: {
    // 3 across. flexBasis 30% plus gap keeps the third key from wrapping.
    flexGrow: 1,
    flexBasis: "30%",
    minHeight: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
});
