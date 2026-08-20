---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/context/PROJECT_BRIEF.md"
  - "docs/playbook/05_Features/01_Onboarding/Overview.md"
  - "docs/playbook/05_Features/03_Daily_Budgeting/Overview.md"
decision_record: none
---

# 01 — MVP Scope

> The smallest thing that delivers value. Everything else is a distraction.

---

## MVP Definition

NUMI v1 is usable when a person can:
1. Download the app, create a Wallet, and create a Period without friction.
2. See a daily Safe-to-Spend number that updates in real time.
3. Log income and expenses in under 5 seconds.
4. Review what happened when a Period ends.
5. Do all of this offline, without an account, forever.

---

## In Scope (v1)

| Feature | Why It Ships |
|---|---|
| Onboarding (Wallet + Period creation) | Without this, nothing else works. |
| Daily Budgeting (log transactions, see Safe-to-Spend) | The core loop. The reason NUMI exists. |
| Budget Setup (create, close, extend Periods) | Money arrives irregularly. Periods must be flexible. |
| Spending (transaction history, reverse) | The honest record. Builds trust. |
| Review (Period summary, Planned vs Actual) | The learning loop. Closes the cycle. |
| Free tier (1 Wallet, unlimited transactions) | The mission. Free for everyone. |
| Offline-first (SQLite, no cloud) | The default. Privacy and accessibility. |

---

## Explicitly Out of Scope (v1)

| Feature | Deferred To | Why It Waits |
|---|---|---|
| Goals | v1.1 or v2 | Organizational feature, not survival. |
| Debt tracking | v2 | Complex, emotionally heavy, Premium. |
| Voice logging | v2 | Premium, AI cost, not core. |
| Widgets | v2 | Platform-specific, Premium. |
| Cloud sync | v2 | Requires backend, Premium funding. |
| Web app (full) | v2 | Freemium/Premium feature. |
| CSV / PDF export | v2 | Premium power tool. |
| Family sharing | v2 | Multi-user complexity. |
| Charts / trends | v2 | Nice-to-have, not need-to-have. |
| Bank linking | Never | Violates Manifesto Principle 1 (Agency). |
| Ads | Never | Violates Principle 4 (No Surveillance). |
| Social features | Never | Violates Principle 4. |

---

## MVP Success Criteria

- [ ] App launches to Safe-to-Spend in under 2 seconds on a R2,000 Android device.
- [ ] Transaction logging completes in one screen, under 5 seconds.
- [ ] No crashes in 7 days of daily use.
- [ ] User can use the app for 30 days without creating an account.
- [ ] App size under 50MB.

---

## What "Shipped" Means

v1 ships when it is on the Play Store and App Store as a free download. Not when it is perfect. Not when it has every feature. When it reliably does the five things listed above.

---

## What Happens After This Document

MVP scope is the guardrail. If a feature is not on this list, it does not ship in v1. Next: Phases — what comes after v1.