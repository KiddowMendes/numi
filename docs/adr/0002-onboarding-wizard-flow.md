---
type: adr
id: ADR-0002
title: Onboarding becomes a four-step wizard with a device PIN lock
status: Accepted
date: 2026-09-25
owner: Elton Pascoal
decides:
  - "docs/playbook/05_Features/01_Onboarding/Overview.md"
  - "docs/playbook/05_Features/01_Onboarding/Flow.md"
  - "docs/playbook/05_Features/01_Onboarding/Screens.md"
supersedes:
  - "ADR-0001 section 6 (onboarding is three routes)"
  - "ADR-0001 section 7 (GoTyme onboarding flow rejected as a reference)"
relates_to:
  - "docs/adr/0001-design-system-reset.md"
  - "docs/context/PROJECT_BRIEF.md"
  - "docs/playbook/04_Design_System/02_Components.md"
  - "docs/playbook/03_Architecture/03_Monorepo_Structure.md"
---

# ADR-0002 — Onboarding becomes a four-step wizard with a device PIN lock

## Context

A prior implementation of NUMI exists at `numi_wallet` (branch `ui/ux`). Its
onboarding is a four-step wizard, and it is materially more developed than
anything in this repo: it has been run, and it has a working PIN gate, a
tactile keypad, and an optional-setup screen that a first-time user can skip.

Its flow is:

| Step | Route         | What it does                                                           |
| ---- | ------------- | ---------------------------------------------------------------------- |
| 1    | `welcome`     | Captures a display name                                                |
| 2    | `pin`         | 4-digit PIN, create-then-confirm, SHA-256 into the device keychain     |
| 3    | `quick-setup` | Optional. Cash, bank card deck, running total, first budget. Skippable |
| 4    | `all-set`     | Celebration and summary                                                |

It could not be lifted as written. Every layer it depends on is absent here:

- `useUserStore.createUser` — this engine has no user creation. `User` is
  `{ id, tier }`.
- SQLite plus a `hydrateUser()` boot sequence — **this app has no persistence at
  all.** `isOnboarded` is in-memory zustand state that resets on every cold
  launch, and `@numi/database` is a declared dependency that no app code imports.
- `expo-secure-store`, `expo-crypto`, `expo-haptics` — none are dependencies.
- `ScreenShell`, `PINPad`, `RadialGradient`, `RingWatermark`, `CategorySheet` —
  none exist. Seventeen different components do.
- `useColors()` and a `ThemeContext` — this repo uses `@/constants/tokens` with
  `useTheme()`, Inter rather than Roboto, Phosphor rather than Lucide.
- NativeWind `className` — this repo styles with `StyleSheet` and has no
  NativeWind installed.
- A multi-wallet card deck — `WALLET_LIMITS.free` is `1`
  (`packages/domain/src/calculations/tier-limit.ts`) and the user is hardcoded
  `tier: "free"` in `store/provider.tsx`.
- `Wallet.bankId` and per-bank brand colours — the `Wallet` entity is
  `{ id, name, type, balance, currency, created_at }`. It has no `bankId`.
- `Math.round(parseFloat(x) * 100)` inline in its screens — **forbidden here.**
  Cents conversion happens only in `packages/utils/src/currency.ts`.

Two decisions in ADR-0001 also stood in the way, and are superseded by this
record rather than contradicted by it.

**ADR-0001 §6** decided that "onboarding is three routes", on the reasoning that
the wallet questions and the theme choice sharing one screen was what stopped it
reading as a wizard.

**ADR-0001 §7** rejected a GoTyme-style onboarding by name, and specifically
ruled out PIN setup. Its reasoning is sound and is largely preserved here: NUMI
is not a bank, holds no funds, and opens no account. GoTyme's mobile number,
personal information, biometric KYC against government ID, tax residency
declaration, and PIN exist because GoTyme opens a **regulated bank account**.
FICA/RICA and BSP obligations do not apply to NUMI, and this record adopts none
of them.

What §7 did not anticipate is that the same step could arrive from a different
direction — a user-authored lock on their own device, with no identity model, no
schema change, and no network. That is a different thing from the obligation it
correctly refused, and it is what is being adopted.

## Decision

### 1. Onboarding is four routes

`welcome` → `pin` → `quick-setup` → `all-set`, each a full-screen route, followed
by an `(auth)/unlock` gate on subsequent launches.

The three routes ADR-0001 §6 installed are removed. The theme preference moves
from the wallet screen into `SettingsScreen`, where the ADR-0001 §6 rationale for
putting it in onboarding does not apply: it was there because the first screen
was the only place a new user would pass through, and a wizard has a first
screen by definition.

### 2. The three routes collapse into one `quick-setup` screen

`quick-setup` absorbs wallet creation, period creation, and the first budget
into a single scrollable screen, keeping the original's Done and Skip paths.

This collapse is forced rather than chosen. The `numi_wallet` flow never created
a `Period`, but this domain requires `Assignment.period_id` to reference a real
one, so a port of that flow cannot create an assignment without also creating a
period. Folding the period in is the smallest change that keeps the domain
valid. It also happens to serve §6's actual concern — one long screen with
optional content does not read as a wizard.

The skipped path lands on Home with no period. `(tabs)/index.tsx` already
handles this via `EmptyState variant="noPeriod"`.

### 3. One wallet, not a deck

The picker offers **cash or one bank, not both.** `WALLET_LIMITS.free` stays `1`
and `store/provider.tsx` keeps `tier: "free"`. The `WALLET_LIMITS` rule and its
tests are untouched.

The bank list is **name only.** Brand colours and card initials have nowhere to
live: `Wallet` has no `bankId`, and adding one means editing a fully-tested
domain entity to carry a presentation concern. `numi_wallet` hardcoded eight
South African banks in a constant for this reason.

### 4. The three seeded categories stand

`quick-setup` offers the existing three seeds — Food, Transport, Entertainment.
`numi_wallet` offered six from a sixteen-category constant. The seeds in
`store/provider.tsx` are left alone, so the engine's initial `AppState` is
unchanged.

### 5. The PIN is a device lock, stored in the keychain

`expo-haptics`, `expo-secure-store`, and `expo-crypto` are added. The PIN is
hashed with SHA-256 and written to SecureStore under the key `pin_hash` — the key
`numi_wallet` actually used, not the `numi_pin_hash` its own documentation
claimed.

This is a lock on a phone that is already in the user's pocket. It is not an
account. There is no email address, no phone number, no server, no recovery
address, and no network call. ADR-0001 §7's objection to a PIN is that it implies
an identity model; nothing here implies one.

`isOnboarded` becomes explicit rather than derived. It is currently computed in
`setEngine` as `!!activePeriod && (assignments.length > 0 || transactions.length > 0)`,
which cannot express a flow that completes without a period.

### 6. Onboarding state is in memory. Persistence is deferred.

**This is a deliberate, temporary decision and it produces a known-bad steady
state.** Because the PIN hash lives in SecureStore but the wallet and period live
only in zustand, a returning user unlocks to an empty Home and rebuilds from
`EmptyState`. The PIN lock persists; the data it protects does not.

Wiring `@numi/database` — hydrate the engine from `Repository` at boot, persist on
every mutation — is the correct fix and is **not** in this slice. It carries its
own spec.

### 7. What is still out of scope

Carried forward from `01_Onboarding/Overview.md` and unchanged: no tutorial
carousel, no coach marks, no bank linking or import, no demo data, no video
explainer. `numi_wallet`'s `stories-carousel` is **not** ported.

## Consequences

**Positive**

- The PIN pad, the create-then-confirm slide, the mismatch shake, the
  error haptic, and the optional-setup-with-skip screen all become reachable
  in this app, having been built and run once already.
- `quick-setup` is a single screen, so the domain gets a wallet, a period, and
  assignments without a three-route wizard.
- No schema migration, no auth layer, no network dependency, no identity model.

**Negative**

- Onboarding re-runs on every cold launch until persistence lands. This is the
  cost of decision 6 and it is not a state to ship.
- Three native dependencies added to reach a screen. None is exercised by the
  build, lint, type-check, or unit-test gates — they are proven only on device.
- The theme preference loses its onboarding home and is reachable only from
  Settings on a first run.
- A returning user sees a PIN prompt guarding an empty app, which reads as
  broken even though it is the documented state.

**Neutral**

- `01_Onboarding/Edge_Cases.md` was never written for either flow shape and
  remains unwritten.
- `03_Monorepo_Structure.md` was already stale before this record — it lists
  `packages/database` as not created, and `App.tsx` and `index.js` as entries.
  It is amended here only where this change adds or removes something.

**Departure from `PROJECT_BRIEF.md`.** The brief is stamped _"Locked — immutable
until v1 ships"_ and requires the app work _"without an internet connection,
account, or subscription."_ A PIN and a display name are a departure from its
"no account creation" success criterion. This record treats the PIN as a local
device lock rather than an account, which keeps the brief's substance — nothing
leaves the phone, there is no account wall — while accepting a narrower reading
of the word. **The brief has not been amended.** If the owner reads that
criterion as absolute, this decision is wrong and should be reversed here rather
than in the code.

## Note on numbering

ADR-0001 §9 asks that numbering continue from `0002`. This record takes `0002`.
It supersedes two numbered sections of ADR-0001, not the record as a whole: the
palette, the token move, the accent work, and the component retirements in §1–§5
stand unchanged.
