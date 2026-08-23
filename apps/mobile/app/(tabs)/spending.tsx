import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStore } from '@/store';
import { Spacing } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';

export default function SpendingScreen() {
  const transactions = useStore((s) => s.appState.transactions);
  const categories = useStore((s) => s.appState.categories);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Spending</ThemedText>

        {transactions.length === 0 ? (
          <ThemedView style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary">
              No transactions yet. Start spending to see them here.
            </ThemedText>
          </ThemedView>
        ) : (
          <ThemedView style={styles.list}>
            {transactions.map((tx) => {
              const cat = tx.category_id ? categoryMap.get(tx.category_id) : null;
              return (
                <ThemedView key={tx.id} style={styles.row}>
                  <ThemedView style={styles.rowLeft}>
                    <ThemedText type="default">{cat?.name ?? tx.type}</ThemedText>
                    {tx.note && (
                      <ThemedText type="small" themeColor="textSecondary">
                        {tx.note}
                      </ThemedText>
                    )}
                  </ThemedView>
                  <ThemedText type="default">
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </ThemedText>
                </ThemedView>
              );
            })}
          </ThemedView>
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
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  rowLeft: {
    gap: 2,
  },
});
