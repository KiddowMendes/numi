---
version: 1.0.0
status: Draft
owner: Elton Pascoal
related_documents:
  - "docs/playbook/04_Design_System/01_Tokens.md"
  - "docs/playbook/05_Features/03_Daily_Budgeting/Screens.md"
decision_record: none
---

# 02 — Components

> Building blocks. Every screen is built from these. No custom one-off styles.

---

## Component Philosophy

1. **Every component serves a lens.** Current, Planned, or Actual. If it serves none, it does not ship.
2. **Touch first, click second.** All components must work with a thumb on a cracked screen in direct sunlight.
3. **State is visible, not hidden.** Disabled, loading, and error states are as designed as the default state.
4. **One component, one responsibility.** A Button is never also a Link. A Card never also a List.

---

## SafeToSpendHero

**Purpose:** The most important UI element in NUMI. Answers "Will my money last?" in one glance.

**Layout:**
- Occupies 40% of home screen vertical space.
- Vertically and horizontally centered within its container.
- Padding: `spacing.lg` on all sides.

**Content:**
- Top: Label "Safe to spend today" in `typography.label`, `color.textMuted`.
- Middle: Amount in `typography.amountHero`, `color.textPrimary`.
  - If positive and healthy: `color.stateSafe`.
  - If caution (Safe-to-Spend below 20% of the sum of active Assignments for the active Period): `color.stateCaution`.
  - If negative or over-committed: `color.stateAlert`.
- Bottom: Context line in `typography.caption`, `color.textMuted`.
  - Example: "R1,200 total · 12 days left"

**Behavior:**
- Updates in real time when a Transaction is logged, or when an active Assignment, the active Period, or a relevant Wallet balance changes. Budget and period edits must not leave the displayed amount stale.
- Animates amount changes with `motion.default` count-up/down.
- Tapping the hero navigates to breakdown view (Current lens).

**Color precedence:** Evaluate in this order — (1) negative or over-committed → `stateAlert`; (2) zero → Zero state (`stateSafe`-agnostic, `textSecondary`, no shame styling); (3) positive and below the Caution threshold → `stateCaution`; (4) otherwise → `stateSafe`. Caution only applies to remaining positive values below the threshold.

**States:**
- **No Period:** Shows "--" in `color.textMuted`. Label reads "No active budget period."
- **Zero:** Shows "R0" in `color.textSecondary`. No shame styling.
- **Negative:** Shows negative amount in `color.stateAlert`. No exclamation marks.

---

## Button

**Variants:**

| Variant | Background | Text | Border | Use For |
|---|---|---|---|---|
| **Primary** | `color.primary` | `color.primaryFg` | none | Main action on screen |
| **Secondary** | transparent | `color.primary` | `1px solid color.primary` | Alternative action |
| **Ghost** | transparent | `color.textSecondary` | none | Low-emphasis action, destructive confirm |

**Sizes:**

| Size | Height | Horizontal Padding | Text Style |
|---|---|---|---|
| `sm` | 36px | `spacing.md` | `typography.label` |
| `md` | 44px | `spacing.lg` | `typography.title` |
| `lg` | 56px | `spacing.xl` | `typography.heading2` |

**States:**
- **Default:** As above.
- **Pressed:** Opacity 0.85, `shadow.sm` on Primary only.
- **Disabled:** `color.textDisabled`, no shadow, `pointer-events: none`. Use the native `disabled` attribute on web and the equivalent disabled prop on mobile; if native semantics are impossible, use `aria-disabled="true"` together with an activation guard that blocks the action handler.
- **Loading:** Spinner replaces text. Maintain height to prevent layout shift. Activation is blocked while loading, and the button's accessible name (text or `aria-label`) is preserved for assistive technology even when the spinner is rendered.

**Rules:**
- Minimum touch target: 48px × 48px even if visual size is smaller.
- One Primary button per screen. Never two.
- Ghost buttons are used for destructive actions to slow the user down intentionally.

---

## AmountInput

**Purpose:** The fastest way to log money. Numeric only.

**Layout:**
- Full width.
- Height: 56px.
- Background: `color.surfaceRaised`.
- Border: `1px solid color.border`, `radius.md`.
- Padding: `spacing.lg` horizontal.

**Content:**
- Left side: `color.textMuted` label "R" (static, not editable).
- Right side: Numeric value in `typography.amountLg`, `color.textPrimary`.
- `fontVariant: ['tabular-nums']` always.

**Keyboard:**
- Mobile: Numeric keypad (`keyboardType="numeric"`).
- Web: HTML number input, no spinners.

**States:**
- **Default:** Border `color.border`.
- **Focus:** Border `color.primary`, `shadow.sm`.
- **Error:** Border `color.stateAlert`, subtle left border accent.
- **Disabled:** Background `color.surface`, text `color.textDisabled`.

**Behavior & Validation (one contract, both platforms):**
- Accepted format: non-negative Rand amount, optional cents. Integers: 1–9 digits (R0–R9,999,999). Cents: exactly 2 digits when present. No sign input, no separators, no currency symbol (the static "R" label provides currency context).
- Validation is enforced on both platforms beyond keyboard hints: invalid input is rejected at the field level (e.g., pattern/`maxLength` on web, `maxLength` + formatter on mobile), never merely prevented by the keyboard type.
- Auto-focus on mount.
- No decimal places by default (v1 rule: Rand-only).
- Long-press or toggle to enable cents for bank tracking; the toggle is keyboard-operable (web) and focusable (mobile).

---

## TextInput

**Purpose:** Notes, Wallet names, Category names.

**Layout:**
- Full width.
- Height: 48px (single line) or auto (multiline).
- Background: `color.surfaceRaised`.
- Border: `1px solid color.border`, `radius.md`.

**Content:**
- Label above input in `typography.label`, `color.textMuted`.
- Value in `typography.body`, `color.textPrimary`.
- Placeholder in `typography.body`, `color.textDisabled`.

**States:** Same as AmountInput.

---

## Card

**Purpose:** Container for Wallet summaries, Category summaries, and quick stats.

**Layout:**
- Background: `color.surface`.
- Border: `1px solid color.borderSubtle`.
- Border radius: `radius.lg`.
- Padding: `spacing.lg`.
- `shadow.none` by default. `shadow.md` on press (mobile only).

**Variants:**

| Variant | Use For |
|---|---|
| **WalletCard** | Wallet name, balance, available balance. Tap to view transactions. |
| **CategoryCard** | Category name, Assignment remaining, spent so far. Tap to view details. |
| **StatCard** | Small inline stats: "Days left", "Total assigned". No interaction. |

**Accessibility (WalletCard, CategoryCard):** Cards that respond to tap are interactive and must have an accessible name (derived from title content or `aria-label`), be keyboard-operable (`role="button"` or a real button/link), and show a visible focus state. **StatCard is never interactive:** no role, no tabindex, no press styling.

**WalletCard Content:**
- Top row: Wallet name (`typography.title`) + Wallet type icon (`icon.sm`).
- Middle: Balance in `typography.amountLg`, `color.textPrimary`.
- Bottom: "RXXX available" in `typography.caption`, `color.textMuted`.

**CategoryCard Content:**
- Left: Color dot (12px) + Category name (`typography.body`).
- Right: Remaining amount (`typography.amountMd`).
  - If remaining >= 0: `color.textPrimary`.
  - If remaining < 0: `color.stateAlert`.

---

## ListItem (TransactionRow)

**Purpose:** A single transaction in history.

**Layout:**
- Full width.
- Height: 72px minimum.
- Padding: `spacing.lg` horizontal, `spacing.md` vertical.
- Border bottom: `1px solid color.borderSubtle`.

**Content:**
- Left: Category icon (`icon.md`) in Category color.
- Middle:
  - Category name (`typography.body`, `color.textPrimary`).
  - Optional note (`typography.caption`, `color.textMuted`). Truncate to 1 line.
  - Date (`typography.caption`, `color.textMuted`).
- Right:
  - Amount (`typography.amountMd`).
    - Income: `color.income`, prefixed "+".
    - Expense: `color.expense`, prefixed "−".
    - Transfer: `color.transfer`, prefixed "→".
  - Wallet name (`typography.caption`, `color.textMuted`).

**States:**
- **Default:** As above.
- **Pressed:** Background `color.surfaceRaised`.
- **Selected:** Background `color.surfaceRaised`, right chevron appears.

**Behavior:**
- Swipe left (mobile): Reveal "Reverse" action.
- Accessible Reverse path: every ListItem exposes a keyboard- and screen-reader-operable action (e.g., overflow menu or context button on web, long-press menu item or row action on mobile). The swipe is a shortcut, never the only path.
- Long press: Multi-select mode (future).

---

## EmptyState

**Purpose:** Explain why something is empty and what to do next. Never a dead end.

**Layout:**
- Centered in container.
- Padding: `spacing.3xl`.
- Max width: 320px.

**Content:**
- Top: Icon (`icon.lg`), `color.textMuted`.
- Middle: Headline (`typography.heading2`), `color.textPrimary`.
- Bottom: Body text (`typography.body`), `color.textSecondary`.
- Action: Primary or Ghost button below text.

**Variants:**

| Variant | Icon | Headline | Body | Action |
|---|---|---|---|---|
| **NoTransactions** | `Receipt` | "No transactions yet" | "Log your first spend to see your money clearly." | "Log expense" |
| **NoPeriod** | `CalendarBlank` | "No active period" | "Set a time horizon so NUMI can show you what's safe to spend." | "Start a period" |
| **NoWallet** | `Wallet` | "No wallet yet" | "Create your first wallet to track your money." | "Create wallet" |
| **NoGoals** (Premium) | `Target` | "No goals yet" | "Set aside money for something specific." | "Create goal" |

**Rule:** No illustration assets. Phosphor icon + text only. Keeps APK small.

---

## BottomSheet

**Purpose:** Secondary actions, filters, quick inputs. Not for primary flows.

**Layout:**
- Mobile: Fixed to bottom, max height 70% of screen.
- Web: Centered modal, max width 480px, max height capped to the viewport (e.g., `max-height: min(90vh, 640px)`). Within the modal, only the body scrolls; header and footer stay visible.
- Background: `color.surface`.
- Border radius: `radius.xl` top corners only (mobile).
- Handle bar: 36px wide, 4px tall, `color.border`, `radius.full`, centered top.

**Content:**
- Header: Title (`typography.heading2`) + close button (Ghost, `X` icon).
- Body: Scrollable, padding `spacing.lg`.
- Footer: Action row (Primary + Ghost), padding `spacing.lg`.

**Behavior:**
- Drag down to dismiss (mobile).
- Tap backdrop to dismiss.
- Focus trap inside sheet (web accessibility): on open, focus moves to the sheet's first focusable element; Tab cycles inside the sheet; on close, focus returns to the element that opened it.
- Dismissal keys: Escape (web) and the hardware/system back button (mobile) close the sheet, matching backdrop-dismiss behavior.
- Modal semantics on web: `role="dialog"` (or `role="alertdialog"` for destructive content) with `aria-modal="true"` and an accessible name from the sheet title.

**States:**
- **Open:** Slides up with `motion.default`.
- **Closed:** Fully off-screen.
- **Loading:** Spinner in body, footer buttons disabled.

---

## Toast

**Purpose:** Brief confirmation of an action. No user interaction required.

**Layout:**
- Position: Bottom of screen, 24px from bottom edge (above FAB if present).
- Background: `color.surfaceRaised`.
- Border: `1px solid color.border`.
- Border radius: `radius.lg`.
- Padding: `spacing.md` vertical, `spacing.lg` horizontal.
- `shadow.md`.

**Content:**
- Icon (`icon.sm`): Checkmark for success, `Info` for neutral.
- Message (`typography.label`): One line. No wrapping.
- Max width: 90% of screen width.

**Behavior:**
- Auto-dismiss after 3 seconds.
- Swipe up to dismiss early.
- Stacking: New toast replaces old toast. No queue.
- Toasts render inside a live region (`role="status"`; `aria-live="polite"`) so assistive technology announces the confirmation. Auto-dismiss timing must give screen readers enough time to finish the announcement before the message is removed; if announcements are pending, dismissal may be deferred until the announcement completes.

**Variants:**

| Variant | Icon Color | Use For |
|---|---|---|
| **Success** | `color.stateSafe` | "R50 logged" |
| **Neutral** | `color.primary` | "Wallet created" |
| **Warning** | `color.stateCaution` | "Sync pending" |

**Forbidden:** No error toasts. Errors use the Error Pattern (inline or modal), not temporary banners.

---

## SegmentedControl

**Purpose:** Switch between Current, Planned, and Actual views.

**Layout:**
- Full width minus `spacing.lg` padding on both sides.
- Height: 40px.
- Background: `color.surfaceRaised`.
- Border radius: `radius.full`.
- Padding: 2px internal.

**Content:**
- Three segments: "Current" | "Planned" | "Actual".
- Active segment: `color.primary` background, `color.primaryFg` text.
- Inactive segment: transparent background, `color.textSecondary` text.
- Text: `typography.label`.

**Behavior:**
- Tap to switch. No swipe.
- Active indicator animates with `motion.fast`.
- State persists per screen, not globally.

**Accessibility:**
- SegmentedControl switches full views (Current / Planned / Actual), so implement the complete tab pattern on web: container `role="tablist"`, segments `role="tab"` with `aria-selected` and `tabindex` management (selected segment `0`, others `-1`), linked `tabpanel` elements with `aria-labelledby`, and arrow-key navigation between tabs.
- If the control is used for single-choice options within a form instead of panel switching, use the radiogroup pattern instead: `role="tablist"`/`tab`+`tabpanel` is only valid for panel-switching. Radiogroup segments use `role="radio"` with `aria-checked`.

---

## FAB (Floating Action Button)

**Purpose:** The one primary action on screens where speed matters.

**Layout:**
- Position: Bottom right, 24px from edges.
- Size: 56px × 56px.
- Background: `color.primary`.
- Icon: `icon.md`, `color.primaryFg`.
- Border radius: `radius.full`.
- `shadow.md`.

**Behavior:**
- Tap: Primary action (usually "Log expense").
- Long press (future): Expand to reveal "Log income" and "Transfer".

**States:**
- **Default:** As above.
- **Pressed:** Scale 0.95, `shadow.sm`.
- **Hidden:** Slides down off-screen with `motion.fast` when scrolling down. Reappears when scrolling up.

**Rule:** One FAB per screen. Never duplicate the primary action elsewhere on the same screen.

---

## Component Inventory

| Component | v1 | Notes |
|---|---|---|
| SafeToSpendHero | Yes | Core of the product |
| Button | Yes | 3 variants, 3 sizes |
| AmountInput | Yes | Numeric keypad default |
| TextInput | Yes | Single and multiline |
| Card | Yes | Wallet, Category, Stat variants |
| ListItem | Yes | TransactionRow only |
| EmptyState | Yes | 4 variants |
| BottomSheet | Yes | Mobile: sheet, Web: modal |
| Toast | Yes | Success, Neutral, Warning |
| SegmentedControl | Yes | Current/Planned/Actual |
| FAB | Yes | Primary action only |
| Checkbox | Yes | Settings, multi-select |
| Radio | Yes | Single choice in sheets |
| Switch | Yes | Toggles in settings |

---

## What Happens After This Document

Components are built in `apps/mobile/src/components/` and `apps/web/components/`. They reference `@numi/design-system` tokens. No hardcoded values.

Next: `docs/playbook/04_Design_System/03_Patterns.md`