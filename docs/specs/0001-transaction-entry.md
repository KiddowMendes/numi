# 0001. Transaction Entry

**Date**: 2026-09-17
**Status**: Proposed

## Summary

Let users record income and expenses from the home screen so the safe to spend number actually changes and the app becomes usable. A FAB on the home screen opens a bottom sheet with a simple form: pick income or expense, enter an amount, pick a category for expenses, add an optional note, and confirm. The engine logs the transaction, the sheet dismisses with a toast, and the safe to spend number updates immediately.

## Context

NUMI is a financial clarity app that answers one question: will my money last? The core loop is: record money in, record money out, see the safe to spend number update. Without transaction entry, the app shows a number that never changes and has no real utility. This is Slice 1, the thinnest real thread through the full stack: UI form to engine calculation to screen update.

The domain engine already defines the Transaction entity and the `logIncome` / `logExpense` operations. The database layer already persists transactions. The home screen already shows the safe to spend number. What is missing is the form that connects the user's intent to the engine, and the wiring that makes the screens react to new data.

The project uses a Tracer Bullet build approach: prove one real path through every layer, then thicken. This feature IS that first real path.

## Requirements

**User stories**:
- As a user, I want to record an expense quickly so that I can see how it affects my safe to spend number.
- As a user, I want to record income when money comes in so that my available balance reflects reality.
- As a user, I want to correct mistakes by seeing a clear error when I try to spend more than I have.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):
- **AC-1**: User taps the FAB on the home screen and a bottom sheet opens with the transaction form.
- **AC-2**: User picks income or expense via a segmented control at the top of the sheet. Expense is the default.
- **AC-3**: User enters an amount using the existing AmountInput component (Rand format, converted to cents for the engine).
- **AC-4**: For expenses, user picks a category via a horizontal scroll of category chips. The category picker is hidden when income is selected.
- **AC-5**: User can add an optional note via a single line text input with placeholder "What was this for?".
- **AC-6**: If only one wallet exists, it is used silently. If multiple wallets exist, a picker row appears above the amount field defaulting to the first wallet.
- **AC-7**: Date defaults to today. User can change it via a tappable row that opens a native date picker.
- **AC-8**: For expenses, a live safe to spend preview updates as the user types the amount: "Safe to spend after: R[available_balance - amount]". Uses the selected wallet's available balance (from engine.getAvailableBalance), not the daily safe to spend. Hidden for income.
- **AC-9**: On confirm, the engine logs the transaction, the sheet dismisses, a toast says "Logged" or "Income logged", and the safe to spend number on the home screen updates.
- **AC-10**: If the expense exceeds the wallet balance, an inline error shows below the amount field: "Not enough in [wallet name]". The sheet stays open.
- **AC-11**: The transaction appears in the history screen immediately after logging.
- **AC-12**: The safe to spend number on the home screen updates immediately after logging.
- **AC-13**: The confirm button is disabled until a valid amount greater than zero is entered AND (type is income OR a category is selected for expenses).
- **AC-14**: The confirm button is disabled while the engine operation is in progress (double submit protection).
- **AC-15**: Transactions can be logged even without an active budget period. Safe to spend shows "--" in that case.
- **AC-16**: If no categories exist (fresh install before onboarding seeds them), the expense form shows a message: "No categories available. Set up your budget first." with a link to onboarding.
- **AC-17**: The form draft (amount, type, category, wallet, note, date) persists in zustand while the sheet is dismissed and across tab switches. Draft is lost on app restart.

## Options considered

### Option 1: Bottom sheet form (chosen)

The FAB opens a bottom sheet containing the full transaction form. The sheet slides up from the bottom, the user fills in the fields, confirms, and the sheet dismisses. This matches the existing BottomSheet component pattern used elsewhere in the app.

**Pros**:
- Reuses the existing BottomSheet component. No new navigation pattern.
- Feels native on mobile. Bottom sheets are the standard pattern for quick entry forms.
- The home screen stays visible behind the sheet, so the user sees the safe to spend update immediately on dismiss.

**Cons**:
- Limited vertical space on small screens when the keyboard is open.
- Category chip scroll may feel cramped on very small devices.

### Option 2: Full screen form

The FAB navigates to a new screen with the transaction form. More room for fields and the category picker.

**Pros**:
- More space for complex forms. Easier to add fields later.
- Standard navigation pattern, works with expo router.

**Cons**:
- Leaves the home screen context. The user does not see the safe to spend number while filling the form.
- Heavier navigation commitment for a 5 second task. Conflicts with the "under 5 seconds" goal in the project brief.

### Option 3: FAB to radial menu to sheet

The FAB shows a small radial menu (income / expense) first, then opens the sheet pre-set to the chosen type.

**Pros**:
- Eliminates the segmented control from the form. Slightly faster if the user always knows the type before opening.

**Cons**:
- Extra tap for users who are not sure of the type before opening.
- Radial menus are uncommon in financial apps. Unfamiliar interaction pattern.

## Decision

**Chosen option**: Option 1: Bottom sheet form

The FAB on the home screen opens a bottom sheet with a segmented control (income / expense), AmountInput, category chips for expenses, optional note, date picker, wallet picker (if multiple), and a live safe to spend preview for expenses. The engine logs the transaction on confirm, the sheet dismisses with a toast, and the home screen updates.

**Implementation skills**: `expo-router` (`expo/expo`, `apps/mobile/.agents/skills/expo-router/`) · `expo-ui` (`expo/expo`, `apps/mobile/.agents/skills/expo-ui/`) · `expo-native-ui` (`expo/expo`, `apps/mobile/.agents/skills/expo-native-ui/`)

## Rationale

The bottom sheet is the right choice because NUMI's transaction entry is a quick, focused action that should not pull the user out of their context. The project brief demands logging in under 5 seconds. A bottom sheet keeps the home screen visible, reuses an existing component, and matches the interaction pattern users already know from the onboarding flow. The full screen form adds navigation weight that contradicts the speed goal. The radial menu adds an extra decision step before the form even opens.

The live safe to spend preview is included because the core value of NUMI is seeing the number change. Showing the preview while the user types the amount reinforces that connection and helps them make informed decisions about whether to proceed.

## Feature design

**Data model sketch**:

No new entities. The Transaction entity already exists in the domain:
- `Transaction.id`: string (UUID)
- `Transaction.amount`: number (positive integer, cents)
- `Transaction.type`: 'income' | 'expense'
- `Transaction.date`: Date
- `Transaction.category_id`: string | null (required for expenses, null for income)
- `Transaction.wallet_id`: string (source for expenses, destination for income)
- `Transaction.to_wallet_id`: null (transfers deferred to Slice 3)
- `Transaction.note`: string | null
- `Transaction.created_at`: Date

The form draft state lives in zustand as transient state, not a persisted entity:
- `draft.type`: 'income' | 'expense' (default: 'expense')
- `draft.amount`: string (display format, e.g. "123.45")
- `draft.categoryId`: string | null
- `draft.walletId`: string | null
- `draft.note`: string
- `draft.date`: Date (default: today)

**State transitions**:

Transaction lifecycle (already in domain): created → immutable (fix via reversal, not edit).

Form state: empty → filling → valid (confirm enabled) → saving (confirm disabled) → dismissed (toast shown).

**API surface**:

| Operation | Method | Key inputs | Key outputs | Auth | Key errors |
|---|---|---|---|---|---|
| recordTransaction | function call | Transaction object (id, type, amount, wallet_id, category_id, date, note, created_at) | Result\<Transaction, EngineError\> | none (single user v1) | INSUFFICIENT_BALANCE, NOT_FOUND, INVALID_STATE |
| getAvailableBalance | function call | walletId: string | Result\<number, EngineError\> (available balance in cents) | none | NOT_FOUND |
| getDailySafeToSpend | function call | none | Result\<number \| null, EngineError\> (daily safe to spend, or null if no period) | none | none |

**Value sourcing**:

| Action | Value produced / displayed | Source |
|---|---|---|
| Form opens | type = 'expense' | hardcoded default |
| Form opens | amount = "" | empty string |
| Form opens | categoryId = null | no selection |
| Form opens | walletId | first wallet in state.wallets array order (auto-select single, user picks if multiple) |
| Form opens | date = today | new Date() in device local timezone (BR-X4) |
| Form opens | note = "" | empty string |
| Preview (expense) | safe to spend after | engine.getAvailableBalance(selectedWalletId) minus parsed amount in cents. This matches the engine's canExpense check, so the preview never contradicts the validation. |
| Confirm | Transaction object | constructed by the store action: id = generateUUID(), type from draft, amount = parseCurrency(draft.amount) from packages/utils/src/currency.ts, wallet_id from draft, category_id from draft (null for income), date from draft, note = draft.note trimmed or null, created_at = new Date() |
| Confirm | categoryId | from chip selection, validated required for expenses (BR-C1) |
| Confirm | walletId | from wallet picker or first in state.wallets array order |
| Confirm | date | from date picker, defaults to today, time component zeroed to midnight for consistent ordering |
| Confirm | note | from text input, trimmed, null if empty |
| Toast message | "Logged" (expense) or "Income logged" (income) | derived from transaction type, auto-dismiss after 2 seconds, positioned at top |
| Inline error | "Not enough in [wallet name]" | engine returns INSUFFICIENT_BALANCE error, wallet name from state.wallets lookup |
| Generic error | "Something went wrong" | engine returns NOT_FOUND, INVALID_STATE, or other errors (map each to a neutral message, never expose error codes to users) |
| No categories message | "No categories available. Set up your budget first." | state.categories.length === 0 AND type === 'expense' (hidden when type is income) |

**Key invariants**:
- Amount must be greater than zero before confirm is enabled (AC-13).
- Expense requires a category (BR-C1). Income must not have a category (BR-C2). Confirm button is disabled when type is expense and categoryId is null.
- Transaction amount is always stored as positive integer cents (BR-T1). Direction is set by type.
- Transaction cannot cause wallet balance to go negative (BR-T2). Engine rejects; UI shows inline error.
- Wallet must exist in state.wallets. If only one, it is auto-selected (first in array order). If none, the form cannot open (edge case from onboarding: at least one wallet is created during onboarding).
- Date is stored in device local timezone with time zeroed to midnight. No UTC conversion (BR-X4). Time zeroing ensures consistent sort order in history.
- Draft state is cleared on successful confirm. Draft persists on sheet dismiss without confirm.
- Transactions in history are sorted newest first (by date descending, then created_at descending for same-day entries).
- Keyboard is dismissed on confirm, on sheet dismiss, and when the user taps outside the form. Category chip horizontal scroll does not dismiss the keyboard.

**Security model**:

Single user, offline, no auth in v1. The engine enforces tier limits (BR-TR1, BR-TR2) via UserContext. No multi-tenant concerns. No PII beyond optional user-provided notes. No compliance scope for v1.

**Configuration required**:

None new. The feature uses existing engine operations and store patterns.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):
- Happy path: User taps FAB, picks expense, enters R50.00, picks Food category, confirms. Store constructs Transaction, calls engine.recordTransaction, sheet dismisses, toast shows "Logged", getAvailableBalance decreases by R50.00, transaction appears in history. Verifies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-9**, **AC-11**, **AC-12**
- Failure case: User tries to expense R500.00 from a wallet with R200.00 available balance. Engine returns INSUFFICIENT_BALANCE. Inline error shows "Not enough in Cash Wallet". Sheet stays open. Verifies **AC-10**
- Preview accuracy: User has R1000 available balance, types R300. Preview shows "Safe to spend after: R700". User changes amount to R500. Preview updates to "Safe to spend after: R500". Verifies **AC-8**
- Edge case: User opens form, types R100.00, switches to income, confirms. Transaction logged with type income, no category required. Verifies **AC-2**, **AC-4**, **AC-9**
- Edge case: User taps confirm with empty amount and no category. Button is disabled. Verifies **AC-13**
- Edge case: No categories exist, user is on expense tab. Message shows "No categories available. Set up your budget first." User switches to income. Message disappears, form works. Verifies **AC-16**
- Edge case: No active period. Form still works, getDailySafeToSpend returns null, safe to spend shows "--". Verifies **AC-15**
- Edge case: User opens sheet, types amount, switches tabs, returns. Draft is preserved in zustand. Verifies **AC-17**

## Build plan

Ordered by Tracer Bullet approach: prove the engine path first, then add UI, then wire and polish.

1. Add `logTransaction` action to zustand store that constructs a Transaction object from draft fields (generating id with generateUUID, setting created_at), calls engine.recordTransaction(tx), calls syncFromEngine, and returns the Result. Add draft state fields (type, amount, categoryId, walletId, note, date) with setDraftField action that updates individual fields and clearDraft action. Satisfies **AC-17**
2. Install `react-native-toast-message` and add a Toast provider to the app layout. Satisfies **AC-9**
3. Install `@react-native-community/datetimepicker`. Satisfies **AC-7**
4. Build `TransactionLogSheet` component: a BottomSheet containing the segmented control, AmountInput, category chip scroll (for expenses), note input, date row, wallet picker (if multiple), safe to spend preview (for expenses), and confirm button. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-4**, **AC-5**, **AC-6**, **AC-7**, **AC-8**, **AC-13**, **AC-14**, **AC-16**
5. Build `CategoryChip` component: a horizontal scrollable list of tappable chips showing category name and color. Satisfies **AC-4**
6. Wire FAB on home screen to open TransactionLogSheet. On confirm, call store.logTransaction, show toast, dismiss sheet. Satisfies **AC-9**, **AC-10**, **AC-11**, **AC-12**
7. Test full flow end to end: FAB to sheet to confirm to toast to home screen update to history. Satisfies all ACs
8. Handle edge cases: insufficient balance inline error, no categories message, no active period display, double submit disable. Satisfies **AC-10**, **AC-15**, **AC-16**, **AC-14**

## Consequences

**Positive**:
- The app becomes usable for the first time. Users can record transactions and see the safe to spend number change.
- The Tracer Bullet approach means this feature validates the entire stack: domain engine, database persistence, store sync, UI rendering.
- The bottom sheet pattern is reusable for other quick entry forms (assignment management in Slice 2).

**Negative / tradeoffs**:
- Adding react-native-toast-message and @react-native-community/datetimepicker are two new dependencies. Both are well maintained and widely used, but they add to the dependency surface.
- The form draft is lost on app restart (zustand only, not AsyncStorage). This is a conscious tradeoff for simplicity in v1; draft persistence across restarts can be added later if users request it.
- The safe to spend preview calls getAvailableBalance on every keystroke. This is a pure in-memory calculation (no DB hit) so it should be fast, but on very old devices with many wallets it could cause minor jank. Profile and optimize if needed.
- The store action must construct the full Transaction object (id, created_at, etc.) since engine.recordTransaction takes a complete entity. This means the store owns ID generation and timestamp creation, not the engine. This is acceptable because the engine is a pure function of state, and ID generation is infrastructure, not domain logic.

**Neutral**:
- The FAB position (bottom right, absolute positioned) may need adjustment when the keyboard is open. The existing FAB component handles this via zIndex and elevation; verify on device.
- Category chips reuse category colors from the domain. If a user has many categories, the horizontal scroll may extend off screen. This is acceptable for v1; a collapsible or paginated picker could be added later.

## Follow-up

- [ ] Draft persistence across app restarts: consider AsyncStorage or domain state if users report losing drafts.
- [ ] Transfer transactions: deferred to Slice 3 (wallet management). The TransactionLogSheet will need a third tab or mode.
- [ ] Transaction editing and deletion: deferred. Currently handled via reversals only.
- [ ] "Log similar" from history detail sheet: a quick way to pre-fill the form from an existing transaction. Deferred to the spending/history refinement.
