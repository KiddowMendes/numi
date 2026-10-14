import type { Assignment } from "../entities/Assignment";
import type { Goal } from "../entities/Goal";
import type { Wallet } from "../entities/Wallet";

/**
 * C11. Assignment Update Check.
 * Checks if an existing assignment can change to `newAmount` without exceeding
 * the wallet balance. The row being edited is excluded from the current total so
 * its old amount is not counted twice.
 */
export function canUpdateAssignment(
  wallet: Wallet,
  assignments: Assignment[],
  goals: Goal[],
  assignmentId: string,
  newAmount: number,
): boolean {
  const otherAssigned = assignments
    .filter((a) => a.wallet_id === wallet.id && a.id !== assignmentId)
    .reduce((sum, a) => sum + a.amount, 0);

  const currentReserved = goals
    .filter((g) => g.wallet_id === wallet.id)
    .reduce((sum, g) => sum + g.current_amount, 0);

  const proposedTotal = otherAssigned + currentReserved + newAmount;
  return proposedTotal <= wallet.balance;
}
