import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  calculateDaysRemaining,
  calculateGlobalSafeToSpend,
} from "@numi/domain";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import {
  CenterDockButton,
  CircleActionButton,
  EmptyState,
  GemBadge,
  GroupList,
  GroupRow,
  SafeToSpendHero,
  SafeToSpendZero,
  TransactionLogSheet,
} from "@/components/ui";
import {
  BottomTabInset,
  formatCents,
  screenPadding,
  spacing,
  type StateToken,
} from "@/constants/tokens";
import { useStore } from "@/store";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [sheetOpen, setSheetOpen] = useState(false);

  const appState = useStore((s) => s.appState);
  const engine = useStore((s) => s.engine);

  const { activePeriod, assignments, goals, transactions, wallets } = appState;

  const safeToSpend = engine?.getDailySafeToSpend();
  const amount = safeToSpend?.ok ? safeToSpend.value : null;
  const daysRemaining = calculateDaysRemaining(activePeriod, new Date()) ?? 0;

  const totalBalance = useMemo(
    () => wallets.reduce<number>((sum, wallet) => sum + wallet.balance, 0),
    [wallets],
  );

  const globalSafe = useMemo(
    () => calculateGlobalSafeToSpend(wallets, assignments, goals),
    [wallets, assignments, goals],
  );

  /**
   * The arc is how much of the pot is already spoken for: assigned money plus
   * goal reserves, over the total pot. A full ring means nothing is free to
   * spend. Time-elapsed would have been easier but it would answer a different
   * question than "will my money last?".
   */
  const committed = useMemo(() => {
    const held = totalBalance - globalSafe;
    if (totalBalance <= 0) return 0;
    return Math.max(0, Math.min(1, held / totalBalance));
  }, [totalBalance, globalSafe]);

  const state: StateToken =
    amount === null
      ? "stateCaution"
      : amount <= 0
        ? "stateCaution"
        : "stateSafe";

  const recent = useMemo(
    () =>
      [...transactions]
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 4),
    [transactions],
  );

  const ready = Boolean(activePeriod) && wallets.length > 0;

  if (!ready) {
    return (
      <ScreenBackground style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <ThemedText type="heading1">NUMI</ThemedText>
        </View>
        <EmptyState
          variant={wallets.length === 0 ? "noWallet" : "noPeriod"}
          style={styles.empty}
        />
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + BottomTabInset + 104,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerText}>
            <ThemedText type="overline" tone="textMuted" numberOfLines={1}>
              {activePeriod?.name}
            </ThemedText>
            <ThemedText type="heading1">Today</ThemedText>
          </View>
          <GemBadge
            label={
              daysRemaining === 1 ? "1 day left" : `${daysRemaining} days left`
            }
            tone="primary"
            icon="calendar"
          />
        </View>

        {amount !== null && amount > 0 ? (
          <SafeToSpendHero
            amount={formatCents(amount)}
            consumed={committed}
            daysRemaining={daysRemaining}
            state={state}
            style={styles.hero}
          />
        ) : (
          <SafeToSpendZero style={styles.hero} />
        )}

        <View style={styles.actions}>
          <CircleActionButton
            icon="moneyOut"
            label="Log a spend"
            tone="soft"
            accessibilityHint="Opens the keypad"
            onPress={() => setSheetOpen(true)}
          />
          <CircleActionButton
            icon="moneyIn"
            label="Log money in"
            tone="plain"
            onPress={() => setSheetOpen(true)}
          />
          <CircleActionButton
            icon="plan"
            label="Adjust the plan"
            tone="plain"
          />
        </View>

        <GroupList label="Money">
          <GroupRow
            label="In the pot"
            icon="balance"
            detail="Across every wallet"
            value={formatCents(totalBalance)}
            trailingIcon={undefined}
            isLast
          />
          <GroupRow
            label="Uncommitted"
            icon="coins"
            detail="Safe to spend before the period ends"
            value={formatCents(globalSafe)}
            trailingIcon={undefined}
            isLast
          />
        </GroupList>

        <GroupList label="Recent">
          {recent.length === 0 ? (
            <GroupRow
              label="Nothing logged yet"
              detail="Use the button below to add one"
              isLast
            />
          ) : (
            recent.map((transaction, index) => (
              <GroupRow
                key={transaction.id}
                label={
                  transaction.note?.trim() ||
                  (transaction.type === "income" ? "Money in" : "Spend")
                }
                detail={transaction.date.toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "short",
                })}
                value={`${transaction.type === "income" ? "+" : "−"}${formatCents(transaction.amount)}`}
                valueTone={
                  transaction.type === "income" ? "income" : "textPrimary"
                }
                trailingIcon={undefined}
                isLast={index === recent.length - 1}
              />
            ))
          )}
        </GroupList>
      </ScrollView>

      <CenterDockButton
        label="Log money"
        accessibilityHint="Opens the keypad to record money in or out"
        offset={insets.bottom + BottomTabInset - 20}
        onPress={() => setSheetOpen(true)}
      />

      <TransactionLogSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: screenPadding,
    gap: spacing.xl,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing["3xs"],
  },
  hero: {
    paddingVertical: spacing.lg,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xl,
  },
  empty: {
    flex: 1,
  },
});
