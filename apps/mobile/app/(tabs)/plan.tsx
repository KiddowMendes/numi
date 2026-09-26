import { useMemo } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  calculateAssignmentRemaining,
  calculateAssignmentSpent,
} from "@numi/domain";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import {
  Card,
  EmptyState,
  GemBadge,
  GroupList,
  GroupRow,
} from "@/components/ui";
import {
  formatCents,
  resolveCategoryAccent,
  screenPadding,
  spacing,
} from "@/constants/tokens";
import { useThemeMode } from "@/hooks/use-theme";
import { resolveAccentKeyForCategory } from "@/lib/category-accent";
import { useStore } from "@/store";

export default function PlanScreen() {
  const insets = useSafeAreaInsets();
  const mode = useThemeMode();
  const activePeriod = useStore((s) => s.appState.activePeriod);
  const assignments = useStore((s) => s.appState.assignments);
  const categories = useStore((s) => s.appState.categories);
  const transactions = useStore((s) => s.appState.transactions);
  const wallets = useStore((s) => s.appState.wallets);

  const categoryById = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.id,
          {
            name: category.name,
            color: resolveCategoryAccent(
              resolveAccentKeyForCategory(category.id, category.name),
              mode,
            ),
          },
        ]),
      ),
    [categories, mode],
  );

  const totalAssigned = useMemo(
    () =>
      assignments.reduce<number>(
        (sum, assignment) => sum + assignment.amount,
        0,
      ),
    [assignments],
  );

  if (!activePeriod) {
    return (
      <ScreenBackground style={styles.root}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.lg }]}>
          <ThemedText type="heading1">Plan</ThemedText>
        </View>
        <EmptyState variant="noPeriod" style={styles.empty} />
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
            paddingBottom: insets.bottom + 120,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="overline" tone="textMuted">
            Budgeting period
          </ThemedText>
          <ThemedText type="heading1">{activePeriod.name}</ThemedText>
          <ThemedText type="body" tone="textSecondary">
            {activePeriod.start_date.toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
            })}{" "}
            –{" "}
            {activePeriod.end_date.toLocaleDateString("en-ZA", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </ThemedText>
        </View>

        <Card tone="accent" padding="md">
          <View style={styles.summaryRow}>
            <View style={styles.summaryCell}>
              <ThemedText type="overline" tone="textMuted">
                Assigned
              </ThemedText>
              <ThemedText type="amountLg">
                {formatCents(totalAssigned)}
              </ThemedText>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryCell}>
              <ThemedText type="overline" tone="textMuted">
                Wallets
              </ThemedText>
              <ThemedText type="amountLg">
                {formatCents(
                  wallets.reduce<number>((sum, w) => sum + w.balance, 0),
                )}
              </ThemedText>
            </View>
          </View>
        </Card>

        {assignments.length === 0 ? (
          <EmptyState variant="noGoals" />
        ) : (
          <GroupList label="By category">
            {assignments.map((assignment, index) => {
              const category = categoryById.get(assignment.category_id);
              const spent = calculateAssignmentSpent(
                assignment,
                transactions,
                activePeriod,
              );
              const remaining = calculateAssignmentRemaining(
                assignment,
                transactions,
                activePeriod,
              );
              const over = remaining < 0;
              const used =
                assignment.amount > 0 ? spent / assignment.amount : 0;

              return (
                <GroupRow
                  key={assignment.id}
                  label={category?.name ?? assignment.category_id}
                  detail={`${formatCents(spent)} of ${formatCents(assignment.amount)}`}
                  dotColor={category?.color}
                  value={formatCents(remaining)}
                  valueTone={over ? "expense" : "textPrimary"}
                  trailingIcon={undefined}
                  isLast={index === assignments.length - 1}
                  accessory={
                    <GemBadge
                      label={over ? "Over" : `${Math.round(used * 100)}%`}
                      tone={
                        over
                          ? "stateAlert"
                          : used > 0.8
                            ? "stateCaution"
                            : "stateSafe"
                      }
                    />
                  }
                />
              );
            })}
          </GroupList>
        )}
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
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryCell: {
    flex: 1,
    gap: spacing.xs,
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth * 2,
    alignSelf: "stretch",
    marginHorizontal: spacing.md,
  },
  empty: {
    flex: 1,
  },
});
