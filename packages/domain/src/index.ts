export type { AppState } from './state.js';

// Entities
export type {
  User,
  UserTier,
  Period,
  Wallet,
  Category,
  Goal,
  GoalStatus,
  Assignment,
  Transaction,
  TransactionType,
} from './entities/index.js';

// Calculations
export {
  calculateWalletBalance,
  calculateAvailableBalance,
  getActiveAssignmentsForWallet,
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
} from './calculations/index.js';

// Engine API
export { createEngine } from './api/index.js';
export type { EngineAPI } from './api/index.js';
