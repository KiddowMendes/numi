---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/04_Spending/Overview.md"
  - "docs/playbook/05_Features/04_Spending/Screens.md"
decision_record: none
---

# 04 — Spending: Flow

> Finding, understanding, and correcting the record.

---

## Flow 1: Browse History

**Trigger:** User navigates to History tab.

**Steps:**
1. HistoryScreen opens.
2. List grouped by date: Today, Yesterday, [Day name], Earlier this [Month name].
3. Each group: TransactionRows (ListItem component).
4. Scroll to load more (virtualized after 50 items).
5. Tap any row: TransactionDetailSheet opens.

**Default view:**
- All Wallets, all Categories, all types, last 30 days.
- Most recent first.

---

## Flow 2: Filter History

**Trigger:** User wants to narrow down.

**Steps:**
1. Tap filter icon in header.
2. BottomSheet opens with filter options:
   - Wallet (single select).
   - Category (single select, Free; multi-select, Premium).
   - Type (Income, Expense, Transfer).
   - Date range (Today, This week, This period, All time).
3. Apply filters. List updates immediately.
4. "Clear all" resets to default.

---

## Flow 3: Search by Note (Premium)

**Trigger:** User remembers a note they wrote.

**Steps:**
1. Tap search icon.
2. TextInput appears in header.
3. Type query. Debounced 300ms.
4. Results filter in real time across all Transactions.
5. Search is local (SQLite LIKE query). No network.

---

## Flow 4: View Transaction Detail

**Trigger:** Tap a TransactionRow.

**Steps:**
1. TransactionDetailSheet opens.
2. Content:
   - Amount (large, `amountLg`).
   - Type icon + label.
   - Category name + color dot.
   - Wallet name.
   - Date and time.
   - Note (if any).
3. Actions:
   - "Reverse this transaction" (Ghost button, `stateAlert` text).
   - "Log similar" (Ghost button, pre-fills new log sheet).

---

## Flow 5: Reverse a Transaction

**Trigger:** User made a mistake or wants to undo.

**Steps:**
1. TransactionDetailSheet → "Reverse this transaction".
2. Confirmation sheet: "Reverse this R[amount] [type]?"
3. Body: "A reversing entry will be created. Your history will show both transactions."
4. Confirm.
5. Engine creates reversing Transaction (BR-T3, BR-T4).
6. Sheet dismisses. Toast: "Reversed."
7. Safe-to-Spend updates immediately.
8. Both transactions remain visible in history (original + reversal).

**Rules:**
- Original Transaction is never edited or deleted.
- Reversal is a new Transaction with `note: "Reversal of [original_id]"`.
- User can reverse a reversal (double-negative). Engine handles it.

---

## Flow 6: Log Similar Transaction

**Trigger:** User repeats a purchase.

**Steps:**
1. TransactionDetailSheet → "Log similar".
2. TransactionLogSheet opens pre-filled:
   - Same amount.
   - Same Category.
   - Same Wallet.
   - Same type.
   - Date: today.
   - Note: cleared.
3. User edits if needed, taps Save.

---

## Recovery Paths

| If User... | Then... |
|---|---|
| Cancels filter sheet | List unchanged. |
| Applies filter with 0 results | EmptyState: "No transactions match." + "Clear filters" button. |
| Reverses wrong transaction | Reverse the reversal. Both visible in history. |
| Deletes app (Free) | History lost. No recovery. |
| Web user views history | Lagged mirror. Stale banner if applicable. |

---

## What Happens After This Document

Spending is the honest ledger. Next: Screens.md.