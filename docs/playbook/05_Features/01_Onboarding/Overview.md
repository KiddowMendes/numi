---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/02_Product_Mechanics/02_User_States.md"
  - "docs/playbook/04_Design_System/03_Patterns.md"
  - "docs/playbook/05_Features/01_Onboarding/Flow.md"
decision_record: none
---

# 01 — Onboarding: Overview

> The first 60 seconds. No tutorial. No account wall. Just the fastest path to "Will my money last?"

---

## User Problem

"I just downloaded this app. I don't know if it's for me. I don't want to create an account. I just want to see if it works."

---

## What Onboarding Does

1. Validates the user's choice to download NUMI in under 3 seconds.
2. Creates the minimum viable state to answer "Will my money last?" (1 Wallet + 1 Period).
3. Never asks for personal data, internet, or payment.

---

## Lens Mapping

| Lens | Served? | How |
|---|---|---|
| **Current** | Yes | Safe-to-Spend appears as soon as Period is created. |
| **Planned** | Yes | User assigns money to Categories during setup. |
| **Actual** | No | No transactions yet. Actual is empty. |

---

## Success Criteria

- User sees Safe-to-Spend within 60 seconds of first app open.
- Zero screens before the first Wallet creation.
- No account creation, no email, no phone number.
- User can skip Period creation and still use the app (Safe-to-Spend shows "--").

---

## Tier Behavior

| Tier | Onboarding Difference |
|---|---|
| **Free** | Default. 1 Wallet. No Goals. |
| **Freemium** | Prompted to create account *after* onboarding complete. Not before. |
| **Premium** | Same as Free until onboarding is done. |

---

## Out of Scope

- Tutorial carousel
- Tooltips or coach marks
- Bank linking or import
- Demo data
- Video or animated explainer

---

## What Happens After This Document

Onboarding is implemented as the default route in `apps/mobile/src/screens/` and `apps/web/app/page.tsx`. It is the first thing a user sees.

Next: Flow.md — the step-by-step journey.