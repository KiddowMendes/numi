---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/02_Product_Mechanics/02_User_States.md"
  - "docs/playbook/05_Features/03_Daily_Budgeting/Overview.md"
  - "docs/playbook/05_Features/06_Review/Overview.md"
decision_record: none
---

# 03 — Behavioral Loops

> How NUMI becomes a habit, not a chore. Every touchpoint must earn its place.

---

## The Core Loop

The fundamental pattern that makes NUMI work:

```
Income Arrives ──► Assign Money ──► Spend & Log ──► Check Safe-to-Spend ──► Review at Period End
      │                  │                │                  │                      │
      ▼                  ▼                ▼                  ▼                      ▼
   Create or        Give every       Log in <5 sec      See daily rate      Learn without
   extend Period    Rand a job       before regret      before spending     shame
```

This loop must complete without friction. If any step feels like work, the loop breaks and the user stops.

---

## Loop 1: Income Arrives (Period Creation)

**Trigger:** User receives money — NSFAS, salary, stokvel payout, weekend job.

**User need:** "I have money now. How do I make it last?"

**NUMI behavior:**
- If no active Period: prompt to create one. Pre-fill name based on common patterns ("NSFAS Semester 1", "March Job").
- If active Period exists: offer to extend Period or close-and-start-new.
- Do not auto-create. The user must consciously set the time horizon.

**Notification rule:** No notification. The user knows they got paid. NUMI waits for them to open the app.

---

## Loop 2: Assign Money (The Budgeting Moment)

**Trigger:** Period created or income logged.

**User need:** "Where should this money go?"

**NUMI behavior:**
- Show total money in Wallets.
- Show suggested Assignments based on previous Period's Actual spending.
- Allow "Copy last plan" or manual assignment.
- Enforce the conservation rule: assignments + goals cannot exceed balance.

**Key interaction:** Assignment is a single-screen operation. Tap category, enter amount, done. No review screen, no confirmation dialog.

**Notification rule:** No notification. This is a user-initiated moment.

---

## Loop 3: Spend & Log (The Critical Moment)

**Trigger:** User is about to spend or has just spent money.

**User need:** "Can I afford this? Should I log this?"

**NUMI behavior:**
- **Before spending:** Glance at widget or home screen. See Daily Safe-to-Spend. Decide.
- **After spending:** Log transaction in under 5 seconds. One screen. Amount, Category, optional note. Save.

**The 5-second rule:**
- Default to last-used Category.
- Default to today.
- Amount input is the first focus.
- No "Are you sure?" dialogs.

**Notification rule:** No notification. Logging is user-initiated.

---

## Loop 4: Check Safe-to-Spend (The Pulse Check)

**Trigger:** User wonders "how much do I have left?"

**User need:** "Can I buy this without breaking my plan?"

**NUMI behavior:**
- Home screen shows Daily Safe-to-Spend prominently.
- Tapping it shows: global number, per-Wallet breakdown, days remaining in Period.
- No judgment. Just math.

**Notification rule:** Optional daily reminder, user-configured, default OFF. If enabled, sent at 08:00: "You have R45/day left this week." Never sent if user already opened app that day.

---

## Loop 5: Review at Period End (The Learning Loop)

**Trigger:** Period ends.

**User need:** "What happened? Did I make it? What should I do differently?"

**NUMI behavior:**
- Show Actual vs Planned for each Category.
- Show total unspent (if any) — this is a win, not a failure to spend.
- Offer to start new Period with adjusted Assignments based on Actual.

**Tone rule:** No "score." No "you did well/badly." Just: "You planned R2,000 for Food. You spent R2,300. Next time, consider R2,500." Neutral. Factual.

---

## State-Specific Behaviors

| State | Behavior | NUMI Response |
|---|---|---|
| First Launch | Curiosity, skepticism | Minimal setup. No account. Immediate value. |
| No Period | Confusion, "what now?" | Prompt to set time horizon. Explain why. |
| Active Budgeter | Routine logging | Fast capture. Daily number visible. |
| Over-Committed | Anxiety, avoidance | Clear breakdown. Actionable fixes. No shame. |
| Recovering | Cautious optimism | Confirm progress. Updated numbers. |
| Period Ended | Reflection, reset | Summary. Suggestions. Fresh start. |
| Inactive | Guilt, fear of mess | Resume exactly where left off. No "we missed you." |

---

## Notification Strategy

**Default:** All notifications OFF. User must opt in.

**Available notifications (all optional):**
- Daily summary (08:00): "R45/day left. 12 days to go."
- Period ending soon (3 days before end): "Your [Period] ends in 3 days. R200 unspent."
- Goal deadline (1 day before): "[Goal name] deadline tomorrow. R150 to go."

**Forbidden notifications:**
- "You overspent."
- "You haven't logged in 3 days."
- Any notification with exclamation marks, emojis, or urgency.
- Any notification sent more than once per day.

---

## Widget Behavior (Premium, v2)

The home screen widget learns patterns:
- Morning: shows Daily Safe-to-Spend.
- Lunch: shows remaining for "Food" category.
- Evening: shows if any Goal deadline is near.

No AI. No predictions. Just scheduled context based on time of day and user history.

---

## The Anti-Loop

What NUMI deliberately does NOT do:
- Does not open on launch to a dashboard. Opens to the number.
- Does not require a "daily check-in." No streaks. No gamification.
- Does not send "tips" or "articles." This is a tool, not a content app.
- Does not celebrate or punish. The numbers speak.

---

## Habit Formation Principle

NUMI builds habit through **speed and clarity**, not reminders. The user returns because logging takes 3 seconds and the answer is always on screen. Notifications are a crutch for broken UX. Our goal is to need zero notifications.

---

## What Happens After This Document

These loops feed into `04_Data_Flow.md` — where data lives, how it moves, and where it transforms.

Next: docs/playbook/02_Product_Mechanics/04_Data_Flow.md