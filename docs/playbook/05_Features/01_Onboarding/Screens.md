---
version: 2.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/01_Onboarding/Flow.md"
  - "docs/playbook/04_Design_System/02_Components.md"
  - "docs/adr/0002-onboarding-wizard-flow.md"
decision_record: "docs/adr/0002-onboarding-wizard-flow.md"
---

# 01 — Onboarding: Screens

> Every screen in onboarding: what it shows, why it exists, and how to leave it.

> **Amended by ADR-0002.** Version 1 specified six screens, four of which were
> sheets over Home. The app now has five full-screen routes.

---

## Screen 1: Welcome

**Route:** `/(onboarding)/welcome`

**Purpose:** Name the app to the user, and get a name for the user.

**Layout:**

- `ScreenBackground`.
- `ScreenShell` with `RadialGlow` across the top 35% and a `RingWatermark` at
  roughly 7% opacity, top-right, bleeding off the edge.
- `KeyboardAvoidingView`, `padding` on iOS.

**Content Blocks:**

### Brand

- `typography.display`, `color.textPrimary`: "NUMI"
- `typography.body`, `color.textSecondary`: "Every rand gets a job."

### Input

- `TextField`, centred, `autoFocus`, `maxLength` 30, placeholder "What should we call you?"

### Action

- `Button` Primary, full width: "Let's go". Disabled below 2 trimmed characters.

**Navigation:**

- Entry: bootstrap gate, first launch only.
- Success: `router.replace("/pin")`. Replace, not push — Back must not return to
  a name field already submitted.

**Accessibility:**

- "NUMI. Every rand gets a job. What should we call you?"

---

## Screen 2: PIN

**Route:** `/(onboarding)/pin`

**Purpose:** Set the device lock.

**Layout:**

- `ScreenShell`, `paddingBottom: 0` — the pad owns the bottom third.
- Back `Pressable` 48×48, `hitSlop` 8, top-left.
- `ProgressDots total={4} current={1}`.

**Content Blocks:**

### Phase 1 — Create

- `typography.heading2`: "Create a PIN"
- `PinDots`, 4, `radius.full`.
- `PinPad`, always visible, no OS keyboard.

### Phase 2 — Confirm

- `typography.heading2`: "Confirm your PIN"
- Same `PinDots` and `PinPad`.
- Error caption, `color.stateAlert`, only when the codes diverge.

**The slide.** One row of width `containerWidth * 2`, translated on X. Measured
from `onLayout`; nothing renders until it is non-zero. `SLIDE_DURATION` 300ms,
`Easing.out(Easing.cubic)`.

**Rules:**

- 200ms pause after the fourth digit before sliding, so the last dot paints
  before it leaves.
- 100ms pause before the shake, so the error appears with the shake rather than
  before it.
- Error haptic on mismatch. Digit haptic on press.
- Digits clear on mismatch. Error clears on the next press.

**Navigation:**

- Back on phase 1 → `router.back()`. Back on phase 2 → slide to phase 1.
- Success → `router.replace("/quick-setup")`.

---

## Screen 3: Quick Setup

**Route:** `/(onboarding)/quick-setup`

**Purpose:** Create one Wallet, one Period, and a first budget. Or none of them.

**Layout:**

- `ScreenShell`.
- `ScrollView`, `keyboardShouldPersistTaps="handled"`, `paddingBottom` clear of
  the fixed button block.
- `ProgressDots total={4} current={2}`.
- A bottom-right scroll hint, 36×36, `surfaceRaised`, only while the content is
  scrollable and not at the bottom.

**Content Blocks:**

### Eyebrow

- `typography.overline`, `color.textMuted`: "Step 3 of 4 — Optional"

### Wallet

- `PillToggle` for type. Cash, Bank, Stokvel, Savings. Bank unlocks a name
  `PillToggle` of the eight South African banks — **name only**, no brand colour.
- `TextField` for wallet name.
- `AmountInput` for balance. Own keypad, no OS keyboard.

### Period

- `TextField` for name, pre-filled "This month".
- Two `DateButton` rows — overline label above a `typography.title` date.
- Inline `DateTimePicker` in `mode="date" display="inline"`, mounted only while
  `picking` is set, so the inline wheel is never in the tree when idle.
- Dates clamped so `end > start` cannot be violated by either picker.

### First budget

- One row per seeded category: dot, name, R5 stepper, running amount.
- Footer: "Total set aside", `typography.amountLg`, `tabular`.

**Rules:**

- Cash or one bank, never both. `WALLET_LIMITS.free` is 1 and is not relaxed.
- Rand→cents goes through `randToCents` in `@numi/utils`. Never `parseFloat(x) * 100`.
- Total assigned cannot exceed wallet balance.

**Navigation:**

- Entry: from PIN.
- Done → `router.replace("/all-set")`.
- Skip → same destination, with a zero-balance cash wallet created.

**Accessibility:**

- Stepper buttons are 36px with `hitSlop` 8, so the effective target clears 48.
- Disabled primary button announces as dimmed.

---

## Screen 4: All Set

**Route:** `/(onboarding)/all-set`

**Purpose:** Confirm, then hand over.

**Layout:**

- `ScreenBackground` with a `RadialGlow` in `color.stateSafe` at 15% — the only
  green in the flow, and it appears exactly once.
- Content vertically centred.
- Back chevron, absolute, top-left, 48×48, `zIndex` above the glow.

**Content Blocks:**

### Confirmation

- Success glyph, 48px, `color.stateSafe`.
- `typography.heading1`, centred: "You're in, [name]."
- `typography.caption`, `color.textMuted`: "N wallets · M budgets ready."
  Pluralised. "1 wallets" is a defect.

### Summary card

- `Card tone="raised"`, up to three lines, `typography.amountSm`, `tabular`.
- Omitted entirely when there is nothing to show.

### Action

- `Button` Primary, full width: "Open NUMI".

**Navigation:**

- Back chevron → `router.replace("/quick-setup")`. Objects already created are
  not re-created; `createWallet` would return `TIER_LIMIT_EXCEEDED`.
- Success → `completeOnboarding()`, then `router.replace("/auth/unlock")`.

---

## Screen 5: Unlock

**Route:** `/(auth)/unlock`

**Purpose:** Verify the PIN on every launch after the first.

**Layout:**

- `ScreenBackground`.
- `ScreenShell`, centred.
- `PinDots` and `PinPad`, identical to Screen 2.
- `typography.heading1`: "Welcome back".
- Attempts remaining, `typography.caption`, `color.textMuted`.

**Rules:**

- No biometric auto-trigger. `expo-local-authentication` is out of scope.
- `PIN_MAX_ATTEMPTS` 5, `PIN_LOCKOUT_SECONDS` 30.
- Counter is component state. A kill clears it. This is a device lock, not
  threat defence, and the lockout is a speed bump rather than a control.
- During lockout the pad is disabled and the countdown is announced.

**Navigation:**

- Success → `router.replace("/(tabs)")`.
- "Forgot PIN? Reset app" → confirm, wipe the keychain entry and the engine, then
  `router.replace("/welcome")`.

---

## Component Mapping

| Screen      | Components Used                                                                           |
| ----------- | ----------------------------------------------------------------------------------------- |
| Welcome     | ScreenBackground, ScreenShell, RadialGlow, RingWatermark, TextField, Button               |
| PIN         | ScreenShell, ProgressDots, PinDots, PinPad, Button                                        |
| Quick Setup | ScreenShell, ProgressDots, PillToggle, TextField, AmountInput, PinDots-free, Card, Button |
| All Set     | ScreenBackground, RadialGlow, Card, Button, AppIcon                                       |
| Unlock      | ScreenBackground, ScreenShell, PinDots, PinPad, Button                                    |

New in ADR-0002: `ScreenShell`, `RadialGlow`, `RingWatermark`, `PinDots`, `PinPad`.
Category selection reuses the existing `BottomSheet` and `CategoryPicker` rather
than porting a `CategorySheet`.

---

## What Happens After This Document

These screens are wired in `apps/mobile/app/(onboarding)/_layout.tsx` and gated by
`apps/mobile/app/_layout.tsx`. Edge cases define what happens when things go wrong.

Next: Edge_Cases.md.
