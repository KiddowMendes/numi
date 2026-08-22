---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/03_Daily_Budgeting/Flow.md"
  - "docs/playbook/04_Design_System/02_Components.md"
decision_record: none
---

# 03 — Daily Budgeting: Screens

> The screen the whole app is judged by. It must never make the user wait, hunt, or wonder.

---

## Screen 1: HomeScreen (Active Budgeter State)

**Route:** `/home` (or `/`)

**Purpose:** Answer "Will my money last?" the instant the app opens, and offer the one action that matters most right now: logging a transaction.

**Layout:**
- SafeAreaView.
- ScrollView (content may exceed viewport on small devices with many Wallets/Categories).

**Content Blocks:**

### Block A: SafeToSpendHero
- Occupies ~40% of vertical space, per `04_Design_System/02_Components.md`.
- Label: "Safe to spend today."
- Amount: `typography.amountHero`, color per state precedence (alert → zero → caution → safe).
- Context line: "R[total] total · [n] days left."
- Tap target: navigates to Breakdown view (Screen 4).

### Block B: WalletCard List
- One card per Wallet (Free tier: exactly one).
- Horizontal scroll if Premium and > 3 Wallets.
- Each card: name, balance, "R[x] available."
- Tap: navigates to that Wallet's filtered transaction history (Spending feature).

### Block C: CategoryCard List
- Shown only if the active Period has Assignments.
- Horizontal scroll, one card per assigned Category.
- Each: color dot, name, remaining amount (`color.textPrimary` if ≥ 0, `color.stateAlert` if negative — no shame styling, just the number).
- Tap: opens Quick Category Adjustment sheet (Flow 6).

### Block D: Empty/Prompt States
- No Wallet: EmptyState "NoWallet" variant (see `04_Design_System/02_Components.md`).
- Wallet but no Period: EmptyState "NoPeriod" variant.
- Period but no Transactions yet: EmptyState "NoTransactions" variant, inline in the list area.

**FAB:**
- "Log expense" (Primary action). Tap opens TransactionLogSheet defaulted to Expense.
- Long-press (future, not v1): reveal Income / Transfer shortcuts. In v1, type is switched inside the sheet.

**Bottom Tabs:**
- Home (active), Plan, History, Settings.

---

## Screen 2: TransactionLogSheet

**Route:** Modal over `/home`

**Purpose:** Log an expense, income, or transfer in under 5 seconds, one screen.

**Layout:** BottomSheet (mobile, max 70% height) / Modal (web, max-width 480px).

**Header:**
- Title: "Log expense" / "Log income" / "Transfer" (updates with type toggle).
- Close button: Ghost, `X` icon.

**Body:**

### Type Toggle
- SegmentedControl: Expense | Income | Transfer.
- Default: Expense (or whatever type the entry point implies — e.g. "Log similar" locks the type to match the original).

### Amount
- AmountInput. Auto-focused on open. Numeric keypad.

### Category (Expense only)
- Row of Category chips, most-recently-used first. Tap to select.
- Selected chip highlighted `color.primary`.
- BR-C1: required for Expense. BR-C2: hidden entirely for Income/Transfer.

### Wallet (Expense, Income)
- Single Wallet selector. Defaults to last-used, or the only Wallet on Free tier.

### Wallets (Transfer only)
- Two selectors: "From" and "To." Cannot be the same Wallet (BR-T5).

### Date
- Defaults to today. Tap to open native date picker. Rarely changed — kept low-emphasis.

### Note (optional)
- Single-line TextInput. Collapsed by default behind a "Add note" Ghost link to keep the primary path fast.

**Footer:**
- Primary: "Save" (disabled until amount > 0 and required fields are set; loading state while the engine call resolves — typically instant, since it's local).
- No secondary confirm button. Close (`X`) is the only way to cancel.

**Behavior:**
- On successful save: sheet dismisses, Toast confirms, SafeToSpendHero animates to its new value before the sheet fully closes (I6, R2.3).
- On engine rejection (`INSUFFICIENT_BALANCE`): inline error below AmountInput, `motion.fast` shake, Save stays disabled until corrected.

---

## Screen 3: QuickCategoryAdjustSheet

**Route:** Modal over `/home` or breakdown view

**Purpose:** Nudge one Assignment amount without leaving Daily Budgeting for a full Budget Setup flow.

**Layout:** BottomSheet, auto-height (small — one field).

**Content:**
- Header: "[Category name]"
- Current Assignment amount (read-only, small).
- AmountInput: new amount.
- Helper text: "R[wallet_available] available in [Wallet name]."

**Footer:**
- Primary: "Update."
- Ghost: "Cancel."

**Validation:**
- New amount must be positive (BR-A1).
- Sum of active Assignments + Goal reservations for the Wallet must not exceed the Wallet balance (C10). If it would, inline error: "You only have R[x] available."

---

## Screen 4: Breakdown View (Current / Planned / Actual)

**Route:** `/home/breakdown` or a section revealed by tapping SafeToSpendHero

**Purpose:** Let the user go one level deeper than the headline number, through any of the three lenses.

**Layout:** Full screen or large sheet, SegmentedControl at top.

**Content — Current tab:**
- Global Safe-to-Spend, restated large.
- Per-Wallet available balance list.
- Days remaining in Period.

**Content — Planned tab:**
- Per-Category: assigned amount, spent so far, remaining (C6, C7).
- Sorted by soonest-to-run-out.

**Content — Actual tab:**
- Read-only shortcut into recent Transactions for the active Period (deep link into Spending feature's HistoryScreen, filtered to "this period").

**Rules:**
- This screen never creates or edits data on the Planned or Actual tabs — those actions live in Budget Setup and Spending respectively. Current tab's only interactive element is the Category tap-through described in Screen 3.

---

## Component Mapping

| Screen | Components |
|---|---|
| HomeScreen | SafeToSpendHero, Card (Wallet/Category variants), EmptyState, FAB, BottomTabs |
| TransactionLogSheet | BottomSheet, SegmentedControl, AmountInput, TextInput, Button |
| QuickCategoryAdjustSheet | BottomSheet, AmountInput, Button |
| Breakdown View | SegmentedControl, Card (StatCard variant), ListItem |

---

## What Happens After This Document

These screens are the default landing experience of `apps/mobile` and `apps/web`. Edge cases cover what happens when the fast path breaks — no Wallet, no Period, insufficient balance, and interruption mid-log.

Next: Edge_Cases.md.