---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/01_Domain/01_Entities.md"
  - "docs/playbook/02_Product_Mechanics/01_Invariants.md"
  - "docs/playbook/05_Features/01_Onboarding/Overview.md"
decision_record: none
---

# 02 — User States

> The emotional and functional states a user can be in. Every screen must know which state it serves.

---

## State Machine Overview

```
[First Launch] ──► [No Period] ──► [Active Budgeter]
                                      │
                                      ▼
                              [Over-Committed] ◄──► [Recovering]
                                      │
                                      ▼
                              [Period Ended] ──► [Renewing]
                                      │
                                      ▼
                              [Inactive / Lapsed]
```

---

## S1. First Launch

**Definition:** App installed. No data. No Period. No Wallet.

**Entry trigger:** App opened for the first time.

**Exit trigger:** User creates their first Wallet and first Period.

**What the user needs:**
- Understand that NUMI is not a bank.
- Understand that their data stays on their device.
- Create a Wallet (default: "Cash Wallet").
- Create a Period (name, start date, end date).

**What the UI must show:**
- Manifesto in 3 sentences, not a tutorial.
- One primary action: "Start your first budget."
- No account creation required. No internet check.

**Invariant relevance:** I1 (Safe-to-Spend visible immediately — but here it is zero, so show "--" and a prompt).

---

## S2. No Period

**Definition:** User has a Wallet but no active Period. This happens after first Wallet creation or after closing a Period and not starting a new one.

**Entry trigger:** First Wallet created without Period. Or previous Period closed.

**Exit trigger:** User creates a new Period.

**What the user needs:**
- Know that money needs a time horizon to be meaningful.
- Create a Period quickly (name, "how long must this money last?").

**What the UI must show:**
- Safe-to-Spend: "--" (null state).
- Prompt: "How long does your current money need to last?"
- No guilt. No "you failed to plan." Just a missing time horizon.

---

## S3. Active Budgeter

**Definition:** User has an active Period, at least one Wallet, and money is assigned or unassigned. The "normal" state.

**Entry trigger:** Active Period exists.

**Exit triggers:**
- Safe-to-Spend goes negative (Over-Committed).
- Period end date passes (Period Ended).
- User stops opening app for 7+ days (Inactive).

**What the user needs:**
- See Daily Safe-to-Spend immediately.
- Log transactions in under 5 seconds.
- See Current, Planned, Actual at a glance.

**What the UI must show:**
- Home screen: Daily Safe-to-Spend (large).
- One-tap transaction logging.
- Visual indication of Period progress ("Day 12 of 90").

**Invariant relevance:** I1, I2, I7, I9.

---

## S4. Over-Committed

**Definition:** User has assigned or reserved more money than they have in their Wallets. Or their Wallet balance has dropped below their commitments due to spending.

**Entry trigger:** Safe-to-Spend (global or per-Wallet) goes negative.

**Exit trigger:** User adjusts Assignments, deletes a Goal, receives new income, or extends/reduces Period.

**What the user needs:**
- Know *where* the over-commitment is (which Wallet, which Category).
- See options to fix it: reduce Assignment, delete Goal, log new income.
- Not feel shamed. This is math, not morality.

**What the UI must show:**
- Warning state on affected Wallet(s).
- Breakdown: "You planned R2,000 for Food but only have R1,500 in Cash Wallet."
- Action buttons: "Reduce Food plan," "Move money from another Wallet," "I received more money."

**Invariant relevance:** I2 (negative is visible, not shameful), BR-S5.

---

## S5. Recovering

**Definition:** User was Over-Committed and has taken action to fix it, but has not yet returned to positive Safe-to-Spend. A transient state.

**Entry trigger:** User edits Assignments, deletes Goals, or logs income while Over-Committed.

**Exit trigger:** Safe-to-Spend returns to zero or positive (Active Budgeter). Or user gives up and closes the Period (Period Ended).

**What the user needs:**
- Confirmation that their action helped.
- Updated numbers immediately.
- Encouragement, not celebration. "You're back on track" is fine. "Great job!" is patronizing.

**What the UI must show:**
- Updated Safe-to-Spend.
- Brief confirmation: "Food plan reduced to R1,500. You have R200 left per day."

---

## S6. Period Ended

**Definition:** The active Period's end_date has passed. No new Period created yet.

**Entry trigger:** `today > active_period.end_date`.

**Exit trigger:** User creates a new Period.

**What the user needs:**
- Review what happened (Actual lens).
- See unspent money (if any) and decide what to do with it.
- Start fresh without losing history.

**What the UI must show:**
- "Your [Period name] has ended."
- Summary: total income, total spent, unspent remaining.
- Prompt: "Start a new period" or "Extend this one" (if they received late income).

**Invariant relevance:** I9 (Period context is clear), BR-P4.

---

## S7. Renewing

**Definition:** User is creating a new Period after a previous one ended. Has historical data to learn from.

**Entry trigger:** User taps "Start new period" after Period Ended.

**Exit trigger:** New Period created.

**What the user needs:**
- See previous Period's Assignments as suggestions, not defaults.
- Adjust based on what actually happened.
- Quick setup: "Same as last time" option.

**What the UI must show:**
- Previous Period summary.
- Suggested Assignments based on Actual spending.
- Editable fields. One-tap "Use same plan" or "Start fresh."

---

## S8. Inactive / Lapsed

**Definition:** User has not opened the app for 7+ days while in Active Budgeter or Period Ended state.

**Entry trigger:** No app open for 7 days.

**Exit trigger:** User opens the app.

**What the user needs:**
- Not be scolded.
- See their current state immediately, as if they never left.
- Optionally, a gentle nudge if a Period is about to end.

**What the UI must show:**
- Exact same home screen as when they left.
- If Period ends in < 3 days: subtle banner, not a popup.
- No "we missed you" guilt.

**Invariant relevance:** I7 (offline does not degrade), I3 (device wins).

---

## State Table

| State | Safe-to-Spend | Period Status | Primary Action |
|---|---|---|---|
| First Launch | -- | None | Create Wallet + Period |
| No Period | -- | None | Create Period |
| Active Budgeter | Positive or Zero | Active | Log transaction |
| Over-Committed | Negative | Active | Fix commitment |
| Recovering | Trending up | Active | Confirm fix |
| Period Ended | -- | Expired | Review + Renew |
| Renewing | -- | Expired | Create new Period |
| Inactive | Last known | Any | Resume where left off |

---

## Transition Triggers

| From | To | Trigger |
|---|---|---|
| First Launch | No Period | Wallet created, no Period yet |
| No Period | Active Budgeter | Period created |
| Active Budgeter | Over-Committed | Safe-to-Spend < 0 |
| Over-Committed | Recovering | User adjusts plan or adds income |
| Recovering | Active Budgeter | Safe-to-Spend >= 0 |
| Active Budgeter | Period Ended | `today > end_date` |
| Period Ended | Renewing | User chooses "Start new period" |
| Renewing | Active Budgeter | New Period created |
| Any | Inactive | No app open for 7 days |
| Inactive | Previous state | User opens app |

---

## What Happens After This Document

These states feed into `03_Behavioral_Loops.md` — the habit formation and notification strategy for each state.

Next: docs/playbook/02_Product_Mechanics/03_Behavioral_Loops.md