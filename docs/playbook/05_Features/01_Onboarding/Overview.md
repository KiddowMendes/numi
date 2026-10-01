---
version: 2.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/02_Product_Mechanics/02_User_States.md"
  - "docs/playbook/04_Design_System/03_Patterns.md"
  - "docs/playbook/05_Features/01_Onboarding/Flow.md"
decision_record: "docs/adr/0002-onboarding-wizard-flow.md"
---

# 01 — Onboarding: Overview

> The first 60 seconds. No tutorial. No account wall. Just the fastest path to "Will my money last?"

> **Amended by ADR-0002.** Version 1 described a six-screen, sheet-based flow over
> Home and ruled out account creation. The flow is now four full-screen routes
> with a local device PIN. The PIN is a lock on a phone already in the user's
> pocket — no email, no phone number, no server, no recovery address.

---

## User Problem

"I just downloaded this app. I don't know if it's for me. I don't want to create an account. I just want to see if it works."

---

## What Onboarding Does

1. Validates the user's choice to download NUMI in under 3 seconds.
2. Creates the minimum viable state to answer "Will my money last?" (1 Wallet + 1 Period).
3. Asks for a name and a 4-digit PIN, both stored on the device only.
4. Never asks for personal data beyond a display name, internet, or payment.

---

## Lens Mapping

| Lens        | Served? | How                                                                      |
| ----------- | ------- | ------------------------------------------------------------------------ |
| **Current** | Yes     | Safe-to-Spend appears as soon as the Period is created in `quick-setup`. |
| **Planned** | Yes     | User assigns money to Categories in `quick-setup`.                       |
| **Actual**  | No      | No transactions yet. Actual is empty.                                    |

---

## Success Criteria

- User sees Safe-to-Spend within 60 seconds of first app open.
- `quick-setup` is skippable in full. A user who taps Skip twice reaches the app.
- No account creation, no email, no phone number, no server round trip.
- The name and the PIN never leave the device.

---

## The PIN Is Not An Account

This is the distinction the whole flow turns on, so it is stated explicitly.

| It is                                | It is not                           |
| ------------------------------------ | ----------------------------------- |
| A 4-digit code the user chooses      | A credential for anything           |
| Hashed with SHA-256                  | Hashed and transmitted              |
| Stored in the device keychain        | Stored on a server                  |
| Verified locally to open the app     | Verified by an identity provider    |
| Forgettable, with a reset that wipes | Recoverable, with a support contact |

`ADR-0001 §7` correctly refused a PIN on the grounds that a PIN implies an
identity model, a schema migration, an auth layer, and a network dependency in
order to satisfy FICA/RICA obligations that do not apply to NUMI. None of that
applies here. There is no identity, no schema, no auth layer, and no network.

`PROJECT_BRIEF.md` requires the app work "without an internet connection,
account, or subscription" and is **not amended** by ADR-0002. This document reads
"no account" as satisfied, because nothing here is an account. If the owner reads
that criterion as absolute, ADR-0002 is wrong and should be reversed there.

---

## Tier Behavior

| Tier         | Onboarding Difference                                                               |
| ------------ | ----------------------------------------------------------------------------------- |
| **Free**     | Default. 1 Wallet — so `quick-setup` offers cash _or_ one bank, not both. No Goals. |
| **Freemium** | Prompted to create an account _after_ onboarding complete. Not before.              |
| **Premium**  | Same as Free until onboarding is done.                                              |

---

## Out of Scope

Carried forward from version 1, unchanged:

- Tutorial carousel — the `stories-carousel` screen in `numi_wallet` is **not**
  ported.
- Tooltips or coach marks
- Bank linking or import
- Demo data
- Video or animated explainer

Still out of scope as of ADR-0002:

- **Persistence.** Onboarding state is in memory. A returning user unlocks to an
  empty app. This is decision 6 of ADR-0002 and it is temporary.
- Bank brand colours or card art. `Wallet` has no `bankId`.
- Biometric unlock.

---

## What Happens After This Document

Onboarding is implemented as four routes in `apps/mobile/app/(onboarding)/` plus
an unlock gate in `apps/mobile/app/(auth)/unlock.tsx`. The theme preference lives
in Settings, not onboarding.

Next: Flow.md — the step-by-step journey.
