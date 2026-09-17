import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Keyboard,
  Pressable,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  type ViewStyle,
} from 'react-native';
import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { AmountInput } from '@/components/ui/amount-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { CategoryChip } from '@/components/ui/category-chip';
import { Button } from '@/components/ui/button';
import { useStore, useEngine } from '@/store';
import { color, radius, spacing } from '@/constants/tokens';
import { useTheme } from '@/hooks/use-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatCurrency, formatDate } from '@/lib/format';
import Toast from 'react-native-toast-message';

function parseAmountToCents(input: string): number {
  const cleaned = input.replace(/[^0-9.\-]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

type TransactionLogSheetProps = {
  visible: boolean;
  onClose: () => void;
};

const TYPE_OPTIONS = [
  { label: 'Expense', value: 'expense' as const },
  { label: 'Income', value: 'income' as const },
];

export function TransactionLogSheet({ visible, onClose }: TransactionLogSheetProps) {
  const theme = useTheme();
  const scheme = useColorScheme();
  const mode = scheme === 'unspecified' ? 'light' : scheme;
  const { engine } = useEngine();

  const draft = useStore((s) => s.draft);
  const setDraftField = useStore((s) => s.setDraftField);
  const clearDraft = useStore((s) => s.clearDraft);
  const logTransaction = useStore((s) => s.logTransaction);
  const wallets = useStore((s) => s.appState.wallets);
  const categories = useStore((s) => s.appState.categories);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Auto-select first wallet if none selected
  useEffect(() => {
    if (visible && !draft.walletId && wallets.length > 0) {
      setDraftField('walletId', wallets[0].id);
    }
  }, [visible, draft.walletId, wallets, setDraftField]);

  // Clear error when draft changes
  useEffect(() => {
    setError(null);
  }, [draft.amount, draft.type, draft.categoryId]);

  const selectedWallet = useMemo(() => {
    const id = draft.walletId || wallets[0]?.id;
    return wallets.find((w) => w.id === id) || wallets[0];
  }, [wallets, draft.walletId]);

  // Live safe to spend preview (AC-8)
  const safeToSpendPreview = useMemo(() => {
    if (draft.type === 'income') return null;
    if (!selectedWallet || !engine) return null;
    const amountCents = parseAmountToCents(draft.amount);
    if (amountCents <= 0) return null;
    const balanceResult = engine.getAvailableBalance(selectedWallet.id);
    if (!balanceResult.ok) return null;
    const after = balanceResult.value - amountCents;
    return after;
  }, [draft.type, draft.amount, selectedWallet, engine]);

  // Confirm disabled logic (AC-13, AC-14)
  const isConfirmDisabled = useMemo(() => {
    if (saving) return true;
    const amountCents = parseAmountToCents(draft.amount);
    if (amountCents <= 0) return true;
    if (draft.type === 'expense' && !draft.categoryId) return true;
    return false;
  }, [saving, draft.amount, draft.type, draft.categoryId]);

  const handleConfirm = useCallback(async () => {
    if (isConfirmDisabled) return;
    Keyboard.dismiss();
    setSaving(true);
    setError(null);

    const result = logTransaction();

    setSaving(false);

    if (result.ok) {
      Toast.show({
        type: 'success',
        text1: draft.type === 'income' ? 'Income logged' : 'Logged',
        position: 'top',
        visibilityTime: 2000,
      });
      onClose();
    } else {
      const firstError = result.errors[0];
      if (firstError?.code === 'INSUFFICIENT_BALANCE') {
        setError(`Not enough in ${selectedWallet?.name || 'wallet'}`);
      } else {
        setError('Something went wrong');
      }
    }
  }, [isConfirmDisabled, logTransaction, draft.type, onClose, selectedWallet]);

  const handleDateChange = useCallback(
    (_event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowDatePicker(Platform.OS === 'ios');
      if (selectedDate) {
        setDraftField('date', selectedDate);
      }
    },
    [setDraftField],
  );

  const handleDismiss = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const noCategories = categories.length === 0 && draft.type === 'expense';

  return (
    <BottomSheet visible={visible} onClose={handleDismiss} title="Log Transaction">
      <ThemedView style={styles.form}>
        {/* Type selector (AC-2) */}
        <SegmentedControl
          options={TYPE_OPTIONS}
          selected={draft.type}
          onChange={(value) => {
            setDraftField('type', value);
            if (value === 'income') {
              setDraftField('categoryId', null);
            }
          }}
        />

        {/* Amount input (AC-3) */}
        <ThemedView style={styles.field}>
          <AmountInput
            value={draft.amount}
            onChangeText={(text) => setDraftField('amount', text)}
            error={error ?? undefined}
          />
          {error && (
            <ThemedText type="caption" themeColor="expense" style={styles.errorText}>
              {error}
            </ThemedText>
          )}
        </ThemedView>

        {/* Category chips for expenses (AC-4) */}
        {draft.type === 'expense' && (
          <ThemedView style={styles.field}>
            {noCategories ? (
              <ThemedView style={styles.noCategories}>
                <ThemedText type="body" themeColor="textSecondary">
                  No categories available. Set up your budget first.
                </ThemedText>
              </ThemedView>
            ) : (
              <CategoryChip
                categories={categories}
                selectedId={draft.categoryId}
                onSelect={(id) => setDraftField('categoryId', id)}
              />
            )}
          </ThemedView>
        )}

        {/* Wallet picker (AC-6) */}
        {wallets.length > 1 && (
          <ThemedView style={styles.field}>
            <ThemedText type="label" themeColor="textSecondary">
              Wallet
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {wallets.map((wallet) => {
                const isSelected = wallet.id === (draft.walletId || wallets[0]?.id);
                return (
                  <Pressable
                    key={wallet.id}
                    onPress={() => setDraftField('walletId', wallet.id)}
                    style={({ pressed }: { pressed: boolean }) => [
                      styles.walletChip,
                      {
                        backgroundColor: isSelected ? theme.primary : 'transparent',
                        borderColor: isSelected ? theme.primary : theme.borderSubtle,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <ThemedText
                      type="label"
                      style={{ color: isSelected ? color.light.background : theme.textPrimary }}
                    >
                      {wallet.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </ThemedView>
        )}

        {/* Note input (AC-5) */}
        <ThemedView style={styles.field}>
          <TextInput
            value={draft.note}
            onChangeText={(text) => setDraftField('note', text)}
            placeholder="What was this for?"
            placeholderTextColor={theme.textMuted}
            style={[styles.noteInput, { color: theme.textPrimary, borderColor: theme.borderSubtle }]}
            returnKeyType="done"
          />
        </ThemedView>

        {/* Date picker (AC-7) */}
        <ThemedView style={styles.field}>
          <Pressable
            onPress={() => setShowDatePicker(true)}
            style={({ pressed }: { pressed: boolean }) => [
              styles.dateRow,
              { borderColor: theme.borderSubtle },
              pressed && styles.pressed,
            ]}
          >
            <ThemedText type="label" themeColor="textSecondary">
              Date
            </ThemedText>
            <ThemedText type="body" themeColor="textPrimary">
              {formatDate(draft.date)}
            </ThemedText>
          </Pressable>
          {showDatePicker && (
            <DateTimePicker
              value={draft.date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}
        </ThemedView>

        {/* Safe to spend preview (AC-8) */}
        {safeToSpendPreview !== null && (
          <ThemedView style={styles.previewRow}>
            <ThemedText type="caption" themeColor="textSecondary">
              Safe to spend after:
            </ThemedText>
            <ThemedText
              type="amountSm"
              style={{ color: safeToSpendPreview < 0 ? theme.expense : theme.income }}
            >
              {formatCurrency(safeToSpendPreview)}
            </ThemedText>
          </ThemedView>
        )}

        {/* Confirm button (AC-9, AC-13, AC-14) */}
        <Button
          variant="primary"
          size="lg"
          disabled={isConfirmDisabled}
          loading={saving}
          onPress={handleConfirm}
          style={styles.confirmButton}
        >
          {draft.type === 'income' ? 'Log Income' : 'Log Expense'}
        </Button>
      </ThemedView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.lg,
  },
  field: {
    gap: spacing.sm,
  },
  errorText: {
    marginTop: spacing.xs,
  },
  noCategories: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  walletChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: 16,
    fontFamily: 'Inter',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  confirmButton: {
    marginTop: spacing.sm,
  },
});
