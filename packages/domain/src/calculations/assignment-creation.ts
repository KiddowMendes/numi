import type { Assignment } from '../entities/Assignment.js';
import type { Goal } from '../entities/Goal.js';
import type { Wallet } from '../entities/Wallet.js';

/**
 * C10. Assignment Creation Check.
 * Checks if a new assignment can be created without exceeding the wallet balance.
 */
export function canCreateAssignment(
  wallet: Wallet,
  assignments: Assignment[],
  goals: Goal[],
  newAmount: number,
): boolean {
  const currentAssigned = assignments
    .filter((a) => a.wallet_id === wallet.id)
    .reduce((sum, a) => sum + a.amount, 0);

  const currentReserved = goals
    .filter((g) => g.wallet_id === wallet.id)
    .reduce((sum, g) => sum + g.current_amount, 0);

  const proposedTotal = currentAssigned + currentReserved + newAmount;
  return proposedTotal <= wallet.balance;
}
