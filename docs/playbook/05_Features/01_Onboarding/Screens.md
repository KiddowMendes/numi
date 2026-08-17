---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/01_Onboarding/Flow.md"
  - "docs/playbook/04_Design_System/02_Components.md"
decision_record: none
---

# 01 — Onboarding: Screens

> Every screen in onboarding: what it shows, why it exists, and how to leave it.

---

## Screen 1: SplashScreen

**Route:** `/` (initial)

**Purpose:** Brand recognition. Loading time cover.

**Layout:**
- Flexbox center.
- Background: `color.background`.

**Content:**
- `typography.heading1`, `color.textPrimary`: "NUMI"
- `typography.caption`, `color.textMuted`: "Financial clarity"

**Navigation:**
- Auto-push to HomeScreen after 1500ms.
- No back button. No gestures.

**Accessibility:**
- Screen reader: "NUMI. Loading."

---

## Screen 2: HomeScreen (First Launch)

**Route:** `/home`

**Purpose:** The starting point. Shows the user what is missing and what to do.

**Layout:**
- SafeAreaView.
- ScrollView.
- Padding: `spacing.lg`.

**Content Blocks:**

### Block A: SafeToSpendHero
- Amount: "--"
- Label: "Safe to spend today"
- Context: "Create a wallet to get started"
- Color: `color.textMuted` (null state styling)

### Block B: EmptyState
- Icon: `Wallet` (`icon.lg`, `color.textMuted`)
- Headline: "No wallet yet"
- Body: "Create your first wallet to track your money."
- Action: Button Primary lg "Create wallet"

### Block C: Manifesto Teaser (below fold)
- `typography.body`, `color.textSecondary`
- "NUMI makes your money visible. No account, no internet needed."
- Disappears after first Transaction is logged.

**Navigation:**
- Bottom tabs visible. Home active. Others disabled.
- No header.

**Entry Points:**
- SplashScreen auto-navigation.
- App relaunch after kill.

**Exit Points:**
- Tap "Create wallet" → WalletSetupSheet opens.

---

## Screen 3: WalletSetupSheet

**Route:** Modal over `/home`

**Purpose:** Create the first (or subsequent) Wallet.

**Layout:**
- BottomSheet (mobile): 50% height, expandable to 70%.
- Modal (web): Centered, max-width 480px.

**Content Blocks:**

### Header
- Title: `typography.heading2` "Create wallet"
- Close button: Ghost, `X` icon.

### Body (scrollable)
1. **Wallet name**
   - Label: "Name"
   - TextInput, pre-filled "Cash Wallet"
   - `autoFocus: true`
   - `returnKeyType: "next"`

2. **Wallet type**
   - Label: "Type"
   - SegmentedControl: Cash | Bank | Stokvel | Savings
   - Default: Cash

3. **Starting balance**
   - Label: "Starting balance (optional)"
   - AmountInput, pre-filled "0"
   - Helper text: "How much is in this wallet right now?"

### Footer
- Primary Button lg: "Create wallet" (disabled if name empty)
- Ghost Button: "Cancel"

**Navigation:**
- Entry: Tap "Create wallet" on HomeScreen.
- Success: Dismiss → auto-open PeriodSetupSheet (if first Wallet).
- Cancel: Dismiss → HomeScreen.

---

## Screen 4: PeriodSetupSheet

**Route:** Modal over `/home`

**Purpose:** Define the time horizon for the money.

**Layout:** Same as WalletSetupSheet.

**Content Blocks:**

### Header
- Title: "Start a period"

### Body
1. **Period name**
   - Label: "Name"
   - TextInput, pre-filled "My Budget"

2. **Start date**
   - Label: "Start date"
   - Date picker, default today

3. **End date**
   - Label: "End date"
   - Date picker, default today + 30 days
   - Helper: "How long must this money last?"

4. **Initial assignment (optional)**
   - Label: "Assign money now?"
   - AmountInput, pre-filled "0"
   - Helper: "You have R[wallet_balance] available."

### Footer
- Primary: "Start period"
- Ghost: "Skip for now"

**Navigation:**
- Entry: Auto-open after first Wallet, or tap "Start a period" later.
- Success: Dismiss → optional CategoryAssignmentSheet.
- Skip: Dismiss → HomeScreen with Wallet but no Period.

---

## Screen 5: CategoryAssignmentSheet

**Route:** Modal over `/home`

**Purpose:** Give the initial money a job.

**Layout:** BottomSheet, 70% height.

**Content Blocks:**

### Header
- Title: "Assign your money"
- Subtitle: "R[remaining] left to assign"

### Body
- List of default Categories (Food, Transport, Airtime, Rent, etc.).
- Each row: Category icon + name + AmountInput inline.
- Running total at bottom: "Assigned: R[X] of R[total]"

### Footer
- Primary: "Done" (enabled when assigned <= total)
- Ghost: "Skip"

**Navigation:**
- Entry: After PeriodSetup if initial assignment > 0.
- Success: Dismiss → HomeScreen with Safe-to-Spend.
- Skip: Dismiss → HomeScreen with unassigned money.

---

## Screen 6: HomeScreen (Onboarding Complete)

**Route:** `/home`

**Purpose:** The normal operating screen. Same route as Screen 2, different state.

**Layout:** Same as Screen 2.

**Content Blocks:**

### Block A: SafeToSpendHero
- Amount: Daily Safe-to-Spend (calculated).
- Label: "Safe to spend today"
- Context: "R[global_safe] total · [days] days left"
- Color: `color.stateSafe` (or Caution/Alert based on value).

### Block B: WalletCard
- Name, balance, available.
- Tap to view Wallet detail.

### Block C: CategoryCard List
- Horizontal scroll if > 3 categories.
- Each: Color dot, name, remaining amount.

### Block D: FAB
- "Log expense" (Primary, `Plus` icon).

**Navigation:**
- Bottom tabs fully enabled.
- FAB → TransactionLogSheet.

---

## Component Mapping

| Screen | Components Used |
|---|---|
| SplashScreen | Text only |
| HomeScreen (First Launch) | SafeToSpendHero, EmptyState, Button |
| WalletSetupSheet | BottomSheet, TextInput, SegmentedControl, AmountInput, Button |
| PeriodSetupSheet | BottomSheet, TextInput, Date picker, AmountInput, Button |
| CategoryAssignmentSheet | BottomSheet, ListItem (custom), AmountInput, Button |
| HomeScreen (Complete) | SafeToSpendHero, Card, FAB, SegmentedControl (in header) |

---

## What Happens After This Document

These screens are wired together in the app router. Edge cases define what happens when things go wrong.

Next: Edge_Cases.md.