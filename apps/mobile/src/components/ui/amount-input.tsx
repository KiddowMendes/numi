import { forwardRef, useState } from 'react';
import { StyleSheet, TextInput, type TextStyle, type ViewStyle } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { color, radius, spacing, typography } from '@/constants/tokens';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AmountInputProps = {
  value: string;
  onChangeText?: (text: string) => void;
  currency?: string;
  error?: string;
  style?: ViewStyle;
  placeholder?: string;
};

export const AmountInput = forwardRef<TextInput, AmountInputProps>(
  ({ value, onChangeText, currency = 'R', error, style, placeholder = '0.00' }, ref) => {
    const theme = useTheme();
    const scheme = useColorScheme();
    const mode = scheme === 'unspecified' ? 'light' : scheme;
    const [focused, setFocused] = useState(false);

    const borderColor = error
      ? theme.expense
      : focused
        ? theme.primary
        : theme.borderSubtle;

    const handleChange = (text: string) => {
      const cleaned = text.replace(/[^0-9.]/g, '');
      onChangeText?.(cleaned);
    };

    return (
      <ThemedView
        style={[
          styles.container,
          { borderColor },
          error && styles.error,
          style,
        ]}>
        <ThemedView style={styles.currencyBadge}>
          <TextInput
            editable={false}
            value={currency}
            style={[styles.currency, { color: theme.textSecondary }]}
          />
        </ThemedView>
        <TextInput
          ref={ref}
          value={value}
          onChangeText={handleChange}
          keyboardType="decimal-pad"
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          style={[styles.input, { color: theme.textPrimary }]}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
      </ThemedView>
    );
  },
);

AmountInput.displayName = 'AmountInput';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: radius.sm,
    minHeight: 56,
    overflow: 'hidden',
  } as ViewStyle,
  error: {
    borderWidth: 2,
  } as ViewStyle,
  currencyBadge: {
    paddingHorizontal: spacing.md,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    justifyContent: 'center',
    height: '100%' as unknown as number,
  },
  currency: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600' as TextStyle['fontWeight'],
    lineHeight: 19,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '700' as TextStyle['fontWeight'],
    lineHeight: 26,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    fontVariant: ['tabular-nums' as const],
  },
});
