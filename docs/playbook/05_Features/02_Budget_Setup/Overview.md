---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/01_Onboarding/Overview.md"
  - "docs/playbook/05_Features/03_Daily_Budgeting/Overview.md"
  - "docs/playbook/01_Domain/01_Entities.md"
decision_record: none
---

# 02 — Budget Setup: Overview

> Creating and managing the time horizon for your money. Not just the first time — every time.

---

## User Problem

"I got paid again. My old period ended. I need to tell NUMI how long this new money must last — and how I want to divide it."

---

## What Budget Setup Does

1. Creates a new Period when income arrives or the old Period ends.
2. Suggests Assignments based on what actually happened last time.
3. Lets the user copy, adjust, or start fresh.
4. Closes old Periods cleanly — money unassigned, history preserved.

---

## Lens Mapping

| Lens | Served? | How |
|---|---|---|
| **Current** | Partial | New Period resets Safe-to-Spend calculation. |
| **Planned** | Yes | Assignments are the budget. This is where they are created. |
| **Actual** | No | Historical Actual informs suggestions, but this screen is forward-looking. |

---

## Success Criteria

- User can create a new Period in under 30 seconds.
- Previous Period's Assignments are available as suggestions, not defaults.
- Unspent money from previous Period is visible and easy to re-allocate.
- Closing a Period is explicit, not automatic.

---

## Tier Behavior

| Tier | Budget Setup Difference |
|---|---|
| **Free** | Unlimited Periods. 1 Wallet. |
| **Freemium** | Same. Web view of archived Periods. |
| **Premium** | Same. Period templates (save a plan as reusable). |

---

## Out of Scope

- Recurring/auto-generated Periods (salary assumption).
- AI-suggested budgets based on "typical" spending.
- Shared budgets / family planning.
- Income prediction or forecasting.

---

## What Happens After This Document

Budget Setup is the bridge between Periods. It happens when money arrives or when the user chooses to start fresh.

Next: Flow.md.