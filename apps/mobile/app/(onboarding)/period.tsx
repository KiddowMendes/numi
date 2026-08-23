import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useEngine, useStore } from '@/store';
import { Spacing } from '@/constants/theme';

export default function OnboardingPeriod() {
  const router = useRouter();
  const { engine, repository } = useEngine();
  const syncFromEngine = useStore((s) => s.syncFromEngine);

  const [periodName, setPeriodName] = useState('This Month');

  function handleComplete() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const result = engine.createWallet({
      id: `wallet-period-${Date.now()}`,
      name: 'Period Wallet',
      type: 'cash',
      balance: 0,
      currency: 'ZAR',
      created_at: now,
    });

    // Create the active period
    repository.upsertPeriod({
      id: `period-${Date.now()}`,
      name: periodName,
      start_date: startOfMonth,
      end_date: endOfMonth,
      is_active: true,
      created_at: now,
    });

    // Reload state and navigate to main app
    const freshState = repository.loadState();
    engine.getState = () => freshState;

    // Force full state replacement
    useStore.setState({ appState: freshState });
    router.replace({ pathname: '/' });
  }

  return (
    <SafeAreaView style={styles.container}>
      <ThemedView style={styles.content}>
        <ThemedText type="title">Set Your Period</ThemedText>
        <ThemedText type="default" themeColor="textSecondary">
          A period is your budgeting cycle — typically a month.
        </ThemedText>

        <View style={styles.periodCard}>
          <ThemedText type="default">Current cycle</ThemedText>
          <ThemedText type="subtitle">{periodName}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {new Date().toLocaleDateString('en-ZA', { month: 'long', year: 'numeric' })}
          </ThemedText>
        </View>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
          onPress={handleComplete}>
          <ThemedText type="default" style={styles.buttonText}>
            Start Budgeting
          </ThemedText>
        </Pressable>
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
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    gap: Spacing.three,
  },
  periodCard: {
    backgroundColor: '#F0F0F3',
    borderRadius: 12,
    padding: Spacing.four,
    marginTop: Spacing.four,
    gap: Spacing.one,
  },
  button: {
    backgroundColor: '#208AEF',
    borderRadius: 12,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
