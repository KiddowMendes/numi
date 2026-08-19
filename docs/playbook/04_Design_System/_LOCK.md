---
type: directory-lock
directory: "04_Design_System"
owner: Elton Pascoal
---

# 04 — Design System Lock

## What "Locked" Means Here

Visual and interaction standards. Locked when every token, component, and pattern is defined enough that a developer can build a screen without asking questions.

## Lock Criteria

1. [ ] Tokens are semantic, not literal (`color-danger`, not `red-500`).
2. [ ] Every component has a purpose, variants, and usage rules.
3. [ ] Patterns cover empty states, errors, loading, and confirmation.
4. [ ] Platform adaptations list is minimal and justified.
5. [ ] No design decision contradicts `02_Principles.md` R2.4 (sunlight readable).

## Modification Rule

ADR required for breaking changes (new tokens, removed components). Additions that extend the system may be Draft → Locked without ADR if they don't contradict existing locked files.

## Directory Inventory

| File | Status | Locked Date | Last ADR |
|---|---|---|---|
| 01_Tokens.md | Draft | — | ADR-007 |
| 02_Components.md | Draft | — | — |
| 03_Patterns.md | Draft | — | — |
| 04_Platform_Adaptations.md | Draft | — | — |
