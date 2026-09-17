# @numi/database

## Overview

The repository layer over sql.js, SQLite compiled to WebAssembly and held in memory on the device. It owns the schema, the migrations, and the mappers that turn rows into domain entities.

## Stack

- TypeScript
- sql.js
- Vitest for tests, with @vitest/coverage-v8
- Depends on @numi/domain and @numi/types

## Commands

```bash
pnpm --filter @numi/database test
pnpm --filter @numi/database test:coverage
pnpm --filter @numi/database check-types
```

## Conventions

- Repository functions accept and return domain entities. The mappers in `src/mappers/` are the only place rows become entities.
- Integration test coverage target is 80% or higher.

## Related specs

- [docs/playbook/03_Architecture/04_Offline_First_Strategy.md](../../docs/playbook/03_Architecture/04_Offline_First_Strategy.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._