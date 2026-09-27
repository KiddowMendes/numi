---
version: 2.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/01_Onboarding/Flow.md"
  - "docs/playbook/05_Features/01_Onboarding/Screens.md"
  - "docs/adr/0002-onboarding-wizard-flow.md"
decision_record: "docs/adr/0002-onboarding-wizard-flow.md"
---

# 01 — Onboarding: Edge Cases

> What happens when the user does the unexpected, the phone fails, or reality interrupts.

> **Amended by ADR-0002.** Version 1 assumed a local database and a six-screen
> sheet flow. Four cases below were rewritten because in-memory state makes them
> impossible as written, and five PIN cases are new.

---

## EC1. App Killed During Quick Setup

**Scenario:** User is partway through `quick-setup` — wallet named, period dates
chosen, two categories stepped up. App is killed.

**State on Relaunch:**

- Nothing exists. Onboarding state is in zustand and does not survive a kill.
- The PIN hash does survive, in the keychain. The user lands on `unlock`, not
  `welcome`.

**Behavior:**

- Unlock, then an empty Home with `EmptyState variant="noWallet"`.
- **"Forgot PIN? Reset app" is the clean way out** and returns to `welcome`.
- No recovery prompt, no draft preservation. This is the documented cost of
  ADR-0002 decision 6 and is not a defect to be fixed in this slice.

---

## EC2. App Killed After Onboarding Completes

**Scenario:** User reaches Home, kills the app, relaunches.

**State on Relaunch:**

- `pin_hash` present in the keychain. Wallet, period, and assignments are gone.

**Behavior:**

- `unlock` is shown. Correct PIN → empty Home with `EmptyState`.
- This reads as broken, and it is the current behaviour. It resolves when
  `@numi/database` is wired in.

---

## EC3. User Enters Negative Starting Balance

**Trigger:** Quick Setup, `AmountInput`.

**Behavior:**

- `AmountInput` regex is `/^\d*\.?\d{0,2}$/` — a minus sign cannot be entered.
- Defence in depth: the engine returns `INVALID_STATE`, the screen shows
  "Balance cannot be negative.", and the primary button is disabled.
- Rand→cents conversion goes through `randToCents`, never `parseFloat(x) * 100`.

---

## EC4. User Sets End Date Before Start Date

**Trigger:** Quick Setup, date buttons.

**Behavior:**

- The inline picker clamps on change. Picking an end date at or before the start
  date moves it to the following day.
- If a period somehow arrives with `end <= start`, the screen shows
  "End date must be after start date." and the primary button is disabled.
- Error clears when the date is corrected.

---

## EC5. User Assigns More Than Wallet Balance

**Trigger:** Quick Setup, first-budget steppers.

**Behavior:**

- Stepper clamps at 0 going down and at wallet balance going up.
- If the total still exceeds the balance, the engine returns
  `INSUFFICIENT_BALANCE`. Inline error: "You only have R[balance] in this wallet."
- Primary button disabled. Error clears when the total is valid.

---

## EC6. User Skips Quick Setup

**Scenario:** User taps "Skip for now" on the Quick Setup footer.

**Behavior:**

- A zero-balance cash wallet is created, so `createPeriod` and `createAssignment`
  have a valid parent. This is not optional bookkeeping — the engine rejects an
  assignment against a missing wallet.
- No period. No assignments.
- `all-set` shows "1 wallet · 0 budgets ready."
- Home shows `EmptyState variant="noPeriod"`. The user can build from there.

**Rules:**

- The PIN step is **not** skippable. It is the one mandatory step.
- The name step is not skippable either, but it costs one field.

---

## EC7. User Creates Wallet Then Deletes It Immediately

**Scenario:** User creates a wallet, then finds a delete affordance in Settings.

**Behavior:**

- Confirmation sheet: "Delete 'Cash Wallet'? This cannot be undone."
- On confirm: wallet deleted, Home returns to `EmptyState`.
- Any period that referenced it is closed or archived. Orphaned periods are not
  allowed.

**Caveat for the current slice:** `WALLET_LIMITS.free` is 1 and there is no
delete path implemented yet. This case is specified, not built.

---

## EC8. Device Rotation During Setup

**Scenario:** User rotates the phone during `quick-setup`.

**Behavior:**

- Scroll position and every field value are preserved.
- The inline date picker is dismissed on rotation rather than restored in a
  half-open state.
- The PIN phase slide is not re-evaluated — `containerWidth` is re-measured on
  layout, so the row re-centres without a flash.

---

## EC9. Low Memory / Budget Phone

**Scenario:** App launched on a 2GB device.

**Behavior:**

- Splash shows. Lightweight — no image assets, no video.
- `useReducedMotion` is honoured: the PIN phase slide becomes a cut, the shake is
  skipped, and the mismatch error text still appears.
- The PIN slide is `withTiming`, not `Animated.spring`. `02_Components.md` is
  explicit: no bounces, springs, or elastic overshoot.

---

## EC10. No Storage Space

**Scenario:** Device storage full during onboarding.

**Behavior:**

- **Not applicable in this slice.** There is no database write. All onboarding
  state is in memory and the only keychain write is a 64-character hash, which
  cannot fail for lack of space.
- The keychain failure path is EC19.

---

## EC11. Web App First Visit

**Scenario:** User opens the web app before installing mobile.

**Behavior:**

- Web shows a static landing page: "NUMI works best on your phone."
- "Continue on web" is Freemium/Premium only and requires an account.
- Free tier cannot use web without a mobile device.
- `apps/web` does not consume `@numi/design-system` and is still the Turbopack
  template. This case is specified, not built.

---

## EC12. User Reinstalls

**Scenario:** User uninstalls and reinstalls.

**State:**

- The keychain entry is removed with the app, so `pin_hash` is gone.
- Local data is gone.

**Behavior:**

- Fresh onboarding from `welcome`. No restore prompt on Free — there is no cloud.
- This is the one case where the in-memory decision is a _benefit_: nothing
  partial can survive, so there is no half-state to reconcile.
- Freemium/Premium: "Restore from backup?" after the splash. Specified, not built.

---

## EC13. Accessibility: Screen Reader

**Behavior:**

- Splash announces "NUMI. Loading."
- `ProgressDots` announces "Step N of 4" with `accessibilityValue`.
- `PinDots` announces the digit count as a single value, not four separate dots.
  Four announced nodes for one code is noise.
- `PinPad` keys announce as buttons with the digit as the label, and backspace
  announces as "Delete".
- The PIN error announces via the error caption; the shake and the haptic are
  both silent to a screen reader, so the caption is the only channel and it must
  be sufficient on its own.
- Disabled buttons announce as dimmed.

---

## EC14. Accessibility: Large Text

**Behavior:**

- `amountHero` clamps at 48px to prevent overflow.
- `quick-setup` scrolls rather than compressing. The scroll hint appears.
- The PIN phase slide holds both columns at `containerWidth` each, so a taller
  heading wraps inside its column and does not push the pad off screen.
- No truncation. All text wraps or scrolls.

---

## EC15. User Opens App Offline

**Scenario:** First launch in airplane mode.

**Behavior:**

- Fully functional. No network call anywhere in onboarding.
- No "No internet" banner. There is no network layer to fail.
- Offline is the only supported mode, not a degraded one.

---

## EC16. User Mismatches Their PIN

**Scenario:** Phase 2 code differs from phase 1.

**Behavior:**

- Error haptic, 4-step shake at 50ms each, digits clear, stay on phase 2.
- Caption: "Those don't match."
- The first PIN is retained — the user only re-enters the confirmation, not both
  codes. Re-asking for a code they just set is a papercut.
- Error clears on the next press. No attempt is counted; a mismatch is a typo,
  not an attack.

---

## EC17. User Exceeds the Unlock Attempt Limit

**Scenario:** 5 wrong attempts on `unlock`.

**Behavior:**

- Pad disabled. Countdown in `typography.caption`, announced each 10s.
- `PIN_LOCKOUT_SECONDS` 30, then the pad returns and the counter clears.
- "Forgot PIN? Reset app" stays available throughout. A user locked out of a
  4-digit code they set an hour ago must never be trapped.
- The counter is component state, so killing the app clears it. This is a device
  lock, not threat defence, and it is documented as a speed bump rather than a
  control.

---

## EC18. User Forgets Their PIN

**Scenario:** User taps "Forgot PIN? Reset app" on `unlock`.

**Behavior:**

- Confirmation names the cost before the tap: this deletes the wallet and period
  from this device and returns to Welcome. "This cannot be undone."
- On confirm: delete the `pin_hash` keychain entry, reset the engine to its
  initial state, then `router.replace("/welcome")`.
- The reset does not require a password, because there is no account and no
  recovery address to authenticate against. Anyone holding an unlocked phone can
  wipe the app, and can equally read it. That is the accepted trade for a
  no-account product.

---

## EC19. Keychain Write Fails During PIN Setup

**Scenario:** `SecureStore.setItemAsync` rejects — keychain unavailable, device
locked, or a restored backup with a broken entitlement.

**Behavior:**

- The screen stays on phase 2. It does **not** advance.
- `console.error` with a `[Pin]` prefix, per the app's error convention.
- Caption: "Could not save PIN. Try again." Digits clear so the user can retry
  both phases.
- Critically: the PIN is never treated as set unless the write resolved. A
  `pinSet` flag that optimistically flips would strand the user on an unlock
  screen they cannot pass, because the hash was never written.

---

## EC20. Name Is Whitespace Only

**Scenario:** User types three spaces into the Welcome field.

**Behavior:**

- Validation is on the trimmed length, so 0 < 2 and the primary button is
  disabled. No error text — the disabled button is the message.
- On submit the value is trimmed before it reaches the store, so the app never
  holds a name that renders as blank.

---

## Summary Table

| Case                       | State After         | UI Behavior                       |
| -------------------------- | ------------------- | --------------------------------- |
| Kill mid-quick-setup       | Nothing             | Empty Home via EmptyState         |
| Kill after onboarding      | PIN only            | Unlock to empty Home              |
| Negative balance input     | Impossible to enter | Regex blocks, engine also rejects |
| Invalid date range         | Clamped             | Picker corrects, button disabled  |
| Over-assignment            | Clamped             | Steppers cap, button disabled     |
| Skip quick setup           | Zero-balance wallet | "1 wallet · 0 budgets"            |
| Delete only wallet         | Empty               | Return to EmptyState              |
| Low memory / reduce motion | Degraded            | Cut instead of slide, no shake    |
| No storage                 | Not applicable      | No DB write in this slice         |
| Web first visit            | Not built           | Landing page                      |
| Reinstall                  | Fresh               | Keychain wiped with the app       |
| PIN mismatch               | Phase 2 retained    | Haptic, shake, digits clear       |
| Unlock attempts exhausted  | Locked 30s          | Pad disabled, countdown           |
| Forgot PIN                 | Wiped               | Confirm, then Welcome             |
| Keychain write fails       | Not set             | Stay on phase 2, retry            |
| Whitespace-only name       | Not stored          | Button disabled                   |

---

## What Happens After This Document

Onboarding is complete. The user is now in Active Budgeter state. Next feature:
Daily Budgeting — the core loop.

Next: docs/playbook/05_Features/03_Daily_Budgeting/Overview.md
