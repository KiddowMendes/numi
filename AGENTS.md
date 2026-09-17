# NUMI

## Stack

- Language / Runtime: TypeScript, Node 18+, React 19
- Apps: an Expo (React Native) mobile app and a Next.js 16 web app
- Key dependencies: expo router, sql.js (local database), zustand (client state), vitest (tests), and the internal `@numi/*` packages
- Package manager: pnpm 9 over a pnpm workspace, run through Turborepo

## Build approach

**Tracer Bullet**: prove one real path through every layer, then thicken.

## Commands

```bash
pnpm install                      # install
pnpm dev                          # dev server
pnpm build                        # build
pnpm lint && pnpm check-types && pnpm format
pnpm --filter @numi/domain test   # tests run per package, no root task
pnpm --filter @numi/database test
```

## Docs

Governing docs live in `docs/playbook/`, versioned and locked. Read first: the coding standards, git workflow, monorepo structure, and testing strategy (under `06_Implementation/` and `03_Architecture/`). `docs/context/PROJECT_BRIEF.md` is the one page product brief and the guard rail for v1. The feature scope and build order live in `docs/scope/scope.md`.

## Rules

- Commit straight to `main` with conventional commits, `type(scope): subject` (scopes: mobile, web, domain, design-system, database, playbook, context, adr, repo). Run `pnpm format`, `pnpm lint`, `pnpm build`, and the package tests before pushing. Never force push `main`.
- App code in `apps/`, shared code in `packages/`, shared configs in `tooling/`. Apps never import each other.
- Import only from the `@numi/*` package entry points, never into another package's internals. Arrows point inward: database depends on domain, domain on types and utils, types is a leaf.
- Money is integer cents (number), never floats. Cents conversion happens only in `packages/utils/src/currency.ts`.
- The domain engine returns `Result<AppState, EngineError>` from its mutating functions. It never throws.
- Strict TypeScript everywhere: no `any`, no `@ts-ignore`.
- Naming: kebab-case file names, camelCase verb-first functions, PascalCase types and components, UPPER_SNAKE_CASE constants. Format with Prettier (line width 100), lint with the shared ESLint config from `tooling/`.
- Domain logic keeps unit tests at 100% line coverage, named `describe(calculation or rule id) it(behavior)`, with money asserted in cents. New folders under `apps/` or `packages/` get declared in the monorepo structure doc first.

## Agent skills

Declined: vercel/turborepo, antfu/skills, callstackincubator/agent-skills, wshobson/agents, jezweb/claude-skills

## Context files

- [apps/mobile/AGENTS.md](apps/mobile/AGENTS.md): the Expo React Native app
- [apps/web/AGENTS.md](apps/web/AGENTS.md): the Next.js web app
- [packages/domain/AGENTS.md](packages/domain/AGENTS.md): the business engine
- [packages/database/AGENTS.md](packages/database/AGENTS.md): the sql.js repository layer
- [packages/design-system/AGENTS.md](packages/design-system/AGENTS.md): tokens and shared UI components
- [packages/types/AGENTS.md](packages/types/AGENTS.md): shared types, a leaf package
- [packages/utils/AGENTS.md](packages/utils/AGENTS.md): currency and date helpers

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._