---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/03_Daily_Budgeting/Overview.md"
  - "docs/playbook/05_Features/03_Daily_Budgeting/Screens.md"
  - "docs/playbook/01_Domain/04_Engine_API.md"
decision_record: none
---

# 03 — Daily Budgeting: Flow

> The loop the whole app exists to serve. Open, glance, log, done.

---

## Flow 1: Open App and See Safe-to-Spend

**Trigger:** App opened (cold start, resume from background, or relaunch).

**Steps:**
1. App shell renders immediately (header + SafeToSpendHero skeleton). No blocking spinner.
2. In-memory `AppState` is read from local DB (already loaded on prior launch, or loaded now on cold start).
3. `Engine.getDailySafeToSpend()` runs against current state.
4. SafeToSpendHero displays the result:
   - No Period: "--", label "No active budget period."
   - Zero: "R0", neutral styling.
   - Positive above Caution threshold: `color.stateSafe`.
   - Positive below Caution threshold: `color.stateCaution`.
   - Negative: `color.stateAlert`.
5. Context line renders: "R[global_safe] total · [days] days left."

**Rules:**
- This must complete within two taps of app open (R2.1). In practice: zero taps — it's the first thing rendered.
- No network call sits between app open and this number (I1, R2.1).

---

## Flow 2: Log an Expense (The 5-Second Path)

**Trigger:** User taps FAB "Log expense" from HomeScreen, or "Log similar" from a past transaction.

**Steps:**
1. TransactionLogSheet opens (BottomSheet, mobile / Modal, web).
2. AmountInput is auto-focused. Numeric keypad appears immediately.
3. Category defaults to the last-used Category. Wallet defaults to the last-used Wallet (or the only Wallet, on Free tier).
4. Date defaults to today.
5. User types amount, optionally taps a different Category or Wallet chip, optionally adds a note.
6. User taps "Save."
7. `Engine.logExpense()` runs. On success:
   - New `AppState` replaces the in-memory state immediately.
   - Sheet dismisses.
   - Toast: "R[amount] logged."
   - SafeToSpendHero updates its number with a `motion.default` count-down animation, before the sheet has fully closed.
8. Local DB write happens async in the background (I6). The user never waits for it.

**Rules:**
- One screen. No confirmation dialog (R1.3, R2.2).
- If the expense would push Safe-to-Spend negative, the engine still allows it (I2). The UI shows the new negative number plainly — no warning modal, no block.
- The 5-second rule: amount → category (default, tap to change) → save. Nothing else is required.

---

## Flow 3: Log Income

**Trigger:** User taps FAB, switches segmented control (or type toggle) to "Income" within TransactionLogSheet.

**Steps:**
1. Same sheet as Flow 2, but no Category field (BR-C2 — income has zero Categories).
2. Wallet selector shows destination Wallet.
3. User enters amount, taps "Save."
4. `Engine.logIncome()` runs. Wallet balance increases immediately.
5. SafeToSpendHero updates (available balance rose; safe-to-spend rises unless it was already fully assigned).
6. Toast offers a soft, dismissible nudge: "Start a new period?" (Behavioral Loop 2) — never blocking.

---

## Flow 4: Log a Transfer

**Trigger:** User switches TransactionLogSheet type toggle to "Transfer."

**Steps:**
1. Two Wallet selectors appear: source and destination. No Category field.
2. User enters amount, taps "Save."
3. `Engine.transfer()` validates: source ≠ destination (BR-T5), source has sufficient *available* balance, not just raw balance (C11).
4. On success: both Wallet balances update atomically. Both Wallet histories show the transaction (I12).
5. SafeToSpendHero is unaffected in total (money moved, didn't leave the system) but per-Wallet breakdowns update.

**Rules:**
- If source and destination are the same Wallet, the Save button stays disabled with inline error "Choose two different wallets" (BR-T5, C11).

---

## Flow 5: Check the Breakdown

**Trigger:** User taps the SafeToSpendHero.

**Steps:**
1. Navigates to Current-lens breakdown view (SegmentedControl defaults to "Current").
2. Shows: global Safe-to-Spend, per-Wallet available balance, days remaining, per-Category remaining (from active Assignments).
3. User can switch SegmentedControl to "Planned" or "Actual" to see the same money through a different lens (R7.1–R7.5).

**Rules:**
- This is a read-only view. Editing Assignments happens in Budget Setup, not here (Daily Budgeting's scope per Overview.md).

---

## Flow 6: Quick Category Adjustment (Inline)

**Trigger:** User taps a CategoryCard remaining-amount on HomeScreen or in the breakdown view.

**Steps:**
1. Small inline sheet: current Assignment amount, AmountInput to adjust.
2. This calls the same Assignment-editing engine path used by Budget Setup, but surfaced here for speed — it does not require a full re-plan.
3. Save updates the Assignment. SafeToSpendHero recalculates.

**Rules:**
- This is the one exception where Daily Budgeting touches Assignments directly (per Overview.md's "Partial" Planned-lens support). Creating new Assignments or editing more than one at a time still belongs to Budget Setup.

---

## Recovery Paths

| If User... | Then... |
|---|---|
| Cancels TransactionLogSheet | No Transaction created. HomeScreen unchanged. |
| Saves with amount = 0 | Save button stays disabled. AmountInput requires > 0 (BR-T1, BR-A1 pattern). |
| Saves an expense with insufficient available balance | Engine rejects (`INSUFFICIENT_BALANCE`, C12 for v1: hard reject, no overdraft). Inline error, input shake, Save stays disabled until corrected. |
| Loses connectivity mid-log | No effect — logging never touches the network (R4.4, I7). |
| Kills the app mid-sheet | Transaction was never saved (only committed on "Save" tap). On relaunch, HomeScreen shows the state from the last completed save. |
| Taps "Log similar" from History | TransactionLogSheet opens pre-filled (same amount, Category, Wallet, type; date reset to today; note cleared). User edits and saves as a new Transaction. |
| Has no active Period | FAB still works — Transactions can be logged with no Period (BR-A4 only governs Assignments). SafeToSpendHero still reads "--" until a Period exists (C4, C5). |

---

## What Happens After This Document

This flow is implemented in the mobile app's `TransactionLogSheet` and shared across `apps/mobile` and `apps/web`. Every step above maps to a function in `01_Domain/04_Engine_API.md`.

Next: Screens.md — the detailed screen specifications.