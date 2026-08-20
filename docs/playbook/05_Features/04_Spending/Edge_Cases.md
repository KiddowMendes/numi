---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/04_Spending/Overview.md"
  - "docs/playbook/05_Features/04_Spending/Flow.md"
  - "docs/playbook/05_Features/04_Spending/Screens.md"
  - "docs/playbook/03_Architecture/04_Offline_First_Strategy.md"
  - "docs/playbook/01_Domain/04_Engine_API.md"
decision_record: none
---

# 04 — Spending: Edge Cases

> The record is never edited, never deleted, and never silent. These edges keep the ledger honest on bad days, big histories, and bad signals.

---

## EC1. No Transactions at All (Fresh Install)

**Symptoms:** User opens History with zero Transactions logged.

**Expected:**
- HistoryScreen shows Block C empty state: "No transactions yet. Log your first spend to see your money clearly."
- Filter icon still opens; applying any filter changes nothing (list stays on the empty state).
- The rest of the app works: logging, Wallets, Daily Budgeting (per Daily Budgeting EC1).

**Forbidden:** Blocking History until a Transaction exists, or routing the user into Budget Setup from the History tab.

---

## EC2. Filters or Search Yield Zero Results

**Symptoms:** Filters active but nothing matches; search query has no hits.

**Expected:**
- Filters: "No transactions match. Clear filters?" (Block C). "Clear all" resets to the default view (per Flow 2).
- Search (Premium): "No results for '[query]'." + "Try a different word or clear filters." (SearchOverlay empty state, per Screens 4).
- Zero-result states are neutral — the data is not lost, the filter is.

**Forbidden:** Shame phrasing ("You didn't spend anything?") or implying history was deleted.

---

## EC3. Extremely Large Datasets (Slow Devices, Many Transactions)

**Symptoms:** 5+ years of history, tens of thousands of Transactions; mid-range Android device.

**Expected:**
- HistoryScreen renders from in-memory state loaded at app start — no per-frame/on-scroll DB reads (per `03_Architecture/04_Offline_First_Strategy.md` load-at-start pattern).
- Lists virtualize after 50 items; scroll-to-load-more stays responsive (Flow 1).
- Search (Premium) is a local SQLite LIKE query with a 300ms debounce — no network (Flow 3).
- Re-filtering operates on the in-memory list; no DB reads per interaction (Flow 2).

**Forbidden:** Freezing the UI thread, showing a loading state on every navigation or scroll, or paging filters server-side.

---

## EC4. "This period" Filter With No Active Budget Period

**Symptoms:** No active Budget Period (fresh install or ended period — BR-S4); user selects "This period" in FilterSheet.

**Expected:**
- "This period" has no meaning without a Period, so it falls back to **All time** silently. The list shows everything, unchanged.
- No nudge, no empty state, no Budget Setup redirect — History is the honest record and keeps showing it.

**Forbidden:** Showing an empty "This period" result, prompting "Start a new budget period," or hiding the option — the filter is about dates, not about Period state.

---

## EC5. Reversing a Reversal (Double-Negative)

**Symptoms:** User reverses a Transaction that is itself a reversal (Flow 5 allows it: "User can reverse a reversal.").

**Expected:**
- Allowed. The Engine creates a new reversing Transaction referencing the reversal's ID (BR-T3, BR-T4).
- History shows the full chain: original → reversal → re-reversal. Net effect on balances is restored; Safe-to-Spend updates immediately.
- Each entry: note "Reversal of [id]" pointing at its immediate predecessor.

**Forbidden:** Merging chain entries, hiding the pair, or blocking the operation "because it nets out."

---

## EC6. Reversing a Transfer

**Symptoms:** User reverses a Transfer Transaction.

**Expected:**
- The reversal is a new **Transfer** Transaction with source and destination swapped (BR-T5: two different Wallets; BR-C2: no Category).
- Both Wallet balances update atomically by the Engine (BR-W5), and Safe-to-Spend updates immediately.
- Detail sheet shows the reversal entry as a Transfer with its own color (Screens 3), note referencing the original (BR-T4).

**Forbidden:** Reversing a Transfer as an Expense/Income pair, or a reversal that would violate BR-T5 (same Wallet both sides).

---

## EC7. Double-Tap on "Reverse"/"Confirm" (Double-Submit)

**Symptoms:** User taps "Reverse this transaction" or the confirmation "Confirm" twice in rapid succession.

**Expected:**
- Exactly one reversing Transaction is created — the second tap is ignored while the first resolves (I6).
- One toast: "Reversed." The sheet dismisses once.

**Forbidden:** Two reversal entries.

---

## EC8. Reversal While Offline

**Symptoms:** User reverses a Transaction with no connectivity (airplane mode).

**Expected:**
- Reversal works locally: the reversing Transaction is created immediately, balances and Safe-to-Spend update (I7, R4.4).
- The original and its reversal both enter the persistent sync queue **in creation order** — the queue is never reordered or dropped (OF8, OF9), so the pair syncs in sequence when connectivity returns and never appears as a lone reversal upstream.
- No "You're offline" warning, no sync spinner in History (OF10 — the queue is invisible in the core UI).

**Forbidden:** Blocking reversal offline, reordering queue items, or surfacing pending-sync counts in History.

---

## EC9. Premium Tier Lapses Mid-Session

**Symptoms:** Freemium/Premium user has a Category multi-select filter or Search active; the tier expires (R6.6).

**Expected:**
- The active view keeps working exactly as before — filters and search results stay (nothing is wiped).
- New Premium actions are blocked at the point of action with a neutral upsell: starting a new search shows the tier message at creation time (I8). "CSV export" button is disabled with the same neutral note.
- Nothing is auto-downgraded: applying a new filter simply returns the control to Free behavior (single-select Category).

**Forbidden:** Clearing the active filter, snapping the list to Free defaults, or silently deleting Premium state.

---

## EC10. Web User Views History

**Symptoms:** User opens History in the web app.

**Expected:**
- Web History is a lagged mirror of the cloud (OF2, OF6): data shown is as-of the last sync, with sync status visible (OF14).
- Web reversal attempts behave like any web edit: subject to the timestamp check — rejected with "Your phone has newer data." (OF13) when the device has newer data.
- Divergence is never silent: the user is told what state the web view is in (R6.2).

**Forbidden:** Web edits bypassing the timestamp check, "Last synced 3 days ago" hidden, or read-only hints implying the data is corrupt.

---

## EC11. Timezone or Day Boundary ("This morning" vs "Yesterday")

**Symptoms:** Device local timezone changes (travel) or a Transaction is logged at 23:55 local.

**Expected:**
- Date grouping ("Today", "Yesterday") is always computed in the device's local timezone (BR-X4 — no UTC conversion).
- A Transaction logged at 23:55 on 31 August stays on 31 August, even across a timezone change.
- If a Transaction was logged in a different timezone, it displays in the *current* local-date grouping — stored timestamps are never rewritten.

**Forbidden:** UTC conversion of stored times, regrouping by a timezone other than device-local, or editing the stored timestamp on display.

---

## EC12. User Interrupts Browsing (Closes App, Changes Tab, Loses Focus)

**Symptoms:** App backgrounded/closed while History was open; user switches tabs mid-scroll or mid-search.

**Expected:**
- Nothing is committed unless an action completed: filters, search query, and scroll position are transient and discarded quietly (I6).
- No "Resume where you left off?" modal, no draft restoration — History reopens at the default view (last 30 days, all Wallets/Categories).
- A committed reversal (or its toast) is never lost after a completed confirm.

**Forbidden:** Persisting transient filter/search state, prompting on relaunch, or auto-saving partial actions.

---

## Coverage Note (Lock Criteria)

This document meets the directory's required edge-case coverage for Spending:

| Required class | Covered by |
|---|---|
| No data | EC1 (fresh install), EC2 (zero-result filters/search) |
| Too much data | EC3 (large datasets, slow devices) |
| Offline | EC8 (offline reversal), EC10 (web lagged mirror) |
| User interruption | EC7 (double-submit), EC12 (interrupt browse/search) |

---

## What Happens After This Document

All engine-level rejection behavior for reversals is defined once in `01_Domain/04_Engine_API.md` (`reverseTransaction`, BR-T3/BR-T4 enforcement) — the UI layer consumes the result, never rewords or re-implements it.

This completes the Spending feature set (Overview, Flow, Screens, Edge Cases). The next feature document on the roadmap is `05_Debt_Tracking/Overview.md`.