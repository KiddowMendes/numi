---
type: directory-lock
directory: "00_Foundation"
owner: Elton Pascoal
---

# 00 — Foundation Lock

## What "Locked" Means Here

Files in this directory are Locked when they represent **immutable project constitution**. They may not be changed without an Architecture Decision Record (ADR) because downstream documents (Domain, Architecture, Features) depend on them.

## Lock Criteria

Before any file in this directory can be marked Locked, ALL of the following must be true:

1. [ ] Every file in this directory is internally consistent (no contradictions between files).
2. [ ] No file contradicts `docs/context/PROJECT_BRIEF.md`.
3. [ ] All defined terms in `03_Glossary.md` are used consistently across all files.
4. [ ] No file contains `TODO`, `FIXME`, or placeholder text.
5. [ ] The owner has read and approved every file.
6. [ ] Every principle in `02_Principles.md` can be traced to a sentence in `01_Manifesto.md`.

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
| 01_Manifesto.md | Draft | — | — |
| 02_Principles.md | Draft | — | — |
| 03_Glossary.md | Draft | — | — |