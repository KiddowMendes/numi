import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { Button, Card, GemBadge, GroupList, GroupRow } from "@/components/ui";
import { formatCents, screenPadding, spacing } from "@/constants/tokens";
import { useStore } from "@/store";

export default function ReviewScreen() {
  const insets = useSafeAreaInsets();
  const activePeriod = useStore((s) => s.appState.activePeriod);
  const assignments = useStore((s) => s.appState.assignments);
  const transactions = useStore((s) => s.appState.transactions);
  const wallets = useStore((s) => s.appState.wallets);

  const totals = useMemo(() => {
    const assigned = assignments.reduce<number>((sum, a) => sum + a.amount, 0);
    const spent = transactions
      .filter((tx) => tx.type === "expense")
      .reduce<number>((sum, tx) => sum + tx.amount, 0);
    const earned = transactions
      .filter((tx) => tx.type === "income")
      .reduce<number>((sum, tx) => sum + tx.amount, 0);
    const balance = wallets.reduce<number>((sum, w) => sum + w.balance, 0);
    return { assigned, spent, earned, balance, left: balance - spent };
  }, [assignments, transactions, wallets]);

  return (
    <ScreenBackground style={styles.root}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: insets.bottom + spacing.xl,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Button
            variant="ghost"
            size="sm"
            fullWidth={false}
            icon="back"
            onPress={() => router.back()}
            style={styles.back}
          >
            Back
          </Button>
          <ThemedText type="heading1">Review</ThemedText>
          {activePeriod ? (
            <ThemedText type="body" tone="textSecondary">
              {activePeriod.name}
            </ThemedText>
          ) : null}
        </View>

        <Card tone="accent" padding="md">
          <View style={styles.totals}>
            <View style={styles.total}>
              <ThemedText type="overline" tone="textMuted">
                In the pot
              </ThemedText>
              <ThemedText type="amountLg">
                {formatCents(totals.balance)}
              </ThemedText>
            </View>
            <View style={styles.total}>
              <ThemedText type="overline" tone="textMuted">
                Assigned
              </ThemedText>
              <ThemedText type="amountLg">
                {formatCents(totals.assigned)}
              </ThemedText>
            </View>
            <View style={styles.total}>
              <ThemedText type="overline" tone="textMuted">
                Spent
              </ThemedText>
              <ThemedText type="amountLg">
                {formatCents(totals.spent)}
              </ThemedText>
            </View>
            <View style={styles.total}>
              <ThemedText type="overline" tone="textMuted">
                Left
              </ThemedText>
              <ThemedText
                type="amountLg"
                tone={totals.left < 0 ? "stateAlert" : "textPrimary"}
              >
                {formatCents(totals.left)}
              </ThemedText>
            </View>
          </View>
        </Card>

        <GroupList label="Counts">
          <GroupRow
            label="Transactions"
            icon="receipt"
            value={String(transactions.length)}
            trailingIcon={undefined}
            isLast
          />
          <GroupRow
            label="Assignments"
            icon="plan"
            value={String(assignments.length)}
            trailingIcon={undefined}
            isLast
          />
          <GroupRow
            label="Wallets"
            icon="balance"
            value={String(wallets.length)}
            trailingIcon={undefined}
            isLast
          />
        </GroupList>

        <View style={styles.badge}>
          <GemBadge label="Offline first" tone="stateSafe" size="md" />
          <ThemedText type="caption" tone="textMuted">
            Everything here is stored on this device.
          </ThemedText>
        </View>
      </ScrollView>
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
    gap: spacing.sm,
  },
  back: {
    alignSelf: "flex-start",
    paddingHorizontal: 0,
  },
  totals: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: spacing.lg,
  },
  total: {
    width: "50%",
    gap: spacing.xs,
  },
  badge: {
    alignItems: "center",
    gap: spacing.sm,
  },
});
