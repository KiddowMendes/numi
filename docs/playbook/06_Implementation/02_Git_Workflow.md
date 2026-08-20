---
version: 1.0.0
status: Draft
owner: Product
related_documents: []
decision_record: null
---

# 02 — Git Workflow

> **Status:** Draft

## Model

- Single long-lived branch: `main`. No `develop`.
- Feature work is committed directly to `main` (solo developer). Branch only when you expect multiple commits and want checkpoint safety: `feature/<short-name>`.
- Experimentation that may be discarded: `spike/<short-name>` (the only branch that may be deleted after use).

## Commit Conventions

Format: `type(scope): subject` — lowercase, imperative, 72 chars max.

| Type | Use for |
|---|---|
| `feat` | New capability |
| `fix` | Bug fix |
| `docs` | Playbook, README, ADR changes |
| `refactor` | Behavior-preserving change |
| `chore` | Tooling, CI, deps |
| `test` | Tests only |
| `perf` | Performance |
| `style` | Formatting, no behavior change |

Scopes: `mobile`, `web`, `domain`, `design-system`, `database`, `playbook`, `context`, `adr`, `repo`.

Subject is a sentence of what happens, not what happened: `fix(domain): return available balance not total balance`.

## Tags

- Cut per package: `mobile@vX.Y.Z`, `web@vX.Y.Z`, `domain@vX.Y.Z`.
- Tags are created only by the release process (`04_Release_Process.md`).

## Before Every Push

1. `pnpm format` (prettier)
2. `pnpm lint` (eslint)
3. `pnpm test` (Vitest for domain + web, Jest for mobile)
4. `pnpm build` (tsc + bundler)

If any step fails, fix or revert before pushing. Never push a red build.

## Rules

- Never force-push `main`.
- Never amend a pushed commit.
- No merge commits on `main`; rebase or commit straight.
- `git add -A` only after `git status` review. Stage intentionally.