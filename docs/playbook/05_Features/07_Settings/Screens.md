---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/04_Design_System/01_Tokens.md"
  - "docs/playbook/04_Design_System/03_Patterns.md"
  - "docs/adr/0001-design-system-reset.md"
decision_record: ADR-0001
---

# 07 — Settings: Screens

> One screen, three preferences' worth of room.

> **New under ADR-0001.** `SettingsScreen` has existed in code since the start and
> was documented nowhere. `01_Onboarding/Screens.md`, `04_Spending/Screens.md` and
> `02_Budget_Setup/Screens.md` are all locked, and Settings appears in none of
> them. `scope.md` lists it as **Deferred**, so this document is Locked for what
> exists now and the deferred expansion is named below rather than drawn.

---

## Route Map

| #   | Route              | Purpose                               | Kind |
| --- | ------------------ | ------------------------------------- | ---- |
| 1   | `/(tabs)/settings` | Appearance, and the app's own version | tab  |

---

## Screen 1: SettingsScreen

**Route:** `/(tabs)/settings` · `app/(tabs)/settings.tsx`

**Purpose:** Change how NUMI looks. That is all, and it is all v1.

```
┌────────────────────────────────────────────────┐
│ Settings                                       │  heading1
│                                                │
│ APPEARANCE                                     │  PillToggle label, overline
│ ┌──────┐┌──────┐┌─────────┐                    │
│ │☀ Light││☾ Dark││▭ Match  │                    │  PillToggle
│ └──────┘└──────┘└─────────┘                    │  minHeight 40, radius.full
│                                                │  track = surfaceSunken
│ Brightest. Best in direct sun.                  │  caption / textMuted
│                                                │  marginTop −16
│ ABOUT                                          │
│ ╭────────────────────────────────────────────╮ │
│ │ ▢  NUMI                            0.1.0   │ │  GroupRow, static
│ │    Version 0.1.0                           │ │  no chevron
│ ╰────────────────────────────────────────────╯ │
│                                                │
│         ╭─────────────────────────╮            │
│         │  ○  ○      ○      ◉      │            │
│         │ Home Plan His- tory Set │            │
│         ╰─────────────────────────╯            │
└────────────────────────────────────────────────┘
```

| Region | Component                             | Tokens                                           | Derivation                            |
| ------ | ------------------------------------- | ------------------------------------------------ | ------------------------------------- |
| Title  | `ThemedText heading1`                 | 24/700                                           | static                                |
| Theme  | `PillToggle`                          | `minHeight 40`, `radius.full`, `gap spacing.xs`  | from `themePreferences`               |
| Note   | `ThemedText caption` tone `textMuted` | `marginTop −spacing.md`, `marginLeft spacing.xs` | the active preference's `description` |
| About  | `GroupList` + `GroupRow`              | `radius.lg`, 2× hairline border                  | static, no chevron                    |

**Applying the choice is immediate.** `onChange` writes to the store and the whole
tree re-renders against the new palette. There is no Save button and no apply
step. A preference that needs confirming is a preference the user is not sure
about.

**`preference` is read from the store, not local state** — `useStore(s => s.themePreference)`.
The same value the onboarding route 1 writes. Changing it here and going back
through onboarding shows the new choice, not a reset to `light`.

**The three options come from `themePreferences` in `@numi/design-system`:**

| Value    | Label        | Description                      | Icon     |
| -------- | ------------ | -------------------------------- | -------- |
| `light`  | Light        | "Brightest. Best in direct sun." | `sun`    |
| `dark`   | Dark         | "Easier on the eyes at night."   | `moon`   |
| `system` | Match device | "Follows your phone setting."    | `device` |

**`system` is available and is never the default.** `01_Tokens.md` says so
directly, and `defaultThemePreference` is `'light'`. A user who has not chosen
gets the theme that is readable in direct sunlight, which is the condition
`02_Principles.md` R2.4 names.

The one-line description under the toggle is doing real work: it tells the user
_which_ option they are on without them having to map icon to meaning, and
"Best in direct sun" is the argument for why light is the default.

**`matchMedia` and `AccessibilityInfo`.** With `system` selected, the resolved
scheme is recomputed on OS change via `useColorScheme`; there is no app-level
listener to leak. `useReducedMotion` follows the same pattern and is the reference
for it.

**This is the only screen where a preference can change the theme outside
onboarding.** If a second such screen appears, the write goes through
`setThemePreference` in the store, never a direct palette import.

---

## Deferred Expansion

`scope.md` Deferred: _"Settings screen: app preferences and wallet/category
management — needs a decision."_ Not drawn, because nothing is decided.

| Would live here                    | Owner                           | Blocked on                                                   |
| ---------------------------------- | ------------------------------- | ------------------------------------------------------------ |
| Wallet list, add / edit / delete   | Slice 3, Wallet management      | `/architect wallet management`                               |
| Category list, add / edit / remove | Deferred: _Category management_ | no slice, no spec                                            |
| Goals                              | Deferred: _Goal management_     | no slice, no spec. Also outside v1 per `PROJECT_BRIEF.md:58` |
| Theme `system` follow              | **built**                       | —                                                            |
| Export, reset, about               | not in `scope.md`               | no owner                                                     |

**Worth saying plainly:** moving wallet and category management into Settings is
a decision that has not been made. The engine already supports
`createWallet` and `deleteAssignment`, so both are buildable, but _where_ they
live is a product call, and it interacts with whether the plan screen's rows
become editable in place (Slice 2) or via a sheet. Recording the two together is
cheaper than recording them twice.

---

## Removed From This Document

Nothing. This document is new.

For the record, Settings was previously absent rather than removed — which is why
`05_Features/_LOCK.md` had no row for it and a reader working from the Playbook
alone would not have known the screen existed.

---

## Component Mapping

| Screen         | Components                                                              |
| -------------- | ----------------------------------------------------------------------- |
| SettingsScreen | `ScreenBackground`, `ThemedText`, `PillToggle`, `GroupList`, `GroupRow` |

---

## What Happens After This Document

Deferred sections are unspecified by design. Behaviour with an unresolvable
system scheme: Edge_Cases.md.
