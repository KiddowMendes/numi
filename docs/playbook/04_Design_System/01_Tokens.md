---
version: 2.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/00_Foundation/01_Manifesto.md"
  - "docs/playbook/00_Foundation/02_Principles.md"
  - "docs/playbook/01_Domain/01_Entities.md"
  - "docs/playbook/04_Design_System/02_Components.md"
decision_record: "ADR-007"
---

# 01 — Tokens

&gt; Raw materials. Every color, size, and timing value used by components.

---

## Design Principles

1. **Calm is the default.** No pulsing, blinking, or attention-grabbing motion on load.
2. **One idea, one glance.** The answer to a screen's question must be unmissable.
3. **Truth has no accent color.** Honest numbers — negative balances, empty categories — get the same typographic confidence as good news.
4. **No shame in the palette.** No punitive red-alert treatments. Over-committed states are visible and dignified, not dramatized.
5. **Hierarchy signals state, not morality.** Safe, Caution, and Alert are distinct hues, not a good/bad ladder.
6. **Restraint is a feature.** Only name what is used. No aliases for aliases.
7. **Accessible contrast is not optional.** WCAG AA minimum: 4.5:1 for body text, 3:1 for large text and UI components.

---

## Color

**Theme Strategy:** User chooses dark or light during onboarding. `system` is available in Settings, never the default.

### Semantic Palette

| Token | Dark OKLCH | Light OKLCH | Dark Hex | Light Hex | Use For |
|---|---|---|---|---|---|
| `background` | `oklch(0.10 0.035 265)` | `oklch(0.92 0.035 265)` | `#01030e` | `#d9e5fd` | App background |
| `surface` | `oklch(0.15 0.035 265)` | `oklch(0.96 0.035 265)` | `#050a1a` | `#e6f2ff` | Cards, sheets |
| `surfaceRaised` | `oklch(0.20 0.035 265)` | `oklch(1.00 0.035 265)` | `#0e1626` | `#f4ffff` | Elevated surfaces, inputs |
| `textPrimary` | `oklch(0.96 0.07 265)` | `oklch(0.15 0.07 265)` | `#dbf2ff` | `#010728` | Headings, amounts |
| `textSecondary` | `oklch(0.76 0.07 265)` | `oklch(0.40 0.07 265)` | `#9bb1de` | `#35476e` | Body text |
| `textMuted` | `oklch(0.60 0.07 265)` | `oklch(0.50 0.07 265)` | `#6c80ab` | `#50638c` | Labels, timestamps |
| `textDisabled` | `oklch(0.40 0.07 265)` | `oklch(0.60 0.07 265)` | `#35476e` | `#6c80ab` | Inactive elements |
| `border` | `oklch(0.40 0.07 265)` | `oklch(0.60 0.07 265)` | `#35476e` | `#6c80ab` | Dividers, borders |
| `borderSubtle` | `oklch(0.30 0.07 265)` | `oklch(0.70 0.07 265)` | `#1c2c51` | `#899ecb` | Hairlines |
| `primary` | `oklch(0.76 0.10 265)` | `oklch(0.40 0.10 265)` | `#92b0f1` | `#2d457d` | Buttons, links, focus |
| `primaryFg` | --- | --- | `#01030e` | `#f4ffff` | Text on primary button |
| `income` | `oklch(0.70 0.07 160)` | `oklch(0.50 0.07 160)` | `#78ac90` | `#3d7055` | Income amounts, positive flow |
| `expense` | `oklch(0.62 0.025 200)` | `oklch(0.42 0.025 200)` | `#758b8c` | `#3d5152` | Spending amounts — neutral, routine |
| `transfer` | `oklch(0.76 0.10 85)` | `oklch(0.40 0.08 85)` | `#ceac64` | `#5b4404` | Wallet-to-wallet transfers |

### State Palette

Three states only. Not a severity gradient — distinct financial realities.

| Token | Dark Hex | Light Hex | Use For |
|---|---|---|---|
| `stateSafe` | `#78ac90` | `#3d7055` | Safe-to-Spend is healthy, Period on track |
| `stateCaution` | `#ceac64` | `#5b4404` | Safe-to-Spend below 20% of the sum of active Assignments for the active Period (rounded down to the nearest Rand) |
| `stateAlert` | `#c68e85` | `#87544b` | Over-committed, negative Safe-to-Spend |

**Rule:** `stateAlert` is never paired with shame language. It is a number, not a verdict.

### Category Accent Colors

User-selected colors for Categories. 8 swatches from a purple-violet family (~290°), varied by lightness, verified disjoint from semantic tokens.

| Swatch | Hex |
|---|---|
| `category.1` | `#e8d5f2` |
| `category.2` | `#d4b3e6` |
| `category.3` | `#b08dd0` |
| `category.4` | `#8c67ba` |
| `category.5` | `#6841a4` |
| `category.6` | `#4a2d82` |
| `category.7` | `#2c1960` |
| `category.8` | `#0e053e` |

---

## Typography

**Font:** Inter only. Single family for all roles. Loaded via `@expo-google-fonts/inter`.

**Rules:**
- All amount tokens include `fontVariant: ['tabular-nums']`. Always.
- Value is always visually heavier than its label.
- Center alignment for headlines and single-line UI. Left alignment for body text &gt; 2 lines.
- Readable text: max 35–60 characters per line.

| Token | Size | Weight | Line Height | Use For |
|---|---|---|---|---|
| `amountHero` | 32px | 700 | 1.1 | Safe-to-Spend hero, big amounts |
| `heading1` | 24px | 700 | 1.2 | Screen titles |
| `heading2` | 18px | 600 | 1.3 | Section headers, card titles |
| `title` | 16px | 600 | 1.4 | Labels, button text, sub-headings |
| `body` | 16px | 400 | 1.5 | Body text, descriptions |
| `label` | 14px | 500 | 1.4 | Input labels, metadata |
| `caption` | 12px | 500 | 1.4 | Hints, timestamps |
| `amountLg` | 22px | 700 | 1.2 | Wallet balances, Assignment remaining |
| `amountMd` | 16px | 600 | 1.2 | Transaction amounts in lists |
| `amountSm` | 14px | 600 | 1.2 | Small totals, inline amounts |

---

## Spacing

Base unit: 4px. All values are multiples of 4.

| Token | Value | Use For |
|---|---|---|
| `spacing.xs` | 4px | Icon padding, label-to-input gap |
| `spacing.sm` | 8px | Between related elements |
| `spacing.md` | 12px | Between list items, handle bar padding |
| `spacing.lg` | 16px | Screen horizontal padding, card padding |
| `spacing.xl` | 24px | Section gaps |
| `spacing.2xl` | 32px | Large section separators |
| `spacing.3xl` | 48px | Bottom padding above FAB |

**Button Padding:** Asymmetric. Primary-action axis gets more space.
- `Button md`: 16px horizontal, 8px vertical (2:1)
- `Button lg`: 24px horizontal, 12px vertical (2:1)
- Icon-to-text gap inside button: `spacing.xs`

---

## Border Radius

| Token | Value | Use For |
|---|---|---|
| `radius.none` | 0px | Full-width lists, data tables |
| `radius.sm` | 4px | Small chips, tags |
| `radius.md` | 8px | Buttons, inputs, small cards |
| `radius.lg` | 12px | Cards, bottom sheets |
| `radius.xl` | 16px | Modals, dialogs |
| `radius.full` | 9999px | Pills, FABs, avatars |

---

## Shadows / Elevation

NUMI is flat by default. Elevation is reserved for overlays and interactive layers.

| Token | Value (Light) | Value (Dark) | Use For |
|---|---|---|---|
| `shadow.none` | none | none | Default surface |
| `shadow.sm` | `0 1px 2px rgba(1,3,14,0.08)` | `0 1px 2px rgba(0,0,0,0.24)` | Subtle lift on press |
| `shadow.md` | `0 4px 12px rgba(1,3,14,0.10)` | `0 4px 12px rgba(0,0,0,0.32)` | Bottom sheets, cards |
| `shadow.lg` | `0 8px 24px rgba(1,3,14,0.14)` | `0 8px 24px rgba(0,0,0,0.40)` | Modals, dialogs |

**Rule:** No blur-heavy shadows on budget devices. Solid, tight shadows only.

---

## Motion / Animation

Calm, informative, never decorative.

| Token | Duration | Easing | Use For |
|---|---|---|---|
| `motion.instant` | 100ms | `ease-out` | Color change, opacity toggle |
| `motion.fast` | 200ms | `ease-out` | Button press, icon swap |
| `motion.default` | 300ms | `ease-in-out` | Sheet open, card expand |
| `motion.slow` | 500ms | `ease-in-out` | Page transition, hero number change |

**Rules:**
- Respect `prefers-reduced-motion`. All transitions become instant.
- No bounces, springs, or elastic overshoot. NUMI is not playful with money.
- The Safe-to-Spend number changes with a 300ms count-up/down animation. When `prefers-reduced-motion` is enabled, the count-up/down is disabled and the value changes instantly.

---

## Iconography

**Set:** Phosphor Icons (`phosphor-react-native` / `@phosphor-icons/react`). Weight: Regular (default), Bold for active states.

| Token | Size | Use For |
|---|---|---|
| `icon.xs` | 16px | Inline indicators, chips |
| `icon.sm` | 20px | List items, compact rows |
| `icon.md` | 24px | Buttons, navigation, default |
| `icon.lg` | 32px | Empty states, feature highlights |

**Rules:**
- Icons are semantic, not decorative. Every icon must reinforce meaning.
- No emoji. Ever.
- Category icons are selected from a fixed set of 24 Phosphor icons (e.g., `ShoppingCart`, `Bus`, `WifiHigh`, `House`).

---

## Z-Index / Elevation Layers

| Token | Value | Use For |
|---|---|---|
| `z.base` | 0 | Default content |
| `z.sticky` | 10 | Sticky headers |
| `z.overlay` | 50 | Backdrops, scrims |
| `z.sheet` | 100 | Bottom sheets |
| `z.modal` | 200 | Modals, dialogs |
| `z.toast` | 300 | Toasts, banners |
| `z.fab` | 400 | Floating Action Button |

---

## Token Naming Convention

All tokens follow the pattern: `category.property.scale`

Examples:
- `color.textPrimary`
- `spacing.lg`
- `typography.heading1`
- `motion.fast`

**Rule:** Components never use raw values. They reference tokens. If a value is used twice, it becomes a token.

---

## What Happens After This Document

These tokens are implemented in `packages/design-system/src/tokens/` and consumed by both mobile and web. No hardcoded values in `apps/`.

Next: `docs/playbook/04_Design_System/02_Components.md`