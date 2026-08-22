import type { Assignment } from '../entities/Assignment.js';
import type { Goal } from '../entities/Goal.js';
import type { Wallet } from '../entities/Wallet.js';
import { calculateAvailableBalance } from './available-balance.js';

/**
 * C15. Conservation of Money (System Check).
 * Verifies that total wallet balances == total unassigned + total assigned + total reserved.
 */
export function checkConservation(
  wallets: Wallet[],
  assignments: Assignment[],
  goals: Goal[],
): { valid: boolean; discrepancy: number } {
  const totalBalances = wallets.reduce((sum, w) => sum + w.balance, 0);

  const totalUnassigned = wallets.reduce(
    (sum, w) => sum + calculateAvailableBalance(w, assignments, goals),
    0,
  );

  const totalAssigned = assignments.reduce((sum, a) => sum + a.amount, 0);
  const totalReserved = goals.reduce((sum, g) => sum + g.current_amount, 0);

  const expected = totalUnassigned + totalAssigned + totalReserved;
  const discrepancy = totalBalances - expected;

  return { valid: discrepancy === 0, discrepancy };
}
