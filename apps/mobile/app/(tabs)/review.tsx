import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStore } from '@/store';
import { Spacing } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';

export default function ReviewScreen() {
  const activePeriod = useStore((s) => s.appState.activePeriod);
  const wallets = useStore((s) => s.appState.wallets);
  const assignments = useStore((s) => s.appState.assignments);
  const transactions = useStore((s) => s.appState.transactions);

  const totalAssigned: number = assignments.reduce<number>((sum, a) => sum + a.amount, 0);
  const totalSpent: number = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce<number>((sum, tx) => sum + tx.amount, 0);
  const totalBalance: number = wallets.reduce<number>((sum, w) => sum + w.balance, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Review</ThemedText>

        {activePeriod && (
          <ThemedText type="small" themeColor="textSecondary">
            {activePeriod.name}
          </ThemedText>
        )}

        <ThemedView style={styles.statsGrid}>
          <ThemedView style={styles.statCard}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Total Balance
            </ThemedText>
            <ThemedText type="subtitle">{formatCurrency(totalBalance)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statCard}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Assigned
            </ThemedText>
            <ThemedText type="subtitle">{formatCurrency(totalAssigned)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statCard}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Spent
            </ThemedText>
            <ThemedText type="subtitle">{formatCurrency(totalSpent)}</ThemedText>
          </ThemedView>

          <ThemedView style={styles.statCard}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              Remaining
            </ThemedText>
            <ThemedText type="subtitle">
              {formatCurrency(totalBalance - totalSpent)}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedText type="small" themeColor="textSecondary">
          {transactions.length} transactions · {assignments.length} assignments
        </ThemedText>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    padding: Spacing.three,
    gap: Spacing.one,
  },
});
