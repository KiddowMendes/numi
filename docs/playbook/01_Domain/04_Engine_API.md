---
version: 1.0.0
status: Locked
owner: Elton Pascoal
related_documents:
  - "docs/playbook/01_Domain/01_Entities.md"
  - "docs/playbook/01_Domain/02_Business_Rules.md"
  - "docs/playbook/01_Domain/03_Calculations.md"
decision_record: none
---

# 04 — Engine API

> The interface between the domain and the world. No UI concepts leak in. No React. No React Native. Just operations and queries.

---

## Design Principles

- The engine is pure. It receives data, validates it against Business Rules, performs Calculations, and returns new state or errors.
- Every function is synchronous. Async operations (storage, sync) are handled by the caller.
- Every mutating function returns either `Result<State, Error[]>` or throws a typed error.
- The engine does not know about users, accounts, or the internet. It knows about `UserContext` (id + tier only).

---

## Types

```typescript
type UserContext = {
  userId: string;
  tier: 'free' | 'freemium' | 'premium';
};

type Result<T, E> = 
  | { ok: true; value: T }
  | { ok: false; errors: E[] };

type EngineError = 
  | { code: 'INSUFFICIENT_BALANCE'; message: string }
  | { code: 'TIER_LIMIT_EXCEEDED'; message: string }
  | { code: 'INVALID_STATE'; message: string }
  | { code: 'DATA_CORRUPTION'; message: string }
  | { code: 'NOT_FOUND'; message: string };
```

---

## Period Operations

### createPeriod
Creates a new Period. Closes any currently active Period.

```typescript
function createPeriod(
  ctx: UserContext,
  state: AppState,
  input: { name: string; startDate: Date; endDate: Date }
): Result<AppState, EngineError>
```

Rules enforced: BR-P1, BR-P2, BR-P3, C4

### closePeriod
Closes the active Period. Archives its Assignments.

```typescript
function closePeriod(
  ctx: UserContext,
  state: AppState
): Result<AppState, EngineError>
```

Rules enforced: BR-P3, C14

### getActivePeriod
Returns the currently active Period or null.

```typescript
function getActivePeriod(
  state: AppState
): Period | null
```

---

## Wallet Operations

### createWallet
Creates a new Wallet if tier allows.

```typescript
function createWallet(
  ctx: UserContext,
  state: AppState,
  input: { name: string; type: WalletType }
): Result<AppState, EngineError>
```

Rules enforced: BR-W3, BR-W4, C13

### getWalletBalance
Returns stored balance and calculated balance for verification.

```typescript
function getWalletBalance(
  state: AppState,
  walletId: string
): { stored: number; calculated: number; matches: boolean }
```

Rules enforced: C1

### getWalletAvailableBalance
Returns unassigned money in a Wallet.

```typescript
function getWalletAvailableBalance(
  state: AppState,
  walletId: string
): number
```

Rules enforced: C2

---

## Category Operations

### createCategory
Creates a new Category.

```typescript
function createCategory(
  ctx: UserContext,
  state: AppState,
  input: { name: string; color: string; icon: string }
): Result<AppState, EngineError>
```

Rules enforced: BR-C1

### listCategories
Returns all Categories.

```typescript
function listCategories(
  state: AppState
): Category[]
```

---

## Goal Operations

### createGoal
Creates a Goal reservation inside a Wallet.

```typescript
function createGoal(
  ctx: UserContext,
  state: AppState,
  input: { name: string; targetAmount: number; deadline: Date | null; walletId: string }
): Result<AppState, EngineError>
```

Rules enforced: BR-G1, BR-G2, BR-G3, BR-G4, C9, C13

### reserveForGoal
Increases a Goal's current_amount.

```typescript
function reserveForGoal(
  ctx: UserContext,
  state: AppState,
  input: { goalId: string; amount: number }
): Result<AppState, EngineError>
```

Rules enforced: BR-G2, BR-G3, BR-G4, C9

### releaseGoal
Deletes a Goal and returns reserved money to Wallet.

```typescript
function releaseGoal(
  ctx: UserContext,
  state: AppState,
  goalId: string
): Result<AppState, EngineError>
```

Rules enforced: BR-G6

### getGoalProgress
Returns progress percentage and remaining amount.

```typescript
function getGoalProgress(
  state: AppState,
  goalId: string
): { percentage: number; remaining: number }
```

Rules enforced: C8

---

## Assignment Operations

### createAssignment
Assigns money from a Wallet to a Category for the active Period.

```typescript
function createAssignment(
  ctx: UserContext,
  state: AppState,
  input: { walletId: string; categoryId: string; amount: number }
): Result<AppState, EngineError>
```

Rules enforced: BR-A1, BR-A2, BR-A3, BR-A4, BR-A5, C10

### deleteAssignment
Removes an Assignment. Money returns to Wallet available balance.

```typescript
function deleteAssignment(
  ctx: UserContext,
  state: AppState,
  assignmentId: string
): Result<AppState, EngineError>
```

Rules enforced: BR-A4

### getAssignmentStatus
Returns spent and remaining for an Assignment.

```typescript
function getAssignmentStatus(
  state: AppState,
  assignmentId: string
): { assigned: number; spent: number; remaining: number }
```

Rules enforced: C6, C7

---

## Transaction Operations

### logIncome
Records money entering a Wallet.

```typescript
function logIncome(
  ctx: UserContext,
  state: AppState,
  input: { walletId: string; amount: number; date: Date; note?: string }
): Result<AppState, EngineError>
```

Rules enforced: BR-T1, BR-T2

### logExpense
Records money leaving a Wallet.

```typescript
function logExpense(
  ctx: UserContext,
  state: AppState,
  input: { walletId: string; categoryId: string; amount: number; date: Date; note?: string }
): Result<AppState, EngineError>
```

Rules enforced: BR-T1, BR-T2, BR-C1, BR-C2, C12

### transfer
Moves money between Wallets.

```typescript
function transfer(
  ctx: UserContext,
  state: AppState,
  input: { fromWalletId: string; toWalletId: string; amount: number; date: Date; note?: string }
): Result<AppState, EngineError>
```

Rules enforced: BR-T1, BR-T2, BR-T5, C11

### reverseTransaction
Creates a reversing entry for a previous Transaction.

```typescript
function reverseTransaction(
  ctx: UserContext,
  state: AppState,
  input: { originalTransactionId: string; date: Date; note?: string }
): Result<AppState, EngineError>
```

Rules enforced: BR-T3, BR-T4

---

## Query Operations

### getSafeToSpend
Returns global and per-Wallet safe-to-spend.

```typescript
function getSafeToSpend(
  state: AppState
): { global: number; byWallet: Record<string, number> }
```

Rules enforced: C2, C3

### getDailySafeToSpend
Returns the daily safe-to-spend number.

```typescript
function getDailySafeToSpend(
  state: AppState
): { value: number | null; daysRemaining: number | null }
```

Rules enforced: C4, C5

### getConservationStatus
Runs the money conservation integrity check.

```typescript
function getConservationStatus(
  state: AppState
): { valid: boolean; discrepancy: number }
```

Rules enforced: C15

---

## AppState

The single source of truth passed into every engine function.

```typescript
type AppState = {
  user: User;
  activePeriod: Period | null;
  periods: Period[];
  wallets: Wallet[];
  categories: Category[];
  goals: Goal[];
  assignments: Assignment[];
  transactions: Transaction[];
};
```

The engine treats AppState as immutable. Every operation returns a new AppState.

---

## Error Handling

All errors are typed. The engine never returns strings. The UI layer maps error codes to human messages.

| Error Code | Trigger | UI Message Example |
|---|---|---|
| `INSUFFICIENT_BALANCE` | BR-T2, BR-T5, C11, C12 | "You don't have enough available in this wallet" |
| `TIER_LIMIT_EXCEEDED` | BR-W3, BR-G1, C13 | "Upgrade to create more wallets" |
| `INVALID_STATE` | BR-P1, BR-A2, BR-G3 | "Cannot do this right now" |
| `DATA_CORRUPTION` | C1, C15 | "Something went wrong. Please contact support." |
| `NOT_FOUND` | Any lookup failure | "Not found" |

---

## What Happens After This Document

This API is implemented in `packages/domain/src/api/EngineAPI.ts`. Every function must have a corresponding unit test in `packages/domain/tests/`.

Next: `docs/playbook/02_Product_Mechanics/01_Invariants.md` — the bridge between domain math and user-facing behavior.