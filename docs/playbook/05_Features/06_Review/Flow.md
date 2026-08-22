---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/06_Review/Overview.md"
  - "docs/playbook/05_Features/06_Review/Screens.md"
decision_record: none
---

# 06 — Review: Flow

> The honest post-mortem. No grades, just facts.

---

## Flow 1: Automatic Prompt at Period End

**Trigger:** `today > active_period.end_date`, user opens app.

**Steps:**
1. HomeScreen shows PeriodEndedBanner.
2. Banner: "Your [Period name] has ended. Review or start fresh?"
3. User taps "Review" → ReviewScreen.
4. Or taps "Start new period" → Budget Setup flow (skip review).

---

## Flow 2: Review a Closed Period

**Trigger:** User taps "Review" from banner, or navigates to History → selects a closed Period.

**Steps:**
1. ReviewScreen opens.
2. Top: Period summary card.
   - Name, dates, duration.
   - Total income, total spent, unspent/overspent.
   - Unspent shown as "R[amount] left over" (never "underspent").
3. Middle: Category-by-category breakdown.
   - Each row: Category name, Planned, Actual, Difference.
   - Difference: absolute value, neutral color.
   - No arrows, no up/down moral indicators.
4. Bottom: Suggested next Period.
   - "Start [Month] Budget with these amounts?"
   - Pre-filled Assignments based on Actuals.
   - User can adjust before creating.
5. Actions:
   - Primary: "Start new period" (goes to Budget Setup with suggestions).
   - Ghost: "Close" (returns to HomeScreen).

---

## Flow 3: Review from History

**Trigger:** User in HistoryScreen, taps a closed Period header.

**Steps:**
1. ReviewScreen opens for that specific Period.
2. Same content as Flow 2.
3. "Start new period" button hidden (Period is old, not just ended).
4. Action: "Close" only.

---

## Flow 4: Skip Review

**Trigger:** User dismisses PeriodEndedBanner without reviewing.

**Behavior:**
- Banner does not reappear for that Period.
- Review remains accessible via History → Period header.
- No nagging. User agency.

---

## Flow 5: Extend Closed Period

**Trigger:** Period ended before income arrived. User is not ready to start a new Period.

**Steps:**
1. ReviewScreen → "Extend this period" (secondary action on the summary card).
2. Sheet: new end date picker. Must be after the original end_date.
3. Confirm. Period reopens with its Assignments re-committed at their remaining amounts.
4. State change only — no Transactions. Safe-to-Spend recalculates.

---

## Tone Rules

| Do | Don't |
|---|---|
| "You planned R2,000 for Food. You spent R2,300." | "You overspent Food by R300." |
| "R500 left over." | "You failed to spend R500." |
| "Next time, consider R2,500 for Food." | "You need to cut Food spending." |
| "Start a new period when you're ready." | "Fix your budget now." |

---

## Recovery Paths

| If User... | Then... |
|---|---|
| Reviews, then kills app | ReviewScreen state not saved. Re-open via History. |
| Starts new Period mid-review | ReviewScreen dismissed. New Period created. |
| Has 0 transactions in Period | Review shows: "No transactions logged this period." Suggestion: start fresh. |

---

## What Happens After This Document

ReviewScreen is the final screen in the v1 feature set. Next: Screens.md.