import { type ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { spacing } from '@/constants/tokens';

type EmptyVariant = 'noTransactions' | 'noWallets' | 'noCategories' | 'noGoals';

type EmptyStateProps = {
  variant: EmptyVariant;
  icon?: ReactNode;
  onAction?: () => void;
};

const VARIANT_CONFIG = {
  noTransactions: {
    title: 'No transactions yet',
    message: 'Add your first transaction to start tracking spending.',
  },
  noWallets: {
    title: 'No wallets',
    message: 'Create a wallet to begin managing your money.',
  },
  noCategories: {
    title: 'No categories',
    message: 'Set up spending categories to organize your budget.',
  },
  noGoals: {
    title: 'No goals',
    message: 'Add a savings goal to stay motivated.',
  },
} as const;

export function EmptyState({ variant, icon, onAction }: EmptyStateProps) {
  const config = VARIANT_CONFIG[variant];

  return (
    <ThemedView style={styles.container}>
      {icon}
      <ThemedText type="heading2" themeColor="textPrimary" style={styles.title}>
        {config.title}
      </ThemedText>
      <ThemedText type="body" themeColor="textSecondary" style={styles.message}>
        {config.message}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
    gap: spacing.md,
  },
  title: {
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    maxWidth: 280,
  },
});
