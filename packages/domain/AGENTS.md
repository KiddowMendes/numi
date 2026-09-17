# @numi/domain

## Overview

The business engine: pure TypeScript with no UI. It owns entities, business rules, calculations, and the public API that returns a new `AppState` after each operation.

## Stack

- TypeScript, no framework
- Vitest for tests, with @vitest/coverage-v8
- Depends only on @numi/types and @numi/utils

## Commands

```bash
pnpm --filter @numi/domain test
pnpm --filter @numi/domain test:coverage
pnpm --filter @numi/domain check-types
```

## Conventions

- Mutating functions return `Result<AppState, EngineError>`, never throw.
- Money stays integer cents, and the rules live in `docs/playbook/01_Domain/`.
- Every business rule and calculation carries a unit test; line coverage must hold at 100%. Test names run `describe(calculation or rule id) it(behavior)`.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._