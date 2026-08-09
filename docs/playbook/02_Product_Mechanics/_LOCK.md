---
type: directory-lock
directory: "02_Product_Mechanics"
owner: Elton Pascoal
---

# 02 — Product Mechanics Lock

## What "Locked" Means Here

Files in this directory define **how the abstract domain becomes concrete user behavior**. They bridge Domain and Features. They may not contradict Domain, and Features may not contradict them.

## Lock Criteria

1. [ ] Every invariant is testable (pass/fail).
2. [ ] Every user state has defined entry/exit triggers.
3. [ ] Every behavioral loop maps to a Manifesto principle.
4. [ ] Data flow is technology-agnostic (no "React," "SQLite," "API").
5. [ ] No file contradicts `01_Domain/02_Business_Rules.md`.

## Modification Rule

ADR required. Same process as `00_Foundation`.

## Directory Inventory

| File | Status | Locked Date | Last ADR |
|---|---|---|---|
| 01_Invariants.md | Planned | — | — |
| 02_User_States.md | Planned | — | — |
| 03_Behavioral_Loops.md | Planned | — | — |
| 04_Data_Flow.md | Planned | — | — |