import type { Result, EngineError } from '@numi/types';
import { ok, err } from '@numi/types';
import type { AppState } from '../state.js';
import type { User } from '../entities/User.js';
import type { Wallet } from '../entities/Wallet.js';
import type { Category } from '../entities/Category.js';
import type { Goal } from '../entities/Goal.js';
import type { Assignment } from '../entities/Assignment.js';
import type { Transaction } from '../entities/Transaction.js';
import {
  calculateWalletBalance,
  calculateAvailableBalance,
  calculateGlobalSafeToSpend,
  calculateDaysRemaining,
  calculateDailySafeToSpend,
  calculateAssignmentSpent,
  calculateAssignmentRemaining,
  calculateGoalProgress,
  canReserveForGoal,
  canCreateAssignment,
  canTransfer,
  canExpense,
  canCreateWallet,
  canCreateGoal,
  calculatePeriodClose,
  checkConservation,
} from '../calculations/index.js';

export type EngineAPI = {
  getState(): AppState;

  // Transactions
  recordTransaction(tx: Transaction): Result<Transaction, EngineError>;
  deleteTransaction(id: string): Result<void, EngineError>;

  // Assignments
  createAssignment(assignment: Assignment): Result<Assignment, EngineError>;
  deleteAssignment(id: string): Result<void, EngineError>;

  // Wallets
  createWallet(wallet: Wallet): Result<Wallet, EngineError>;

  // Goals
  createGoal(goal: Goal): Result<Goal, EngineError>;
  updateGoal(id: string, patch: Partial<Pick<Goal, 'current_amount'>>): Result<Goal, EngineError>;
  deleteGoal(id: string): Result<void, EngineError>;

  // Queries
  getWalletBalance(walletId: string): Result<number, EngineError>;
  getAvailableBalance(walletId: string): Result<number, EngineError>;
  getDailySafeToSpend(): Result<number | null, EngineError>;
  getAssignmentSpent(assignmentId: string): Result<number, EngineError>;
  getAssignmentRemaining(assignmentId: string): Result<number, EngineError>;
  getGoalProgress(goalId: string): Result<{ percentage: number; remaining: number }, EngineError>;
  checkConservation(): Result<{ valid: boolean; discrepancy: number }, EngineError>;
};

export function createEngine(initialState: AppState): EngineAPI {
  let state = { ...initialState };

  function findWallet(id: string): Wallet | undefined {
    return state.wallets.find((w) => w.id === id);
  }

  function findAssignment(id: string): Assignment | undefined {
    return state.assignments.find((a) => a.id === id);
  }

  function findGoal(id: string): Goal | undefined {
    return state.goals.find((g) => g.id === id);
  }

  function findTransaction(id: string): Transaction | undefined {
    return state.transactions.find((t) => t.id === id);
  }

  function findCategory(id: string): Category | undefined {
    return state.categories.find((c) => c.id === id);
  }

  return {
    getState: () => state,

    recordTransaction(tx: Transaction): Result<Transaction, EngineError> {
      const wallet = findWallet(tx.wallet_id);
      if (!wallet) {
        return err([{ code: 'NOT_FOUND', message: `Wallet ${tx.wallet_id} not found` }]);
      }

      if (tx.type === 'expense') {
        const category = tx.category_id ? findCategory(tx.category_id) : undefined;
        if (!category) {
          return err([{ code: 'NOT_FOUND', message: `Category ${tx.category_id} not found` }]);
        }

        if (!canExpense(wallet, state.assignments, state.goals, tx.amount)) {
          return err([{ code: 'INSUFFICIENT_BALANCE', message: 'Insufficient available balance' }]);
        }
      }

      if (tx.type === 'transfer') {
        if (!tx.to_wallet_id) {
          return err([{ code: 'INVALID_STATE', message: 'Transfer requires to_wallet_id' }]);
        }

        const toWallet = findWallet(tx.to_wallet_id);
        if (!toWallet) {
          return err([{ code: 'NOT_FOUND', message: `Destination wallet ${tx.to_wallet_id} not found` }]);
        }

        const transferCheck = canTransfer(wallet, toWallet, state.assignments, state.goals, tx.amount);
        if (!transferCheck.valid) {
          return err([{ code: 'INSUFFICIENT_BALANCE', message: transferCheck.error }]);
        }
      }

      state = {
        ...state,
        transactions: [...state.transactions, tx],
      };

      // Update wallet balance
      state = {
        ...state,
        wallets: state.wallets.map((w) => {
          if (w.id === tx.wallet_id) {
            let newBalance = w.balance;
            if (tx.type === 'income') newBalance += tx.amount;
            if (tx.type === 'expense') newBalance -= tx.amount;
            if (tx.type === 'transfer') newBalance -= tx.amount;
            return { ...w, balance: newBalance };
          }
          if (tx.type === 'transfer' && tx.to_wallet_id === w.id) {
            return { ...w, balance: w.balance + tx.amount };
          }
          return w;
        }),
      };

      return ok(tx);
    },

    deleteTransaction(id: string): Result<void, EngineError> {
      const tx = findTransaction(id);
      if (!tx) {
        return err([{ code: 'NOT_FOUND', message: `Transaction ${id} not found` }]);
      }

      state = {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== id),
        wallets: state.wallets.map((w) => {
          if (w.id === tx.wallet_id) {
            let newBalance = w.balance;
            if (tx.type === 'income') newBalance -= tx.amount;
            if (tx.type === 'expense') newBalance += tx.amount;
            if (tx.type === 'transfer') newBalance += tx.amount;
            return { ...w, balance: newBalance };
          }
          if (tx.type === 'transfer' && tx.to_wallet_id === w.id) {
            return { ...w, balance: w.balance - tx.amount };
          }
          return w;
        }),
      };

      return ok(undefined);
    },

    createAssignment(assignment: Assignment): Result<Assignment, EngineError> {
      const wallet = findWallet(assignment.wallet_id);
      if (!wallet) {
        return err([{ code: 'NOT_FOUND', message: `Wallet ${assignment.wallet_id} not found` }]);
      }

      if (!canCreateAssignment(wallet, state.assignments, state.goals, assignment.amount)) {
        return err([{ code: 'INSUFFICIENT_BALANCE', message: 'Cannot create assignment: exceeds available balance' }]);
      }

      state = {
        ...state,
        assignments: [...state.assignments, assignment],
      };

      return ok(assignment);
    },

    deleteAssignment(id: string): Result<void, EngineError> {
      const assignment = findAssignment(id);
      if (!assignment) {
        return err([{ code: 'NOT_FOUND', message: `Assignment ${id} not found` }]);
      }

      state = {
        ...state,
        assignments: state.assignments.filter((a) => a.id !== id),
      };

      return ok(undefined);
    },

    createWallet(wallet: Wallet): Result<Wallet, EngineError> {
      if (!canCreateWallet(state.user, state.wallets.length)) {
        return err([{ code: 'TIER_LIMIT_EXCEEDED', message: 'Wallet limit reached for your tier' }]);
      }

      state = {
        ...state,
        wallets: [...state.wallets, wallet],
      };

      return ok(wallet);
    },

    createGoal(goal: Goal): Result<Goal, EngineError> {
      if (!canCreateGoal(state.user, state.goals.length)) {
        return err([{ code: 'TIER_LIMIT_EXCEEDED', message: 'Goal limit reached for your tier' }]);
      }

      const wallet = findGoal(goal.wallet_id) ?? findWallet(goal.wallet_id);
      if (!wallet) {
        return err([{ code: 'NOT_FOUND', message: `Wallet ${goal.wallet_id} not found` }]);
      }

      state = {
        ...state,
        goals: [...state.goals, goal],
      };

      return ok(goal);
    },

    updateGoal(
      id: string,
      patch: Partial<Pick<Goal, 'current_amount'>>,
    ): Result<Goal, EngineError> {
      const goal = findGoal(id);
      if (!goal) {
        return err([{ code: 'NOT_FOUND', message: `Goal ${id} not found` }]);
      }

      const updated = { ...goal, ...patch };

      state = {
        ...state,
        goals: state.goals.map((g) => (g.id === id ? updated : g)),
      };

      return ok(updated);
    },

    deleteGoal(id: string): Result<void, EngineError> {
      const goal = findGoal(id);
      if (!goal) {
        return err([{ code: 'NOT_FOUND', message: `Goal ${id} not found` }]);
      }

      state = {
        ...state,
        goals: state.goals.filter((g) => g.id !== id),
      };

      return ok(undefined);
    },

    getWalletBalance(walletId: string): Result<number, EngineError> {
      const wallet = findWallet(walletId);
      if (!wallet) {
        return err([{ code: 'NOT_FOUND', message: `Wallet ${walletId} not found` }]);
      }

      return ok(wallet.balance);
    },

    getAvailableBalance(walletId: string): Result<number, EngineError> {
      const wallet = findWallet(walletId);
      if (!wallet) {
        return err([{ code: 'NOT_FOUND', message: `Wallet ${walletId} not found` }]);
      }

      const available = calculateAvailableBalance(wallet, state.assignments, state.goals);
      return ok(available);
    },

    getDailySafeToSpend(): Result<number | null, EngineError> {
      const { value } = calculateDailySafeToSpend(
        state.wallets,
        state.assignments,
        state.goals,
        state.activePeriod,
        new Date(),
      );
      return ok(value);
    },

    getAssignmentSpent(assignmentId: string): Result<number, EngineError> {
      const assignment = findAssignment(assignmentId);
      if (!assignment) {
        return err([{ code: 'NOT_FOUND', message: `Assignment ${assignmentId} not found` }]);
      }

      if (!state.activePeriod) {
        return err([{ code: 'INVALID_STATE', message: 'No active period' }]);
      }

      const spent = calculateAssignmentSpent(assignment, state.transactions, state.activePeriod);
      return ok(spent);
    },

    getAssignmentRemaining(assignmentId: string): Result<number, EngineError> {
      const assignment = findAssignment(assignmentId);
      if (!assignment) {
        return err([{ code: 'NOT_FOUND', message: `Assignment ${assignmentId} not found` }]);
      }

      if (!state.activePeriod) {
        return err([{ code: 'INVALID_STATE', message: 'No active period' }]);
      }

      const remaining = calculateAssignmentRemaining(
        assignment,
        state.transactions,
        state.activePeriod,
      );
      return ok(remaining);
    },

    getGoalProgress(
      goalId: string,
    ): Result<{ percentage: number; remaining: number }, EngineError> {
      const goal = findGoal(goalId);
      if (!goal) {
        return err([{ code: 'NOT_FOUND', message: `Goal ${goalId} not found` }]);
      }

      const progress = calculateGoalProgress(goal);
      return ok(progress);
    },

    checkConservation(): Result<{ valid: boolean; discrepancy: number }, EngineError> {
      const result = checkConservation(state.wallets, state.assignments, state.goals);
      return ok(result);
    },
  };
}
