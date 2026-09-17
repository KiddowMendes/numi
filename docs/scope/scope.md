# Scope: NUMI

A financial clarity app for people with irregular income who spend money in small increments. It answers one question: will my money last?

**Build approach:** Tracer Bullet (prove one real path through every layer, then thicken).
**Workflow:** Beta (after /develop, /check verify then /test). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but skippable when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| A. Domain engine | Foundation | existing |
| B. Database layer | Foundation | existing |
| C. Design system & tokens | Foundation | existing |
| D. Mobile onboarding flow | Foundation | existing |
| E. Mobile home screen | Foundation | existing |
| F. Mobile plan screen | Foundation | existing |
| G. Mobile history screen | Foundation | existing |
| H. Web app (Next.js) | Foundation | existing |
| 1. Transaction entry | Slice 1 | in-progress |
| 2. Assignment management | Slice 2 | planned |
| 3. Wallet management | Slice 3 | planned |
| 4. Review screen | Slice 4 | planned |
| 5. Home & plan display | Slice 5 | planned |
| 6. Period management | Slice 6 | planned |
| 7. Settings | Deferred | planned |

## Existing (brownfield)

### A. Domain engine · existing
Pure TypeScript business engine with entities (Wallet, Category, Assignment, Transaction, Period, Goal, User), all calculations (safe to spend, wallet balance, assignment tracking, goal progress), and the EngineAPI that returns Result types and never throws. code in `packages/domain/`

### B. Database layer · existing
sql.js repository layer with schema, migrations, and mappers that turn rows into domain entities. Tests at 80%+ coverage. code in `packages/database/`

### C. Design system & tokens · existing
Design tokens (colors, typography, spacing, radius, shadows) and shared UI components (Button, Card variants, AmountInput, SafeToSpendHero, TransactionRow, BottomSheet, FAB, SegmentedControl, EmptyState). code in `packages/design-system/`

### D. Mobile onboarding flow · existing
Three step onboarding: wallet setup (name, type, starting balance), period setup (name, date range), budget assignment (allocate to categories). Uses engine directly. code in `apps/mobile/app/(onboarding)/`

### E. Mobile home screen · existing
Displays SafeToSpendHero with the daily safe to spend number and total balance summary. Read only, no actions. code in `apps/mobile/app/(tabs)/index.tsx`

### F. Mobile plan screen · existing
Lists period info and assignments with category names and amounts. Read only. code in `apps/mobile/app/(tabs)/plan.tsx`

### G. Mobile history screen · existing
Flat list of transactions showing icon, title, date, category, and amount. Read only, no add or delete. code in `apps/mobile/app/(tabs)/history.tsx`

### H. Web app (Next.js) · existing
Client side mirror of the mobile experience. Static export, no backend. Stays as is until mobile is proven. code in `apps/web/`

## Slice 1: Transaction entry

### 1. Transaction entry · in-progress
The core loop. Let users record income and expenses from the home screen so the safe to spend number actually changes and the app becomes usable. This is the thinnest real thread through the full stack: UI form to engine calculation to screen update.
**Done when:** a user can tap the FAB on the home screen, pick income or expense, enter an amount, pick a category (for expenses), add an optional note, confirm, and see the safe to spend number update immediately while the transaction appears in history.
- [x] Design it (spec): `/architect transaction entry` · [0001](../specs/0001-transaction-entry.md)
- [ ] Build it: /develop transaction entry
  - [ ] Store actions and draft state
  - [ ] Dependencies: toast and date picker
  - [ ] TransactionLogSheet form
  - [ ] CategoryChip component
  - [ ] FAB wiring and confirm flow
  - [ ] End-to-end testing and edge cases
- [ ] Verify it: /check verify transaction entry
- [ ] Test it: /test transaction entry

## Slice 2: Assignment management

### 2. Assignment management · needs a decision
After recording transactions, users need to adjust their budget plan. Let them create, edit, and delete assignments after onboarding so the safe to spend calculation reflects their current commitments.
**Done when:** a user can add a new assignment from the plan screen, edit an existing assignment's amount, delete an assignment, and see the safe to spend number recalculate to reflect the change.
- [ ] Design it (spec): `/architect assignment management`

## Slice 3: Wallet management

### 3. Wallet management · needs a decision
Users with irregular income often have multiple money sources (cash, bank account, stokvel). Let them add and manage wallets after onboarding so they can track money across sources.
**Done when:** a user can add a new wallet, edit a wallet's name or type, and see balances across all wallets on the home screen.
- [ ] Design it (spec): `/architect wallet management`

## Slice 4: Review screen

### 4. Review screen
Wire the existing review screen to the tab bar so users can see a summary of their financial position: balance, assigned, spent, remaining, and per category breakdowns.
**Done when:** the review screen is accessible from the tab bar and shows live stats computed from the current app state.
- [ ] Design it (spec): `/architect review screen`

## Slice 5: Home & plan display

### 5. Home & plan display
Thicken the display on the home and plan screens so users see assignment progress, days remaining in the period, and per wallet breakdowns instead of just top line numbers.
**Done when:** the home screen shows days remaining and per wallet safe to spend, and the plan screen shows spent vs assigned per category with a progress indicator.
- [ ] Design it (spec): `/architect home & plan display`

## Slice 6: Period management

### 6. Period management
When a period ends, users need a clear transition: close the current period, review what happened, and start a new one. Without this the safe to spend calculation becomes stale.
**Done when:** a user can close the current period, see a period summary, and start a new period with a fresh budget.
- [ ] Design it (spec): `/architect period management`

## Deferred

Out of scope for the current build pass, kept so the plan stays honest.
- **Settings screen**: app preferences and wallet/category management · needs a decision
- **Transfer transactions**: move money between wallets · needs a decision
- **Goal management**: create and track savings goals · needs a decision
- **Transaction editing**: edit or delete existing transactions from history · needs a decision
- **Period history**: view past periods and their summaries · needs a decision
- **Category management**: add, edit, or remove budget categories · needs a decision
- **CSV import**: bring in transaction data from other sources · needs a decision
- **Cloud sync**: sync data across devices · needs a decision
- **Voice logging**: record transactions by voice · needs a decision
- **Web parity**: bring mobile features to the web app · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub-task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow-up enrolled |
| `in-progress` (building) | `/develop` | milestone sub-boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre-workflow) and `dropped` (de-scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Prototype`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
