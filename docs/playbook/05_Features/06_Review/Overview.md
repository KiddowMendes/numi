---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/02_Product_Mechanics/03_Behavioral_Loops.md"
  - "docs/playbook/05_Features/02_Budget_Setup/Overview.md"
  - "docs/playbook/01_Domain/03_Calculations.md"
decision_record: none
---

# 06 — Review: Overview

> What happened? Did my money last? What should I do differently next time?

---

## User Problem

"My period ended. I know I spent money, but I don't know if I made it or not. I need to see — without shame — what actually happened versus what I planned."

---

## What Review Does

1. Shows a summary of the closed Period: income, spent, unspent, overspent.
2. Compares Planned vs Actual for each Category.
3. Suggests adjustments for the next Period based on reality.
4. Celebrates unspent money as a win, not a failure to spend.
5. Provides the exit ramp to start a new Period or extend.

---

## Lens Mapping

| Lens | Served? | How |
|---|---|---|
| **Current** | No | Period is closed. |
| **Planned** | Yes | Shows every Assignment and whether it survived. |
| **Actual** | Yes | Shows every expense and income in the Period. |

---

## Success Criteria

- User understands Period outcome in under 10 seconds.
- No red/green judgment. No score. No "you did well/badly."
- Suggested next Period is one tap away.
- Works offline. History is local.

---

## Tier Behavior

| Tier | Review Difference |
|---|---|
| **Free** | Full Period summary. Basic Planned vs Actual table. |
| **Freemium** | Same. Web view of archived Periods. |
| **Premium** | Trend indicators ("You usually overspend Food by 15%"). Export Period as CSV/PDF. |

---

## Core Metrics

- Percentage of users who start a new Period within 24 hours of Period end.
- Most common Category where Planned > Actual (indicates systemic under-planning).
- Average unspent amount (positive signal).

---

## Out of Scope

- Charts, graphs, or visual trends (v2 / Premium).
- "Insights" or AI-generated advice.
- Social sharing ("I saved R500!").
- Merchant-level analysis.

---

## What Happens After This Document

Review is the learning loop. It closes one Period and opens the next.

Next: Flow.md.