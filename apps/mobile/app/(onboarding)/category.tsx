import { useState } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { AmountInput } from '@/components/ui/amount-input';
import { useEngine, useStore } from '@/store';
import { formatCurrency } from '@/lib/format';
import { spacing, categoryColors } from '@/constants/tokens';
import type { Category } from '@numi/domain';

export default function CategorySetupScreen() {
  const { engine } = useEngine();
  const syncFromEngine = useStore((s) => s.syncFromEngine);
  const categories = useStore((s) => s.appState.categories);
  const wallets = useStore((s) => s.appState.wallets);
  const activePeriod = useStore((s) => s.appState.activePeriod);

  const [amounts, setAmounts] = useState<Record<string, string>>({});

  const wallet = wallets[0];

  function getAmount(categoryId: string): number {
    return Math.round((parseFloat(amounts[categoryId]) || 0) * 100);
  }

  const totalAssigned = categories.reduce((sum, cat) => sum + getAmount(cat.id), 0);

  function handleComplete() {
    if (!activePeriod || !wallet) return;

    categories.forEach((cat) => {
      const cents = getAmount(cat.id);
      if (cents <= 0) return;

      engine.createAssignment({
        id: `assignment-${cat.id}-${Date.now()}`,
        period_id: activePeriod.id,
        category_id: cat.id,
        wallet_id: wallet.id,
        amount: cents,
        created_at: new Date(),
      });
    });

    syncFromEngine();
    // Stack key changes from 'onboarding' to 'tabs' via activePeriod update
  }

  function updateAmount(categoryId: string, value: string) {
    setAmounts((prev) => ({ ...prev, [categoryId]: value }));
  }

  function renderCategory({ item }: { item: Category }) {
    const idx = categories.indexOf(item) % categoryColors.length;
    const catColor = categoryColors[idx];

    return (
      <ThemedView style={styles.categoryRow}>
        <ThemedView style={styles.categoryLeft}>
          <ThemedView style={[styles.categoryDot, { backgroundColor: catColor }]} />
          <ThemedText type="body" themeColor="textPrimary">
            {item.name}
          </ThemedText>
        </ThemedView>
        <AmountInput
          value={amounts[item.id] ?? ''}
          onChangeText={(v) => updateAmount(item.id, v)}
        />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedView style={styles.header}>
          <ThemedText type="heading1" themeColor="textPrimary">
            Assign Your Budget
          </ThemedText>
          <ThemedText type="body" themeColor="textSecondary">
            Divide your money across categories. You can skip any for now.
          </ThemedText>
        </ThemedView>

        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderCategory}
          contentContainerStyle={styles.list}
        />

        <ThemedView style={styles.footer}>
          <ThemedView style={styles.totalRow}>
            <ThemedText type="label" themeColor="textSecondary">
              Total assigned
            </ThemedText>
            <ThemedText type="amountMd" themeColor="textPrimary">
              {formatCurrency(totalAssigned)}
            </ThemedText>
          </ThemedView>

          <Button variant="primary" size="lg" onPress={handleComplete}>
            Start Budgeting
          </Button>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing['3xl'],
    gap: spacing.xl,
  },
  header: {
    gap: spacing.sm,
  },
  list: {
    flex: 1,
    gap: spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  categoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minWidth: 100,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
