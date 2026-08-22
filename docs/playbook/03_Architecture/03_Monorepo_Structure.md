---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/03_Architecture/02_System_Design.md"
  - "docs/playbook/03_Architecture/04_Offline_First_Strategy.md"
decision_record: none
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
│   ├── App.tsx
│   ├── index.js
│   ├── app/                 # expo-router file-based routes
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   └── src/
│       ├── components/
│       ├── constants/
│       └── hooks/
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
│       ├── calculations/
│       └── api/
│
├── database/                # @numi/database — Repository layer
│   ├── package.json         # NOT YET CREATED (planned with sync work)
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── schema.ts
│       ├── migrations/
│       └── mappers/
│
├── design-system/           # @numi/design-system — Tokens
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── tokens/
│       └── theme.ts
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

**Repo note:**
- The three `@repo/*` packages are create-turborepo leftovers. Remove them once `tooling/` configs are in use.
- `packages/database` does not exist yet. It is created when the sync layer (v2) begins.

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

| Package | Import Name | Scope | State |
|---|---|---|---|
| Domain | `@numi/domain` | Business engine | Exists |
| Database | `@numi/database` | SQLite repository | Not created yet |
| Design System | `@numi/design-system` | Tokens | Exists |
| Types | `@numi/types` | Shared interfaces | Exists |
| Utils | `@numi/utils` | Currency, date helpers | Exists |

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