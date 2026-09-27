---
version: 2.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/01_Onboarding/Overview.md"
  - "docs/playbook/05_Features/01_Onboarding/Screens.md"
  - "docs/adr/0002-onboarding-wizard-flow.md"
decision_record: "docs/adr/0002-onboarding-wizard-flow.md"
---

# 01 — Onboarding: Flow

> The path from first tap to first answer.

> **Amended by ADR-0002.** Version 1 described splash → Home → three sheets.

---

## Flow Overview

Splash ──► Welcome ──► PIN ──► Quick Setup ──► All Set ──► Unlock ──► Home
│
└──► Skip ──────────────┘

Home is the terminal state on first launch. On every launch after the first, the
flow begins at Unlock, because the PIN hash outlives the app's in-memory state.

---

## Step 0: Splash

**Trigger:** App launch.
**Duration:** 1.5 seconds ceiling, enforced in `app/_layout.tsx` by
`SPLASH_CEILING_MS`. No tap to skip.
**Content:** Inter wordmark, `color.background`. Lightweight — no image assets,
no video.

**Exit:** Auto-advances once fonts load and the bootstrap gate resolves.

**Rules:**

- No animation longer than 1.5s. Budget phones struggle with heavy motion.

---

## Step 1: Welcome

**Route:** `/(onboarding)/welcome`
**Purpose:** Capture a display name so the app can address the user.

**Content:**

- Wordmark and tagline.
- `TextField`, centred, "What should we call you?"
- `Button` Primary: "Let's go", disabled below 2 characters.

**Rules:**

- `maxLength` 30.
- Trimmed before store.
- No keyboard avoidance bug: the field is centred, the CTA is above the fold.

**On Success:** `setUserName(name)`, then `router.replace("/pin")`.

---

## Step 2: PIN

**Route:** `/(onboarding)/pin`
**Purpose:** Let the user set a device lock.

**Mechanic — the two-phase slide.** Both phases are mounted side by side in one
`width: containerWidth * 2` row, translated on X. Capturing `containerWidth` via
`onLayout` and translating rather than remounting is what makes the transition a
slide instead of a cut. Nothing renders until `containerWidth > 0`.

1. **Create.** Four digits entered → 200ms pause → slide left.
2. **Confirm.** Four digits entered:
   - Match → SHA-256 → SecureStore `pin_hash` → `router.replace("/quick-setup")`.
   - Mismatch → error haptic, 4-step shake, 100ms, digits clear, stay on phase 2.

**Back button behaviour:**

- On phase 1 → `router.back()` to Welcome.
- On phase 2 → slide back to phase 1. Does not leave the screen.

**Shake.** `withSequence(-10, 10, -10, 0)` at 50ms each, applied to the heading
and pad only — not the whole screen, which would be disorienting.

**Rules:**

- `PIN_LENGTH` is 4.
- Error clears as soon as the next digit is pressed.
- The pad is hidden behind the phase transition, never unmounted.

---

## Step 3: Quick Setup

**Route:** `/(onboarding)/quick-setup`
**Purpose:** Create the minimum viable state, or none at all.

**Purpose-built shape.** `numi_wallet` never created a `Period`, but this domain
requires `Assignment.period_id` to reference a real one. Wallet, period, and
first budget therefore share one screen.

**Sections, in order:**

1. **Wallet** — `PillToggle` for type, `TextField` for name, `AmountInput` for
   balance. Cash or one bank, never both: `WALLET_LIMITS.free` is 1.
2. **Period** — `TextField` for name, two date buttons, inline
   `@react-native-community/datetimepicker` in `mode="date" display="inline"`,
   rendered only while a date is being picked.
3. **First budget** — the three seeded categories, each with a `±` stepper at
   R5 increments. Running total in the footer.

**Engine call order on Done.** `createWallet` → `createPeriod` → `createAssignment`
per non-zero category. This order is not arbitrary: `createPeriod` auto-closes any
existing active period, and `createAssignment` validates against wallet balance,
so the wallet must exist first.

**Actions:**

- Primary: "I'm done".
- Ghost: "Skip for now".

**Validation:**

- Wallet name non-empty.
- `endDate > startDate`.
- Total assigned ≤ wallet balance, enforced by the engine as well as the UI.

**On Skip:** create a zero-balance cash wallet so `createPeriod` and
`createAssignment` have something valid to attach to, then advance. The user
lands on Home with no period and `EmptyState variant="noPeriod"`.

**On Success:** write the summary, `router.replace("/all-set")`.

---

## Step 4: All Set

**Route:** `/(onboarding)/all-set`
**Purpose:** Confirm what was created, then hand over.

**Content:**

- Success glyph in `color.stateSafe`.
- "You're in, [name]."
- "N wallets · M budgets ready." — pluralised, never "1 wallets".
- A raised card listing up to three created lines, `tabular` numerals.
- `Button` Primary: "Open NUMI".

**On Success:** `completeOnboarding()`, then `router.replace("/auth/unlock")`.

**Back button:** an absolute chevron returns to `quick-setup`, so a user who
realises they mistyped their balance is not stranded.

---

## Step 5: Unlock

**Route:** `/(auth)/unlock`
**Purpose:** Verify the PIN on every launch after the first.

**Mechanic.** Biometric auto-trigger is **not** ported — `expo-local-authentication`
is out of scope. The pad is the whole surface.

**On success:** `router.replace("/(tabs)")`.

**On failure:** error haptic, shake, digits clear, attempt counter increments.

**After `PIN_MAX_ATTEMPTS`:** input disabled, `PIN_LOCKOUT_SECONDS` countdown, then
the pad returns. Counter lives in component state, so a kill clears it.

**Forgot PIN:** destructive, explicit, labelled. Wipes the keychain entry and the
engine's in-memory state, then routes to Welcome. It is the only escape and it is
worded so the cost is understood before the tap.

---

## Recovery Paths

| If User...                     | Then...                                                                  |
| ------------------------------ | ------------------------------------------------------------------------ |
| Goes back from PIN phase 2     | Slides to phase 1. Does not leave the screen.                            |
| Goes back from All Set         | Returns to `quick-setup`. Already-created objects are not re-created.    |
| Taps Skip on Quick Setup       | Zero-balance cash wallet, then All Set.                                  |
| Kills the app mid-onboarding   | Everything is lost. The PIN hash survives; the wallet and period do not. |
| Kills the app after onboarding | Unlocks to an empty Home. Rebuild from `EmptyState`.                     |
| Forgets the PIN                | Wipes the keychain and the engine. Back to Welcome.                      |

The third and fifth rows are the documented cost of ADR-0002 decision 6. They are
not edge cases to be handled later; they are the current behaviour.

---

## Flow Metrics (Future)

- Time to first Wallet creation.
- Time to first Safe-to-Spend display.
- Drop-off rate per step.
- PIN set rate, and unlock abandonment.

---

## What Happens After This Document

Implemented in `apps/mobile/app/(onboarding)/` and `apps/mobile/app/(auth)/`.
The bootstrap gate that chooses between them is in `apps/mobile/app/_layout.tsx`.

Next: Screens.md — the detailed screen specifications.
