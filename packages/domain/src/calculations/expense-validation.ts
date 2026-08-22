import type { Assignment } from '../entities/Assignment.js';
import type { Goal } from '../entities/Goal.js';
import type { Wallet } from '../entities/Wallet.js';
import { calculateAvailableBalance } from './available-balance.js';

/**
 * C12. Expense Validation.
 * Checks if an expense can be made from a wallet.
 */
export function canExpense(
  wallet: Wallet,
  assignments: Assignment[],
  goals: Goal[],
  amount: number,
): boolean {
  const available = calculateAvailableBalance(wallet, assignments, goals);
  return available >= amount;
}
