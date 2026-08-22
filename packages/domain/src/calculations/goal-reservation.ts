import type { Assignment } from '../entities/Assignment.js';
import type { Goal } from '../entities/Goal.js';
import type { Wallet } from '../entities/Wallet.js';
import { calculateAvailableBalance } from './available-balance.js';

/**
 * C9. Goal Reservation Check.
 * Checks if a goal reservation of the given amount is possible.
 * Returns true if there is enough available balance.
 */
export function canReserveForGoal(
  wallet: Wallet,
  assignments: Assignment[],
  goals: Goal[],
  excludeGoalId: string,
  amount: number,
): boolean {
  const otherGoals = goals.filter((g) => g.id !== excludeGoalId);
  const available = calculateAvailableBalance(wallet, assignments, otherGoals);
  return amount <= available;
}
