import type { ReactNode } from "react";
import { StyleSheet, View, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { screenPadding, spacing } from "@/constants/tokens";

export type ScreenShellProps = {
  children?: ReactNode;
  /**
   * Overrides `insets.bottom + spacing.xl`. The PIN and unlock screens pass 0
   * because their pad owns the bottom third of the screen.
   */
  paddingBottom?: number;
  /** Overrides `spacing.xl`. */
  paddingHorizontal?: number;
  style?: ViewStyle | ViewStyle[];
};

/**
 * The one inset and padding policy every full screen shares.
 *
 * Uses `useSafeAreaInsets` rather than `SafeAreaView` so the values agree with
 * the tab bar's, which reads the same hook. A screen overrides a padding value
 * only when it is genuinely different, and says why.
 */
export function ScreenShell({
  children,
  paddingBottom,
  paddingHorizontal,
  style,
}: ScreenShellProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.shell,
        {
          paddingTop: insets.top + spacing.lg,
          paddingBottom: paddingBottom ?? insets.bottom + spacing.xl,
          paddingHorizontal: paddingHorizontal ?? screenPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
});
