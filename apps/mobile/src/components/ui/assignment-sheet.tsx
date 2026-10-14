import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

import { showToast } from "@/components/app-toast";
import { AppIcon } from "@/components/app-icon";
import { ThemedText } from "@/components/themed-text";
import { AmountInput } from "@/components/ui/amount-input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { CategoryPicker } from "@/components/ui/category-picker";
import { PillToggle } from "@/components/ui/pill-toggle";
import { formatCents, spacing } from "@/constants/tokens";
import { resolveAccentKeyForCategory } from "@/lib/category-accent";
import { useStore } from "@/store";

/**
 * Add or edit a budget commitment from the plan screen.
 *
 * One sheet covers both: add picks a category (and a wallet when there is more
 * than one), edit shows the category and wallet read only and changes the amount
 * only, with a delete action in the footer. A live "available after" line keeps
 * the effect on the wallet visible while the user types. The draft lives in the
 * store, so dismissing the sheet or switching tabs does not lose it.
 */
export function AssignmentSheet() {
  const mode = useStore((s) => s.assignmentSheetMode);
  const editingAssignmentId = useStore((s) => s.editingAssignmentId);
  const draft = useStore((s) => s.assignmentDraft);
  const setDraftField = useStore((s) => s.setAssignmentDraftField);
  const selectCategory = useStore((s) => s.selectAssignmentCategory);
  const closeSheet = useStore((s) => s.closeAssignmentSheet);
  const addAssignment = useStore((s) => s.addAssignment);
  const updateAssignment = useStore((s) => s.updateAssignment);
  const deleteAssignment = useStore((s) => s.deleteAssignment);
  const categories = useStore((s) => s.appState.categories);
  const wallets = useStore((s) => s.appState.wallets);
  const assignments = useStore((s) => s.appState.assignments);
  const engine = useStore((s) => s.engine);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const visible = mode !== "closed";
  const isEdit = mode === "edit";
  const editingAssignment = isEdit
    ? assignments.find((a) => a.id === editingAssignmentId)
    : undefined;

  const walletId = draft.walletId ?? wallets[0]?.id ?? null;
  const wallet = wallets.find((w) => w.id === walletId);
  const amountCents = Math.round(Number.parseFloat(draft.amount || "0") * 100);

  const availableResult =
    walletId && engine ? engine.getAvailableBalance(walletId) : null;
  const available = availableResult?.ok ? availableResult.value : 0;

  // Add: available minus what is being assigned. Edit: the wallet's available
  // still counts the row's old amount, so add it back before subtracting the
  // new amount, or the old amount would be counted twice.
  const previewCents =
    isEdit && editingAssignment
      ? available + editingAssignment.amount - amountCents
      : available - amountCents;

  const categoryOptions = categories.map((category) => ({
    id: category.id,
    label: category.name,
    accent: resolveAccentKeyForCategory(category.id, category.name),
  }));

  const walletOptions = wallets.map((w) => ({ value: w.id, label: w.name }));

  const editingCategory = editingAssignment
    ? categories.find((c) => c.id === editingAssignment.category_id)
    : undefined;

  const hasCategories = categories.length > 0;
  const canConfirm =
    !submitting &&
    amountCents > 0 &&
    (isEdit
      ? Boolean(editingAssignment)
      : draft.categoryId !== null && hasCategories) &&
    Boolean(walletId);

  function handleSelectCategory(id: string) {
    setError(null);
    selectCategory(id);
  }

  function handleConfirm() {
    if (!canConfirm) return;
    setSubmitting(true);
    setError(null);

    const result = isEdit ? updateAssignment() : addAssignment();

    if (result.ok) {
      // The store closes the sheet, so this component is about to unmount.
      showToast("success", "Saved");
      return;
    }

    setSubmitting(false);
    const failure = result.errors[0];
    if (failure?.code === "INSUFFICIENT_BALANCE") {
      setError(`Not enough in ${wallet?.name ?? "that wallet"}`);
      return;
    }
    showToast("warning", "Something went wrong");
  }

  function handleDelete() {
    if (!editingAssignment) return;
    Alert.alert(
      "Delete assignment?",
      `${formatCents(editingAssignment.amount)} moves back to available.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const result = deleteAssignment();
            if (result.ok) showToast("success", "Deleted");
            else showToast("warning", "Something went wrong");
          },
        },
      ],
    );
  }

  function handleClose() {
    setError(null);
    setSubmitting(false);
    closeSheet();
  }

  return (
    <BottomSheet
      visible={visible}
      onClose={handleClose}
      title={isEdit ? "Edit assignment" : "New assignment"}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isEdit ? (
          <>
            <ReadOnlyField
              label="Category"
              value={editingCategory?.name ?? "—"}
            />
            <ReadOnlyField label="Wallet" value={wallet?.name ?? "—"} />
          </>
        ) : (
          <>
            {wallets.length > 1 ? (
              <PillToggle
                label="Wallet"
                options={walletOptions}
                value={walletId ?? ""}
                onChange={(id) => {
                  setDraftField("walletId", id);
                  setError(null);
                }}
              />
            ) : null}

            {hasCategories ? (
              <CategoryPicker
                label="Category"
                options={categoryOptions}
                value={draft.categoryId}
                onChange={handleSelectCategory}
              />
            ) : (
              <ThemedText type="body" tone="textSecondary">
                No categories available. Set up your budget first.
              </ThemedText>
            )}
          </>
        )}

        <AmountInput
          label={isEdit ? "New amount" : "How much?"}
          value={draft.amount}
          onChangeText={(value) => {
            setDraftField("amount", value);
            setError(null);
          }}
          error={error ?? undefined}
        />

        {walletId ? (
          <View style={styles.preview}>
            <AppIcon name="coins" size={16} />
            <ThemedText type="caption" tone="textMuted">
              Available after: {formatCents(previewCents)}
            </ThemedText>
          </View>
        ) : null}

        <Button
          size="lg"
          onPress={handleConfirm}
          disabled={!canConfirm}
          loading={submitting}
          icon="check"
        >
          Save
        </Button>

        {isEdit ? (
          <Button
            variant="danger"
            size="sm"
            onPress={handleDelete}
            icon="remove"
          >
            Delete assignment
          </Button>
        ) : null}

        <Button variant="ghost" size="sm" onPress={handleClose}>
          Cancel
        </Button>
      </ScrollView>
    </BottomSheet>
  );
}

type ReadOnlyFieldProps = { label: string; value: string };

function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  return (
    <View style={styles.readonly}>
      <ThemedText type="label" tone="textSecondary">
        {label}
      </ThemedText>
      <ThemedText type="title">{value}</ThemedText>
    </View>
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
  readonly: {
    gap: spacing["3xs"],
  },
  preview: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    alignSelf: "center",
  },
});
