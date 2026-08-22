---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/03_Daily_Budgeting/Overview.md"
  - "docs/playbook/01_Domain/01_Entities.md"
  - "docs/playbook/04_Design_System/03_Patterns.md"
decision_record: none
---

# 04 — Spending: Overview

> See what happened. Learn without shame. The Actual lens made visible.

---

## User Problem

"I know I spent money this week. But where did it actually go? Not what I planned — what really happened. I need to see it without feeling judged."

---

## What Spending Does

1. Shows a complete, filterable history of all Transactions.
2. Groups by time for mental alignment ("this morning", "yesterday", "last week").
3. Allows reversing mistakes without editing history.
4. Surfaces patterns through simple aggregation (total by Category, by Wallet).
5. Never implies good or bad. Just: this is what happened.

---

## Lens Mapping

| Lens | Served? | How |
|---|---|---|
| **Current** | No | This is the past. |
| **Planned** | Partial | Compare Actual vs Planned in Review feature. Spending shows raw history only. |
| **Actual** | Yes | Complete. This is the only feature that serves Actual deeply in v1. |

---

## Success Criteria

- User can find any transaction from the last 30 days in under 10 seconds.
- Reversing a transaction takes 2 taps.
- No red/green indicators on spending amounts. All amounts are neutral.
- Works offline. History is local.

---

## Tier Behavior

| Tier | Spending Difference |
|---|---|
| **Free** | Full history. No filters beyond time and type. |
| **Freemium** | Same. Web view of history (lagged). |
| **Premium** | Advanced filters (Category multi-select, amount range, search by note). CSV export. |

---

## Core Metrics

- Time to find a specific transaction.
- Frequency of transaction reversals (indicates UX friction in logging).
- Most-used filter (if any).

---

## Out of Scope

- Charts, graphs, or trend visualizations (v2 / Premium).
- Merchant recognition or auto-categorization.
- Receipt attachment or photo logging.
- Split transactions.
- Budget vs Actual comparison (this lives in Review).

---

## What Happens After This Document

Spending is the honest record. It pairs with Daily Budgeting (the present) and Review (the reflection).

Next: Flow.md.