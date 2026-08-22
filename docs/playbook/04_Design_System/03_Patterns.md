---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/04_Design_System/02_Components.md"
  - "docs/playbook/02_Product_Mechanics/02_User_States.md"
decision_record: none
---

# 03 — Patterns

> How components behave when reality is messy. Not what exists, but what to do when.

---

## Pattern Philosophy

1. **Never blame the user.** Empty, error, and loading states are the app's responsibility, not the user's failure.
2. **Always provide a path forward.** Every state must have a primary action.
3. **Be honest about limitations.** If sync is stale, say so. If data is missing, say so. No fake data, no skeletons for content that will never arrive.

---

## Empty States

### First Launch (First Launch State)

**Trigger:** App opened for the first time.

**Screen:**
- SafeToSpendHero shows "--".
- Centered EmptyState: Icon `Wallet`, "Welcome to NUMI", "Your money stays on your device. No account needed.", Button "Create your first wallet".
- No onboarding carousel. No tutorial. No "skip".

**Rules:**
- One primary action only.
- Manifesto summary in 2 sentences below the fold (scrollable), not blocking.

### No Period (No Period State)

**Trigger:** User has a Wallet but closed or never created a Period.

**Screen:**
- SafeToSpendHero shows "--".
- EmptyState: Icon `CalendarBlank`, "No active period", "Tell NUMI how long your money needs to last.", Button "Start a period".
- Below: WalletCard list still visible (read-only).

### No Transactions (Active Budgeter State)

**Trigger:** Period active, but no Transactions logged yet.

**Screen:**
- SafeToSpendHero shows full amount (everything unspent).
- Below: EmptyState inline in list area: Icon `Receipt`, "No transactions yet", "Log your first spend to see your money clearly.", Button "Log expense".

### No Goals (Premium)

**Trigger:** Premium user, Goals tab selected, no Goals created.

**Screen:**
- EmptyState: Icon `Target`, "No goals yet", "Set aside money for something specific. It stays in your wallet — just labeled.", Button "Create goal".

---

## Loading States

### Initial Load

**Behavior:**
- Show app shell immediately (header + SafeToSpendHero skeleton).
- Skeleton: Gray block (`color.borderSubtle`) in place of the hero amount.
- List area: 3 skeleton rows (72px height each, `radius.md`).
- No full-screen spinner. No "Loading..." text.

### Async Operation (Save, Sync)

**Behavior:**
- Button enters loading state (spinner replaces text). The button's accessible name is preserved while loading, and the button is announced as busy (`aria-busy="true"` on web; platform-equivalent busy/loading state on mobile).
- Toast on completion: "Saved" or "Synced". Toasts render in a live region (see Toast component); failure is announced through the accessible status region, never by sound or color alone.
- If operation takes > 3 seconds, show inline text: "Still saving..." below the button.

### Pull-to-Refresh

**Behavior:**
- Mobile: Standard platform pull-to-refresh.
- Web: Pull gesture or refresh button in header.
- Spinner: `color.primary`.
- No text label; the spinner is announced as an accessible busy/status state (e.g., `aria-busy` on the refresh trigger, or announced status text in the same live region as toasts).
- Completion and failure are announced via the status region ("Updated" / "Refresh failed").

---

## Error States

### Engine Rejection (Business Rule Violation)

**Trigger:** User tries to spend more than available, exceed tier limit, etc.

**Behavior:**
- Inline error below the input: `typography.label`, `color.stateAlert`.
- Message: Engine error code mapped to human text, plus a recovery action:
  - `INSUFFICIENT_BALANCE`: "You don't have enough available in this wallet." Input validation; primary button disabled until resolved.
  - `TIER_LIMIT_EXCEEDED`: "Upgrade to create more wallets." Recovery action: "Upgrade" (opens tier screen).
  - `INVALID_STATE`: "Cannot do this right now." Recovery action: "Cancel" when the operation was user-invoked, or "Reload" (web) / reopen screen (mobile) when state is stale.
- Shake animation on the input (`motion.fast`, 50ms horizontal shakes). Only for input errors, never on tier or state errors.
- Primary button disabled until error is resolved.

### Data Corruption

**Trigger:** Conservation of Money invariant fails (C15).

**Behavior:**
- App enters read-only mode.
- Banner at top: `color.stateAlert` background, `color.primaryFg` text.
- Message: "Something went wrong with your data. Please export a backup and contact support."
- All mutation buttons disabled.
- Primary action: "Export my data". Before exporting, the user confirms with a sensitive-data disclosure ("This backup contains your full financial history. It will be saved to the app's protected storage, not an unprotected Downloads folder."). Export writes an encrypted, app-protected backup file (or the platform's secure share destination) — never a plaintext JSON dropped into Downloads.
- Secondary action: "Restore from backup" (if Freemium/Premium). Restore validates the backup's integrity and format (signature + schema check) before accepting it; invalid or foreign backups are rejected with an error message.

### Sync Failure

**Trigger:** Cloud push fails repeatedly.

**Behavior:**
- Subtle banner (not blocking): `color.stateCaution` left border.
- Message: "Sync pending. Your data is safe on your device."
- No retry button. Background auto-retry with bounded behavior: exponential backoff (start 30s, double each attempt, cap 10 minutes), maximum 20 attempts per sync run.
- Queue retention limit: 5,000 pending changes. If the queue exceeds the limit, oldest queued changes are not dropped silently — escalation instead: banner escalates to a blocking state prompting the user to retry manually or contact support (in-app support link). Data on the device is never deleted.
- If queue > 100 items: Update message to "Sync pending: {count} changes." (count is the runtime pending-change number, not a hardcoded value).

### Network Error (Web App)

**Trigger:** Web app cannot reach cloud.

**Behavior:**
- Stale banner: "Cannot reach server. Data may be outdated."
- Web app goes read-only.
- Retry button: "Try again".

---

## Confirmation Patterns

### Destructive Action

**When:** Delete Wallet, Close Period, Delete Goal.

**Pattern:**
1. User taps destructive action (Ghost button, red text if available, or `color.stateAlert` text).
2. BottomSheet opens with action-specific copy:
   - **Delete Wallet:** Title "Delete this wallet?", Body "Transactions stay in your history. The wallet itself will be removed.", Confirm "Delete wallet".
   - **Close Period:** Title "Close this period?", Body "You can start a new one anytime. Your history stays safe.", Confirm "Close period".
   - **Delete Goal:** Title "Delete this goal?", Body "Reserved money returns to your wallet's available balance.", Confirm "Delete goal".
   - All variants share: Secondary button "Cancel" (dismisses sheet), `color.stateAlert` styling on the confirm button.
3. No "Are you sure?" double-confirm. One sheet is enough.

### Non-Destructive Action

**When:** Log transaction, create Assignment.

**Pattern:**
- No confirmation. Tap Save, immediate Toast.
- Undo is not v1. If user makes a mistake, they reverse the Transaction later.

---

## Overflow Patterns

### Too Many Transactions

**Behavior:**
- Virtualized list. Render only visible rows.
- Load more on scroll. No pagination numbers.
- If > 1000 transactions in a Period: Show "Search" input at top of list.

### Too Many Categories

**Behavior:**
- Vertical scroll.
- If > 12 categories: Show alphabetical quick-jump (A-Z sidebar on mobile, not web).

### Too Many Wallets (Premium)

**Behavior:**
- Horizontal scroll on home screen.
- Max 3 visible at once. Snap to card width.

---

## First-Run Experience

**Rule:** No onboarding wizard. No "Next" buttons 5 times.

**Flow:**
1. Splash screen: Logo + "NUMI", shown as a non-blocking transition (max 1.5 seconds, fades as soon as the home shell is ready). It never blocks the initial app-shell render.
2. Home screen immediately.
3. If no Wallet: SafeToSpendHero shows "--", EmptyState prompts "Create your first wallet".
4. If Wallet but no Period: EmptyState prompts "Start a period".
5. If both exist: Show Safe-to-Spend.

**Manifesto teaser:**
- Below the fold on first launch only (scroll down).
- 2 sentences: "NUMI makes your money visible. The phone app works without an account, internet, or a connection to the cloud." (Web App requires connectivity; the offline claim is scoped to the on-device app only.)
- Disappears after first Transaction is logged.

---

## Accessibility Patterns

### Screen Reader

- SafeToSpendHero reads: "Safe to spend today: {amount}. {n} days remaining." — values come from runtime state and the localization/currency formatter (ZAR), not hardcoded text.
- TransactionRow reads: "{Category}. Minus {amount}. {Wallet}. {relative date}." — values from runtime data and locale-aware date formatting.
- All meaningful icons have `aria-label` or `accessibilityLabel`. Decorative icons (purely visual, e.g., a background glyph) are hidden from assistive technology (`aria-hidden` on web, `importantForAccessibility="no"` / no label on mobile).

### Dynamic Type

- All text scales with system font size.
- `amountHero` has no fixed maximum size. Large amounts reflow and scale responsively: the amount shrinks proportionally (e.g., via adjustable font metrics, `font-size: clamp()`, or `adjustsFontSizeToFit`) while remaining readable, so oversized values never clip or overflow.
- Layouts use `ScrollView` where content may exceed viewport.

### Color Independence

- State is never communicated by color alone.
- Safe/Caution/Alert have distinct icons: `CheckCircle`, `Warning`, `Prohibit`.
- Category colors are decorative, not semantic.

---

## What Happens After This Document

Patterns are implemented as behavior specs for each screen in `05_Features/`. Every screen must declare which patterns it uses.

Next: `docs/playbook/04_Design_System/04_Platform_Adaptations.md`