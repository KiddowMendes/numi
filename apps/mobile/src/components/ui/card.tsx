import { type ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { color, radius, spacing } from '@/constants/tokens';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
};

export function Card({ children, onPress, style }: CardProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const mode = scheme === 'unspecified' ? 'light' : scheme;

  const cardBg = mode === 'dark' ? color.dark.surface : color.light.surface;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.card,
        { backgroundColor: cardBg },
        pressed && onPress && { opacity: 0.92, transform: [{ scale: 0.98 }] },
        style,
      ]}>
      {children}
    </Pressable>
  );
}

// ─── WalletCard ───────────────────────────────────────────────────────

type WalletCardProps = {
  name: string;
  balance: string;
  accentColor?: string;
  onPress?: () => void;
};

export function WalletCard({ name, balance, accentColor, onPress }: WalletCardProps) {
  return (
    <Card onPress={onPress}>
      <ThemedView
        style={[styles.walletCard, accentColor && { borderTopColor: accentColor }]}>
        <ThemedText type="label" themeColor="textSecondary">{name}</ThemedText>
        <ThemedText type="amountLg" themeColor="textPrimary">{balance}</ThemedText>
      </ThemedView>
    </Card>
  );
}

// ─── CategoryCard ─────────────────────────────────────────────────────

type CategoryCardProps = {
  name: string;
  spent: string;
  remaining: string;
  accentColor?: string;
  onPress?: () => void;
};

export function CategoryCard({ name, spent, remaining, accentColor, onPress }: CategoryCardProps) {
  return (
    <Card onPress={onPress}>
      <ThemedView style={styles.categoryCard}>
        <ThemedView style={styles.categoryRow}>
          <ThemedView style={[styles.categoryDot, accentColor && { backgroundColor: accentColor }]} />
          <ThemedText type="body" themeColor="textPrimary">{name}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.categoryAmounts}>
          <ThemedText type="amountMd" themeColor="textPrimary">{spent}</ThemedText>
          <ThemedText type="amountSm" themeColor="textSecondary"> of {remaining}</ThemedText>
        </ThemedView>
      </ThemedView>
    </Card>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────

type StatCardProps = {
  label: string;
  value: string;
  accent?: boolean;
  onPress?: () => void;
};

export function StatCard({ label, value, accent = false, onPress }: StatCardProps) {
  return (
    <Card onPress={onPress}>
      <ThemedView style={styles.statCard}>
        <ThemedText type="caption" themeColor="textSecondary">{label}</ThemedText>
        <ThemedText
          type="amountMd"
          themeColor={accent ? 'primary' : 'textPrimary'}>
          {value}
        </ThemedText>
      </ThemedView>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    padding: spacing.lg,
  },
  // WalletCard
  walletCard: {
    borderTopWidth: 3,
    gap: spacing.xs,
  },
  // CategoryCard
  categoryCard: {
    gap: spacing.sm,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#999',
  },
  categoryAmounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  // StatCard
  statCard: {
    gap: spacing.xs,
  },
});
