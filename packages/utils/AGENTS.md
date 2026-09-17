# @numi/utils

## Overview

Small helpers shared across packages, mainly the currency and date functions. It depends on nothing inside the workspace.

## Stack

- TypeScript

## Commands

```bash
pnpm --filter @numi/utils check-types
```

## Conventions

- Cents conversion happens here and only here, in `src/currency.ts`. Money is integer cents everywhere else.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._