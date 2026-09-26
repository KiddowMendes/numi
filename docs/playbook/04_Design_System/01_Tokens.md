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

**Theme Strategy:** User chooses dark or light during onboarding. `system` is available in Settings, never the default. Resolved by `resolveColorScheme()` in `@numi/design-system`; the choice lives in the mobile store as `themePreference`.

### Semantic Palette

| Token            | Dark OKLCH          | Light OKLCH           | Dark Hex                                     | Light Hex | Use For |
| ---------------- | ------------------- | --------------------- | -------------------------------------------- | --------- | ------- |
| `background`     | `#080c15`           | `#eef2f8`             | App background (base of the gradient)        |
| `backgroundGlow` | `#0d1420`           | `#f7f9fd`             | Gradient stop, top                           |
| `backgroundEdge` | `#04070d`           | `#e3e9f4`             | Gradient stop, bottom                        |
| `surface`        | `#101725`           | `#ffffff`             | Cards, sheets                                |
| `surfaceRaised`  | `#18202f`           | `#f6f8fc`             | Inputs, inset fills                          |
| `surfaceSunken`  | `#0b111c`           | `#e8edf6`             | Tracks, wells, unselected pills              |
| `textPrimary`    | `#eef3fb`           | `#0a1224`             | Headings, amounts                            |
| `textSecondary`  | `#b3c0d4`           | `#44506a`             | Body text                                    |
| `textMuted`      | `#8494ab`           | `#5a6b85`             | Labels, timestamps                           |
| `textDisabled`   | `#66738a`           | `#828fa6`             | Placeholders, inactive controls              |
| `border`         | `#607089`           | `#7e8a9f`             | **Every visible boundary.** 3.3:1 on surface |
| `borderSubtle`   | `#232c3b`           | `#dde3ec`             | Hairlines, decorative only                   |
| `primary`        | `#9db4ea`           | `#1f3d8f`             | Buttons, links, focus                        |
| `primaryFg`      | `#080c15`           | `#ffffff`             | Text on `primary`                            |
| `primarySoft`    | `#1b2740`           | `#e4eafb`             | Soft accent fills                            |
| `income`         | `#7fbb99`           | `#2f6b4f`             | Income amounts, positive flow                |
| `expense`        | `#8fa3a4`           | `#3d5152`             | Spending amounts — neutral, routine          |
| `transfer`       | `#d6b46a`           | `#7a5c07`             | Wallet-to-wallet transfers                   |
| `overlay`        | `rgba(4,7,13,0.66)` | `rgba(10,18,36,0.44)` | Scrim behind sheets                          |

#### Why borders carry the boundaries

**Amended 2026-09-25.** The previous palette was one hue at three lightnesses:
`background` `#d9e5fd`, `surface` `#e6f2ff`, `surfaceRaised` `#f4ffff`. Measured,
`background` vs `surface` was **1.12:1** and `surface` vs `surfaceRaised` was
**1.11:1** — both far under the 3:1 that Principle 7 sets for UI components. Any
card built from those fills was, by construction, invisible. It also made
`textDisabled` the same hex as `border` in both themes, and `textDisabled` on a
dark surface measured **1.96:1**.

The rule now, and it is the rule that made the difference:

> **A card's fill is never its boundary. The 1px border is.**

White on `#eef2f8` is about 1.1:1 and that is fine and expected. The `border` at
3.3:1 is what makes the edge visible, and it is why `Card` carries a border
unconditionally. Text pairs all clear 4.5:1 and `border` clears 3:1 in both
themes. The soft gradient on the page is atmosphere and is held close to the
base `background` in luminance for the same reason — it must never be able to
degrade text contrast.

### State Palette

Three states only. Not a severity gradient — distinct financial realities.

| Token          | Dark Hex  | Light Hex | Use For                                                                                                           |
| -------------- | --------- | --------- | ----------------------------------------------------------------------------------------------------------------- |
| `stateSafe`    | `#7fbb99` | `#2f6b4f` | Safe-to-Spend is healthy, Period on track                                                                         |
| `stateCaution` | `#d6b46a` | `#7a5c07` | Safe-to-Spend below 20% of the sum of active Assignments for the active Period (rounded down to the nearest Rand) |
| `stateAlert`   | `#d09a90` | `#8a4034` | Over-committed, negative Safe-to-Spend                                                                            |

**Rule:** `stateAlert` is never paired with shame language. It is a number, not a verdict.

### Category Accent Colors

**Amended 2026-09-25.** These were eight lightnesses of a single purple-violet
hue (~290°). Measured against `surfaceRaised` in light mode they ranged from
**1.35:1** to **18.55:1**, so the first three swatches were effectively invisible,
and because they differed only in lightness, "Food" and "Transport" were the
same colour. Four of the eight also failed as a chip fill behind white text.

They are now eight distinct hues, and each one has a **light fill and a dark
fill**, because a deep tone vanishes on a near-black surface and a pale tint
vanishes on white. Light fills take white text, dark fills take ink — the
foreground is derived from the fill's luminance, never assumed.

| Accent      | Light fill | Dark fill | Fixed icon   |
| ----------- | ---------- | --------- | ------------ |
| `food`      | `#c2410c`  | `#f0a58a` | `ForkKnife`  |
| `transport` | `#1d4ed8`  | `#a3b8f5` | `Bus`        |
| `bills`     | `#b91c1c`  | `#f4a9a4` | `Lightning`  |
| `data`      | `#0e7490`  | `#8fd0e2` | `WifiHigh`   |
| `study`     | `#6d28d9`  | `#c0aef0` | `BookOpen`   |
| `health`    | `#047857`  | `#8ed4b3` | `FirstAid`   |
| `social`    | `#be185d`  | `#f0a3c2` | `UsersThree` |
| `other`     | `#5a6779`  | `#b6c0cf` | `Handbag`    |

**Rule:** the icon is the signal and the hue is the reinforcement. Every
category carries a fixed Phosphor icon precisely so colour never has to be the
only thing telling two categories apart — which is also what satisfies the
Colour Independence rule in `03_Patterns.md`.

`health` sits near `stateSafe` in hue. That is accepted deliberately and
mitigated the same way: a state is only ever rendered with its state icon
(`CheckCircle`, `Warning`, `Prohibit`) and a text label, never a bare colour.

`resolveAccentKeyForCategory()` in `apps/mobile/src/lib/category-accent.ts`
maps a category to an accent by name, falling back to a round-robin over a
seed order that interleaves the hues. Positional assignment is gone: it was
giving the third seeded category the same accent as Bills purely because of
where it sat in the array.

## Spacing

Base unit: 4px. All values are multiples of 4.

| Token         | Value | Use For                                 |
| ------------- | ----- | --------------------------------------- |
| `spacing.xs`  | 4px   | Icon padding, label-to-input gap        |
| `spacing.sm`  | 8px   | Between related elements                |
| `spacing.md`  | 12px  | Between list items, handle bar padding  |
| `spacing.lg`  | 16px  | Screen horizontal padding, card padding |
| `spacing.xl`  | 24px  | Section gaps                            |
| `spacing.2xl` | 32px  | Large section separators                |
| `spacing.3xl` | 48px  | Bottom padding above FAB                |

**Button Padding:** Asymmetric. Primary-action axis gets more space.

- `Button md`: 16px horizontal, 8px vertical (2:1)
- `Button lg`: 24px horizontal, 12px vertical (2:1)
- Icon-to-text gap inside button: `spacing.xs`

---

## Border Radius

| Token         | Value  | Use For                       |
| ------------- | ------ | ----------------------------- |
| `radius.none` | 0px    | Full-width lists, data tables |
| `radius.sm`   | 4px    | Small chips, tags             |
| `radius.md`   | 8px    | Buttons, inputs, small cards  |
| `radius.lg`   | 12px   | Cards, bottom sheets          |
| `radius.xl`   | 16px   | Modals, dialogs               |
| `radius.full` | 9999px | Pills, FABs, avatars          |

---

## Shadows / Elevation

NUMI is flat by default. Elevation is reserved for overlays and interactive layers.

| Token         | Value (Light)                  | Value (Dark)                  | Use For              |
| ------------- | ------------------------------ | ----------------------------- | -------------------- |
| `shadow.none` | none                           | none                          | Default surface      |
| `shadow.sm`   | `0 1px 2px rgba(1,3,14,0.08)`  | `0 1px 2px rgba(0,0,0,0.24)`  | Subtle lift on press |
| `shadow.md`   | `0 4px 12px rgba(1,3,14,0.10)` | `0 4px 12px rgba(0,0,0,0.32)` | Bottom sheets, cards |
| `shadow.lg`   | `0 8px 24px rgba(1,3,14,0.14)` | `0 8px 24px rgba(0,0,0,0.40)` | Modals, dialogs      |

**Rule:** No blur-heavy shadows on budget devices. Solid, tight shadows only.

---

## Motion / Animation

Calm, informative, never decorative.

| Token            | Duration | Easing        | Use For                             |
| ---------------- | -------- | ------------- | ----------------------------------- |
| `motion.instant` | 100ms    | `ease-out`    | Color change, opacity toggle        |
| `motion.fast`    | 200ms    | `ease-out`    | Button press, icon swap             |
| `motion.default` | 300ms    | `ease-in-out` | Sheet open, card expand             |
| `motion.slow`    | 500ms    | `ease-in-out` | Page transition, hero number change |

**Rules:**

- Respect `prefers-reduced-motion`. All transitions become instant.
- No bounces, springs, or elastic overshoot. NUMI is not playful with money.
- The Safe-to-Spend number changes with a 300ms count-up/down animation. When `prefers-reduced-motion` is enabled, the count-up/down is disabled and the value changes instantly.

---

## Iconography

**Set:** Phosphor Icons (`phosphor-react-native` / `@phosphor-icons/react`). Weight: Regular (default), Fill for selected and active states, Bold inside a solid accent.

`react-native-svg` is a peer of `phosphor-react-native` and must be declared
directly in `apps/mobile/package.json`. Under pnpm's strict resolution an
undeclared transitive peer is not guaranteed to resolve.

**Never import a Phosphor export in a screen.** Screens reference names from the
`icons` registry in `apps/mobile/src/components/app-icon.tsx`, so the library can
be swapped in one file and so a missing icon is a type error rather than a blank
space at runtime.

| Token     | Size | Use For                          |
| --------- | ---- | -------------------------------- |
| `icon.xs` | 16px | Inline indicators, chips         |
| `icon.sm` | 20px | List items, compact rows         |
| `icon.md` | 24px | Buttons, navigation, default     |
| `icon.lg` | 32px | Empty states, feature highlights |

**Rules:**

- Icons are semantic, not decorative. Every icon must reinforce meaning.
- No emoji. Ever.
- Category icons are selected from a fixed set of 24 Phosphor icons (e.g., `ShoppingCart`, `Bus`, `WifiHigh`, `House`).

---

## Z-Index / Elevation Layers

| Token       | Value | Use For                |
| ----------- | ----- | ---------------------- |
| `z.base`    | 0     | Default content        |
| `z.sticky`  | 10    | Sticky headers         |
| `z.overlay` | 50    | Backdrops, scrims      |
| `z.sheet`   | 100   | Bottom sheets          |
| `z.modal`   | 200   | Modals, dialogs        |
| `z.toast`   | 300   | Toasts, banners        |
| `z.fab`     | 400   | Floating Action Button |

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
