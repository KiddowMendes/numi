# Verify: Assignment management · spec 0002 · updated 2026-10-13

_Steps derived from spec 0002 acceptance criteria. `/check verify` runs these; `/test` locks the durable ones._

## UI / manual

- [ ] Plan screen with an active period, tap the docked add button → the sheet opens in add mode with a category picker and an amount field → AC-1
- [ ] With one wallet, no wallet picker; with several, a wallet picker appears above the amount, defaulting to the first → AC-3
- [ ] Pick Food, key in 500, confirm → "Saved" toast, Food row appears, assigned total rises, home safe to spend drops → AC-1, AC-4, AC-6, AC-7
- [ ] Add for a category that already has a row in the same wallet → picking it opens that row in edit with the amount prefilled, and no second row is created → AC-2
- [ ] Type an amount and watch the "Available after" line update from the wallet available, not the daily safe to spend → AC-5
- [ ] Confirm stays disabled until the amount is greater than zero and a category is chosen → AC-6
- [ ] Try to assign more than the wallet holds → inline "Not enough in [wallet name]" below the amount, the sheet stays open, nothing saved → AC-8
- [ ] Tap an existing row → edit mode, category and wallet read only, amount prefilled and editable → AC-9
- [ ] In edit, change the amount; the preview and validation follow the new amount; save → the row updates, "Saved" toast, safe to spend recalculates → AC-10
- [ ] In edit, tap Delete → native confirm "Delete assignment? R[amount] moves back to available." → "Deleted" toast, row gone, available rises by the full amount → AC-11
- [ ] No categories: add mode shows "No categories available. Set up your budget first." and confirm stays disabled → AC-13
- [ ] Tap confirm twice fast while the engine call is in flight → the second tap is ignored → AC-14
- [ ] Pick a category and amount, dismiss the sheet, switch tabs, come back, reopen add → the draft is still there; restart the app → the draft is gone → AC-15
- [ ] With no active period → the plan screen keeps its empty state and the add button is hidden → AC-16
- [ ] Tap "Adjust the plan" on the home screen → the plan screen opens → AC-17
- [ ] A row whose period is not the active period shows no tap and no chevron (defensive, v1 has no closed periods) → AC-16

## Behavioral edges (from the value sourcing table)

- [ ] Same category in a second wallet → a new row is created (the rule is period, category, wallet) → AC-2, AC-12
- [ ] Open edit for a row assigned R500 → the field reads "500.00" and saves back to 50000 cents → AC-9, AC-10
- [ ] Edit with no change, or lower the amount → the preview equals the wallet's current available and the old amount is never counted twice → AC-10
- [ ] Assign R500, spend R300, delete → available rises by R500 (not R200); the R300 of transactions stay in history → AC-11
- [ ] A direct engine call for the same active period, category, and wallet as an existing row → INVALID_STATE → AC-12

## Commands

- [ ] `pnpm --filter @numi/domain test` → all pass (the new engine and C11 coverage tests included) → AC-8, AC-10, AC-12
- [ ] `pnpm --filter @numi/domain test:coverage` → lines 100, statements 100, functions 100, branches at or above 95 → AC-8, AC-10, AC-12
- [ ] `pnpm --filter mobile check-types` → clean → all

## Acceptance-criteria coverage

- AC-1 covered by the add-open step and the happy path create step · AC-2 by the duplicate route step and the second-wallet edge · AC-3 by the wallet picker step · AC-4 by the happy path create step · AC-5 by the preview step · AC-6 by the disabled-until-valid step · AC-7 by the happy path create step · AC-8 by the overcommit step and the no-op/lower edit edge · AC-9 by the tap-to-edit step and the prefill edge · AC-10 by the edit step and the no-change edge · AC-11 by the delete step and the delete-with-spend edge · AC-12 by the direct engine call edge · AC-13 by the no-categories step · AC-14 by the double-tap step · AC-15 by the draft persistence step · AC-16 by the no-active-period step and the inactive-row step · AC-17 by the home entry step
