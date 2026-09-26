export type { AppState } from "./state";

// Entities
export type {
  User,
  UserTier,
  Period,
  Wallet,
  Category,
  Goal,
  Assignment,
  Transaction,
  TransactionType,
} from "./entities/index";

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
} from "./calculations/index";

// Engine API
export { createEngine } from "./api/index";
export type { EngineAPI } from "./api/index";
