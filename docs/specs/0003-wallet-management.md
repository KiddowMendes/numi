# 0003. Wallet Management

**Date**: 2026-10-13
**Status**: Proposed

## Summary

Let users manage their money sources after onboarding: add a wallet, edit a wallet's name, type, or balance, and delete a wallet that is empty and holds no money, all from a new wallets screen reached through Settings. The home screen gains a Wallets group listing each wallet with its balance beside the existing In the pot total. The engine already owns wallets and creation; this feature adds the update and delete operations plus the rules that guard them (unique names, a balance that cannot drop below committed money, and a delete that never destroys money). No schema change and no migration.

## Context

NUMI is built for people with irregular income who keep money in several places at once: cash, a bank account, a stokvel. The engine already models the Wallet entity and offers `createWallet` with a tier limit check, but there is no way to add a wallet from the app after onboarding, no way to rename or adjust one, and no way to remove one. Closing that gap is Slice 3: without it, a user who opens a second account after onboarding is stuck with one wallet forever.

Three forces shape the design. First, the domain owns the money rules: a wallet balance is integer cents, creation already respects the tier limit, and every mutation returns a `Result` and never throws, so the new update and delete operations must follow the same conventions and carry unit tests at 100 percent line coverage. Second, the application currently seeds the user as the free tier, which allows exactly one wallet; a free user can never add anything, so the seeded tier must rise to freemium (three wallets) for the feature to be usable, and the engine limit must keep working. Third, the mobile app already has the interaction idioms this feature needs: the settings screen holds the entry points, the plan and transaction forms use a bottom sheet for quick entry, and the home screen lists money as grouped rows.

Forces that stay out of scope: moving money between wallets is a separate deferred decision, as is a real tier or account system, so this feature manages wallets as standalone containers and leaves the tier seed as a hardcoded value.

## Requirements

**User stories**:

- As a user, I want to add a wallet for each money source so that I can track cash, a bank account, and a stokvel in one place.
- As a user, I want to rename a wallet or change its type when my setup changes so that the list stays honest.
- As a user, I want to correct a wallet balance so that the number on screen matches what I actually hold.
- As a user, I want to remove a wallet I no longer use, without losing money by accident, so that the list stays clean.

**Acceptance criteria** (the contract, each criterion is IDed and independently checkable):

- **AC-1**: Settings shows a Wallets row that opens the wallets screen.
- **AC-2**: The wallets screen lists every wallet with its name, its type label, and its balance in Rand.
- **AC-3**: A docked add button opens the wallet sheet in add mode with a name field, a type picker offering Cash, Bank, Stokvel, and Savings, and an optional starting balance.
- **AC-4**: Confirm stays disabled until the trimmed name is non empty. With no starting balance the wallet starts at R0.
- **AC-5**: On confirm, the engine creates the wallet, the sheet dismisses, a toast says "Added", the list shows the new wallet, and the home Wallets group gains the row.
- **AC-6**: The sheet checks the draft name live against every wallet, trimmed and lowercased, and shows the inline error "Name already in use" before submit. The engine also rejects a duplicate name with `INVALID_STATE` as a backstop.
- **AC-7**: When the wallet count reaches the tier limit, the add button is disabled and a line reads "N of M wallets used", where M is the tier's limit. The line is hidden when the limit is unlimited (premium).
- **AC-8**: Tapping a wallet row opens the wallet sheet in edit mode, prefilled with that wallet's name, type, and balance.
- **AC-9**: In edit mode, name, type, and balance are all editable; saving applies the change, shows the "Saved" toast, dismisses the sheet, and updates every screen that lists wallets on its next render.
- **AC-10**: In edit mode, a new balance below the wallet's committed money (all assignments across every period plus goal reserves in that wallet) returns `INSUFFICIENT_BALANCE` and shows the inline error "R [amount] is already assigned or reserved here".
- **AC-11**: A rename to a duplicate name is caught by the same live check and the same inline error as create.
- **AC-12**: Edit mode has a delete action. It is disabled, with a one line reason, when the wallet is the last one ("You need at least one wallet") or when it holds any transaction, assignment, goal, or a non zero balance ("Move or clear this wallet's money first"). The last wallet reason takes precedence.
- **AC-13**: Tapping delete shows a native `Alert.alert` confirm, titled "Delete wallet?", body "This wallet will be removed.", with a "Delete" confirm and a "Cancel" action. On confirm, the engine deletes the wallet, the sheet dismisses, a toast says "Deleted", and the row leaves the list.
- **AC-14**: The engine rejects deleting the last wallet or a wallet with transactions, assignments, goals, or a non zero balance, with `INVALID_STATE`.
- **AC-15**: The home screen shows a Wallets group below the existing Money group, one row per wallet with its name and balance.
- **AC-16**: Every wallet change is reflected on the wallets screen and the home Wallets group on their next render (both read `appState`, which `syncFromEngine` refreshes after each change).
- **AC-17**: The add and edit draft lives only while the sheet is open; it is discarded on a successful save and when the sheet closes. It is not persisted.
- **AC-18**: Confirm is disabled while the engine call is in flight (double submit protection).

## Options considered

### Option 1: Wallets screen from Settings with a shared add and edit sheet (chosen)

A Settings row opens a dedicated wallets screen that lists every wallet. A docked add button opens a bottom sheet for adding; tapping a row opens the same sheet for editing, with delete inside it. The home screen keeps its totals and gains a per wallet group.

**Pros**:

- Matches the app's idiom: quick entry lives in bottom sheets, lists live on screens, and Settings holds the entry point (ADR 0002 already placed wallet management under Settings).
- The home screen stays focused on the one number that matters, while the per wallet breakdown is one tap away.

**Cons**:

- A new screen and a new route to maintain.
- The wallets list and the home list show some of the same information twice.

### Option 2: Inline wallet editing on the Settings screen

Wallet rows appear directly inside Settings, with add and edit inline.

**Pros**:

- No new route. Fewest moving parts.

**Cons**:

- Settings crowds as more rows arrive.
- A list of wallets with balances makes the Settings screen read as a data screen, not a preferences screen.

### Option 3: A new top level Wallets tab

A fourth tab beside Home, Plan, History, and Settings, holding the full wallet experience.

**Pros**:

- Most prominent placement. Wallets feel as important as the plan.

**Cons**:

- Heaviest commitment for a screen users touch rarely.
- Displaces the tab bar for a management task, and the product brief keeps the home focus on the safe to spend number.

## Decision

**Chosen option**: Option 1: Wallets screen from Settings with a shared add and edit sheet

A Settings row opens a wallets screen at the root route `app/wallets.tsx`. A docked add button (the same pattern the plan screen uses) opens a wallet sheet in add mode; tapping a row opens it in edit mode. The engine gains `updateWallet` and `deleteWallet` plus the calculations `canDeleteWallet`, `canUpdateWalletBalance`, and `isDuplicateWalletName`, and a `walletLimitFor(tier)` helper, with unit tests at 100 percent coverage. The seeded user tier moves from free to freemium, in both seed sites, so a second wallet can actually be created, and the engine's tier limit keeps working. The home screen adds a Wallets group below the existing Money group. No schema change and no migration.

The engineer chose to allow editing a wallet's balance, over the recommended name and type only. That decision is viable because a stored balance that drifts from the transaction history is already part of the model (onboarding sets an opening balance with no backing transaction), and the new `canUpdateWalletBalance` floor keeps available balance non negative, so the conservation check still holds by definition. Delete is stricter than a plain no commitments rule: a wallet must also hold a zero balance, so removing one never destroys money silently.

**Implementation skills**: `expo-router` (`expo/expo`, `.agents/skills/expo-router/`) · `expo-ui` (`expo/expo`, `.agents/skills/expo-ui/`) · `expo-native-ui` (`expo/expo`, `.agents/skills/expo-native-ui/`)

## Rationale

The separate screen wins because it matches every convention the app already uses: Settings holds entry points, bottom sheets hold quick forms, and grouped rows hold lists. Business rules stay in the engine, so the uniqueness check, the balance floor, the delete guard, and the tier limit all live in `@numi/domain` with tests, exactly as 0002 does for assignments. The tier seed matters more than it looks: with the free tier hardcoded, the add button would always fail against `TIER_LIMIT_EXCEEDED`, so the feature would be unbuildable no matter how clean the UI, while freemium makes the path real and still honors the cap at three wallets.

Balance editing is the one decision worth flagging. The recommended shape was name and type only, because a free balance edit lets stored money drift from the sum of income minus expense, which misleads a user who corrects it once and never again. The engineer chose to allow it, and it is safe here: the app never claims the balance equals the transaction history (onboarding already breaks that identity), and the new floor rule keeps a wallet from being dragged below what is committed. The correct follow up is a reconciliation path, recorded below, not blocking the edit.

The two inline errors follow one rule, matching 0002: a not enough money condition surfaces as `INSUFFICIENT_BALANCE` inline (the balance floor, the same code `canUpdateAssignment` uses), while the duplicate name is checked live in the sheet from the domain `isDuplicateWalletName` so its inline copy needs no engine code. Every other engine code maps to the generic toast "Something went wrong".

## Feature design

**Data model sketch**:

The `Wallet` entity stays exactly as it is, so there is no schema change and no migration:

- `Wallet.id`: string (UUID)
- `Wallet.name`: string (display name, trimmed on save)
- `Wallet.type`: `WalletType`, one of `cash`, `bank`, `stokvel`, `savings` offered in v1 (the enum also allows `mashonisa`, deferred)
- `Wallet.balance`: number (integer cents)
- `Wallet.currency`: "ZAR"
- `Wallet.created_at`: Date

Wallet names are unique across all wallets, enforced at the engine with a trimmed, case insensitive comparison. No new persisted entity. The add and edit draft is transient component state in the sheet (AC-17), unlike the assignment and transaction drafts, which persist in zustand; a wallet form is short enough that a half typed row is not worth holding across tab switches. Delete is stricter than the rest: a wallet is deletable only when it holds no transaction, no assignment, no goal, and a zero balance, and at least one other wallet remains.

**State transitions**:

Wallet lifecycle: created → renamed or retyped or rebalanced → deleted (only when empty, holding no money, and not the last one). No other persisted states exist in v1. Sheet: closed → add → (engine create) → closed; closed → edit → (engine update) → closed; edit → confirming delete → closed.

**API surface**:

| Operation                                       | Method          | Key inputs                                             | Key outputs                               | Auth | Key errors                                                                                                  |
| ----------------------------------------------- | --------------- | ------------------------------------------------------ | ----------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------- |
| createWallet                                    | engine function | Wallet (id, name, type, balance, currency, created_at) | Result<Wallet, EngineError>               | none | INVALID_STATE (duplicate name, negative balance), TIER_LIMIT_EXCEEDED                                       |
| updateWallet (new)                              | engine function | id: string, patch { name?, type?, balance? }           | Result<Wallet, EngineError>               | none | NOT_FOUND, INVALID_STATE (duplicate name, negative balance), INSUFFICIENT_BALANCE (balance below committed) |
| deleteWallet (new)                              | engine function | id: string                                             | Result<void, EngineError>                 | none | NOT_FOUND, INVALID_STATE (last wallet, or wallet not empty, or non zero balance)                            |
| canDeleteWallet (new)                           | calculation     | wallet, wallets, assignments, goals, transactions      | { valid: boolean, error: string \| null } | none | none                                                                                                        |
| canUpdateWalletBalance (new)                    | calculation     | wallet, assignments, goals, newBalance: number         | { valid: boolean, error: string \| null } | none | none                                                                                                        |
| isDuplicateWalletName (new)                     | calculation     | wallets, name: string, excludeId?: string              | boolean                                   | none | none                                                                                                        |
| walletLimitFor (new)                            | calculation     | tier: UserTier                                         | number (Infinity when unlimited)          | none | none                                                                                                        |
| addWallet / updateWallet / deleteWallet (store) | store action    | wallet draft, or id plus patch, or id                  | ok or error union, then `syncFromEngine`  | none | the engine codes, plus INVALID_STATE when the engine is not ready                                           |

`updateWallet` accepts a patch of any subset of name, type, and balance; untouched fields keep their values, and an unchanged field is simply not included. The guard calculations return the same `{ valid, error }` shape the existing `canTransfer` returns. The balance floor used by `canUpdateWalletBalance` sums all assignments for the wallet (across every period) plus `current_amount` for goals on that wallet, the same lifetime window the existing available balance uses, so the edit check can never disagree with the available balance the rest of the app reads. `deleteWallet` hard deletes the row: no archive flag, no reassignment.

**Value sourcing** (every value each action produces, computes, or displays, and where it comes from):

| Action               | Value produced / displayed             | Source                                                                                                                                                                   |
| -------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Settings row         | the route opened                       | a fixed constant route, `/wallets` via Expo Router (AC-1)                                                                                                                |
| Wallets screen list  | the wallets                            | `appState.wallets` (AC-2)                                                                                                                                                |
| Wallet row           | name, type label, balance              | `wallet.name`; `wallet.type` mapped by a label map over the offered list (Cash, Bank, Stokvel, Savings); `formatCents(wallet.balance)` from `@/constants/tokens` (AC-2)  |
| Add opens            | name = "", type = "cash", balance = "" | component defaults (AC-3)                                                                                                                                                |
| Add form             | starting balance                       | `AmountInput`, parsed with `randToCents`, `"0"` when empty (AC-3, AC-4)                                                                                                  |
| Add confirm          | the Wallet object                      | store builds it: id via `generateId`, name from the draft trimmed, type from the picker, balance from `randToCents` or 0, currency "ZAR", `created_at` new Date() (AC-5) |
| Duplicate check      | a conflicting wallet                   | the domain `isDuplicateWalletName(appState.wallets, draftName, editingWalletId)`, run live as the name changes (AC-6, AC-11)                                             |
| Tier cap             | the cap line                           | `walletLimitFor(user.tier)` for M and `appState.wallets.length` for N; `canCreateWallet(user, count)` disables the button; the line is hidden when M is unlimited (AC-7) |
| Edit opens           | the row being edited                   | the tapped wallet, looked up by id in `appState.wallets` (AC-8)                                                                                                          |
| Edit opens           | name, type, balance prefill            | the row's fields; balance via `centsToDraftAmount` (AC-8)                                                                                                                |
| Edit save            | the patch                              | any draft field that differs from the row; name trimmed, balance `randToCents` (AC-9)                                                                                    |
| Balance floor        | the committed amount                   | sum of assignments for the wallet plus goal `current_amount`, from `appState` (AC-10)                                                                                    |
| Delete enabled       | allowed and reason                     | `canDeleteWallet(wallet, appState.wallets, appState.assignments, appState.goals, appState.transactions)` returning `{ valid, error }` (AC-12)                            |
| Delete confirm       | which row                              | `editingWalletId` held by the open sheet (AC-13)                                                                                                                         |
| Delete side effect   | stale draft wallet ids                 | the delete action clears any stored `draft.walletId` or `assignmentDraft.walletId` equal to the deleted wallet, so the sheets fall back to the first wallet (AC-13)      |
| Home Wallets group   | one row per wallet, name and balance   | `appState.wallets` (AC-15)                                                                                                                                               |
| Toast                | "Added", "Saved", "Deleted"            | the existing app toast (`components/app-toast`, the same one transaction entry and assignments use) (AC-5, AC-9, AC-13)                                                  |
| Every screen refresh | the updated lists                      | `syncFromEngine` after each engine call (AC-16)                                                                                                                          |

**Key invariants**:

- Wallet names are unique. The check trims and lowercases both sides, and excludes the row being edited, so a rename to the same name is not a conflict (AC-6, AC-11).
- Wallet balance is a non negative integer in cents. The engine rejects a negative balance on create and on update, and the UI disables confirm until the number parses (AC-4, AC-9).
- A wallet's balance never drops below its committed money. `canUpdateWalletBalance` compares the new balance to all assignments for the wallet plus goal reserves, so available balance stays non negative (AC-10).
- Delete is allowed only when the wallet has no transaction (as either source or destination), no assignment, no goal, a zero balance, and at least one other wallet remains. The engine enforces it, and the UI disables delete with the same rule's reason (AC-12, AC-14).
- The last wallet is never deleted, so the app always has a wallet to hang transactions and the home empty state on (AC-14).
- The tier limit still governs creation. Free allows one, freemium allows three, premium is unlimited, and the add button is disabled at the cap instead of failing on tap (AC-7).
- Money stays integer cents. Conversion happens only in `@numi/utils/src/currency.ts`.
- No derived value is stored. Balances, available, and committed all compute at read time from the current state (AC-16).
- The draft is component state only. It clears on a successful save and when the sheet closes, and is never persisted (AC-17).
- Error to surface mapping matches 0002: only `INSUFFICIENT_BALANCE` shows an inline field error; the duplicate name inline error comes from the live domain check; every other code maps to the generic toast "Something went wrong" (AC-6, AC-10).
- Wallet type is a label, not behavior in v1. It changes nothing about balances or transactions; only the display and the picker read it.

**Security model**:

Single user, offline, no auth, same as transaction entry and assignment management. No regulated data beyond user entered wallet names and balances, no compliance scope. Wallet names are free text and are rendered as text only, never executed.

**Configuration required**:

None. No new environment variables or credentials. One seed change in two places: the user tier moves from `free` to `freemium` in `apps/mobile/src/store/provider.tsx` and in `INITIAL_APP_STATE` in `apps/mobile/src/store/store.ts`, so `resetForNewUser` cannot drop the app back to the free tier.

**Critical test scenarios** (each maps to an acceptance criterion in ## Requirements):

- Happy path add: from Settings, open the wallets screen, tap the docked button, type "Capitec", pick Bank, enter R500, confirm. Toast "Added", the row appears, and the home Wallets group gains "Capitec R500.00". Verifies **AC-1**, **AC-2**, **AC-3**, **AC-5**, **AC-15**
- Empty balance add: confirm with no starting balance creates a wallet at R0. Verifies **AC-4**
- Duplicate name: a wallet named "cash" exists; add one named "Cash". The inline error "Name already in use" appears live, before submit, and nothing saves. A direct engine call returns `INVALID_STATE`. Verifies **AC-6**
- Tier cap: with three wallets on freemium, the add button is disabled and the line reads "3 of 3 wallets used"; for a premium (unlimited) user the line is absent. Verifies **AC-7**
- Edit: tap the Capitec row, the sheet opens prefilled, rename to "Capitec account", change the type to Savings, save. Toast "Saved", the row updates, home updates on its next render. Verifies **AC-8**, **AC-9**, **AC-16**
- Balance below committed: a wallet has R800 assigned and reserved; edit the balance to R500. The engine returns `INSUFFICIENT_BALANCE` and the inline error "R800.00 is already assigned or reserved here" shows, nothing saves. Verifies **AC-10**
- Duplicate rename: rename to an existing name. The live inline error shows, nothing saves. Verifies **AC-11**
- Delete blocked: the last wallet shows delete disabled with "You need at least one wallet"; a wallet with any transaction, assignment, or goal, or a non zero balance, shows delete disabled with "Move or clear this wallet's money first". Verifies **AC-12**
- Delete empty: an empty wallet (zero balance, no data) row opens edit, delete shows enabled, confirm the dialog. Toast "Deleted", the row leaves the list and leaves home. Verifies **AC-13**
- Stranded draft: a stored spend sheet draft points at wallet B, then wallet B is deleted from the wallets screen. Reopening the spend sheet falls back to the first wallet. Verifies **AC-13**
- Delete blocked at engine: a direct `deleteWallet` call on the last wallet, or a wallet with data or a non zero balance, returns `INVALID_STATE`. Verifies **AC-14**
- No persistence: type a name, close the sheet without saving, reopen. The field is empty. Verifies **AC-17**
- Double submit: confirm is disabled while the engine call is in flight. Verifies **AC-18**

## Build plan

Ordered by the Tracer Bullet approach: prove the engine path first, then the store, then the sheets, then the screens, then wire and polish. No migration is needed because the wallet table is unchanged.

1. [ ] Domain engine: add a trimmed, case insensitive unique name check and a non negative balance guard to `createWallet`; add `updateWallet` (patch of name, type, balance, with the duplicate name check, the negative balance guard, and the balance floor) and `deleteWallet` (hard delete, guarded by empty, zero balance, and not last); add the `canDeleteWallet`, `canUpdateWalletBalance`, and `isDuplicateWalletName` calculations and the `walletLimitFor(tier)` helper, with the `{ valid, error }` guard shape; keep unit tests at 100 percent line coverage. Satisfies **AC-6**, **AC-9**, **AC-10**, **AC-11**, **AC-14**
2. [ ] Seed the app as freemium in both sites: the user tier in `apps/mobile/src/store/provider.tsx` and `INITIAL_APP_STATE.user.tier` in `apps/mobile/src/store/store.ts`, from `free` to `freemium`, so a second wallet is creatable and a reset cannot drop back to free. Satisfies **AC-7**
3. [ ] Store: add `walletSheetMode` (`'closed' | 'add' | 'edit'`) and `editingWalletId`, keep the name, type, and balance draft as component state in the sheet, and add the `addWallet`, `updateWallet`, and `deleteWallet` actions that build the entity or patch, call the engine, `syncFromEngine`, and close the sheet on success. The delete action also clears any stored `draft.walletId` or `assignmentDraft.walletId` that points at the deleted wallet. Satisfies **AC-5**, **AC-9**, **AC-13**, **AC-16**, **AC-18**
4. [ ] Build the WalletSheet component: a bottom sheet reusing BottomSheet, TextField for the name, PillToggle for the type picker (Cash, Bank, Stokvel, Savings), and AmountInput for the optional starting balance and the editable balance; a live duplicate name check calling `isDuplicateWalletName` from `@numi/domain`, an inline error for a balance below committed (from `INSUFFICIENT_BALANCE`), and Save disabled until a field changes; a delete action in the footer enabled only when `canDeleteWallet` allows it, with the `Alert.alert` confirm and its copy; confirm disabled until the name is non empty and while the engine call is in flight. Satisfies **AC-3**, **AC-4**, **AC-6**, **AC-8**, **AC-9**, **AC-10**, **AC-11**, **AC-12**, **AC-13**, **AC-17**, **AC-18**
5. [ ] Build the wallets screen (`app/wallets.tsx`): the list of wallets with name, type label, and Rand balance using GroupList and GroupRow, the docked add button (disabled at the tier cap) with the "N of M wallets used" line from `walletLimitFor` (hidden when unlimited), a back button matching the review screen, and the wallet sheet wired to add and edit. Satisfies **AC-1**, **AC-2**, **AC-3**, **AC-5**, **AC-7**, **AC-8**
6. [ ] Wire Settings: add a Wallets GroupRow that opens the wallets screen with Expo Router. Satisfies **AC-1**
7. [ ] Add the home Wallets group: below the existing Money group, one GroupRow per wallet with its name and balance, updating with the rest of the screen. Satisfies **AC-15**, **AC-16**
8. [ ] Edge cases end to end: duplicate name on add and rename, balance below committed, the two delete blocked reasons with their precedence, the tier cap line (and its absence when unlimited), the empty wallets list (defensive only, onboarding guarantees one), and double submit. Satisfies **AC-6**, **AC-7**, **AC-10**, **AC-11**, **AC-12**, **AC-13**, **AC-14**, **AC-17**, **AC-18**

## Consequences

**Positive**:

- Users can finally add the bank account or stokvel they opened after onboarding, which is the whole point of Slice 3.
- The rules live where every other money rule lives, in the engine, tested at 100 percent coverage, so create, update, and delete can never disagree.
- A delete can never destroy money: the zero balance requirement closes the silent money loss the first draft missed.
- The feature reuses the bottom sheet, the type pill, the group list, the docked button, the toast, and `syncFromEngine`, with no new dependency and no migration.
- Seeding freemium makes the wallet cap real and visible, so the tier model starts to mean something.

**Negative / tradeoffs**:

- Balance editing lets stored money drift from the transaction history. The app never claimed those matched (onboarding sets an opening balance with no transaction), but the drift is now user controlled, so a careless correction silently changes every number downstream.
- The engine gains two operations, four calculations or helpers, and their tests, a bounded but real surface to hold at 100 percent coverage.
- Delete requires a zero balance as well as no commitments, so removing a funded wallet means moving the money out first, and moving money between wallets is not built yet, which can block a delete a user expects to work.
- Delete is a hard delete. A wallet removed this way is gone permanently, including its place in pickers.
- The tier is now freemium for everyone, a product decision made without a real account system, because the app has no way to tell a paying user from any other user yet.

**Neutral**:

- No schema change and no database migration; the wallets table already fits create, update, and delete.
- The settings screen and the home screen both change, which the route dependency map in `apps/mobile/AGENTS.md` will need to reflect.
- The wallets screen shows the same names and balances that appear on home; duplication is intentional, home answers "will my money last" and the wallets screen answers "where is my money".
- The error to surface mapping now matches 0002 exactly: inline for `INSUFFICIENT_BALANCE` and the live duplicate name, generic toast otherwise.

## Follow-up

- [ ] Reconciliation for wallet balances: because balance is editable, add a real adjust balance path (a transaction the engine counts) later so the stored number can be moved back toward the transaction history with a record.
- [ ] Transfer transactions: moving money between wallets stays deferred (already listed in scope), and is the natural way to empty a wallet before deleting it; the wallet sheet must not grow a transfer mode before that decision.
- [ ] Mashonisa as a wallet type: the enum allows it and the glossary reserves it for Premium v2; offer it when tiers or debt entries arrive.
- [ ] Wallet reordering or archive: if users want a specific order, or want to keep history while hiding a wallet, design either as its own decision.
- [ ] Settings skill path: `apps/mobile/AGENTS.md` lists the Expo skills under `apps/mobile/.agents/skills/`, but the real directory is `.agents/skills/` at the repo root; reconcile the pointer so later skills resolve it.
- [ ] Real tier enrollment: the freemium seed is a stopgap; a real account and tier decision will eventually own this value.

## References

**Project sources** (verifiable, in this repo):

- `docs/scope/scope.md`, slice 3, the feature row and its Done when line
- Spec 0001, transaction entry, for the wallet picker and the balance rules it shares
- Spec 0002, assignment management, for the engine owns the rules convention, the bottom sheet pattern, the error to surface mapping, and the lifetime available balance window
- `docs/adr/0002-onboarding-wizard-flow.md`, for placing wallet management under Settings
- `packages/domain/AGENTS.md`, for the engine conventions and the 100 percent coverage rule
- `apps/mobile/AGENTS.md`, for the route and component idioms
- `packages/domain/src/calculations/tier-limit.ts`, the wallet tier limits
- `apps/mobile/app/(tabs)/index.tsx`, the existing home Money group

**Practices & standards**:

- Engine owned business rules, returning `Result` and never throwing
- Money kept as integer cents, converted only in the currency helper
- Hard delete for a small local store over soft delete, with guards instead of ghost data
- Uniqueness and invariant validation at the domain layer, not the UI
- A guarded delete that cannot destroy money silently
