---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/06_Review/Flow.md"
  - "docs/playbook/04_Design_System/02_Components.md"
decision_record: none
---

# 06 — Review: Screens

> The period-end summary. Neutral, factual, forward-looking.

---

## Screen 1: ReviewScreen

**Route:** `/review?periodId=[id]` or modal over `/home`

**Purpose:** Understand what happened and decide what's next.

**Layout:**
- SafeAreaView.
- ScrollView.

**Header:**
- Title: "[Period name]" (`typography.heading1`).
- Subtitle: "[start] – [end] · [duration] days" (`typography.caption`).

**Content Blocks:**

### Block A: Period Summary Card
- Background: `color.surface`.
- Border radius: `radius.lg`.
- Padding: `spacing.lg`.

**Top row:**
- Left: "Income" label, `textMuted`.
- Right: Total income amount, `amountLg`, `color.income`.

**Middle row:**
- Left: "Spent" label.
- Right: Total spent, `amountLg`, `color.expense`.

**Bottom row:**
- Left: "Left over" or "Over by" label.
- Right: Absolute amount, `amountLg`.
  - If unspent: `color.stateSafe`.
  - If overspent: `color.stateAlert`.
- No judgment text. Just the number.

---

### Block B: Category Breakdown
- Section header: "By category" (`typography.heading2`).

**Each row (ListItem variant):**
- Left: Category color dot + name (`typography.body`).
- Middle: Planned amount (`typography.caption`, `textMuted`).
- Right: Actual amount (`typography.amountMd`).
- Below: Difference bar.
  - Width: proportional to max(Planned, Actual).
  - Planned segment: `color.border` (subtle).
  - Actual segment: Category color (solid).
  - If Actual > Planned: bar extends beyond Planned marker. No red. Just longer.

**Tap row:** Expand to show transaction count and list of transactions in that Category for this Period.

---

### Block C: Wallet Breakdown (optional, collapsible)
- Same pattern as Category Breakdown.
- Shows which Wallets were used.

---

### Block D: Suggestion Card (if Period just ended)
- Background: `color.surfaceRaised`.
- Border left: 3px `color.primary`.
- Headline: "Start your next period"
- Body: "Based on what happened, here's a suggested plan."
- List: Top 3 Categories with suggested amounts (based on Actuals).
- Primary button: "Use this plan" → navigates to Budget Setup with pre-filled Assignments.
- Ghost button: "Start fresh" → Budget Setup with blank Assignments.

---

### Block E: Actions
- Primary: "Start new period" (if Period just ended).
- Ghost: "Close".

---

## Screen 2: PeriodEndedBanner (Inline)

**Route:** Inline on HomeScreen

**Purpose:** Soft prompt to review.

**Layout:**
- Full width, below SafeToSpendHero.
- Background: `color.surfaceRaised`.
- Border left: 3px `color.primary`.
- Padding: `spacing.lg`.

**Content:**
- Headline: "Your [Period name] has ended."
- Body: "R[unspent] left over. R[overspent] over budget." (omit zero lines).
- Actions: Primary "Review" + Ghost "Start new period".

---

## Component Mapping

| Screen | Components |
|---|---|
| ReviewScreen | Card (summary), ListItem (breakdown), Button, Progress bar (difference) |
| PeriodEndedBanner | Card (custom), Button |

---

## What Happens After This Document

Edge cases cover empty Periods, massive overspending, and review after Period deletion.

Next: Edge_Cases.md.