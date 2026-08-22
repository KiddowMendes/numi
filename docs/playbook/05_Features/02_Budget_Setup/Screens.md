---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/02_Budget_Setup/Flow.md"
  - "docs/playbook/04_Design_System/02_Components.md"
decision_record: none
---

# 02 — Budget Setup: Screens

> The screens for managing time horizons and plans.

---

## Screen 1: PeriodSetupSheet (Return Visit)

**Route:** Modal over `/home` or `/plan`

**Purpose:** Create a new Period after the first one.

**Layout:** Same as Onboarding PeriodSetupSheet.

**Differences from First Launch:**
- Name pre-filled: "[Month] Budget" or "Budget [number]".
- Date range: Defaults to same duration as previous Period.
- Assignment section visible if previous Period exists.

**Assignment Suggestions Block:**
- Header: "Last time you planned..."
- List of previous Assignments: Category, amount.
- Each row: Toggle to include/exclude.
- Tap amount to edit.
- "Use last plan" button: toggles all on with original amounts.
- "Clear all" button: toggles all off.

**Unspent Money Block:**
- If previous Period had unspent money: "R[amount] unspent from [Period name]."
- Toggle: "Include in this period" (default: on).
- If toggled on: added to Wallet available balance for new Period.

**Footer:**
- Primary: "Start period".
- Ghost: "Cancel".

---

## Screen 2: PeriodEndedBanner (Inline)

**Route:** Inline on HomeScreen

**Purpose:** Notify that Period ended without blocking.

**Layout:**
- Full width, below SafeToSpendHero.
- Background: `color.surfaceRaised`.
- Border left: 3px `color.primary`.
- Padding: `spacing.lg`.

**Content:**
- Headline: "Your [Period name] has ended."
- Body: "R[unspent] unspent. R[overspent] over budget."
- Actions: Primary button "Start new period". Ghost button "Review first" (navigates to Review).

**Behavior:**
- Dismissible with `X` (Ghost, top right).
- Reappears on next app open if no new Period created.
- Does not block transaction logging. User can still log expenses against old Period (engine allows, but warns).

---

## Screen 3: ExtendPeriodSheet

**Route:** Modal over `/plan`

**Purpose:** Push back the end date.

**Fields:**
- Current end date (read-only).
- New end date picker.
- Helper: "Your daily safe-to-spend will change to R[new_daily]."

**Validation:**
- New date > current end_date.

**Footer:**
- Primary: "Extend".
- Ghost: "Cancel".

---

## Screen 4: ClosePeriodSheet

**Route:** Modal over `/plan`

**Purpose:** End a Period before its time.

**Content:**
- Warning icon (`Warning`, `color.stateCaution`).
- Headline: "Close [Period name] early?"
- Body: "R[unspent] will become unassigned. You can start a new period anytime."
- Summary: Days elapsed, total spent, total assigned.

**Footer:**
- Primary: "Close period" (color: `stateAlert` text, Ghost styling).
- Ghost: "Keep period open".

---

## Screen 5: PlanScreen (Period Management)

**Route:** `/plan`

**Purpose:** View and manage the current Period.

**Content Blocks:**

### Block A: Period Card
- Period name, dates, days remaining.
- Progress bar: elapsed / total days.
- Menu (three dots): Extend, Close early, Rename.

### Block B: Assignment List
- Same as Daily Budgeting PlanScreen.
- Plus: "Add assignment" button.

### Block C: Unassigned Money
- If Wallet balance > sum(assignments): "R[amount] not yet assigned."
- Tap: Quick-assign sheet.

---

## Component Mapping

| Screen | Components |
|---|---|
| PeriodSetupSheet | BottomSheet, TextInput, Date picker, AmountInput, Button, ListItem (assignment row) |
| PeriodEndedBanner | Card (custom), Button |
| ExtendPeriodSheet | BottomSheet, Date picker, Button |
| ClosePeriodSheet | BottomSheet, Button, Text |
| PlanScreen | Card, ListItem, Button, Progress bar |

---

## What Happens After This Document

Edge cases cover overlapping income, zero-day periods, and data migration between Periods.

Next: Edge_Cases.md.