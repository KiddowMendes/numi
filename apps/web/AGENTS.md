# web

## Overview

The Next.js 16 web app, a client side mirror of the mobile experience. Static export is the deployment target, so there is no backend server.

## Stack

- Next.js 16, React 19, TypeScript
- App router under `src/app/`
- Shared configs from tooling: @repo/eslint-config and @repo/typescript-config

## Commands

```bash
pnpm --filter web dev          # local dev on port 3000
pnpm --filter web build
pnpm --filter web lint
pnpm --filter web check-types
```

## Conventions

- `src/app/` is the canonical app directory. The empty `app/` folder at the workspace root is a scaffold duplicate; do not add new code there.
- The web app never imports `@numi/database` (a forbidden arrow in the monorepo structure doc).

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._