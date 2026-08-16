---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/01_Domain/01_Entities.md"
  - "docs/playbook/01_Domain/03_Calculations.md"
decision_record: none
---

# 02 — Business Rules

> Inviolable facts. If the engine breaks one of these, it is wrong.

---

## Period Rules

- BR-P1. Only one Period may be active at any time. (See E-P1)
- BR-P2. A Period's end_date must be strictly after its start_date.
- BR-P3. Closing a Period archives all its Assignments. Archived Assignments do not affect Safe-to-Spend.
- BR-P4. A new Period may be created even if the previous Period has remaining money. The remaining money becomes unassigned in its Wallet and must be re-allocated.

## Wallet Rules

- BR-W1. A Wallet's balance must never be negative. (See E-W5, E-T5)
- BR-W2. A Wallet's balance must always equal the sum of all Transactions affecting it (income +, expense -, transfer in +, transfer out -).
- BR-W3. Deleting a Wallet is forbidden if its balance is non-zero or it has active Assignments or active Goals.
- BR-W4. The Free tier may have exactly 1 Wallet. Freemium: maximum 3. Premium: unlimited.
- BR-W5. Transferring money between Wallets creates exactly one Transaction record of type 'transfer', with wallet_id as source and to_wallet_id as destination. Both Wallet balances are updated atomically by the Engine. (See E-T4, E-T6)

## Category Rules

- BR-C1. Every expense Transaction must reference exactly one Category.
- BR-C2. Income and Transfer Transactions must reference zero Categories.
- BR-C3. A Category cannot be deleted if any Transaction or Assignment references it.
- BR-C4. Categories are unlimited on all tiers.

## Goal Rules

- BR-G1. The Free tier may have zero Goals. Freemium: maximum 3. Premium: unlimited.
- BR-G2. A Goal's current_amount cannot exceed its target_amount.
- BR-G3. A Goal's current_amount cannot exceed the available balance of its parent Wallet at the time of reservation.
- BR-G4. Creating or increasing a Goal reservation reduces Safe-to-Spend but does NOT create a Transaction. The money has not moved; its state has changed.
- BR-G5. Spending from a Goal requires two engine operations in sequence: (1) create an expense Transaction against the parent Wallet and a Category, (2) reduce the Goal's current_amount by the same amount. Both succeed or both fail.
- BR-G6. Deleting a Goal releases its current_amount back to the parent Wallet's available balance. No Transaction is created.

## Assignment Rules

- BR-A1. An Assignment's amount must be strictly positive.
- BR-A2. The sum of all active Assignments for a Wallet plus the sum of all Goal current_amounts for that same Wallet cannot exceed the Wallet's balance.
- BR-A3. Assignments are immutable. To change a plan, delete the Assignment and create a new one.
- BR-A4. An Assignment belongs to exactly one active Period. When the Period closes, the Assignment is archived.
- BR-A5. An Assignment must reference exactly one Wallet and exactly one Category.

## Transaction Rules

- BR-T1. Transaction amount is always stored as a positive integer (cents). Direction is determined by type.
- BR-T2. A Transaction cannot cause any Wallet's balance to fall below zero. The engine must reject the operation.
- BR-T3. Transactions are immutable. Correction requires a reversing Transaction, not an edit.
- BR-T4. A reversing Transaction must reference the original Transaction ID in its note or metadata.
- BR-T5. Transfer Transactions must specify two different Wallets. Transferring to the same Wallet is forbidden.

## Safe-to-Spend Rules

- BR-S1. Safe-to-Spend for a single Wallet = Wallet.balance - sum(active Assignments for that Wallet) - sum(Goal current_amount for that Wallet).
- BR-S2. Global Safe-to-Spend = sum of Safe-to-Spend across all Wallets.
- BR-S3. Daily Safe-to-Spend = Global Safe-to-Spend / Days Remaining in active Period, rounded down to the nearest Rand.
- BR-S4. If no Period is active, Daily Safe-to-Spend is undefined (display "--" or prompt user to create a Period).
- BR-S5. Safe-to-Spend can be negative. This is a valid state representing overspending. The UI must display it clearly without shame.

## Tier Enforcement Rules

- BR-TR1. The engine must reject any operation that would exceed the user's tier limit for Wallets or Goals.
- BR-TR2. Tier checks happen at the domain layer, not the UI layer. A malicious or buggy client cannot bypass tier limits.
- BR-TR3. Tier is part of the UserContext passed to every engine operation. The engine is the gatekeeper.

## Cross-Cutting Rules

- BR-X1. Every Rand must belong to exactly one Wallet at all times.
- BR-X2. Every Rand in a Wallet is either unassigned (available) or assigned (to an Assignment or Goal). There is no third state. When Assignments + Goal reservations exceed the Wallet balance, unassigned is negative: this is the overcommitted state, and it always equals a negative Safe-to-Spend (see BR-S5).
- BR-X3. The sum of all Wallet balances equals the sum of all unassigned money + all Assignment amounts + all Goal current_amounts. This is the conservation of money invariant. The invariant holds exactly; unassigned may be negative, but the equation never breaks.
- BR-X4. Time is handled in the user's local timezone. No UTC conversion for date-bound logic. A transaction logged at 23:55 on 31 August stays on 31 August even if the server thinks it's 1 September.
