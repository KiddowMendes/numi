import { StyleSheet, View } from "react-native";

import { AppIcon, type IconName } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { iconSize, radius, spacing } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";

export type EmptyVariant =
  | "noTransactions"
  | "noPeriod"
  | "noWallet"
  | "noGoals";

export type EmptyStateProps = {
  variant: EmptyVariant;
  /** A next step, always. An empty screen with no way forward is a dead end. */
  action?: { label: string; onPress: () => void };
  style?: object;
};

const CONFIG: Record<
  EmptyVariant,
  { icon: IconName; title: string; message: string }
> = {
  noTransactions: {
    icon: "receipt",
    title: "Nothing logged yet",
    message:
      "Add your first spend and the safe-to-spend number moves straight away.",
  },
  noPeriod: {
    icon: "calendar",
    title: "No period open",
    message:
      "Start a budgeting period and NUMI can work out what is safe to spend.",
  },
  noWallet: {
    icon: "balance",
    title: "No wallet yet",
    message: "Create a wallet to start tracking where your money actually is.",
  },
  noGoals: {
    icon: "goal",
    title: "No goals yet",
    message:
      "Set aside money for something specific and it will read as spoken for.",
  },
};

/** The round plate behind the glyph. Comfortably inside the 44px touch target. */
const BADGE = iconSize.xl * 1.45;

export function EmptyState({ variant, action, style }: EmptyStateProps) {
  const theme = useTheme();
  const config = CONFIG[variant];

  return (
    <View style={[styles.wrap, style]}>
      <View
        style={[
          styles.badge,
          {
            backgroundColor: theme.surfaceSunken,
            borderColor: theme.borderSubtle,
          },
        ]}
      >
        <AppIcon
          name={config.icon}
          size={iconSize.lg}
          color={theme.textSecondary}
        />
      </View>

      <ThemedText type="heading2" align="center">
        {config.title}
      </ThemedText>
      <ThemedText
        type="body"
        tone="textSecondary"
        align="center"
        style={styles.message}
      >
        {config.message}
      </ThemedText>

      {action ? (
        <ThemedText
          type="button"
          tone="primary"
          accessibilityRole="button"
          onPress={action.onPress}
          style={styles.action}
        >
          {action.label}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing["3xl"],
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
  },
  badge: {
    width: BADGE,
    height: BADGE,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  message: {
    maxWidth: 300,
  },
  action: {
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.full,
    overflow: "hidden",
  },
});
