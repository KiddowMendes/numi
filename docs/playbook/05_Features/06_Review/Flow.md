---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/06_Review/Overview.md"
  - "docs/playbook/05_Features/06_Review/Screens.md"
  - "docs/playbook/02_Product_Mechanics/03_Behavioral_Loops.md"
decision_record: none
---

# 06 — Review: Flow

> What happened? Did my money last? What should I do differently next time?

---

## Flow 1: Period Ended — Summary

**Trigger:** Today > active Period end_date. User opens app.

**Steps:**
1. HomeScreen shows Period Ended state.
2. User opens Review. The summary loads first, showing:
   - Income received in the Period.
   - Spent (sum of expense Transactions in the Period's date range).
   - Unspent (sum of positive Assignment remainders).
   - Overspent (sum of negative Assignment remainders, shown only if > 0).
3. Numbers only, plain language: "You planned R[planned]. You spent R[spent]. R[unspent] is still yours." No score. No "well done" or "you failed."
4. Unspent stated as a good thing: money that survived, not money that was wasted.
5. Two actions: "Start a new period" (primary) and "See categories" (secondary).

---

## Flow 2: Planned vs Actual

**Trigger:** User taps "See categories" from the summary.

**Steps:**
1. Table lists every Assignment from the closed Period.
2. Columns: Category, Planned, Actual (assignment_spent), Remaining (assignment_remaining).
3. Rows sorted by Remaining ascending, so overspent Categories surface first.
4. Negative Remaining renders as a plain negative number. No red, no warning color.
5. Tap a row to see the individual expenses that made up that Category's Actual.

---

## Flow 3: Adjustment Suggestions

**Trigger:** User taps "Start a new period" from the summary, or creates a Period in Budget Setup.

**Steps:**
1. Suggested Assignments pre-fill from the closed Period's Actual amounts, rounded up to a convenient number.
2. Neutral, factual phrasing: "You planned R2,000 for Food. You spent R2,300. Next time, consider R2,500."
3. Suggestions are suggestions, not defaults — editable before saving.
4. Categories that no longer exist (deleted since close) are skipped.
5. User can adjust, accept, or clear all (Start Fresh path from Budget Setup).

---

## Flow 4: Unspent Money Resolution

**Trigger:** Summary shows unspent > 0.

**Steps:**
1. Under the summary: "R[amount] unspent. Include it in the next period?"
2. Tap → unspent is carried into the new Period as unassigned money in the Wallet.
3. Dismiss → unspent stays unassigned. Either way the money stays theirs; the choice is explicit, not assumed.

---

## Flow 5: Start Next Period

**Trigger:** User taps "Start a new period".

**Steps:**
1. Review hands off to the Budget Setup create flow (PeriodSetupSheet).
2. Name pre-filled with date pattern. Start = today. End = today + 30 days (or same duration as the closed Period).
3. Assignments pre-filled from Flow 3 suggestions.
4. Save. New Period active. Safe-to-Spend recalculates.
5. Review closes. HomeScreen returns to the Current lens.

---

## Flow 6: Extend Closed Period

**Trigger:** Period ended but income arrived late. User is not ready for a new Period.

**Steps:**
1. From the summary: "Extend this period" (secondary action).
2. Sheet: new end date picker. Must be after the original end_date.
3. Confirm. Period reopens with its original Assignments, re-committed at their remaining amounts.
4. State change only — no Transactions. Conservation of money holds (C15): only what is still in the Wallet gets re-committed.
5. Safe-to-Spend recalculates.

---

## Recovery Paths

| If User... | Then... |
|---|---|
| Ignores Review | Nothing. Period stays closed. History preserved. Prompt remains on HomeScreen. |
| Had zero Transactions in the Period | Summary shows zeros. No celebration, no punishment. New Period still offered. |
| Overspent the Period | Overspent shown as a plain negative number. Suggestions adjust down. No warning state. |
| Has unspent money | Treated as a win, re-allocable in one tap. Never framed as "leftover" or wasted. |
| Closes Review without acting | Returns to HomeScreen Period Ended state. Nothing is auto-created. |
| Reviews an archived Period (Freemium web) | Same summary and Planned vs Actual. No suggestions, no exit ramp. Read-only. |
| Extends a Period with no money left | Valid. Period reopens with assignments of R0 where nothing remains. Daily Safe-to-Spend may be 0. |

---

## What Happens After This Document

Review closes the learning loop: it turns reality into the next plan. If either exit ramp breaks, the loop dead-ends and the user stops budgeting.

Next: Screens.md.