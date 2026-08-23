import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { spacing } from '@/constants/tokens';

type SafeToSpendHeroProps = {
  amount: string;
  subtitle?: string;
};

export function SafeToSpendHero({ amount, subtitle = 'Safe to spend today' }: SafeToSpendHeroProps) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="label" themeColor="textSecondary" style={styles.label}>
        Safe to spend
      </ThemedText>
      <ThemedText
        type="amountHero"
        themeColor="primary"
        style={styles.amount}>
        {amount}
      </ThemedText>
      {subtitle && (
        <ThemedText type="caption" themeColor="textMuted" style={styles.subtitle}>
          {subtitle}
        </ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
    gap: spacing.xs,
  },
  label: {
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  amount: {
    fontVariant: ['tabular-nums' as const],
  },
  subtitle: {
    marginTop: spacing.xs,
  },
});
