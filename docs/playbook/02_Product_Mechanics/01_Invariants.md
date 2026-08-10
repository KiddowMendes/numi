---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/01_Domain/02_Business_Rules.md"
  - "docs/playbook/01_Domain/03_Calculations.md"
  - "docs/playbook/02_Product_Mechanics/02_User_States.md"
decision_record: none
---

# 01 — Invariants

&gt; What must ALWAYS be true in the product, no matter what the user does. If an invariant breaks, it is a bug.

---

## I1. The Safe-to-Spend Number is Never Hidden

The daily safe-to-spend number must be visible on app open within one interaction. It cannot be behind a menu, a loading spinner, a login wall, or a paywall.

Source: Principle 2 (Visibility in the Moment), C5

---

## I2. Negative is Visible, Not Shameful

If safe-to-spend, available balance, or assignment remaining is negative, the UI must display the negative number clearly. No hiding, no rounding to zero, no red-alert shame styling. Use neutral colors (blue/orange) per Principle 4.

Source: BR-S5, Principle 4 (No Shame)

---

## I3. The Device Wins Silently, But the User Knows

If the web app or any secondary platform shows stale data, it must display an explicit "out of sync" indicator. The user must never act on stale numbers without knowing they are stale.

Source: Principle 6 (Device is Source of Truth), R6.2, R6.3

---

## I4. Every Rand Has a Wallet

At all times, every tracked Rand in the system belongs to exactly one Wallet. There is no "floating" or unallocated money that exists outside a Wallet. Even unassigned money lives inside a Wallet's balance.

Source: BR-X1, BR-X2

---

## I5. Conservation of Money is Enforceable

The UI must be capable of displaying a "system health" indicator (even if hidden in settings) that confirms total balances equal total assignments plus total reservations. If this invariant fails, the app must enter a read-only state until corruption is resolved.

Source: C15, BR-X3

---

## I6. Capture Completes or Aborts

A transaction logging flow must be atomic from the user's perspective. If the user taps "Save," the transaction is recorded and the safe-to-spend number updates before the screen dismisses. If the operation fails, the user sees an error and the transaction is NOT partially saved.

Source: Principle 2 (Visibility in the Moment), BR-T6

---

## I7. Offline Does Not Degrade Core Experience

In airplane mode, the user can log transactions, create Assignments, and view safe-to-spend exactly as if online. The only features that degrade are those explicitly requiring connectivity (sync, web view). No nagging banners demanding connection.

Source: Principle 6 (Device is Source of Truth), R4.4

---

## I8. Tier Limits Are Enforced at the Point of Creation

If a free-tier user attempts to create a second Wallet or any Goal, the action is blocked immediately with a clear explanation. The block happens in the engine before any UI state changes. There is no "create then tell you later" flow.

Source: BR-TR1, BR-TR2, C13

---

## I9. Period Context is Always Clear

Whenever the user sees safe-to-spend, assignment remaining, or daily rate, the UI must implicitly or explicitly indicate which Period this refers to. The user must never wonder "is this for this week or this month?"

Source: C4, C5

---

## I10. Immutable History

A logged transaction cannot be edited. The UI must offer "reverse" or "correct" actions that create new transactions, not edit old ones. The history view must never show an "edit" button on a past transaction.

Source: BR-T3, BR-T6

---

## I11. Goal Reservations Are Reversible

A user can decrease or delete a Goal at any time and the reserved money immediately returns to available balance. No penalties, no waiting periods, no "are you sure?" guilt dialogs. A single confirmation is permitted; a lecture is not.

Source: BR-G6, Principle 1 (Agency)

---

## I12. Transfer is Transparent

When money moves between Wallets, both the source and destination Wallets update their balances immediately. The transaction appears in both Wallet histories. There is no "pending" transfer state in v1.

Source: BR-W5, BR-T5

---

## Enforcement

These invariants are tested at two levels:

1. **Engine tests:** Every invariant with a calculation or rule source must have a unit test in `packages/domain/tests/`.
2. **UI tests:** Every invariant with a display or interaction requirement must have an E2E or component test in the respective app.

If a feature breaks an invariant, the feature is cut or the invariant is elevated to an ADR.

---

## What Happens After This Document

These invariants feed into `02_User_States.md` — the defined states a user can be in, and what triggers movement between them.

Next: docs/playbook/02_Product_Mechanics/02_User_States.md