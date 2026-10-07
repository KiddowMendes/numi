---
version: 1.1.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/03_Architecture/02_System_Design.md"
  - "docs/playbook/03_Architecture/04_Offline_First_Strategy.md"
  - "docs/adr/0002-onboarding-wizard-flow.md"
decision_record: "docs/adr/0002-onboarding-wizard-flow.md"
---

# 03 — Monorepo Structure

> The actual folder layout. If the repo does not match this document, the repo is wrong.

---

## Root

```
numi/
├── .npmrc                   # node-linker=hoisted (Metro symlink fix)
├── pnpm-workspace.yaml      # apps/*, packages/*
├── turbo.json
├── package.json             # name: numi
├── .gitignore
├── README.md
├── apps/
├── packages/
├── docs/
└── tooling/
```

---

## Apps

```
apps/
├── mobile/                  # Expo (React Native) + expo-router
│   ├── package.json
│   ├── tsconfig.json
│   ├── app.json
│   ├── metro.config.js
│   ├── babel.config.js
│   ├── app/                 # expo-router file-based routes
│   │   ├── _layout.tsx      # bootstrap gate + Stack.Protected
│   │   ├── (onboarding)/    # welcome, pin, quick-setup, all-set
│   │   ├── (auth)/          # unlock
│   │   ├── (tabs)/          # index, plan, history, settings
│   │   └── review.tsx
│   └── src/
│       ├── components/
│       │   ├── ui/          # primitives + feature components, barrel at index.ts
│       │   └── *.tsx        # AppIcon, ThemedText, ThemedView, ScreenBackground, Toast
│       ├── constants/       # tokens.ts — the only seam onto @numi/design-system
│       ├── hooks/
│       ├── lib/             # category-accent, format, polyfill, pin
│       ├── store/           # store.ts, provider.tsx, index.ts
│       └── types/
│
└── web/                     # Next.js (static export)
    ├── package.json
    ├── tsconfig.json
    ├── next.config.js
    ├── tailwind.config.ts
    ├── postcss.config.mjs
    └── src/
        ├── app/
        ├── components/
        └── lib/             # not yet created
```

**Rule:** `apps/mobile` and `apps/web` do not import each other. They both import from `packages/*`.

**Repo note:** `apps/web` still contains a scaffold `app/` directory at its root, duplicated with `src/app/`. The duplicate must be removed; `src/app/` is canonical.

**Added by ADR-0002.** The `app/(auth)/` group and `src/lib/pin.ts` are new.
`App.tsx` and `index.js` are both zero bytes and have been removed from this
tree — `main` is `expo-router/entry`, so expo-router is the only entry point and
those files are dead weight from the starter template.

**Three native dependencies were added for the PIN lock:** `expo-haptics`,
`expo-secure-store`, `expo-crypto`. `expo-secure-store` also needs an entry in
`app.json` `plugins`. None of the three is exercised by `lint`, `check-types`,
or the unit tests — they are proven only on a device.

**`apps/mobile` has no `build` script.** Metro bundles on demand, so there is
nothing for `turbo run build` to do. It also had no `check-types` script until
ADR-0002 added one, which meant `turbo run check-types` silently skipped the
entire app. A package with no script for a task is invisible to that task, not
passing it.

---

## Packages

```
packages/
├── domain/                  # @numi/domain — The Engine
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── index.ts
│       ├── entities/
│       ├── rules/
│       ├── calculations/    # + *.test.ts colocated beside each module
│       ├── api/
│       └── test-support/    # unit-test factories, never exported from index.ts
│
├── database/                # @numi/database — Repository layer
│   ├── package.json
│   ├── tsconfig.json
│   ├── vitest.config.ts
│   └── src/
│       ├── index.ts
│       ├── schema.ts
│       ├── repository.ts
│       ├── migrations/
│       ├── mappers/
│       └── types/           # ambient declarations for untyped deps (sql.js)
│
├── design-system/           # @numi/design-system — Tokens
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── color-scheme.ts
│       └── tokens/
│
├── types/                   # @numi/types — Shared TypeScript
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       └── shared.ts
│
├── utils/                   # @numi/utils — Helpers
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── currency.ts
│       └── date.ts
│
├── ui/                      # @repo/ui — Turborepo scaffold leftover
├── eslint-config/           # @repo/eslint-config — scaffold leftover
└── typescript-config/       # @repo/typescript-config — scaffold leftover
```

**Rule:** `packages/domain` must not import `packages/database`. The dependency arrow points inward: `database` depends on `domain`, not reverse.

**Repo note:** `packages/domain` has no `tests/` folder — unit tests are colocated in `src/` next to the module they exercise, and `src/test-support/` holds the shared factories.

**Repo note:**

- The three `@repo/*` packages are create-turborepo leftovers. Remove them once `tooling/` configs are in use.

---

## Docs

```
docs/
├── context/
│   └── PROJECT_BRIEF.md
├── resources/
│   └── money_habits_for_study_success.md
├── playbook/
│   ├── 00_Foundation/
│   ├── 01_Domain/
│   ├── 02_Product_Mechanics/
│   ├── 03_Architecture/
│   ├── 04_Design_System/
│   ├── 05_Features/
│   ├── 06_Implementation/
│   ├── 07_Roadmap/
│   └── 08_Changelog/
├── adr/
└── assets/
```

**Rule:** Docs live at repo root, outside `apps/` and `packages/`. They are not compiled or bundled.

---

## Tooling

```
tooling/
├── eslint-config/
│   ├── package.json
│   └── index.js
└── typescript-config/
    ├── package.json
    ├── base.json
    ├── nextjs.json
    └── react-native.json
```

**Rule:** Shared configs only. No application code.

**Repo note:** `tooling/*` is not listed in `pnpm-workspace.yaml`. Add `- "tooling/*"` when the configs are referenced as workspace packages, or import them via file paths.

---

## Dependency Graph

```
                    apps/mobile        apps/web
                         │                │
                         ▼                ▼
    ┌─────────────────────────────────────────────┐
    │         packages/design-system              │
    └─────────────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    ▼                    ▼                    ▼
packages/database   packages/domain      packages/utils
    │                    │                    │
    └────────────────────┼────────────────────┘
                         ▼
                   packages/types
```

**Forbidden arrows:**

- `packages/domain` → `packages/database`
- `packages/domain` → `apps/*`
- `packages/types` → any package (leaf node)
- `apps/mobile` → `apps/web`
- `apps/web` → `packages/database`

---

## Package Naming

| Package       | Import Name           | Scope                  | State           |
| ------------- | --------------------- | ---------------------- | --------------- |
| Domain        | `@numi/domain`        | Business engine        | Exists          |
| Database      | `@numi/database`      | SQLite repository      | Not created yet |
| Design System | `@numi/design-system` | Tokens                 | Exists          |
| Types         | `@numi/types`         | Shared interfaces      | Exists          |
| Utils         | `@numi/utils`         | Currency, date helpers | Exists          |

---

## Workspace References

In `apps/mobile/package.json`:

```json
{
  "dependencies": {
    "@numi/domain": "workspace:*",
    "@numi/database": "workspace:*",
    "@numi/design-system": "workspace:*",
    "@numi/types": "workspace:*",
    "@numi/utils": "workspace:*"
  }
}
```

In `apps/web/package.json` (no database — forbidden arrow):

```json
{
  "dependencies": {
    "@numi/domain": "workspace:*",
    "@numi/design-system": "workspace:*",
    "@numi/types": "workspace:*",
    "@numi/utils": "workspace:*"
  }
}
```

**Repo note:** Mobile currently imports only Expo SDK packages; web imports `@repo/ui`. The `@numi/*` workspace references replace these once package names are set.

---

## What Happens After This Document

This structure is enforced by `turbo.json` and pnpm workspaces. Next: `04_Offline_First_Strategy.md` — the detailed rules for sync, conflict resolution, and the queue.

Next: docs/playbook/03_Architecture/04_Offline_First_Strategy.md
