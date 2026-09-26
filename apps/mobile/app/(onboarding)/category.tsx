import { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { resolveAccentKeyForCategory } from "@/lib/category-accent";
import {
  formatCents,
  iconSize,
  radius,
  resolveCategoryAccent,
  screenPadding,
  spacing,
} from "@/constants/tokens";
import { useTheme, useThemeMode } from "@/hooks/use-theme";
import { useEngine, useStore } from "@/store";

/**
 * The budget step, and the last thing standing between a new user and the home
 * screen. Every category is skippable, so the fastest path through is the
 * shortest one: assign nothing, press the button, start logging.
 */
export default function CategorySetupScreen() {
  const insets = useSafeAreaInsets();
  const mode = useThemeMode();
  const theme = useTheme();
  const { engine } = useEngine();

  const syncFromEngine = useStore((s) => s.syncFromEngine);
  const completeOnboarding = useStore((s) => s.completeOnboarding);
  const categories = useStore((s) => s.appState.categories);
  const wallets = useStore((s) => s.appState.wallets);
  const activePeriod = useStore((s) => s.appState.activePeriod);

  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const wallet = wallets[0];

  const enriched = useMemo(
    () =>
      categories.map((category) => ({
        ...category,
        accentKey: resolveAccentKeyForCategory(category.id, category.name),
        color: resolveCategoryAccent(
          resolveAccentKeyForCategory(category.id, category.name),
          mode,
        ),
      })),
    [categories, mode],
  );

  const totalAssigned = useMemo(
    () =>
      enriched.reduce(
        (sum, category) =>
          sum +
          Math.round(Number.parseFloat(amounts[category.id] || "0") * 100),
        0,
      ),
    [enriched, amounts],
  );

  function step(id: string, delta: number) {
    const current = Math.round(Number.parseFloat(amounts[id] || "0") * 100);
    const next = Math.max(0, current + delta);
    setAmounts((prev) => ({
      ...prev,
      [id]: next === 0 ? "" : (next / 100).toFixed(2),
    }));
    setError(null);
  }

  function handleComplete() {
    if (!activePeriod || !wallet) {
      setError(
        "Something is missing. Go back and check your wallet and period.",
      );
      return;
    }
    if (totalAssigned > wallet.balance) {
      setError(`You only have ${formatCents(wallet.balance)} in this wallet.`);
      return;
    }

    for (const category of enriched) {
      const cents = Math.round(
        Number.parseFloat(amounts[category.id] || "0") * 100,
      );
      if (cents <= 0) continue;

      const result = engine.createAssignment({
        id: `assignment-${category.id}-${Date.now()}`,
        period_id: activePeriod.id,
        category_id: category.id,
        wallet_id: wallet.id,
        amount: cents,
        created_at: new Date(),
      });

      if (!result.ok) {
        setError(result.errors[0]?.message ?? "Could not save that plan.");
        return;
      }
    }

    syncFromEngine();
    completeOnboarding();
  }

  return (
    <ScreenBackground style={styles.root}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={insets.top}
      >
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <ThemedText type="heading1">Set aside for each thing</ThemedText>
          <ThemedText type="body" tone="textSecondary">
            Anything you assign here stops counting as free to spend. You can
            skip all of it.
          </ThemedText>
        </View>

        <FlatList
          data={enriched}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <ThemedText
              type="body"
              tone="textMuted"
              align="center"
              style={styles.empty}
            >
              No categories yet — you are all set.
            </ThemedText>
          }
          renderItem={({ item }) => {
            const cents = Math.round(
              Number.parseFloat(amounts[item.id] || "0") * 100,
            );
            return (
              <View style={styles.row}>
                <View
                  style={[styles.swatch, { backgroundColor: item.color }]}
                />
                <ThemedText
                  type="title"
                  style={styles.rowLabel}
                  numberOfLines={1}
                >
                  {item.name}
                </ThemedText>

                <Pressable
                  onPress={() => step(item.id, -500)}
                  accessibilityRole="button"
                  accessibilityLabel={`Reduce ${item.name} by five rand`}
                  hitSlop={8}
                  style={styles.stepper}
                >
                  <ThemedText type="heading2" tone="textSecondary">
                    −
                  </ThemedText>
                </Pressable>

                <ThemedText
                  type="amountMd"
                  tone={cents > 0 ? "textPrimary" : "textDisabled"}
                  align="right"
                  style={styles.amount}
                  accessibilityLabel={`${item.name} ${formatCents(cents)}`}
                >
                  {formatCents(cents)}
                </ThemedText>

                <Pressable
                  onPress={() => step(item.id, 500)}
                  accessibilityRole="button"
                  accessibilityLabel={`Add five rand to ${item.name}`}
                  hitSlop={8}
                  style={styles.stepper}
                >
                  <ThemedText type="heading2" tone="primary">
                    +
                  </ThemedText>
                </Pressable>
              </View>
            );
          }}
        />

        <View
          style={[
            styles.footer,
            {
              paddingBottom: insets.bottom + spacing.lg,
              borderTopColor: theme.borderSubtle,
              backgroundColor: theme.background,
            },
          ]}
        >
          <View style={styles.totalRow}>
            <ThemedText type="label" tone="textSecondary">
              Total set aside
            </ThemedText>
            <ThemedText type="amountMd">
              {formatCents(totalAssigned)}
            </ThemedText>
          </View>

          {error ? (
            <ThemedText type="caption" tone="stateAlert">
              {error}
            </ThemedText>
          ) : null}

          <Button size="lg" onPress={handleComplete} icon="check">
            Start budgeting
          </Button>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

/** Tap target for the plus and minus on a category row. */
const STEPPER = 36;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  header: {
    paddingHorizontal: screenPadding,
    gap: spacing.xs,
    paddingBottom: spacing.lg,
  },
  list: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  swatch: {
    width: iconSize.dot,
    height: iconSize.dot,
    borderRadius: radius.full,
  },
  rowLabel: {
    flex: 1,
  },
  stepper: {
    width: STEPPER,
    height: STEPPER,
    alignItems: "center",
    justifyContent: "center",
  },
  amount: {
    minWidth: 76,
  },
  footer: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.lg,
    gap: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth * 2,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  empty: {
    paddingVertical: spacing.xl,
  },
});
