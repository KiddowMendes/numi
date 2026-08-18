---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/02_Budget_Setup/Overview.md"
  - "docs/playbook/05_Features/02_Budget_Setup/Screens.md"
decision_record: none
---

# 02 — Budget Setup: Flow

> From "my money ran out" to "my money has a plan" — again.

---

## Flow 1: New Period After Old One Ends

**Trigger:** Today > active Period end_date. User opens app.

**Steps:**
1. HomeScreen shows Period Ended state.
2. Banner: "Your [Period name] ended. Start a new period?"
3. User taps "Start new period".
4. PeriodSetupSheet opens.
5. Name: Pre-filled with date pattern ("September Budget").
6. Dates: Start = today. End = today + 30 days (or same duration as last Period).
7. Suggested assignments: Previous Period's Categories with same amounts.
8. User adjusts, accepts, or clears all.
9. Unspent money from previous Period is shown: "R[amount] unspent. Include it?"
10. Save. New Period active. Safe-to-Spend recalculates.

---

## Flow 2: New Period While Old One Active

**Trigger:** User receives unexpected income mid-Period.

**Steps:**
1. User logs income (Daily Budgeting flow).
2. Toast offers: "Start a new period?" (dismissible, not blocking).
3. If user taps:
   - Confirm sheet: "Close '[Old Period]' and start new? Unspent money will be available in the new period."
   - Old Period closed. New Period created.
   - Unspent money from old Period becomes unassigned in Wallet.
4. If user ignores: Income is added to current Period. Safe-to-Spend increases.

---

## Flow 3: Extend Current Period

**Trigger:** User realizes they need more time (late income, miscalculation).

**Steps:**
1. PlanScreen → Period card → "Extend period".
2. Sheet: New end date picker.
3. Validation: Must be after current end_date.
4. Save. Period extended. Daily Safe-to-Spend recalculates (decreases if no new income).

---

## Flow 4: Copy Previous Plan

**Trigger:** User wants the same Assignments as last time.

**Steps:**
1. During Period creation, sheet shows "Use last plan" button.
2. Tapping pre-fills all Assignments from previous Period.
3. User can edit individual amounts before saving.
4. Categories that don't exist anymore (deleted) are skipped.

---

## Flow 5: Start Fresh

**Trigger:** User wants a blank slate.

**Steps:**
1. During Period creation, "Clear all" button.
2. All suggested Assignments removed.
3. User creates Assignments one by one.
4. Or skips entirely — all money remains unassigned.

---

## Flow 6: Close Period Early

**Trigger:** User wants to end a Period before the end_date.

**Steps:**
1. PlanScreen → Period card → "Close period".
2. Confirmation sheet: "Close '[Name]' early? R[unspent] will become unassigned."
3. Confirm.
4. Period closed. HomeScreen shows Period Ended state.
5. Prompt to start new Period.

---

## Recovery Paths

| If User... | Then... |
|---|---|
| Cancels Period creation | Returns to previous state. Old Period remains active (if not ended). |
| Creates Period with 0 assignments | Valid. All money unassigned. Safe-to-Spend = full balance / days. |
| Extends Period but no money left | Valid. Daily Safe-to-Spend may be 0 or negative. |
| Closes Period with negative balance | Valid. Over-commitment is preserved in history. New Period starts fresh. |

---

## What Happens After This Document

Budget Setup is the administrative layer of the core loop. It must be fast, or users will abandon the app when money arrives.

Next: Screens.md.