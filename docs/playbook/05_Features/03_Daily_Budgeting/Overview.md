---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/02_Product_Mechanics/03_Behavioral_Loops.md"
  - "docs/playbook/01_Domain/04_Engine_API.md"
  - "docs/playbook/05_Features/02_Budget_Setup/Overview.md"
  - "docs/playbook/05_Features/04_Spending/Overview.md"
decision_record: none
---

# 03 — Daily Budgeting: Overview

> Can I afford this? Log it in five seconds. The number updates before you leave the screen.

---

## User Problem

"I'm standing at the till, or I've just paid for something. I need to know — right now, not at month end — whether I can still afford the rest of the week. And if I just spent money, I need to record it before I forget, without it feeling like paperwork."

---

## What Daily Budgeting Does

1. Shows the Daily Safe-to-Spend number the instant the app opens — no navigation, no loading state blocking it.
2. Lets the user log an expense, income, or transfer in a single screen, under five seconds.
3. Recalculates Safe-to-Spend in real time the moment a Transaction is logged — before the user leaves the screen.
4. Shows per-Category and per-Wallet breakdowns on request, without demanding them up front.
5. Never blocks a transaction from being logged, even if it pushes Safe-to-Spend negative. It shows the consequence; it does not enforce a decision.

---

## Lens Mapping

| Lens | Served? | How |
|---|---|---|
| **Current** | Yes | This is Current's home. SafeToSpendHero is the default view when the app opens. |
| **Planned** | Partial | Assignment remaining is visible per Category, but creating/editing plans belongs to Budget Setup. |
| **Actual** | Partial | Logging a Transaction creates the Actual record, but reviewing history belongs to Spending. |

---

## Success Criteria

- Daily Safe-to-Spend is visible within **two taps** of app open (Principle R2.1).
- Logging a transaction completes on **one screen**, in under 5 seconds, with no confirmation dialog (R2.2, R1.3, Loop 3's "5-second rule").
- Safe-to-Spend updates in real time — the number changes before the user leaves the logging screen (R2.3).
- Works fully offline. No network call sits between "tap Save" and "see updated number."
- Negative Safe-to-Spend displays with the same typographic confidence as positive — no shame styling (R4.3, I2).

---

## Tier Behavior

| Tier | Daily Budgeting Difference |
|---|---|
| **Free** | Full logging and Safe-to-Spend, unlimited transactions and categories, 1 Wallet. |
| **Freemium** | Same. Web view is lagged and read-only when stale (see `03_Architecture/02_System_Design.md`). |
| **Premium** | Real-time sync means the number is current across devices without a manual refresh. Optional daily reminder notification (see Behavioral Loops, Loop 4). |

---

## Core Metrics

- Time from app open to Safe-to-Spend visible.
- Time to complete a transaction log (target: under 5 seconds).
- Frequency of app opens per day (a proxy for whether the "pulse check" habit is forming).
- Percentage of logged transactions that use the last-used Category default (indicates whether defaults are actually saving time).

---

## Out of Scope

- Creating or editing Periods (belongs to `02_Budget_Setup`).
- Creating or editing Assignments beyond quick inline adjustment (belongs to `02_Budget_Setup`).
- Browsing full transaction history, filtering, or search (belongs to `04_Spending`).
- Reversing a transaction (belongs to `04_Spending`).
- Charts, trends, or spending insights (v2 / Premium, per `07_Roadmap/01_MVP_Scope.md`).
- Voice logging (v2, per Roadmap Phase 4).

---

## What Happens After This Document

Daily Budgeting is the loop the whole product exists to serve — the moment referenced directly in the Project Brief ("Will my money last?"). Every other feature either feeds this screen (Budget Setup) or is fed by it (Spending, Review).

Next: Flow.md — the step-by-step logging and Safe-to-Spend interaction paths.