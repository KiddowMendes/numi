---
type: adr
id: ADR-0001
title: Design system reset — palette, component retirements, and onboarding shape
status: Accepted
date: 2026-09-25
owner: Elton Pascoal
decides:
  - "docs/playbook/04_Design_System/01_Tokens.md"
  - "docs/playbook/04_Design_System/02_Components.md"
  - "docs/playbook/04_Design_System/03_Patterns.md"
supersedes: null
relates_to:
  - "docs/playbook/00_Foundation/02_Principles.md"
  - "docs/context/PROJECT_BRIEF.md"
---

# ADR-0001 — Design system reset

## Context

The locked design system in `docs/playbook/04_Design_System/` was written in
August 2026 and never implemented. The tokens, components, and patterns existed
as prose while the app was built from the Expo starter template, so by the time
this ADR was written the two had diverged in ways that were not cosmetic.

Three classes of problem, in increasing severity.

**1. The package was empty.** All six files in
`packages/design-system/src/` were zero bytes. Tokens lived in
`apps/mobile/src/constants/tokens.ts` and were not shared. `apps/web` was the
untouched Turbopack template, loading Geist rather than the specified Inter.

**2. Two token systems ran side by side.** Onboarding used the new vocabulary
(`spacing.lg`, `type="heading1"`). The four tab screens and Review used a legacy
shim (`Spacing.four`, `type="title"`, `type="smallBold"`), and `ThemedText`
silently remapped the legacy names — `title` resolved to `heading1`, so two
different intents in the codebase rendered at the same size.

**3. The palette failed its own contrast rule.** `01_Tokens.md` Principle 7 sets
WCAG AA as non-negotiable: 4.5:1 for body text, 3:1 for UI components. Measured
against the specified palette:

| Pair                                          | Measured | Required | Result |
| --------------------------------------------- | -------- | -------- | ------ |
| `background` `#d9e5fd` vs `surface` `#e6f2ff` | 1.12:1   | 3:1      | Fail   |
| `surface` vs `surfaceRaised`                  | 1.11:1   | 3:1      | Fail   |
| `textDisabled` on dark surfaces               | 1.96:1   | 4.5:1    | Fail   |
| category swatch 1 on `surfaceRaised`          | 1.35:1   | 3:1      | Fail   |

The three light surfaces were one hue (265°) at three lightnesses. Any card built
from those fills was, by construction, invisible. `textDisabled` was also the
same hex as `border` in both themes, and four of the eight category swatches
failed as a chip fill behind white text.

Compounding this, four screens hardcoded `#F0F0F3` — the Expo template grey —
which measures **1.00:1** against the light `surface` and **17.3:1** against the
dark one. Those cards were invisible in light mode and glaring in dark mode.

Two motion violations sat in library defaults and hand-written animation:
`BottomSheet` used `Animated.spring` with damping and stiffness, and
`react-native-toast-message` defaults to `{ type: 'spring', friction: 8 }`.
`02_Components.md` states "No bounces, springs, or elastic overshoot. NUMI is
not playful with money."

Finally, `01_Onboarding/Screens.md` specified a six-screen, sheet-based
onboarding over the Home screen, while the app had three full-screen routes.
876 lines of locked screen specification described screens that did not exist.

## Decision

### 1. Move tokens to `packages/design-system` and give the package a real contract

Tokens now live in `packages/design-system/src/tokens/`, consumed as source.
The package imports no renderer: font family _resolution_ — the part needing
`Platform.select` — lives in `apps/mobile/src/constants/tokens.ts`, which
re-exports everything and merges type metrics into `TextStyle` objects. This is
what allows `apps/web` to consume identical numbers without a native dependency.

`react-native-svg` is now declared directly in `apps/mobile/package.json`. It is
a peer of `phosphor-react-native`, and under pnpm's strict resolution an
undeclared transitive peer is not guaranteed to resolve.

### 2. Replace the palette, and make borders carry the boundaries

New light base `#eef2f8`, white `surface`, navy `primary` `#1f3d8f`. New dark base
`#080c15`. The navy identity is preserved deliberately; the blue-on-blue wash is
not.

The structural rule that makes it work:

> **A card's fill is never its boundary. The 1px border is.**

White on `#eef2f8` is about 1.1:1 and that is expected. `border` is `#7e8a9f`
(light) and `#607089` (dark), measuring 3.25:1 and 3.25:1 against their own
surfaces. Every text pair clears 4.5:1. `Card` therefore carries a border
unconditionally; removing it in favour of a fill change is now a defect.

The page background is a soft three-stop gradient for atmosphere only, held close
to the base `background` in luminance so it can never degrade text contrast.

### 3. Category accents become eight hues, each with a light and a dark fill

The old ramp was eight lightnesses of one hue (290°), so "Food" and "Transport"
were the same colour. Accents are now eight distinct hues, each with a light fill
(deep tone, white text) and a dark fill (pale tint, ink text) — a deep tone
vanishes on a near-black surface and a pale tint vanishes on white. Foreground
colour is derived from the fill's relative luminance, never assumed.

Every category carries a fixed Phosphor icon. This is what lets colour stay
decorative and satisfies the Colour Independence rule in `03_Patterns.md`.
`health` sits near `stateSafe` in hue; that is accepted and mitigated the same
way — a state is only ever rendered with its state icon and a text label.

Positional accent assignment is removed. `resolveAccentKeyForCategory()` maps by
name, falling back to a round-robin over a seed order that interleaves hues. The
old behaviour gave the third seeded category the same accent as Bills purely
because of its array position.

### 4. Retire three components, add seven

| Retired                                                    | Replaced by                                     | Why                                                                                                                   |
| ---------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `SegmentedControl`                                         | `PillToggle`                                    | A single control covering both radiogroup and tab semantics; full-radius pill rather than a square track              |
| `FAB`                                                      | `CenterDockButton`                              | Docked centre-bottom, 66px, floating above the tab bar. A centre dock keeps the thumb on the same target on every tab |
| `Card` variants (`WalletCard`, `CategoryCard`, `StatCard`) | `Card` with `tone`, plus `GroupRow`/`GroupList` | The variants were never used; the grouped-row pattern carries the same content and matches the iOS Settings idiom     |

Added: `GroupRow`/`GroupList`, `GemBadge`, `CircleActionButton`, `PillToggle`,
`CategoryPicker`, `ProgressDots`, `CenterDockButton`.

Press feedback is opacity only. `motion.pressScale` exists for the dock button
alone and is clamped to 0.94–0.98 so no caller can overshoot into playfulness.

### 5. Icons go through a registry

Screens reference names from `icons` in `app-icon.tsx`, never a Phosphor export
directly. A missing icon is then a type error rather than a blank space at
runtime, and the library is swappable in one file. Tab bar glyphs were the
characters `$`, `P`, `H`, `S`.

### 6. Onboarding is three routes, and the first one carries the theme choice

`03_Patterns.md` said "No onboarding wizard. No 'Next' buttons 5 times." The code
had drifted to a three-screen wizard that did not match its spec. Onboarding is
now three full-screen routes — wallet, period, assignment — with the wallet
questions and the light/dark choice sharing the first screen, because splitting
them is what made it read as a wizard. The theme choice is here because
`01_Tokens.md` requires it and it had never been built.

Both onboarding `TextField`s and the sheet keypad mean no OS keyboard is needed
for a numeric entry. `AmountInput` uses an always-visible keypad, which serves
the locked principle that a R20 purchase is logged in a single screen.

### 7. GoTyme Bank's onboarding flow is explicitly rejected as a reference

GoTyme's six-step onboarding is the wrong reference for NUMI. Five of its six
steps — mobile number, personal information, biometric KYC with government ID,
tax residency declaration, and PIN setup — exist because GoTyme opens a
**regulated bank account**. They are FICA/RICA obligations in South Africa and BSP
obligations in the Philippines, not UX choices.

NUMI is not a bank, holds no funds, and has no account to open:

- `User` is `{ id: string; tier: UserTier }` — `packages/domain/src/entities/User.ts`
- the `users` table has two columns — `packages/database/src/schema.ts`
- no auth, KYC, PIN, or phone code exists anywhere in `apps/` or `packages/`
- `PROJECT_BRIEF.md` requires the app work "without an internet connection,
  account, or subscription"

Adopting the flow would require an identity model, a schema migration, an auth
layer, and a network dependency, in order to satisfy obligations that do not
apply. Its step one — a value-prop welcome screen — also contradicts the locked
wizard rule.

What was taken from GoTyme is the app shell, not the onboarding: the large hero
number, a single centre-docked primary action, pill toggles, grouped list rows,
faceted status badges, and generous spacing. The reference that informed this
work is recorded in `references/`, not in a flow.

## Consequences

**Positive**

- Every contrast claim in `01_Tokens.md` now carries the measurement that
  justifies it. Changing a hex means re-measuring it.
- One token source shared by both apps, with the web app no longer contradicted
  by its own font choice.
- Screens can no longer disagree about what `title` means.
- Spring animations can no longer be introduced silently by a library default.

**Negative**

- Every visual regression since August 2026 is invalid. There is no
  compatibility layer, because there was nothing to be compatible with.
- `apps/web` now has a design system it has not adopted. It is a template stub
  and `scope.md` says it "stays as is until mobile is proven"; the Geist font
  remains a known contradiction with `01_Tokens.md`.
- The `categories` seed in `store/provider.tsx` still carries a `color` hex
  required by the `Category` entity. It is a fallback: the UI resolves the live
  accent by name. The entity field is now documented as such.

**Neutral**

- `05_Debt_Tracking/` remains a reserved `Planned` stub. `PROJECT_BRIEF.md:58`
  places debt tracking outside v1.
- `docs/specs/0001-transaction-entry.md` is left untouched. A spec is a
  point-in-time record; rewriting it would erase the decision history.

## Note on numbering

`04_Design_System/01_Tokens.md` and its `_LOCK.md` both cite **ADR-007**, which
has never existed — `docs/adr/` contained only `.gitkeep`. This record is
numbered `ADR-0001`. The stale `ADR-007` references have been repointed here
rather than left dangling, and numbering should continue from `0002`.
