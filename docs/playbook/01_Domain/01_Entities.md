---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/00_Foundation/03_Glossary.md"
  - "docs/playbook/01_Domain/02_Business_Rules.md"
decision_record: none
---

# 01 — Entities

The nouns of NUMI's world.

## 1. User

The ghost identity. Minimal.

- id: string (UUID, generated on device)
- tier: 'free' | 'freemium' | 'premium'

Rules:
- U1. Exists even without an account. Tier defaults to 'free'.
- U2. No email, name, or phone in domain. That lives in infrastructure (auth API).
- U3. Domain enforces tier limits. It does not handle payments.

## 2. Period

A lump-sum survival window. "This money must last from now until then."

- id: string
- name: string (e.g., "NSFAS Semester 1")
- start_date: Date
- end_date: Date
- is_active: boolean
- created_at: Date

Rules:
- P1. Only ONE Period may be active at a time.
- P2. Creating a new active Period closes the previous one.
- P3. end_date must be after start_date.
- P4. May be closed early if new income arrives.
- P5. Closed Periods are archived, not deleted.

## 3. Wallet

Manual container for real-world money. Not linked to any bank.

- id: string
- name: string (e.g., "Cash", "Capitec", "Stokvel")
- type: 'cash' | 'bank' | 'stokvel' | 'mashonisa' | 'savings'
- balance: number (stored in cents, integer)
- currency: 'ZAR'
- created_at: Date

Rules:
- W1. Balance is manually maintained. No bank linking.
- W2. Balance must equal sum of all Transactions for this Wallet (engine verifies).
- W3. Tier limits: Free=1, Freemium=3, Premium=unlimited.
- W4. Default Wallet on first launch: "Cash Wallet", type 'cash'.
- W5. Wallets can transfer money between each other.
- W6. Cannot delete if balance is non-zero or has active Assignments.

## 4. Category

Purpose label for spending.

- id: string
- name: string (e.g., "Food", "Transport", "Airtime")
- color: string (hex, e.g., "#FF5733")
- icon: string (name from design system)
- is_default: boolean
- created_at: Date

Rules:
- C1. Unlimited on all tiers.
- C2. Every expense Transaction must have exactly one Category.
- C3. Income and Transfer Transactions have no Category.
- C4. System defaults seeded on first launch. User can edit or hide.
- C5. Cannot delete if any Transaction references it.

## 5. Goal

Named target that reserves money INSIDE a Wallet. The money is still there — just spoken-for.

- id: string
- name: string (e.g., "New Phone")
- target_amount: number (in cents)
- current_amount: number (reserved so far, in cents)
- deadline: Date | null
- wallet_id: string (which Wallet holds the reservation)
- created_at: Date

Rules:
- G1. Tier limits: Free=0, Freemium=3, Premium=unlimited.
- G2. current_amount cannot exceed target_amount.
- G3. current_amount cannot exceed Wallet's available balance at reservation time.
- G4. Reduces Safe-to-Spend but does NOT create a Transaction. Money never moved.
- G5. Spending from a Goal is two steps: (1) log expense Transaction, (2) reduce Goal.current_amount.
- G6. If Goal is deleted, reserved money returns to Wallet's available balance.

## 6. Assignment

The result of "giving every Rand a job." Makes Safe-to-Spend calculable.

- id: string
- period_id: string
- category_id: string
- wallet_id: string
- amount: number (in cents, planned/committed)
- created_at: Date

Rules:
- A1. Amount must be positive.
- A2. Enforced when creating or increasing an Assignment: Sum of active Assignments + Sum of Goal reservations for a Wallet cannot exceed that Wallet's balance. Later expenses may push Safe-to-Spend negative without invalidating existing Assignments.
- A3. Belongs to exactly one Period, one Category, one Wallet.
- A4. Immutable once created. To change: delete old, create new.
- A5. Archived when Period closes. Do not affect future Periods.

## 7. Transaction

The atomic unit. Money moves. Truth is recorded.

- id: string
- amount: number (always positive, in cents)
- type: 'income' | 'expense' | 'transfer'
- date: Date
- category_id: string | null
- wallet_id: string (source, or destination for income)
- to_wallet_id: string | null (destination for transfers only)
- note: string | null
- created_at: Date

Rules:
- T1. Amount is always positive. Direction is set by type.
- T2. Income: wallet_id is destination. category_id is null. to_wallet_id is null.
- T3. Expense: wallet_id is source. category_id is required. to_wallet_id is null.
- T4. Transfer: wallet_id is source. to_wallet_id is destination. category_id is null. Source and destination must differ.
- T5. Cannot cause Wallet balance to go negative. (Engine rejects for v1.)
- T6. Immutable. Errors fixed by creating a reversing Transaction.

## Relationships

User owns everything (Period, Wallet, Category, Goal, Assignment, Transaction).
Period contains many Assignments.
Wallet holds many Transactions (as source).
Wallet receives many Transactions (as destination for transfers/income).
Wallet funds many Assignments.
Wallet reserves many Goals.
Category classifies many Assignments.
Category classifies many Transactions (expenses only).

## What is NOT an Entity

- Budget: Not a noun in NUMI. "Budgeting" is the act of creating Assignments.
- Account: Not domain. NUMI Account (freemium/premium) is infrastructure.
- IncomeEvent: Not needed. Income is a Transaction with type 'income'.
- RecurringRule: Not v1. Irregular income does not recur predictably.

## Derived Values (Calculated by Engine, Not Stored)

- Safe-to-Spend per Wallet = balance - sum(active Assignments) - sum(Goal reservations)
- Safe-to-Spend global = sum of all Wallet Safe-to-Spend values
- Assignment Spent = sum of expense Transactions in this Category, this Period, this Wallet
- Assignment Remaining = Assignment.amount - Assignment Spent
- Days Remaining in Period = end_date - today. If the Period ends today, Days Remaining is 0; if expired, it is negative. (Division by zero or negative daily amounts is prevented by the Engine: see below.)
- Daily Safe-to-Spend = Safe-to-Spend / Days Remaining (rounded down to the nearest Rand), only when Days Remaining > 0. If Days Remaining == 0: Daily Safe-to-Spend = Safe-to-Spend (the whole amount is available today). If Days Remaining < 0 (Period expired): Daily Safe-to-Spend = 0 and the Period must be closed.
- Period expiry is an explicit Engine transition, not a read-time side effect: when end_date passes, the Engine closes the Period, sets is_active = false, and archives its Assignments (idempotent — repeated checks have no further effect). Reads and derived-value calculations only read state; they never mutate it.
- Clamping: Daily Safe-to-Spend is clamped to a minimum of 0. A negative Safe-to-Spend with positive Days Remaining yields 0 for the day; the negative balance itself remains visible in the Wallet and in Safe-to-Spend (overspending state).
