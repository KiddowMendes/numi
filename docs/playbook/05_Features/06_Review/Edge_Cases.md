---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/06_Review/Flow.md"
  - "docs/playbook/05_Features/06_Review/Screens.md"
decision_record: none
---

# 06 — Review: Edge Cases

> Even the post-mortem can go wrong.

---

## EC1. Period with 0 Transactions

**Trigger:** User created Period but never logged anything.

**Behavior:**
- ReviewScreen shows: "No transactions logged this period."
- All Category rows show Planned = Actual = 0.
- Suggestion card: "Start a new period when you're ready."
- No "you failed to track" language.

---

## EC2. Period with Massive Overspending

**Trigger:** Actual >> Planned in every Category.

**Behavior:**
- ReviewScreen shows negative "Left over" (displayed as "Over by R[amount]").
- `color.stateAlert` used for the total only.
- Individual Category rows still use neutral colors.
- Suggestion card: "You spent more than planned. Consider a longer period or more income."

---

## EC3. Attempt to Delete a Closed Period

**Trigger:** User tries to delete a closed Period (e.g. via Settings).

**Behavior:**
- Not possible. Closed Periods are archived, never deleted (invariant P5).
- No delete path exists for Periods. ReviewScreen and History always remain accessible.
- Transactions and Assignments are never touched by period lifecycle.

---

## EC4. User Reviews Old Period Mid-New-Period

**Trigger:** User in History, taps old Period header.

**Behavior:**
- ReviewScreen opens in read-only mode.
- No "Start new period" button.
- Suggestion card hidden.
- Purely informational.

---

## EC5. Web User Reviews Period

**Trigger:** Freemium/Premium user on web app.

**Behavior:**
- Web shows archived Period data from cloud.
- If stale: banner applies, but review is read-only anyway.
- No action buttons. Just view.

---

## EC6. Category Archived That Existed in Period

**Trigger:** Category was archived after Period closed.

**Behavior:**
- Review row shows Category name with "(archived)".
- Color dot preserved.
- Amounts still calculated correctly.

---

## EC7. Transfer Transactions in Review

**Trigger:** User transferred between Wallets during Period.

**Behavior:**
- Transfers do not appear in Category breakdown (no Category).
- They appear in Wallet breakdown.
- They do not affect "Spent" total (money did not leave the system).

---

## EC8. Income Logged After Period Closed

**Trigger:** User logged income with date inside closed Period, after Period ended.

**Behavior:**
- Income appears in Period summary (income total increases).
- Safe-to-Spend for that Period is not recalculated (Period is closed).
- New Period's starting balance is higher, but this Period's review is historical.

---

## Summary Table

| Case | Behavior |
|---|---|
| 0 transactions | Neutral empty state |
| Massive overspend | Alert color on total only, neutral rows |
| Delete attempt | Blocked — periods are archived, review persists |
| Old Period review | Read-only, no suggestions |
| Web review | Read-only, stale banner if applicable |
| Archived category | Show with suffix |
| Transfers | Wallet breakdown only |
| Late income | Included in Period income, no recalc |

---

## What Happens After This Document

Specified: Onboarding, Budget Setup, Daily Budgeting, Spending, and Review. Still Planned (stubs): Debt Tracking.

Next: docs/playbook/06_Implementation/01_Coding_Standards.md