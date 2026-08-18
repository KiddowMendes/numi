---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/02_Budget_Setup/Flow.md"
  - "docs/playbook/05_Features/02_Budget_Setup/Screens.md"
decision_record: none
---

# 02 — Budget Setup: Edge Cases

> Periods are the spine of NUMI. When they break, the app breaks.

---

## EC1. User Creates Period with End Date in the Past

**Trigger:** Date picker allows past dates, or user types wrong year.

**Behavior:**
- Validation: end_date must be > start_date AND >= today.
- Inline error: "End date must be today or later."
- If somehow bypassed: Engine rejects with `INVALID_STATE`.

---

## EC2. User Creates 1-Day Period

**Trigger:** Start and end date are same day.

**Behavior:**
- Validation: Minimum 1 day period. End date must be > start date.
- Inline error: "A period must be at least 1 day."

---

## EC3. Previous Period Had Negative Unspent

**Trigger:** User overspent. Unspent is negative.

**Behavior:**
- PeriodEndedBanner shows: "R[abs(amount)] over budget."
- No "unspent" toggle. The deficit is just history.
- New Period starts with current Wallet balance (which is already lower).

---

## EC4. User Deletes All Assignments Mid-Period

**Trigger:** User removes every Assignment.

**Behavior:**
- Valid. All money becomes unassigned.
- Safe-to-Spend = full Wallet balance / days remaining.
- No warning. This is user agency.

---

## EC5. User Renames Active Period

**Trigger:** PlanScreen → Rename.

**Behavior:**
- Allowed anytime.
- No impact on calculations.
- Historical references update (Period name is display only).

---

## EC6. User Creates Period with No Wallet

**Trigger:** Somehow no Wallet exists.

**Behavior:**
- Impossible in normal flow. Engine requires at least one Wallet.
- If triggered: Redirect to Wallet setup first.

---

## EC7. App Killed During Period Creation

**Trigger:** User taps "Start period", app killed before DB write.

**Behavior:**
- Same as Onboarding EC7. Period not created.
- On relaunch: Old Period still active (or Period Ended state if it had ended).

---

## EC8. Multiple Periods Created Rapidly

**Trigger:** User spams "Start period".

**Behavior:**
- Engine enforces BR-P1: only one active Period.
- Second creation closes the first automatically.
- Toast: "Previous period closed. New period started."

---

## EC9. User Extends Period by 365 Days

**Trigger:** User sets end date far in future.

**Behavior:**
- Allowed. No maximum period length.
- Daily Safe-to-Spend becomes very small.
- UI shows warning if daily < R1: "Your daily budget is less than R1."

---

## EC10. Freemium User on Web Creates Period

**Trigger:** Web app, stale data, user tries to create Period.

**Behavior:**
- Web is read-only when stale.
- If fully synced: Web can create Period, queued for device ack.
- Device must sync to confirm.

---

## Summary Table

| Case | Engine | UI |
|---|---|---|
| Past end date | Reject | Inline error |
| 1-day period | Reject | Inline error |
| Negative unspent | Allow | Show overspent |
| Zero assignments | Allow | Safe-to-spend = full |
| Rename | Allow | Immediate |
| No wallet | Reject | Redirect |
| Kill mid-create | Lose | Resume old state |
| Rapid create | Auto-close old | Toast |
| 365-day extend | Allow | Warning if daily < R1 |
| Web create (stale) | Queue/reject | Stale banner |

---

## What Happens After This Document

Budget Setup completes the administrative side of the core loop. Next: Spending — the transaction history and management layer.

Next: docs/playbook/05_Features/04_Spending/Overview.md