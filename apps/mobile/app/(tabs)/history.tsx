import { useMemo } from "react";
import { SectionList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { Transaction } from "@numi/domain";

import { ScreenBackground } from "@/components/screen-background";
import { ThemedText } from "@/components/themed-text";
import { EmptyState, TransactionRow } from "@/components/ui";
import { formatCents, screenPadding, spacing } from "@/constants/tokens";
import { useCategoryAccentMap } from "@/hooks/use-category-accent-map";
import { useTabBarSpace } from "@/hooks/use-tab-bar-space";
import { useStore } from "@/store";

type DaySection = { title: string; data: Transaction[] };

export default function HistoryScreen() {
  const insets = useSafeAreaInsets();
  const { contentBottom } = useTabBarSpace();
  const transactions = useStore((s) => s.appState.transactions);
  const categoryById = useCategoryAccentMap();

  const sections = useMemo<DaySection[]>(() => {
    const buckets = new Map<string, Transaction[]>();
    for (const tx of [...transactions].sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    )) {
      const key = tx.date.toLocaleDateString("en-ZA", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
      const bucket = buckets.get(key);
      if (bucket) bucket.push(tx);
      else buckets.set(key, [tx]);
    }
    return [...buckets.entries()].map(([title, data]) => ({ title, data }));
  }, [transactions]);

  return (
    <ScreenBackground style={styles.root}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.list,
          {
            paddingTop: insets.top + spacing.lg,
            paddingBottom: contentBottom,
          },
        ]}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="heading1">History</ThemedText>
            <ThemedText type="body" tone="textSecondary">
              Every entry, newest first.
            </ThemedText>
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <ThemedText type="overline" tone="textMuted">
              {section.title}
            </ThemedText>
          </View>
        )}
        renderItem={({ item }) => {
          const category = item.category_id
            ? categoryById.get(item.category_id)
            : undefined;
          return (
            <TransactionRow
              title={
                item.note?.trim() ||
                category?.name ||
                (item.type === "income" ? "Money in" : "Spend")
              }
              kind={item.type}
              amount={formatCents(item.amount)}
              date={item.date.toLocaleDateString("en-ZA", {
                day: "numeric",
                month: "short",
              })}
              category={category?.name}
            />
          );
        }}
        ListEmptyComponent={<EmptyState variant="noTransactions" />}
      />
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  list: {
    paddingHorizontal: screenPadding,
  },
  header: {
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
});
