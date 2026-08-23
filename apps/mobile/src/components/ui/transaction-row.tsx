import { type ReactNode } from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { color, radius, spacing } from '@/constants/tokens';
import { useTheme } from '@/hooks/use-theme';

type TransactionRowProps = {
  title: string;
  amount: string;
  date: string;
  category?: string;
  accentColor?: string;
  onPress?: () => void;
  icon?: ReactNode;
  style?: ViewStyle;
};

export function TransactionRow({
  title,
  amount,
  date,
  category,
  accentColor,
  onPress,
  icon,
  style,
}: TransactionRowProps) {
  const theme = useTheme();
  const isPositive = amount.startsWith('+') || amount.startsWith('R');
  const amountColor = isPositive ? theme.income : theme.textPrimary;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        pressed && onPress && { opacity: 0.7 },
        style,
      ]}>
      {icon ? (
        <ThemedView style={[styles.iconContainer, accentColor && { backgroundColor: accentColor + '20' }]}>
          {icon}
        </ThemedView>
      ) : (
        <ThemedView style={[styles.dot, accentColor && { backgroundColor: accentColor }]} />
      )}
      <ThemedView style={styles.details}>
        <ThemedText type="body" themeColor="textPrimary" numberOfLines={1}>
          {title}
        </ThemedText>
        <ThemedText type="caption" themeColor="textMuted">
          {date}{category ? ` · ${category}` : ''}
        </ThemedText>
      </ThemedView>
      <ThemedText type="amountMd" style={{ color: amountColor }}>
        {amount}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CCC',
  },
  details: {
    flex: 1,
    gap: 2,
  },
});
