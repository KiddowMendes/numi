---
type: directory-lock
directory: "03_Architecture"
owner: Elton Pascoal
---

# 03 — Architecture Lock

## What "Locked" Means Here

Technology decisions that serve the Domain. Once locked, changing the stack requires an ADR because it affects `packages/domain`, `apps/mobile`, and `apps/web`.

## Lock Criteria

1. [ ] Every tech choice traces back to a Domain requirement or Foundation principle.
2. [ ] The monorepo structure matches the actual repository.
3. [ ] Offline-first strategy explains conflict resolution, sync, and failure modes.
4. [ ] Security model addresses data-at-rest, no-cloud-default, and premium sync.
5. [ ] No architecture decision contradicts `02_Product_Mechanics/04_Data_Flow.md`.

## Modification Rule

ADR required.

## Directory Inventory

| File | Status | Locked Date | Last ADR |
|---|---|---|---|
| 01_Tech_Stack.md | Locked | 2026-08-22 | — |
| 02_System_Design.md | Locked | 2026-08-22 | — |
| 03_Monorepo_Structure.md | Locked | 2026-08-22 | — |
| 04_Offline_First_Strategy.md | Locked | 2026-08-22 | — |
| 05_Security.md | Locked | 2026-08-22 | — |
