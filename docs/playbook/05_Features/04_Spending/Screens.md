---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/04_Spending/Flow.md"
  - "docs/playbook/04_Design_System/02_Components.md"
decision_record: none
---

# 04 — Spending: Screens

> The history view. Neutral, honest, complete.

---

## Screen 1: HistoryScreen

**Route:** `/history`

**Purpose:** Browse all transactions.

**Layout:**
- SafeAreaView.
- ScrollView with section headers.

**Header:**
- Title: "History" (`typography.heading1`).
- Right: Filter icon (`Funnel`, `icon.sm`, Ghost).
- Premium: Search icon (`MagnifyingGlass`, `icon.sm`, Ghost).

**Content Blocks:**

### Block A: Active Filters (if any)
- Horizontal scroll of filter chips.
- Each chip: label + `X` to remove.
- "Clear all" chip at end.

### Block B: Date Grouped List
- Section header: date label (`typography.label`, `color.textMuted`).
- Groups: "Today", "Yesterday", "Monday", "Earlier this month", "[Month]".
- Each row: TransactionRow (ListItem component).

### Block C: Empty State
- If no transactions at all: "No transactions yet. Log your first spend to see your money clearly."
- If filters active but no results: "No transactions match. Clear filters?"

**Bottom Tabs:**
- Home, Plan, History (active), Settings.

---

## Screen 2: FilterSheet

**Route:** Modal over `/history`

**Purpose:** Narrow the history view.

**Layout:** BottomSheet, 70% height.

**Header:**
- Title: "Filter"
- "Clear all" Ghost button (right).

**Body:**

### Section: Wallet
- Radio list of all Wallets.
- "All Wallets" option at top.

### Section: Category
- Radio list (Free/Freemium) or multi-check (Premium).
- "All Categories" option.

### Section: Type
- SegmentedControl: All | Income | Expense | Transfer.

### Section: Date Range
- Radio list: Today | This week | This period | All time.

**Footer:**
- Primary: "Apply".
- Ghost: "Cancel".

---

## Screen 3: TransactionDetailSheet

**Route:** Modal over `/history`

**Purpose:** See everything about one transaction.

**Layout:** BottomSheet, auto-height.

**Content:**

### Header
- Amount: `amountHero`, color by type:
  - Income: `color.income`.
  - Expense: `color.expense`.
  - Transfer: `color.transfer`.
- Type label: `typography.caption`, `color.textMuted`.

### Details
- Category: Icon + name, `color.textPrimary`.
- Wallet: Name, `color.textSecondary`.
- Date: Full date + time, `color.textMuted`.
- Note: `typography.body`, `color.textSecondary`. If empty: "No note."

### Metadata (collapsible, v2)
- Transaction ID (truncated).
- Reversal reference (if applicable): "Reverses [original_id]".

**Actions:**
- "Reverse this transaction" (Ghost, `color.stateAlert` text).
- "Log similar" (Ghost, `color.primary` text).

---

## Screen 4: SearchOverlay (Premium)

**Route:** Overlays `/history`

**Purpose:** Find transactions by note.

**Layout:**
- Header becomes search field.
- Results replace list below.

**Content:**
- TextInput with `autoFocus`, clear button.
- Debounced search.
- Results grouped by date (same as HistoryScreen).
- Highlight matching text in note.

**Empty:**
- "No results for '[query]'."
- "Try a different word or clear filters."

---

## Component Mapping

| Screen | Components |
|---|---|
| HistoryScreen | ListItem, EmptyState, Button (chip), BottomTabs |
| FilterSheet | BottomSheet, Radio, SegmentedControl, Button |
| TransactionDetailSheet | BottomSheet, Text, Button |
| SearchOverlay | TextInput, ListItem, EmptyState |

---

## What Happens After This Document

Edge cases cover large histories, reversal chains, and filter persistence.

Next: Edge_Cases.md.