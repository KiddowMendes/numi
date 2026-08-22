---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/01_Domain/01_Entities.md"
  - "docs/playbook/01_Domain/02_Business_Rules.md"
  - "docs/playbook/01_Domain/04_Engine_API.md"
decision_record: none
---

# 03 — Calculations

> Math with no ambiguity. If two developers implement these formulas, they must get the same result.

---

## C1. Wallet Balance Verification

Verifies that a Wallet's stored balance matches its Transaction history.

```
wallet_balance == SUM(income_transactions.amount)
                   - SUM(expense_transactions.amount)
                   + SUM(transfer_in_transactions.amount)
                   - SUM(transfer_out_transactions.amount)
```

Where:
- `income_transactions`: Transactions where `wallet_id == this_wallet` AND `type == 'income'`
- `expense_transactions`: Transactions where `wallet_id == this_wallet` AND `type == 'expense'`
- `transfer_in_transactions`: Transactions where `to_wallet_id == this_wallet` AND `type == 'transfer'`
- `transfer_out_transactions`: Transactions where `wallet_id == this_wallet` AND `type == 'transfer'`

Rule: If stored balance != calculated balance, the engine must flag data corruption. Do not auto-correct.

---

## C2. Wallet Available Balance

Money in a Wallet that is not assigned or reserved.

```
available_balance = wallet.balance
                    - SUM(active_assignments.amount WHERE wallet_id == this_wallet)
                    - SUM(active_goals.current_amount WHERE wallet_id == this_wallet)
```

Where:
- `active_assignments`: Assignments linked to the active Period
- `active_goals`: Goals where `wallet_id == this_wallet` (Goals are always active until deleted or completed)

Rule: Available balance can be negative. This means the user has over-committed.

---

## C3. Global Safe-to-Spend

Total uncommitted money across all Wallets.

```
safe_to_spend_global = SUM(available_balance FOR EACH wallet)
```

Display rule: If negative, show the negative number in a warning state. Do not hide it.

---

## C4. Days Remaining in Active Period

```
IF no active_period:
    days_remaining = NULL

ELSE IF today > active_period.end_date:
    days_remaining = 0

ELSE:
    days_remaining = active_period.end_date - today
```

Both dates are counted in whole days. If today is August 10 and end_date is August 15, days_remaining = 5.

---

## C5. Daily Safe-to-Spend

The single most important number in NUMI.

```
IF days_remaining IS NULL OR days_remaining <= 0:
    daily_safe_to_spend = NULL

ELSE IF safe_to_spend_global <= 0:
    daily_safe_to_spend = safe_to_spend_global

ELSE:
    daily_safe_to_spend = FLOOR(safe_to_spend_global / days_remaining)
```

Currency rule: Always round down to the nearest Rand. No cents. If you have R150 and 7 days, daily = R21 (not R21.43).

Display rule: If NULL, show "--" and prompt user to create or extend a Period.

---

## C6. Assignment Spent

How much of an Assignment has actually been used.

```
assignment_spent = SUM(transaction.amount)
                   WHERE transaction.category_id == assignment.category_id
                   AND transaction.wallet_id == assignment.wallet_id
                   AND transaction.type == 'expense'
                   AND transaction.date >= assignment.period.start_date
                   AND transaction.date <= assignment.period.end_date
```

Note: This looks at the Period's date range, not the Assignment's creation date. Money spent before the Period started does not count against this Assignment.

---

## C7. Assignment Remaining

```
assignment_remaining = assignment.amount - assignment_spent
```

Can be negative. Negative means overspent in this Category for this Period.

---

## C8. Goal Progress

```
goal_progress_percentage = FLOOR(
    (goal.current_amount / goal.target_amount) * 100
)
```

Cap: 100%. If current_amount somehow exceeds target_amount (should be prevented by BR-G2), clamp display at 100%.

Goal remaining:
```
goal_remaining = goal.target_amount - goal.current_amount
```

---

## C9. Goal Reservation Check

Before creating or increasing a Goal reservation:

```
required_available = wallet.balance - SUM(active_assignments for this wallet)
                      - SUM(active_goals for this wallet, excluding this goal)

IF goal_increase_amount > required_available:
    REJECT with error: "Insufficient available balance"
```

---

## C10. Assignment Creation Check

Before creating an Assignment:

```
current_assignments = SUM(active_assignments.amount WHERE wallet_id == target_wallet)
current_goals = SUM(active_goals.current_amount WHERE wallet_id == target_wallet)
proposed_total = current_assignments + current_goals + new_assignment_amount

IF proposed_total > wallet.balance:
    REJECT with error: "Cannot assign more than available"
```

---

## C11. Transfer Validation

Before creating a transfer Transaction:

```
IF source_wallet == destination_wallet:
    REJECT with error: "Cannot transfer to same wallet"

IF source_wallet.available_balance < transfer_amount:
    REJECT with error: "Insufficient balance"
```

Note: Transfer uses available_balance, not raw balance. You cannot transfer money that is already assigned or reserved.

---

## C12. Expense Validation

Before creating an expense Transaction:

```
IF wallet.available_balance < expense_amount:
    REJECT with error: "Insufficient available balance"
```

v1 rule: Hard reject. Do not allow overdraft. (Future ADR may allow overdraft with warning.)

---

## C13. Tier Limit Check

```
IF operation == CREATE_WALLET:
    current_count = COUNT(wallets)
    IF user.tier == 'free' AND current_count >= 1: REJECT
    IF user.tier == 'freemium' AND current_count >= 3: REJECT
    ELSE: ALLOW

IF operation == CREATE_GOAL:
    current_count = COUNT(goals)
    IF user.tier == 'free' AND current_count >= 0: REJECT
    IF user.tier == 'freemium' AND current_count >= 3: REJECT
    ELSE: ALLOW
```

---

## C14. Period Close Calculation

When closing a Period:

```
remaining_unspent = SUM(assignment_remaining FOR EACH assignment in period)

FOR EACH wallet:
    unassigned_from_period = SUM(assignments in period for this wallet)
    // This money becomes unassigned in the wallet
    // No Transaction created. State change only.
```

Rule: Closing a Period does not create money or destroy it. It simply removes commitments. The money remains in the Wallet, now unassigned.

---

## C15. Conservation of Money (System Check)

A periodic integrity check the engine should run:

```
total_wallet_balances = SUM(wallet.balance FOR EACH wallet)
total_unassigned = SUM(wallet.available_balance FOR EACH wallet)
total_assigned = SUM(active_assignments.amount FOR EACH assignment)
total_reserved = SUM(active_goals.current_amount FOR EACH goal)

ASSERT: total_wallet_balances == total_unassigned + total_assigned + total_reserved
```

If this ever fails, data corruption has occurred.

---

## Pseudocode Conventions

- SUM() means arithmetic sum. Empty set = 0.
- FLOOR() means round down to integer.
- NULL means undefined/impossible to calculate.
- REJECT means the engine throws an error and makes no state changes.
- All money values are in cents (integers) internally. Display converts to Rands.

---

## What Happens After This Document

These calculations are implemented in packages/domain. Every function in the Engine API must reference one or more calculations here.

Next: docs/playbook/01_Domain/04_Engine_API.md — the interface that exposes these calculations to the apps.