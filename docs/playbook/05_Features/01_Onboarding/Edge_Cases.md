---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/05_Features/01_Onboarding/Flow.md"
  - "docs/playbook/05_Features/01_Onboarding/Screens.md"
decision_record: none
---

# 01 — Onboarding: Edge Cases

> What happens when the user does the unexpected, the phone fails, or reality interrupts.

---

## EC1. App Killed During Wallet Setup

**Scenario:** User fills Wallet name, types balance, app is killed by system or user.

**State on Relaunch:**
- Wallet was not created (sheet dismiss does not commit).
- HomeScreen shows EmptyState "No wallet yet".

**Behavior:**
- No recovery prompt. User taps "Create wallet" again.
- Pre-fill is lost. This is acceptable for v1.

---

## EC2. App Killed After Wallet Created, Before Period Created

**Scenario:** Wallet creation succeeded. Period setup sheet was open. App killed.

**State on Relaunch:**
- Wallet exists in local DB.
- HomeScreen shows WalletCard.
- EmptyState below: "No active period. Start a period to see what's safe to spend."

**Behavior:**
- Prompt is softer than first launch. User has already made progress.
- "Start a period" button is Primary.

---

## EC3. User Enters Negative Starting Balance

**Trigger:** Wallet setup, AmountInput.

**Behavior:**
- Engine rejects with `INVALID_STATE`.
- Inline error: "Balance cannot be negative."
- Button disabled.

---

## EC4. User Sets End Date Before Start Date

**Trigger:** Period setup, date pickers.

**Behavior:**
- Inline error below End Date: "End date must be after start date."
- "Start period" button disabled.
- Error clears automatically when user corrects the date.

---

## EC5. User Assigns More Than Wallet Balance

**Trigger:** Period setup, initial assignment > Wallet balance.

**Behavior:**
- Inline error: "You only have R[balance] in this wallet."
- Button disabled.
- If user reduces assignment to valid amount, error clears.

---

## EC6. User Skips Everything

**Scenario:** User opens app, sees Splash, sees Home, taps nothing, kills app.

**Behavior:**
- On next open: Same state. No nagging.
- After 3 launches with no Wallet: Subtle prompt on HomeScreen: "Tap 'Create wallet' to begin." Not a popup. Inline below EmptyState.

---

## EC7. User Creates Wallet Then Deletes It Immediately

**Scenario:** User creates Wallet, then finds delete option (Settings > Wallets > Delete).

**Behavior:**
- Confirmation sheet: "Delete 'Cash Wallet'? This cannot be undone."
- On confirm: Wallet deleted. HomeScreen returns to EmptyState.
- If Period existed: Period is also closed/archived (orphaned Periods are not allowed).

---

## EC8. Device Rotation During Setup

**Scenario:** User rotates phone while sheet is open.

**Behavior:**
- Sheet remains open.
- Inputs preserve state.
- Keyboard remains visible.
- No layout breakage.

---

## EC9. Low Memory / Budget Phone

**Scenario:** App launched on 2GB RAM device.

**Behavior:**
- SplashScreen still shows (lightweight).
- Sheets open without animation (`reduceMotion` or low RAM detection).
- No background image assets. No video.

---

## EC10. No Storage Space

**Scenario:** Device storage full. Local DB write fails.

**Behavior:**
- Wallet creation appears to succeed (in-memory state updates).
- DB write fails silently, queued for retry.
- If retry fails 3 times: Toast "Unable to save. Free up space and try again."
- In-memory state is correct. User can continue using the app, but data will not survive app kill.

---

## EC11. Web App First Visit

**Scenario:** User opens web app on laptop before installing mobile.

**Behavior:**
- Web shows static landing page: "NUMI works best on your phone."
- "Continue on web" button (Freemium/Premium only, requires account).
- Free tier: Cannot use web without mobile device. Prompt to download.

---

## EC12. User Has Existing Data (Reinstall)

**Scenario:** User reinstalls app. Previous local data was wiped (Free tier).

**Behavior:**
- Fresh onboarding. No restore prompt (Free has no cloud).
- Freemium/Premium: Prompt "Restore from backup?" after SplashScreen.

---

## EC13. Accessibility: Screen Reader

**Scenario:** User navigates onboarding with TalkBack/VoiceOver.

**Behavior:**
- SplashScreen: Announces "NUMI. Loading."
- EmptyState: Announces headline, body, and button action.
- Sheet fields: Label is read before input. Focus moves to first field on open.
- Date picker: Native picker announces selected date.
- Button state: Disabled buttons are announced as "dimmed."

---

## EC14. Accessibility: Large Text

**Scenario:** System font size set to Extra Large.

**Behavior:**
- `amountHero` clamps at 48px to prevent overflow.
- Sheets become scrollable if content exceeds height.
- BottomSheet expands to 90% height if needed.
- No truncation. All text wraps or scrolls.

---

## EC15. User Opens App Offline

**Scenario:** First launch with airplane mode on.

**Behavior:**
- Fully functional. No network required for onboarding.
- No "No internet" banner.
- All operations local.

---

## Summary Table

| Case | State After | UI Behavior |
|---|---|---|
| Kill mid-Wallet setup | No Wallet | Start over |
| Kill after Wallet, before Period | Wallet exists | Prompt for Period |
| Negative balance input | Rejected | Inline error |
| Invalid date range | Rejected | Inline error, button disabled |
| Over-assignment | Rejected | Inline error |
| Skip everything | No progress | Persistent EmptyState |
| Delete only Wallet | Empty | Return to EmptyState |
| Low memory | Degraded | No animations |
| No storage | Warning | Toast, retry queue |
| Web first visit | Landing page | Prompt to download mobile |
| Reinstall (Free) | Fresh start | No restore |
| Reinstall (Premium) | Prompt | Offer cloud restore |

---

## What Happens After This Document

Onboarding is complete. The user is now in Active Budgeter state. Next feature: Daily Budgeting — the core loop.

Next: docs/playbook/05_Features/03_Daily_Budgeting/Overview.md