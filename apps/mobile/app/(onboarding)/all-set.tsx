import { useCallback, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppIcon } from "@/components/app-icon";
import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { Button, Card, RadialGlow, ScreenShell } from "@/components/ui";
import { spacing, zIndex } from "@/constants/tokens";
import { useTheme } from "@/hooks/use-theme";
import { useStore } from "@/store";

function pluralise(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

export default function AllSetScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const userName = useStore((s) => s.userName);
  const summary = useStore((s) => s.onboardingSummary);
  const walletCount = useStore((s) => s.appState.wallets.length);
  const budgetCount = useStore((s) => s.appState.assignments.length);
  const completeOnboarding = useStore((s) => s.completeOnboarding);

  const [loading, setLoading] = useState(false);

  // Prefer what `quick-setup` reported. Falling back to live state covers a
  // back-and-forth through the screen, where the summary is stale but the
  // engine is not.
  const shownWallets = summary?.walletCount ?? walletCount;
  const shownBudgets = summary?.budgetCount ?? budgetCount;
  const lines = summary?.lines ?? [];

  const handleOpen = useCallback(() => {
    if (loading) return;
    setLoading(true);
    completeOnboarding();
    router.replace("/(auth)/unlock");
  }, [completeOnboarding, loading]);

  const handleBack = useCallback(() => {
    // Objects already exist. `createWallet` would return TIER_LIMIT_EXCEEDED,
    // so this is a way for the user to look, not to re-run.
    router.replace("/(onboarding)/quick-setup");
  }, []);

  return (
    <ScreenBackground>
      <RadialGlow color={theme.stateSafe} opacity={0.15} extent={0.5} />

      <Pressable
        onPress={handleBack}
        accessibilityRole="button"
        accessibilityLabel="Back to quick setup"
        hitSlop={8}
        style={[
          styles.back,
          { top: insets.top + spacing.sm, zIndex: zIndex.sticky },
        ]}
      >
        <AppIcon name="back" size={24} color={theme.textPrimary} />
      </Pressable>

      <ScreenShell style={styles.shell}>
        <View style={styles.body}>
          <AppIcon name="safe" size={48} color={theme.stateSafe} />

          <ThemedText type="heading1" align="center">
            {`You\u2019re in${userName ? `, ${userName}` : ""}.`}
          </ThemedText>
          <ThemedText type="caption" tone="textMuted" align="center">
            {`${pluralise(shownWallets, "wallet", "wallets")} · ${pluralise(shownBudgets, "budget", "budgets")} ready.`}
          </ThemedText>

          {lines.length > 0 ? (
            <Card tone="raised" padding="md" style={styles.summary}>
              {lines.map((line, index) => (
                <ThemedText
                  key={index}
                  type="amountSm"
                  style={index > 0 ? styles.summaryLine : undefined}
                >
                  {line}
                </ThemedText>
              ))}
            </Card>
          ) : null}
        </View>

        <View style={styles.action}>
          <Button onPress={handleOpen} disabled={loading} size="lg" fullWidth>
            Open NUMI
          </Button>
        </View>
      </ScreenShell>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  back: {
    position: "absolute",
    left: spacing.lg,
    width: 48,
    height: 48,
    justifyContent: "center",
  },
  body: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.md,
  },
  summary: {
    width: "100%",
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  summaryLine: {
    marginTop: spacing.xs,
  },
  action: {
    paddingTop: spacing.lg,
  },
});
