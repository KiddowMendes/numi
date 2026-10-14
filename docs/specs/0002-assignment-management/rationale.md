# 0002. Assignment Management · decision record

Decision history for spec 0002. The build spec lives in `index.md`.

## Context

NUMI is a financial clarity app that answers one question: will my money last? Transaction entry (slice 1) made the app usable by letting people record money in and out. The second slice is the other half of trust: the budget plan has to stay honest as plans change. Today an assignment (a money commitment to a category for a period) can only be created once at onboarding. The plan screen shows rows read only, and the only way to change a commitment is to wipe the app. That makes the safe to spend number drift away from reality.

The domain engine already models this well. The `Assignment` entity carries the period, category, wallet, and amount. `createAssignment` and `deleteAssignment` exist, as do the spent, remaining, and available balance calculations. All money math is integer cents from `@numi/utils/src/currency.ts`, and the engine returns a `Result` from every mutation and never throws. What the engine lacks is an update operation and a guard that stops two rows from claiming the same category and wallet in one period. The plan screen already renders each assignment as a row with spent, amount, remaining, and an over or usage badge.

The build approach is Tracer Bullet: prove the engine path first, then add the store actions, then the UI, then wire and polish. This feature adds no schema, so there is no migration.

## Options considered

### Option 1: Assignment sheet from the plan screen (chosen)

The plan screen gets the docked add button the home screen already uses. Tapping it opens a bottom sheet with a category picker, the amount field, a wallet row when several wallets exist, and a live available balance preview. Tapping any assignment row opens the same sheet in edit mode prefilled with the amount, category and wallet read only, and a delete action in the footer with a native confirm dialog. The engine gains `updateAssignment` and a uniqueness check.

**Pros**:

- Reuses BottomSheet, AmountInput, the category picker, the toast, and the `syncFromEngine` pattern from transaction entry. No new dependency and no new navigation.
- All assignment actions live in one place, matching how the app already behaves.
- The engine stays the owner of the money rules, with the update and uniqueness logic unit tested at 100% line coverage like every other rule.

**Cons**:

- The bottom sheet is a tight space when the keyboard is open, the same constraint transaction entry already accepts.
- A tap on a plan row changes meaning from "nothing" to "edit", which needs a visible affordance.

### Option 2: Inline editing in the plan list

Each plan row becomes editable in place, for example a stepper or a tappable amount field that opens a light editor directly on the screen.

**Pros**:

- No sheet to open for a single number change, slightly fewer taps for the common case.

**Cons**:

- Editing several fields in a list breaks the clean rows and fights the existing GroupRow layout.
- Deletion still needs a destination, so it ends up in a sheet or an alert anyway, splitting the actions across two patterns.

### Option 3: A full screen assignment manager

A new route (for example a plan editor screen) holds the category list with amounts, opened from the plan screen.

**Pros**:

- More room for a dense budget edit screen, a familiar pattern in budgeting apps.

**Cons**:

- A whole navigation surface for a single number change, heavier than the task deserves.
- Contradicts the under five seconds goal in the project brief, the same reason transaction entry chose a sheet.

### Option 4: Store level delete and recreate, no engine change

Edit becomes delete then create in the store. Uniqueness lives only in the mobile form.

**Pros**:

- The smallest engine change, no new operation to test.

**Cons**:

- A failed create after a successful delete loses the row and needs manual reconciliation.
- The uniqueness invariant lives in the UI, which this repo's `AGENTS.md` conventions avoid; the domain is supposed to own the business rules.

## Rationale

The sheet matches everything else in the app: transaction entry proved it, users can reach it in one tap from where they already are, and it reuses the components and the store pattern already built. The full screen and inline options add navigation or layout work for a task that is a single number change most of the time. The project brief and the transaction entry spec both pin the app to quick, in context actions, and the sheet is the smallest surface that honors that.

The engine additions follow the repo's core convention from `@numi/domain`: the domain owns the business rules, returns `Result` from every mutation, keeps money as integer cents, and holds unit tests at 100% line coverage. Deleting and recreating in the store would leave the create step able to fail after the delete succeeded, and would put the uniqueness rule in the UI where the mobile `AGENTS.md` explicitly avoids keeping business logic. The one row per category and wallet rule is why the duplicate selection routes to edit: the mental model is one budget per category in a wallet, and routing there is what a user who taps an already budgeted category almost certainly means.
