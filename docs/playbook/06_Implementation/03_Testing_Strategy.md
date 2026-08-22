---
version: 1.0.0
status: Locked
owner: Product
related_documents: [01_Domain/03_Calculations.md, 01_Domain/02_Business_Rules.md, 06_Implementation/01_Coding_Standards.md]
decision_record: null
---

# 03 — Testing Strategy

> **Status:** Draft

## Pyramid

```
        /E2E\            Deferred
       /Comp\            Optional
      /Integr\           Recommended — engine + repository
     /  Unit  \          Non-negotiable — domain
```

## Unit Tests (Non-negotiable)

- **Scope:** Every calculation C1–C15 in `01_Domain/03_Calculations.md`, every business rule BR-* in `01_Domain/02_Business_Rules.md`, and every Edge Case recorded in `05_Features/*/Edge_Cases.md`.
- **Coverage:** 100% of `packages/domain` line coverage. `coverage` check is part of CI.
- **Tool:** Vitest.
- **Data:** Factory helpers per entity (`packages/domain/tests/factories/`). No hand-rolled inline objects.
- **Money:** Assert on integer cents. Never on floats.

## Integration Tests (Recommended)

- **Scope:** Engine + repository (`packages/database`) — wallet persistence round trips, period close + reopen, engine restarts with existing data.
- **Tool:** Vitest with in-memory SQLite.
- **Target:** ≥ 80% of `packages/database`.
- **Note:** `packages/database` does not exist yet — it is created when the sync layer begins (v2). The integration suite is specified now and stands up with the package.

## Component Tests (Optional)

- **Scope:** Components that render money or dates (`packages/design-system`).
- **Tool:** React Testing Library + Vitest (web), React Native Testing Library + Jest (mobile).
- Write them when a bug was caught by a unit-level gap here; otherwise keep the suite small.

## E2E (Deferred)

- Not part of v1. Revisit when a second client exists or before any public multi-device promise.

## Coverage Gates

| Layer | Gate |
|---|---|
| `packages/domain` | 100% (blocking) |
| `packages/database` | ≥ 80% (blocking when package exists) |
| UI components | no gate |

## CI

- Unit + integration run on every push (pre-push hook per `02_Git_Workflow.md`).
- Coverage report uploaded on every `main` push.

## Test Naming

`describe(calculation/rule id)` → `it(behavior)`, e.g.:

```
describe('C1. Wallet Balance Verification') // #1
  it('returns total minus spent for the active period')
```