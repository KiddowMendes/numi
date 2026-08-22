---
version: 1.0.0
status: Locked
owner: Product
related_documents: [03_Architecture/03_Monorepo_Structure.md, 01_Domain/04_Engine_API.md]
decision_record: null
---

# 01 — Coding Standards

> **Status:** Draft

## Stack

- **Language:** TypeScript only. No JavaScript files in `apps/` or `packages/`.
- **tsconfig:** Strict mode on. No `any`, no `@ts-ignore`. If a type fight takes more than a few minutes, extract a type alias or fix the upstream type instead of casting.
- **Money:** All money values are integer cents (`number`). Never floats. Conversions happen only in `packages/utils/src/currency.ts`.
- **Validation:** Engine mutating functions return `Result<AppState, EngineError>` (see `01_Domain/04_Engine_API.md`). Do not throw inside the engine; collect errors and return them.

## Naming

| Thing | Convention | Example |
|---|---|---|
| Files (domain) | kebab-case | `wallet-repository.ts` |
| Functions | camelCase, verb-first | `getWalletBalance()` |
| Types / interfaces | PascalCase | `WalletState` |
| Constants | UPPER_SNAKE_CASE | `MAX_CATEGORIES` |
| Components (mobile/web) | PascalCase | `WalletCard.tsx` |
| CSS / style files | co-located | `WalletCard.styles.ts` |

## Imports

- Only import from `@numi/*` package entry points. Never deep-import into another package's internals.
- Domain engine packages do not import from mobile/web code.

## Formatting & Lint

- **Prettier** for formatting. Line width 100.
- **ESLint** with the repo's shared config from `tooling/`.
- Run `pnpm format` and `pnpm lint` before every commit.
- Sort imports: external → `@numi/*` → relative.

## Folder Structure

Follow `03_Monorepo_Structure.md`. Every new folder in `packages/` or `apps/` must be declared there first.

## Testing Rules

- Domain logic (C1–C15, BR-*, Edge Cases) must have unit tests. No exceptions.
- UI tests are optional; write them when the component interacts with money or dates.
- See `03_Testing_Strategy.md` for the full policy.

## Commits

- Follow `02_Git_Workflow.md` commit conventions. No `git add -A` without review.