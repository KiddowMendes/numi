---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/01_Onboarding/Overview.md"
  - "docs/playbook/05_Features/01_Onboarding/Screens.md"
decision_record: none
---

# 01 — Onboarding: Flow

> The path from first tap to first answer.

---

## Flow Overview

Splash (1.5s) ──► Home Screen ──► [No Wallet] ──► Wallet Setup Sheet ──► [No Period] ──► Period Setup Sheet ──► Home Screen (with Safe-to-Spend)

---

## Step 1: Splash Screen

**Trigger:** App launched for the first time.

**Duration:** 1.5 seconds. No tap to skip.

**Content:**
- Center: NUMI wordmark (text, not image asset).
- Below: "Financial clarity" in `typography.caption`, `color.textMuted`.

**Exit:** Auto-navigates to Home Screen.

**Rules:**
- No animation longer than 1.5s. Budget phones struggle with heavy motion.
- No "Get started" button. The app starts itself.

---

## Step 2: Home Screen (First Launch)

**Trigger:** Splash completes.

**State:** No Wallet, no Period.

**Content:**
- SafeToSpendHero: "--" in `color.textMuted`.
- EmptyState: Icon `Wallet`, "No wallet yet", "Create your first wallet to track your money.", Button "Create wallet" (Primary, lg).
- Below fold (scrollable): 2-sentence Manifesto teaser.

**Primary Action:** Tap "Create wallet".

**Rules:**
- Bottom tab bar is visible but all tabs except Home are disabled (opacity 0.5, no tap).
- No hamburger menu. No settings gear. Nothing to distract.

---

## Step 3: Wallet Setup Sheet

**Trigger:** User taps "Create wallet".

**Presentation:** BottomSheet (mobile) / Modal (web).

**Fields:**
1. Wallet name: TextInput. Pre-filled: "Cash Wallet". User can edit.
2. Wallet type: SegmentedControl or radio row. Options: Cash, Bank, Stokvel, Savings. Default: Cash.
3. Starting balance: AmountInput. Pre-filled: "0". Optional.

**Actions:**
- Primary: "Create wallet" (disabled until name is non-empty).
- Secondary: "Cancel" (dismisses sheet, returns to Home).

**Validation:**
- Name: 1–30 characters.
- Starting balance: >= 0.

**On Success:**
- Sheet dismisses.
- Home screen updates: WalletCard appears.
- If this is the first Wallet, prompt for Period creation (same sheet pattern, auto-open after 300ms).

---

## Step 4: Period Setup Sheet

**Trigger:** Auto-prompt after first Wallet created. Or user taps "Start a period" later.

**Presentation:** BottomSheet (mobile) / Modal (web).

**Fields:**
1. Period name: TextInput. Pre-filled: "My Budget". User can edit.
2. Start date: Date picker. Default: today.
3. End date: Date picker. Default: today + 30 days.
4. Initial assignment (optional): "How much of your R[balance] do you want to assign now?" — AmountInput. Default: 0.

**Actions:**
- Primary: "Start period".
- Secondary: "Skip for now" (dismisses, user can start later).

**Validation:**
- Name: 1–30 characters.
- End date must be after start date.
- Initial assignment cannot exceed Wallet balance.

**On Success:**
- Sheet dismisses.
- Home screen updates:
  - SafeToSpendHero shows calculated Daily Safe-to-Spend.
  - WalletCard shows balance and available.
  - If initial assignment > 0: Category assignment sheet opens next (optional flow).

---

## Step 5: Optional Category Assignment

**Trigger:** User entered initial assignment > 0 in Period Setup.

**Presentation:** BottomSheet.

**Content:**
- "You have R[amount] to assign. Where should it go?"
- List of default Categories (Food, Transport, Airtime, etc.).
- Tap Category → AmountInput → "Assign".
- Repeat until assigned amount equals initial assignment or user taps "Done".

**Actions:**
- Primary: "Done" (enabled once sum of assignments <= initial assignment).
- Ghost: "Skip" (money remains unassigned, fully available).

**Validation:**
- Sum of assignments cannot exceed initial assignment amount.
- Per assignment: > 0.

**On Success:**
- Sheet dismisses.
- Home screen shows Safe-to-Spend with assigned money subtracted.

---

## Step 6: Home Screen (Onboarding Complete)

**Trigger:** Wallet + Period created.

**Content:**
- SafeToSpendHero: Daily Safe-to-Spend (large, `color.stateSafe` if positive).
- WalletCard: "Cash Wallet", balance, available.
- CategoryCards: For each assigned Category, remaining amount.
- FAB: "Log expense".

**State:** User is now in Active Budgeter state.

**Rules:**
- Bottom tab bar enables all tabs.
- Manifesto teaser disappears (never shown again).

---

## Recovery Paths

| If User... | Then... |
|---|---|
| Cancels Wallet setup | Returns to Home. EmptyState still visible. |
| Cancels Period setup | Returns to Home. WalletCard visible. EmptyState prompts "Start a period". |
| Skips Category assignment | Money stays unassigned. Safe-to-Spend equals full balance divided by days. |
| Kills app mid-setup | On relaunch, resume at Home. Partial state is saved (Wallet created, Period not). |

---

## Flow Metrics (Future)

- Time to first Wallet creation.
- Time to first Safe-to-Spend display.
- Drop-off rate per step.

---

## What Happens After This Document

This flow is implemented in `apps/mobile/src/screens/HomeScreen.tsx` and `apps/web/app/page.tsx`. The sheets are shared components.

Next: Screens.md — the detailed screen specifications.