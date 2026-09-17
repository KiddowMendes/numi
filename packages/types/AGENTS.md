# @numi/types

## Overview

Shared TypeScript types. It is the leaf of the dependency graph, so it imports nothing from inside the workspace.

## Stack

- TypeScript

## Commands

```bash
pnpm --filter @numi/types check-types
```

## Conventions

- Keep types small and stable: every other package builds on this one, so a breaking change here ripples everywhere.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._