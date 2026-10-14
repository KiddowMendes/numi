import { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

import {
  canDeleteWallet,
  canUpdateWalletBalance,
  isDuplicateWalletName,
} from "@numi/domain";
import { randToCents } from "@numi/utils";

import { showToast } from "@/components/app-toast";
import { ThemedText } from "@/components/themed-text";
import { AmountInput } from "@/components/ui/amount-input";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { PillToggle } from "@/components/ui/pill-toggle";
import { TextField } from "@/components/ui/text-field";
import { formatCents, spacing } from "@/constants/tokens";
import { WALLET_TYPES } from "@/lib/wallet-types";
import { centsToDraftAmount, useStore, type WalletDraft } from "@/store";

type FormMode = "add" | "edit";

/**
 * Add, edit, and delete a wallet from the wallets screen.
 *
 * One sheet covers all three. The draft is component state, not store state
 * (spec 0003 AC-17): a wallet form is short enough that a half typed row is not
 * worth holding across tab switches, so it clears on close and on a successful
 * save. The form is remounted (via `key`) each time the sheet opens, which is
 * what reseeds the fields and discards any leftover draft. The domain owns
 * every rule — the live duplicate name check, the balance floor, and the delete
 * guard — so the sheet only renders what those return.
 */
export function WalletSheet() {
  const mode = useStore((s) => s.walletSheetMode);
  const editingWalletId = useStore((s) => s.editingWalletId);
  const closeWalletSheet = useStore((s) => s.closeWalletSheet);

  const visible = mode !== "closed";

  return (
    <BottomSheet
      visible={visible}
      onClose={closeWalletSheet}
      title={mode === "edit" ? "Edit wallet" : "New wallet"}
    >
      {visible ? (
        <WalletForm
          key={editingWalletId ?? "add"}
          mode={mode === "edit" ? "edit" : "add"}
          editingWalletId={editingWalletId}
        />
      ) : null}
    </BottomSheet>
  );
}

type WalletFormProps = {
  mode: FormMode;
  editingWalletId: string | null;
};

function WalletForm({ mode, editingWalletId }: WalletFormProps) {
  const wallets = useStore((s) => s.appState.wallets);
  const assignments = useStore((s) => s.appState.assignments);
  const goals = useStore((s) => s.appState.goals);
  const transactions = useStore((s) => s.appState.transactions);
  const closeWalletSheet = useStore((s) => s.closeWalletSheet);
  const addWallet = useStore((s) => s.addWallet);
  const updateWallet = useStore((s) => s.updateWallet);
  const deleteWallet = useStore((s) => s.deleteWallet);

  const isEdit = mode === "edit";
  const editingWallet = isEdit
    ? wallets.find((w) => w.id === editingWalletId)
    : undefined;

  // Seeded once per mount: prefill from the row in edit mode, blank in add mode.
  const [draft, setDraft] = useState<WalletDraft>(() =>
    editingWallet
      ? {
          name: editingWallet.name,
          type: editingWallet.type,
          balance: centsToDraftAmount(editingWallet.balance),
        }
      : { name: "", type: "cash", balance: "" },
  );
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const trimmedName = draft.name.trim();

  // The name rule, run live as the user types (AC-6, AC-11). The engine still
  // rejects a duplicate as a backstop.
  const duplicate =
    trimmedName.length > 0 &&
    isDuplicateWalletName(
      wallets,
      draft.name,
      isEdit ? (editingWalletId ?? undefined) : undefined,
    );

  const newBalance = randToCents(draft.balance || "0");

  // The money committed to this wallet across every period, the same lifetime
  // window the available balance uses. Shown in the balance floor message.
  const committed = editingWallet
    ? assignments
        .filter((a) => a.wallet_id === editingWallet.id)
        .reduce((sum, a) => sum + a.amount, 0) +
      goals
        .filter((g) => g.wallet_id === editingWallet.id)
        .reduce((sum, g) => sum + g.current_amount, 0)
    : 0;

  const balanceGuard =
    isEdit && editingWallet
      ? canUpdateWalletBalance(editingWallet, assignments, goals, newBalance)
      : null;
  const liveBalanceError =
    balanceGuard && !balanceGuard.valid
      ? `${formatCents(committed)} is already assigned or reserved here`
      : null;
  const balanceErrorText = liveBalanceError ?? balanceError;
  const invalidBalance = liveBalanceError !== null;

  const deleteGuard = editingWallet
    ? canDeleteWallet(editingWallet, wallets, assignments, goals, transactions)
    : null;
  const canDelete = deleteGuard?.valid === true;
  const deleteReason =
    deleteGuard && !deleteGuard.valid ? deleteGuard.error : null;

  // Add needs only a non-empty, unique name (AC-4). Edit also needs something
  // to have changed (a save that writes nothing is not a save). Confirm is off
  // while a balance sits below committed money, and while in flight (AC-18).
  const changed = editingWallet
    ? trimmedName !== editingWallet.name ||
      draft.type !== editingWallet.type ||
      newBalance !== editingWallet.balance
    : true;
  const canConfirm =
    !submitting &&
    trimmedName.length > 0 &&
    !duplicate &&
    !invalidBalance &&
    (isEdit ? changed : true);

  function setField<K extends keyof WalletDraft>(
    key: K,
    value: WalletDraft[K],
  ) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setBalanceError(null);
  }

  function handleConfirm() {
    if (!canConfirm) return;
    setSubmitting(true);
    setBalanceError(null);

    const result = isEdit ? updateWallet(draft) : addWallet(draft);

    if (result.ok) {
      // The store closes the sheet, so this form is about to unmount.
      showToast("success", isEdit ? "Saved" : "Added");
      return;
    }

    setSubmitting(false);
    const failure = result.errors[0];
    if (failure?.code === "INSUFFICIENT_BALANCE") {
      setBalanceError(
        `${formatCents(committed)} is already assigned or reserved here`,
      );
      return;
    }
    showToast("warning", "Something went wrong");
  }

  function handleDelete() {
    if (!editingWallet || !canDelete) return;
    Alert.alert("Delete wallet?", "This wallet will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const result = deleteWallet();
          if (result.ok) showToast("success", "Deleted");
          else showToast("warning", "Something went wrong");
        },
      },
    ]);
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.body}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <TextField
        label="Name"
        value={draft.name}
        onChangeText={(value) => setField("name", value)}
        placeholder="Cash"
        autoCapitalize="words"
        returnKeyType="done"
        error={duplicate ? "Name already in use" : undefined}
      />

      <PillToggle
        label="Type"
        options={WALLET_TYPES}
        value={draft.type}
        onChange={(value) => setField("type", value)}
      />

      <AmountInput
        label={isEdit ? "Balance" : "Starting balance (optional)"}
        value={draft.balance}
        onChangeText={(value) => setField("balance", value)}
        error={balanceErrorText ?? undefined}
      />

      <Button
        size="lg"
        onPress={handleConfirm}
        disabled={!canConfirm}
        loading={submitting}
        icon="check"
      >
        {isEdit ? "Save" : "Add wallet"}
      </Button>

      {isEdit ? (
        <View style={styles.deleteBlock}>
          <Button
            variant="danger"
            size="sm"
            onPress={handleDelete}
            disabled={!canDelete}
            icon="delete"
          >
            Delete wallet
          </Button>
          {deleteReason ? (
            <ThemedText type="caption" tone="textMuted" align="center">
              {deleteReason}
            </ThemedText>
          ) : null}
        </View>
      ) : null}

      <Button variant="ghost" size="sm" onPress={closeWalletSheet}>
        Cancel
      </Button>
    </ScrollView>
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
  deleteBlock: {
    alignItems: "center",
    gap: spacing.sm,
  },
});
