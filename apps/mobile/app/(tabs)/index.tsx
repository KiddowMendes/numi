import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStore } from '@/store';
import { Spacing } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';

export default function DailyBudgetingScreen() {
  const wallets = useStore((s) => s.appState.wallets);
  const activePeriod = useStore((s) => s.appState.activePeriod);
  const assignments = useStore((s) => s.appState.assignments);
  const engine = useStore((s) => s.engine);

  const safeToSpendResult = engine?.getDailySafeToSpend();
  const safeToSpend = safeToSpendResult?.ok ? safeToSpendResult.value : null;
  const totalBalance: number = wallets.reduce<number>((sum, w) => sum + w.balance, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Daily Budgeting</ThemedText>

        <ThemedView style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Safe to Spend Today
          </ThemedText>
          <ThemedText type="title">
            {safeToSpend !== null ? formatCurrency(safeToSpend) : '—'}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.card}>
          <ThemedText type="smallBold" themeColor="textSecondary">
            Total Balance
          </ThemedText>
          <ThemedText type="subtitle">
            {formatCurrency(totalBalance)}
          </ThemedText>
        </ThemedView>

        {activePeriod && (
          <ThemedText type="small" themeColor="textSecondary">
            {activePeriod.name} · {assignments.length} assignments
          </ThemedText>
        )}
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.three,
  },
  card: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    padding: Spacing.four,
    gap: Spacing.one,
  },
});
