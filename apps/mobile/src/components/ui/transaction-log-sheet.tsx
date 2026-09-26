import { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import { AppIcon } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { AmountInput } from "@/components/ui/amount-input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/ui/category-picker";
import { PillToggle } from "@/components/ui/pill-toggle";
import { TextField } from "@/components/ui/text-field";
import { formatCents, spacing } from "@/constants/tokens";
import { resolveAccentKeyForCategory } from "@/lib/category-accent";
import { useStore } from "@/store";

export type TransactionLogSheetProps = {
  visible: boolean;
  onClose: () => void;
  onLogged?: () => void;
};

const TYPE_OPTIONS = [
  { value: "expense" as const, label: "Spent", icon: "moneyOut" as const },
  { value: "income" as const, label: "Got in", icon: "moneyIn" as const },
];

/**
 * Money in, money out, on one screen with a keypad. No OS keyboard, no
 * stepping through screens — the locked principles call for a single screen
 * even for a R20 purchase, and a thumb reaching for a numeric pad is faster
 * than reaching for keys anyway.
 */
export function TransactionLogSheet({
  visible,
  onClose,
  onLogged,
}: TransactionLogSheetProps) {
  const draft = useStore((s) => s.draft);
  const setDraftField = useStore((s) => s.setDraftField);
  const clearDraft = useStore((s) => s.clearDraft);
  const logTransaction = useStore((s) => s.logTransaction);
  const categories = useStore((s) => s.appState.categories);

  const [error, setError] = useState<string | null>(null);

  const cents = Math.round(Number.parseFloat(draft.amount || "0") * 100);
  const isExpense = draft.type === "expense";
  const needsCategory = isExpense && categories.length > 0;

  const options = categories.map((category) => ({
    id: category.id,
    label: category.name,
    accent: resolveAccentKeyForCategory(category.id, category.name),
  }));

  function handleLog() {
    if (cents <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    if (needsCategory && !draft.categoryId) {
      setError("Pick a category so this spend lands somewhere.");
      return;
    }

    const result = logTransaction();
    if (!result.ok) {
      setError(result.errors[0]?.message ?? "Could not log that. Try again.");
      return;
    }

    setError(null);
    clearDraft();
    onLogged?.();
    onClose();
  }

  function handleClose() {
    setError(null);
    onClose();
  }

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Log money">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PillToggle
          options={TYPE_OPTIONS}
          value={draft.type}
          onChange={(value) => {
            setDraftField("type", value);
            if (value === "income") setDraftField("categoryId", null);
            setError(null);
          }}
        />

        <AmountInput
          label={isExpense ? "How much did you spend?" : "How much came in?"}
          value={draft.amount}
          onChangeText={(value) => {
            setDraftField("amount", value);
            setError(null);
          }}
          error={error ?? undefined}
        />

        {needsCategory ? (
          <CategoryPicker
            label="Category"
            options={options}
            value={draft.categoryId}
            onChange={(id) => {
              setDraftField("categoryId", id);
              setError(null);
            }}
          />
        ) : null}

        <TextField
          label="Note"
          placeholder="Optional"
          value={draft.note}
          maxLength={60}
          onChangeText={(value) => setDraftField("note", value)}
        />

        {cents > 0 ? (
          <View style={styles.preview}>
            <AppIcon name={isExpense ? "moneyOut" : "moneyIn"} size={16} />
            <ThemedText type="caption" tone="textMuted">
              Logging {isExpense ? "−" : "+"}
              {formatCents(cents)}
            </ThemedText>
          </View>
        ) : null}

        <Button
          size="lg"
          onPress={handleLog}
          icon="check"
          accessibilityHint="Saves this entry and updates your safe to spend"
        >
          Save
        </Button>

        <Button variant="ghost" size="sm" onPress={handleClose}>
          Cancel
        </Button>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scroll: {
    maxHeight: 520,
  },
  body: {
    gap: spacing.xl,
    paddingBottom: spacing.md,
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "center",
  },
});
