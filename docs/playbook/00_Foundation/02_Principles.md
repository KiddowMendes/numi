---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/00_Foundation/01_Manifesto.md"
  - "docs/playbook/01_Domain/01_Entities.md"
  - "docs/playbook/03_Architecture/04_Offline_First_Strategy.md"
decision_record: none
---

# 02 — Principles

> The Manifesto says *why*. This document says *how* — the operational rules that every technical decision must obey.

---

## 1. Agency, Not Automation

### Rules
- **R1.1** — NUMI never auto-categorizes a transaction. The user must confirm or assign the category. Suggestions are permitted; silent assignments are forbidden.
- **R1.2** — NUMI never auto-saves money into a goal or reserve. The user must explicitly move funds.
- **R1.3** — NUMI never blocks, declines, or warns against a transaction in a way that feels like a parental lock. It may surface consequences ("This leaves R0 for transport"), but the user decides.
- **R1.4** — Every notification must be actionable information, not a nudge or shame tactic. "You have R150 left for food this week" is allowed. "You overspent again" is forbidden.

---

## 2. Visibility in the Moment

### Rules
- **R2.1** — The safe-to-spend number must be visible within **two taps** from app open. No navigation menu, no loading screen, no sync spinner blocking the view.
- **R2.2** — Transaction logging must complete in a single screen. No multi-step wizard for a R20 purchase.
- **R2.3** — All numbers must update in real time. If I log a transaction, the safe-to-spend number must change before I leave the screen. No "refresh to see updates."
- **R2.4** — The app must be readable in direct sunlight. High contrast, large fonts, no grey-on-grey minimalism. This is a tool, not an art gallery.

---

## 3. Free Core, Funded Future

### Rules
- **R3.1** — **Transactions are unlimited** on all tiers. Gating the core loop is forbidden.
- **R3.2** — **Categories are unlimited** on all tiers. Classifying spending is basic hygiene, not a premium feature.
- **R3.3** — Free tier: **1 Wallet** (Cash Wallet). Freemium: **3 Wallets**. Premium: **Unlimited Wallets**.
- **R3.4** — Free tier: **0 Goals**. Freemium: **3 Goals**. Premium: **Unlimited Goals**.
- **R3.5** — Free tier: **No web access**. Freemium: **Web view, lagged, read-mostly**. Premium: **Real-time sync + full web editing**.
- **R3.6** — Free tier: **Self-service export of raw data (device backup)**. Freemium: **JSON backup only**. Premium: **CSV, PDF, and structured export**. Export formats other than the raw backup are tier-gated.
- **R3.7** — Debt tracking is a **Premium feature** (v2 scope). It is explicitly excluded from Free and Freemium.
- **R3.8** — A user's own data — transaction history, categories, amounts — may never be held hostage behind a paywall. Export of *your own data* must be possible even if the app is uninstalled and reinstalled.

---

## 4. No Shame, No Surveillance

### Rules
- **R4.1** — No tracking pixels. No analytics that identify individual users. Aggregate event counts only (e.g., "transaction logged") with no user ID attached.
- **R4.2** — No social features. No leaderboards, no "you spent more than your friends," no sharing to social media.
- **R4.3** — Error messages must be neutral. "Insufficient funds in this category" is allowed. "You can't afford this" is forbidden.
- **R4.4** — The app must work in **airplane mode** indefinitely. No nagging to "connect to get the full experience."

---

## 5. Built for Small Amounts

### Rules
- **R5.1** — Currency input must accept **no decimal places** by default. South African cash transactions happen in whole Rands. (Cents may be toggled for bank tracking, but the default is Rand-only.)
- **R5.2** — The smallest possible transaction is **R1**. The app must not treat small transactions as noise.
- **R5.3** — Performance target: smooth on a **R1,500–R2,500 Android device** with 2GB RAM. If it lags on a budget phone, the implementation has failed.
- **R5.4** — App install size must stay under **50MB** on mobile. Data is expensive and storage is scarce.

---

## 6. The Device is the Source of Truth

### Rules
- **R6.1** — The local database on the phone is the **authoritative ledger**. Cloud is a mirror, not a master.
- **R6.2** — When web and device disagree, the **device wins silently, but the user is notified**. The web app must display: *"Your phone has newer data. Sync to see the latest."*
- **R6.3** — The web app must go **read-only** when it detects stale data. No edits allowed on a lagged mirror.
- **R6.4** — Sync must be **user-initiated or scheduled**, never blocking. The app must never freeze while "syncing."
- **R6.5** — Conflict resolution is simple: **last write from the device wins**. No complex merge algorithms. If the user logs a transaction offline and another on web, the device transaction wins and the web edit is rejected with a clear message.
- **R6.6** — A user must be able to **delete their cloud account and keep all local data**. Unsubscribing from Premium must never delete local history.

---

## 7. Current, Planned, Actual

### Rules
- **R7.1** — Every screen must declare which lens it serves. If a screen serves none, it does not ship.
- **R7.2** — **Current** is the default view. It is the home screen. It is what the user sees when they open the app.
- **R7.3** — **Planned** must show tension, not just allocation. "R1,000 allocated to food, R600 spent, 12 days remaining" is more useful than "R400 left."
- **R7.4** — **Actual** is for learning, not judgment. No red/green color coding that implies good/bad. Use neutral blues and oranges. Surplus and shortfall are facts, not grades.
- **R7.5** — The three lenses must use **consistent math**. If Current + Planned + Actual do not reconcile, there is a bug in the engine, not the UI.

---

## 8. Wallets (The NUMI Card Rule)

### Rules
- **R8.1** — A Wallet is a **manual representation** of real-world money. It is never linked to a bank. The user creates it, names it, and tracks it.
- **R8.2** — Wallets may represent: cash, a bank account (tracked manually), a stokvel pool, a savings jar, or informal debt (mashonisa).
- **R8.3** — Money must be able to move between wallets without leaving the app. "Transfer R200 from Cash Wallet to Stokvel Wallet" is a valid transaction.
- **R8.4** — Every transaction must be assigned to exactly one Wallet. No "global" transactions that bypass the wallet system.

---

## 9. The One Sentence Test

Before any feature is added to the backlog, it must pass this test:

> *"Does this feature make invisible spending visible in the moment, or does it add complexity for the sake of completeness?"*

If the answer is the latter, the feature is cut.

---

## Enforcement

These rules are not guidelines. They are gates:

- **Design review:** Every screen mock must cite the principle it serves.
- **Code review:** Every PR must declare which rules it obeys or modifies.
- **Feature review:** If a feature violates a principle, the feature is cut or the principle is formally revised (requires ADR).

---

## What Happens After This Document

This document is locked until v1 ships. Violations discovered during development must be fixed or escalated to an ADR. No silent exceptions.

Next: `docs/playbook/00_Foundation/03_Glossary.md` — the shared language of NUMI.
