import type { Assignment } from '../entities/Assignment';
import type { Goal } from '../entities/Goal';
import type { Wallet } from '../entities/Wallet';
import { calculateAvailableBalance } from './available-balance';

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
