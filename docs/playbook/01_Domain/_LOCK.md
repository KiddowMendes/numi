---
type: directory-lock
directory: "01_Domain"
owner: Elton Pascoal
---

# 01 — Domain Lock

## What "Locked" Means Here

Files in this directory define the **business logic independent of any technology**. They describe what is true in the world of South African personal finance. Downstream Architecture and Features documents consume this layer. If Domain changes, Architecture may need to change.

## Lock Criteria

Before any file in this directory can be marked Locked, ALL of the following must be true:

1. [ ] Every entity has a unique name, defined attributes, and clear relationships.
2. [ ] Every business rule is stated as an inviolable fact (not a suggestion).
3. [ ] Every calculation is expressible as pseudocode or a mathematical formula.
4. [ ] The Engine API exposes only what the domain requires — no UI concepts leak in.
5. [ ] No entity or rule contradicts `00_Foundation/03_Glossary.md`.
6. [ ] No entity or rule contradicts `00_Foundation/02_Principles.md`.
7. [ ] The owner can explain every rule to a non-technical person using Glossary terms only.

## Modification Rule

Once Locked, a file may only be changed via this process:

1. Write an ADR in `docs/adr/` explaining the required change and its justification.
2. Update the target file's status from `Locked` to `Draft`.
3. Make the edit.
4. Re-verify against the lock criteria above.
5. Mark the file `Locked` again.
6. Update this `_LOCK.md` with the ADR reference.

## Directory Inventory

| File | Status | Locked Date | Last ADR |
|---|---|---|---|
| 01_Entities.md | Planned | — | — |
| 02_Business_Rules.md | Planned | — | — |
| 03_Calculations.md | Planned | — | — |
| 04_Engine_API.md | Planned | — | — |