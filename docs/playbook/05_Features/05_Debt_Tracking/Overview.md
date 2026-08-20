---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/00_Foundation/02_Principles.md"
  - "docs/playbook/00_Foundation/03_Glossary.md"
  - "docs/playbook/07_Roadmap/01_MVP_Scope.md"
  - "docs/playbook/07_Roadmap/02_Phases.md"
decision_record: none
---

# 05 — Debt Tracking: Overview

> Money you owe, tracked without shame. The debt you can't forget, remembered for you.

---

## User Problem

"I borrowed R800 from my mashonisa and R300 from my sister. I know I'm paying it back, but I've lost count of what's still owed, and I'm scared to check. I need a clear, private record — not a lecture."

---

## What Debt Tracking Does

1. Records an informal debt: creditor (family, friend, mashonisa), amount, and purpose.
2. Offers a mashonisa preset for loans with fixed repayment cycles (daily or weekly installments).
3. Treats each repayment as a Transaction that references the Debt — money moves between Wallets exactly as normal.
4. Shows the remaining balance and the next installment date at a glance.
5. Reminds the user on-device when an installment is due.
6. Never implies guilt. The record exists to protect the user, not judge them.

---

## Lens Mapping

| Lens | Served? | How |
|---|---|---|
| **Current** | No | An obligation is not an Available balance. Repayments surface in Current as normal Transfers when they happen. |
| **Planned** | No | Installment dates are reminders, not Assignments. |
| **Actual** | Yes | Every borrow and repayment is recorded in the Transaction history. |

---

## Success Criteria

- User can see how much is still owed, to whom, in under 5 seconds.
- Recording a repayment takes 2 taps.
- No red/green or guilt framing anywhere in the feature.
- Works offline. Debt is local on the device (source of truth per R6.5).
- A debt is considered cleared only when the user repays the full recorded amount.

---

## Data Model Decision

Recorded in this document (no ADR store exists yet):

1. **Informal debt is a separate Debt entity, not a Wallet.**
   R8.2 allows a Wallet to *represent* informal debt, but BR-W1 forbids negative Wallet balances — a wallet holding an amount owed would go negative. A Debt entity lives outside Wallets: BR-W1 and the conservation invariant (BR-X3) stay untouched, and a Wallet may still represent informal debt as a simple asset (R8.2) where the user prefers it.
2. **Scope is general informal debt; mashonisa is a preset, not a separate machine.**
   The Glossary covers family, friends, and mashonisas. One toolchain serves all: Debt entry + installment schedule + due-date reminders + remaining balance. The mashonisa preset pre-fills daily/weekly installment cycles (per Phase 5: "Debt tracking (mashonisa support)").

---

## Tier Behavior

| Tier | Debt Tracking Difference |
|---|---|
| **Free** | Excluded entirely (R3.7). |
| **Freemium** | Excluded entirely (R3.7). |
| **Premium** | Full feature: Debt entries, mashonisa preset, installment schedules, due-date reminders, repayment history. |

---

## Core Metrics

- Debts cleared (remaining balance reaches zero) within the scheduled period.
- Median time to record a repayment.
- Installment reminders actioned within 24 hours of firing.

---

## Out of Scope

- Interest or APR computation. NUMI records what the user must repay; it does not calculate it.
- Formal loans, banks, or credit institutions (Glossary: informal only).
- Debt consolidation or payoff strategy advice.
- Any notification sent to the creditor. Reminders are on-device only.
- Changes to Wallet balances driven by Debt. Money moves only through user-initiated Transactions.

---

## What Happens After This Document

Debt Tracking is the last Premium (v2) pillar in MVP scope. It is the only feature that holds an obligation rather than a transaction history.

Next: Flow.md. The Debt data model's domain rules (BR-D entries: entity shape, Transaction references, repayment constraints) are introduced there.