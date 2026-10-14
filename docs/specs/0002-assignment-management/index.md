# 0002. Assignment Management

**Date**: 2026-10-13
**Status**: In Progress

## Summary

Let users adjust their budget plan from the mobile plan screen: add a new budget row, change a row's amount, or delete a row entirely. Each row is a commitment toward one category in one wallet for the current period. The domain engine already owns the create and delete operations and the spent and remaining math; this feature adds the edit operation, an engine rule that stops one category from having two rows in the same wallet, the assignment form sheet, and the plan screen wiring. The safe to spend number recalculates after every change because it is computed from the current state, never stored.

## Requirements

**User stories**:

- As a user, I want to commit money to a category after onboarding so that my safe to spend number reflects what I have planned.
- As a user, I want to change a category's amount when my plans change so that my budget stays honest with my wallet.
- As a user, I want to remove a commitment when I no longer need it so that the money returns to what I can spend.
- As a user, I want a clear warning when I try to commit more than I have.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: An add button on the plan screen (the same docked action the home screen uses) opens the assignment sheet in add mode with a category picker and an amount field.
- **AC-2**: The category picker shows every existing category. Picking a category that already has a row for the chosen wallet in this period opens that row in edit mode instead of creating a second row.
- **AC-3**: With one wallet, it is used silently. With several, a wallet picker row appears above the amount field, defaulting to the first wallet.
- **AC-4**: The amount uses the existing AmountInput component, Rand format, converted to cents for the engine.
- **AC-5**: A live preview shows the selected wallet's available balance after this assignment, updating as the user types: "Available after: R[available minus amount]". It uses the wallet's available balance from the engine, not the daily safe to spend.
- **AC-6**: Confirm is disabled until the amount is greater than zero AND a category is selected.
- **AC-7**: On confirm, the engine creates the assignment, the sheet dismisses, a toast says "Saved", the plan list shows the new row, and the safe to spend number on the home screen recalculates.
- **AC-8**: If the amount would exceed the wallet's available balance, an inline error shows below the amount: "Not enough in [wallet name]". The sheet stays open.
- **AC-9**: Tapping an existing assignment row opens the sheet in edit mode, prefilled with that row's current amount. The category and wallet show read only; the amount is editable.
- **AC-10**: In edit mode the same live preview and balance validation apply to the new amount. Saving updates the row, shows the "Saved" toast, and recalculates safe to spend.
- **AC-11**: The edit sheet has a delete action in its footer. Tapping it shows a native confirm: "Delete assignment? R[amount] moves back to available." Confirming deletes the row, dismisses the sheet, shows a "Deleted" toast, removes the row from the plan, and recalculates safe to spend. Deletion is allowed even if money has been spent against the row.
- **AC-12**: The engine rejects a second assignment for the same active period, category, and wallet with an `INVALID_STATE` error.
- **AC-13**: If no categories exist, the add sheet shows "No categories available. Set up your budget first." and confirm stays disabled.
- **AC-14**: Confirm is disabled while the engine operation is in progress (double submit protection).
- **AC-15**: The form draft (category, amount, wallet) persists in zustand while the sheet is dismissed and across tab switches. The draft is lost on app restart.
- **AC-16**: With no active period, the plan screen keeps its existing empty state and the add button is hidden.
- **AC-17**: The "Adjust the plan" action on the home screen opens the plan screen, so the entry point already shown there is no longer dead.

## Decision

**Chosen option**: Option 1: Assignment sheet from the plan screen

The plan screen gets the docked action button, an assignment sheet in add and edit modes with a live available balance preview, and delete inside the edit sheet with a native confirm. The engine gains `updateAssignment` (amount only, validates against the wallet balance with the edited row excluded), a uniqueness check on create, and a category existence check, plus the nonzero amount guard on both create and update.

**Implementation skills**: `expo-ui` (`expo/expo`, `apps/mobile/.agents/skills/expo-ui/`) · `expo-native-ui` (`expo/expo`, `apps/mobile/.agents/skills/expo-native-ui/`)

## Feature design

**Data model sketch**:

The `Assignment` entity already exists in `@numi/domain` and needs no new columns:

- `Assignment.id`: string (UUID)
- `Assignment.period_id`: string (the active period, required)
- `Assignment.category_id`: string (the budget category, required)
- `Assignment.wallet_id`: string (the wallet the commitment comes from, required)
- `Assignment.amount`: number (positive integer, cents)
- `Assignment.created_at`: Date

The uniqueness constraint is logical, at the engine, not a database constraint: at most one row per (`period_id`, `category_id`, `wallet_id`) within the active period. The mobile draft state is transient in zustand:

- `assignmentDraft.categoryId`: string | null
- `assignmentDraft.walletId`: string | null (defaults to the first wallet)
- `assignmentDraft.amount`: string (display format, a bare decimal string, for example "500.00")

The sheet mode lives in the store as `assignmentSheetMode` (`'closed' | 'add' | 'edit'`) with `editingAssignmentId` (`string | null`), alongside `assignmentDraft`. Editing and adding are mutually exclusive. Opening add clears any edit id. Opening edit refills the draft from the row's current amount. A duplicate category selection in add mode switches to edit: it discards the typed amount and refills from the found row. The draft persists while the sheet is dismissed and across tabs, and clears on a successful confirm or an app reset (`resetForNewUser`).

**State transitions**:

Sheet: closed → add → (engine create) → closed · closed → edit → (engine update) → closed · edit → confirming delete → closed. Assignment lifecycle: created → amount changed → deleted. No other persisted states exist in v1.

**API surface**:

| Operation                                   | Method          | Key inputs                                                             | Key outputs                                                       | Auth | Key errors                                                                                                              |
| ------------------------------------------- | --------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| createAssignment                            | engine function | Assignment (id, period_id, category_id, wallet_id, amount, created_at) | Result<Assignment, EngineError>                                   | none | NOT_FOUND (wallet or category), INVALID_STATE (duplicate, amount not positive, period not active), INSUFFICIENT_BALANCE |
| updateAssignment (new)                      | engine function | id: string, patch { amount: number }                                   | Result<Assignment, EngineError>                                   | none | NOT_FOUND, INVALID_STATE (amount not positive, or the row is not in the active period), INSUFFICIENT_BALANCE            |
| deleteAssignment                            | engine function | id: string                                                             | Result<void, EngineError>                                         | none | NOT_FOUND                                                                                                               |
| getAvailableBalance                         | engine function | walletId: string                                                       | Result<number, EngineError> in cents                              | none | NOT_FOUND                                                                                                               |
| getAssignmentSpent / getAssignmentRemaining | engine function | assignmentId: string                                                   | Result<number, EngineError>                                       | none | NOT_FOUND, INVALID_STATE (no active period)                                                                             |
| add / update / delete assignment (store)    | store action    | draft fields, or id plus new amount                                    | the same ok or error union as logTransaction, then syncFromEngine | none | the engine codes, plus INVALID_STATE when there is no active period                                                     |

`updateAssignment` accepts only `{ amount }`. It never changes period, category, or wallet in v1. It requires the target row to belong to the active period (INVALID_STATE otherwise), so a closed period row can never be edited. The update balance check is a new calculated function, `canUpdateAssignment(wallet, assignments, goals, assignmentId, newAmount)`, which sums the other rows for the wallet plus goals plus the new amount and compares to the wallet balance, so the row being edited is not counted twice.

**Value sourcing** (every value each action produces, computes, or displays, and where it comes from):

| Action                | Value produced / displayed                                 | Source                                                                                                                                                                                                                                                                                           |
| --------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Sheet opens (add)     | categoryId = null, amount = ""                             | no selection, empty string                                                                                                                                                                                                                                                                       |
| Sheet opens (add)     | walletId                                                   | first wallet in `appState.wallets` order, auto picked when one wallet, user pick when several (AC-3)                                                                                                                                                                                             |
| Sheet opens (edge)    | the category list                                          | `appState.categories` (AC-1)                                                                                                                                                                                                                                                                     |
| Sheet opens (edit)    | the row being edited                                       | the tapped assignment, looked up by id in `appState.assignments` (AC-9)                                                                                                                                                                                                                          |
| Sheet opens (edit)    | amount prefill                                             | the row's `assignment.amount` in cents, divided by 100 into a bare decimal string with two decimals, the format AmountInput accepts; the currency helpers apply at display and submit, never to the draft (AC-9)                                                                                 |
| Sheet opens (edit)    | read only category and wallet                              | `category_id` and `wallet_id` looked up in `appState.categories` and `appState.wallets` (AC-9)                                                                                                                                                                                                   |
| Duplicate check (add) | existing row for the chosen category and wallet            | lookup across `appState.assignments` where `period_id` matches the active period, and category and wallet match (AC-2, AC-12)                                                                                                                                                                    |
| Duplicate route (add) | the row to edit and its prefill amount                     | set the sheet to edit the found row (`editingAssignmentId` = the found row's id) and refill the amount from that row, discarding the typed add amount (AC-2)                                                                                                                                     |
| Preview               | available balance after the assignment                     | engine.getAvailableBalance(walletId) minus the parsed amount in cents in add mode; in edit mode the wallet lifetime available (which still counts the edited row's old amount) plus the row's current amount, minus the new amount, so the old amount is never counted twice (AC-5, AC-8, AC-10) |
| Confirm (add)         | the Assignment object                                      | store builds it: id via generateId, period_id from `appState.activePeriod.id`, category_id and wallet_id from the draft, amount via randToCents, created_at new Date() (AC-7)                                                                                                                    |
| Confirm (edit)        | the new amount                                             | randToCents from the edited draft amount; period, category, and wallet unchanged (AC-10)                                                                                                                                                                                                         |
| Delete                | which row                                                  | the editing row's id held by the open sheet (AC-11)                                                                                                                                                                                                                                              |
| Toast                 | "Saved" or "Deleted"                                       | derived from the completed operation (AC-7, AC-10, AC-11)                                                                                                                                                                                                                                        |
| Inline error          | "Not enough in [wallet name]"                              | engine returns INSUFFICIENT_BALANCE, wallet name from `appState.wallets` lookup (AC-8)                                                                                                                                                                                                           |
| No categories message | "No categories available. Set up your budget first."       | `appState.categories.length` is zero in add mode (AC-13)                                                                                                                                                                                                                                         |
| Safe to spend recalc  | refreshed number on home, refreshed assigned total on plan | syncFromEngine updates `appState` after each engine call; the home number comes from getDailySafeToSpend over the new state (AC-7, AC-10, AC-11)                                                                                                                                                 |
| Draft preserved       | amount, category, wallet                                   | zustand `assignmentDraft`, cleared only on successful confirm, lost on app restart (AC-15)                                                                                                                                                                                                       |
| Home Adjust the plan  | the route opened                                           | the plan tab route, a fixed constant, no data dependency (AC-17)                                                                                                                                                                                                                                 |

**Key invariants**:

- At most one assignment per (`period_id`, `category_id`, `wallet_id`), scoped to the active period only. A row from a closed period never blocks a new active period row for the same category and wallet, because the engine only ever accepts the active period. The engine rejects a duplicate with `INVALID_STATE` (AC-12).
- Assignment amounts are positive integers in cents. The engine rejects zero and negative amounts on create and update, and the UI also disables confirm (AC-6).
- Money stays integer cents. Cents conversion happens only in `@numi/utils/src/currency.ts`.
- Assigned plus reserved for a wallet never exceeds its balance. The existing `canCreateAssignment` check and the new `canUpdateAssignment` check (sum of the other rows plus goals plus the new amount) enforce it, and the UI shows the inline error (AC-8).
- Balance checks use the wallet lifetime available balance, the same window the engine's existing available balance and create check use, which sums assignments across all periods. The one row rule is period scoped. The preview and the guards share the lifetime window, so they never disagree (AC-5, AC-8).
- An assignment belongs to the active period. With no active period, the plan screen keeps its empty state and the add button is hidden. The store refuses to submit without one, and `createAssignment` requires the passed period to be the active period (INVALID_STATE) (AC-16).
- Non amount failures (`INVALID_STATE`, `NOT_FOUND`, `DATA_CORRUPTION`) map to the generic toast "Something went wrong", matching transaction entry. Only `INSUFFICIENT_BALANCE` shows the inline field error (AC-8).
- Editing changes the amount only in v1; period, category, and wallet stay fixed (AC-9, AC-10).
- No derived value is stored. Available, spent, and remaining all compute at read time from balance, assignments, goals, and transactions, so deletion returns money automatically and nothing can go stale (AC-11, AC-12).
- The plan list renders every assignment in `appState.assignments`. In v1 every assignment belongs to the active period, so this is correct. Period close (`closePeriodState`) does not remove assignments, so when period management arrives in Slice 6 the list must be filtered by the active period. Until then, the plan list hides the tap and chevron on any row whose `period_id` is not the active period, so a closed period row can never open a doomed edit.
- Defensive only: onboarding guarantees at least one wallet. If the sheet ever opens with no wallet, confirm stays disabled, since there is nothing to assign against.

**Security model**:

Single user, offline, no auth in v1, same as transaction entry. No regulated data beyond user entered budget amounts, no compliance scope. The engine is the only owner of money rules, and tier limits apply elsewhere through `UserContext`.

**Configuration required**:

None. The feature uses existing engine operations, store patterns, and UI components. No new environment variables or credentials.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Happy path create: on the plan screen, tap the add button, pick Food, enter R500, confirm. Toast "Saved", the Food row appears, the assigned total rises, and the home safe to spend number drops. Verifies **AC-1**, **AC-4**, **AC-6**, **AC-7**
- Duplicate route: Food already has a row for the chosen wallet. In add mode the user picks Food. The sheet switches to edit with R500 prefilled. A direct engine call for the same period, category, and wallet returns `INVALID_STATE`. Verifies **AC-2**, **AC-12**
- Edit: tap the Food row, the sheet opens in edit with the amount prefilled and the category and wallet read only. Change the amount to R800, confirm. The row shows R800 and safe to spend recalculates. Verifies **AC-9**, **AC-10**
- Overcommit failure: a wallet has R200 left after its other rows. The user tries R500. Inline error "Not enough in [wallet name]", the sheet stays open, nothing saved. Verifies **AC-8**
- Delete with spend: Food assigned R500, R300 spent. Tap the row, tap delete, confirm the dialog. Toast "Deleted", the row disappears, the full R500 commitment returns to available (available rises by R500, because the R300 already left the wallet), and the R300 of transactions stay in history. Verifies **AC-11**
- No categories: add mode with an empty category list shows the setup message and confirm stays disabled. Verifies **AC-13**
- Double submit: confirm is disabled while the engine call is in flight. Verifies **AC-14**
- No-op and lower edit: open edit and confirm without changing the amount. The update check passes because the other rows plus the current amount already sit within the balance, and lowering the amount always passes. Verifies **AC-8**, **AC-10**
- Draft persistence: pick a category and an amount, dismiss the sheet, switch tabs, come back. The draft is still there. Restarting the app clears it. Verifies **AC-15**
- No active period: the plan screen shows its existing empty state and no add button. Verifies **AC-16**
- Home entry: tapping "Adjust the plan" on the home screen opens the plan screen. Verifies **AC-17**

## Build plan

Ordered by the Tracer Bullet approach: prove the engine path first, then the store, then the UI, then wire and polish. No migration is needed.

1. [x] Domain engine: add the uniqueness check, the category existence check, the active period check, and the nonzero amount guard to `createAssignment`; add the `canUpdateAssignment` calculated check and the `updateAssignment` operation (amount only, requires an active period), and the unit tests so domain line coverage stays at 100%. Satisfies **AC-12**, **AC-8**, **AC-10**
2. [x] Store: add the `assignmentDraft` state plus `assignmentSheetMode` (`'closed' | 'add' | 'edit'`) and `editingAssignmentId` (edit carries the row id and refills the draft, add clears it), the `setAssignmentDraftField` and `clearAssignmentDraft` actions, the `addAssignment`, `updateAssignment`, and `deleteAssignment` actions that refuse without an active period, call the engine, then `syncFromEngine` and clear the draft on success, and a duplicate lookup helper that finds an existing row for a category and wallet in the active period. Clear the assignment draft and the edit mode inside `resetForNewUser` so a stale draft cannot survive "Forgot PIN? Reset app". Satisfies **AC-2**, **AC-7**, **AC-10**, **AC-11**, **AC-15**
3. [x] Build the AssignmentSheet component: a bottom sheet that reuses BottomSheet, AmountInput, and the category picker, plus the wallet row when several wallets exist, the live available after preview (available minus the new amount in add mode, available plus the row's current amount minus the new amount in edit mode), static read only category and wallet rows in edit mode, a picker hidden when no categories exist in add mode, and a delete action in the footer with a native confirm dialog. Confirm stays disabled until the amount is valid and while the engine call is in flight. Satisfies **AC-1**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-9**, **AC-11**, **AC-13**, **AC-14**
4. [x] Wire the plan screen: add the docked action button above the list, make every active period assignment row open edit on tap with a chevron affordance, route a duplicate category selection to edit, and show the toasts. Hide the tap and chevron on any row whose period is not active (defensive, since v1 has no closed periods). Give the home screen's "Adjust the plan" action an `onPress` that uses Expo Router to switch to the plan tab. Satisfies **AC-1**, **AC-2**, **AC-7**, **AC-9**, **AC-17**
5. [x] Edge cases end to end: insufficient balance inline error, no categories message, no active period, double submit, draft persistence, and the delete confirm dialog. Satisfies **AC-8**, **AC-13**, **AC-14**, **AC-15**, **AC-16**

## Consequences

**Positive**:

- The budget plan becomes editable, so the safe to spend number stays trustworthy after transactions flow.
- The feature reuses the sheet, amount field, category picker, toast, and `syncFromEngine` patterns from transaction entry, with no new dependency and no migration.
- The engine keeps ownership of the money rules: uniqueness and balance checks live in `@numi/domain` with unit tests at 100% coverage.
- Onboarding's quick setup budget is just an assignment, so it becomes editable from the plan screen for free.

**Negative / tradeoffs**:

- The domain gains a new operation and two new checks, a bounded but real test surface to hold at 100% coverage.
- Editing is amount only in v1. Moving a row to another category or wallet needs a delete and a recreate.
- Tapping a plan row now opens edit instead of just scrolling, so rows get a chevron to show they are pressable.
- Assignment changes persist through the same path as transactions. Until the app wires sql.js persistence, they live in memory and are lost on relaunch, exactly as transaction entry behaves today.
- The one row per category rule merges duplicates instead of allowing two separate budgets for the same category in one wallet. Users who want that can use a second wallet.

**Neutral**:

- The plan header already totals assigned, and it now recalculates on every change.
- No schema change and no database migration: the assignments table and its upsert already fit create, update, and delete.

## Follow-up

- [ ] App wide persistence wiring (load and save via `@numi/database`) so assignments and transactions survive a relaunch; shared with slice 1 and deferred so far.
- [ ] Onboarding quick setup: now that the engine rejects duplicate rows, quick setup should treat an existing assignment for the same period, category, and wallet as an update (upsert) so a rerun cannot fail.
- [ ] Editing category or wallet on an assignment row (delete and recreate today) if users ask.
- [ ] A category split across two pots in one wallet (the one row rule stands, a second wallet covers it today).
- [ ] Filter the plan list by the active period once period management lands (Slice 6), since `closePeriodState` leaves closed period assignments in state, and make editing a closed period row fail cleanly.
