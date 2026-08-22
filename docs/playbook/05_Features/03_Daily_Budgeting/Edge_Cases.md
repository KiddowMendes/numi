---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/03_Daily_Budgeting/Overview.md"
  - "docs/playbook/03_Architecture/04_Offline_First_Strategy.md"
  - "docs/playbook/01_Domain/04_Engine_API.md"
decision_record: none
---

# 03 — Daily Budgeting: Edge Cases

> The fast path is the product. These edges are what keep it fast — being rare is not a license to be slow or shameful.

---

## EC1. No Period Exists (Fresh Install or Ended Period)

**Symptoms:** SafeToSpendHero shows "--" and "No active budget period."

**Expected:**
- Logging still works (Expense, Income, Transfer all available) — Transactions with no Period are permitted (BR-A4 only binds Assignments).
- Wallet balances still count and display correctly.
- A soft, dismissible prompt nudge appears: "Start a new budget period to see your daily plan." Dismissal persists (suppressed via local flag).

**Forbidden:** Disabling the FAB, blocking logging, or routing the user into Budget Setup on every launch.

---

## EC2. Expense Exceeds Available Balance

**Symptoms:** User logs an expense larger than the Wallet's available balance; Safe-to-Spend would go negative.

**Expected:**
- v1 engine policy (C12): hard reject — `INSUFFICIENT_BALANCE`. Inline error under AmountInput: "You don't have enough available in this wallet." Input shake, Save disabled until corrected.
- No income minus expense direction policy — income is logged as its own Transaction; expenses are checked against available balance only.

**Forbidden:** Pushy warning dialogs ("Are you sure?") or shame phrasing ("You can't afford this"). Errors must be neutral (R4.3).

---

## EC3. Amount Is Missing, Zero, or Invalid

**Symptoms:** Empty field, `0`, negative, malformed input (e.g. two decimal points).

**Expected:**
- Save stays disabled until a valid positive amount is present (BR-T1).
- AmountInput restricts bad characters on entry; failures are silent-until-submit, then inline.

**Forbidden:** Submitting then showing a generic failure toast.

---

## EC4. Transfer Uses the Same Wallet Twice

**Symptoms:** From and To selectors both point at the same Wallet.

**Expected:** Save disabled; inline error "Choose two different wallets" (BR-T5, C11).

---

## EC5. User Interrupts the Log (Clicks X, Kills App, Loses Focus)

**Symptoms:** Sheet closed mid-typing; app backgrounded or killed while the sheet was open.

**Expected:**
- No Transaction is committed unless "Save" was tapped.
- Unsaved input is discarded quietly — no "Resume draft?" modal; that friction would kill speed (I6).
- If amount AND category were entered (the draft is plausibly complete), the draft is retained in memory only and discarded on app exit — no persistence.

**Forbidden:** Persisting drafts, prompting on relaunch, or auto-saving partial input.

---

## EC6. Duplicate Tap on Save (Double-Submit)

**Symptoms:** User taps Save twice in rapid succession.

**Expected:**
- Save debounces: second tap ignored while the first is resolving (I6).
- Exactly one Transaction created — the toast fires once.

**Forbidden:** Two Transactions.

---

## EC7. Last Category in Use Cannot Be Deleted While Referenced

**Symptoms:** User tries to delete a Category that past Transactions or Assignments reference, from the Home screen's Category list long-press (future) or Settings.

**Expected:** Deletion rejected (BR-C3); inline toast "Move or delete its transactions first."

---

## EC8. Tier Limits Hit at Creation Time

**Symptoms:** Free user has 1 Wallet and tries to create another, or tries to create a second Goal.

**Expected:** Creation rejected at the point of creation (I8, BR-TR1) with a neutral upsell: "Wallets are capped at 1 on the Free plan." (BR-W4.)

**Forbidden:** Creating the object and then auto-downgrading, or silently deleting existing objects.

---

## EC9. Duplicate Transaction (User Logs the Same Expense Twice)

**Symptoms:** Same amount, same Category, same Wallet, minutes apart.

**Expected:** Allowed. No dedupe — the user may legitimately have spent twice (e.g. two coffees) (BR-T2 allows duplicates). History shows both.

**Forbidden:** Silent merging or "Looks like a duplicate?" interference.

---

## EC10. App Runs Entirely Offline (Airplane Mode, No Network Ever)

**Symptoms:** No connectivity; possibly never connected.

**Expected:**
- Core loop fully functional: logging, balances, Safe-to-Spend, breakdown — all local (R4.4, I7).
- Deferred sync queue holds outgoing changes; queue length is invisible in the core UI (per `03_Architecture/04_Offline_First_Strategy.md`).
- No offline banner, no "You're offline" nag, no degraded styling on the core screen.

**Forbidden:** Blocking logging, showing sync spinners, or warning bars that imply the app is broken.

---

## EC11. Sync Conflict When Connectivity Returns

**Symptoms:** User edited Assignments on web while mobile was offline; mobile's offline Transactions now arrive.

**Expected:** Last write from the device wins (R6.5). The mobile Transaction stands; the conflicting web edit is rejected with a clear, neutral message "Your phone has newer data." (OF13).

**Forbidden:** Merge screens, conflict pickers, or silently dropping either change.

---

## EC12. Extremely Large Datasets (Slow Devices, Many Transactions)

**Symptoms:** 5+ years of history, tens of thousands of Transactions; mid-range Android device.

**Expected:**
- HomeScreen renders from in-memory state — no per-frame DB reads (per `04_Offline_First_Strategy.md` load-at-start pattern).
- Lists virtualize; breakdown math is cached and invalidated on write, not recomputed on read (C5 constant-time lookup).

**Forbidden:** Freezing the UI thread, or showing a loading state on every navigation.

---

## Coverage Note (Lock Criteria)

This document meets the directory's required edge-case coverage for Daily Budgeting:

| Required class | Covered by |
|---|---|
| No data | EC1 (no Period / fresh install) |
| Too much data | EC12 (large datasets) |
| Offline | EC10 (airplane mode), EC11 (sync conflicts) |
| User interruption | EC5 (mid-log interruption), EC6 (double-submit) |

---

## What Happens After This Document

All engine-level rejection messages (INSUFFICIENT_BALANCE, INVALID_TRANSFER, etc.) are defined once in `01_Domain/04_Engine_API.md` — the UI layers consume them, never reword them.

This completes the Daily Budgeting feature set (Overview, Flow, Screens, Edge Cases). The next feature document on the roadmap is `04_Spending/Edge_Cases.md`.