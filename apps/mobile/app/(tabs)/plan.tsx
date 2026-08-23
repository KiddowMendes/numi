import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStore } from '@/store';
import { Spacing } from '@/constants/theme';
import { formatCurrency } from '@/lib/format';

export default function PlanScreen() {
  const activePeriod = useStore((s) => s.appState.activePeriod);
  const wallets = useStore((s) => s.appState.wallets);
  const assignments = useStore((s) => s.appState.assignments);
  const categories = useStore((s) => s.appState.categories);

  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const totalAssigned: number = assignments.reduce<number>((sum, a) => sum + a.amount, 0);
  const totalBalance: number = wallets.reduce<number>((sum, w) => sum + w.balance, 0);

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Plan</ThemedText>

        {activePeriod ? (
          <>
            <ThemedView style={styles.card}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                {activePeriod.name}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {new Date(activePeriod.start_date).toLocaleDateString()} –{' '}
                {new Date(activePeriod.end_date).toLocaleDateString()}
              </ThemedText>
            </ThemedView>

            <ThemedView style={styles.card}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                Assignments
              </ThemedText>
              {assignments.length === 0 ? (
                <ThemedText type="default" themeColor="textSecondary">
                  No assignments yet.
                </ThemedText>
              ) : (
                assignments.map((a) => {
                  const cat = categoryMap.get(a.category_id);
                  return (
                    <ThemedView key={a.id} style={styles.row}>
                      <ThemedText type="default">{cat?.name ?? a.category_id}</ThemedText>
                      <ThemedText type="default">{formatCurrency(a.amount)}</ThemedText>
                    </ThemedView>
                  );
                })
              )}
              <ThemedText type="small" themeColor="textSecondary">
                {formatCurrency(totalAssigned)} assigned of {formatCurrency(totalBalance)}
              </ThemedText>
            </ThemedView>
          </>
        ) : (
          <ThemedView style={styles.empty}>
            <ThemedText type="default" themeColor="textSecondary">
              No active period. Create one from the Home screen.
            </ThemedText>
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
  card: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    padding: Spacing.four,
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
});
