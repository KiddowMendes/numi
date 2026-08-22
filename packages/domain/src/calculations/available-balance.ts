import type { Assignment } from '../entities/Assignment.js';
import type { Goal } from '../entities/Goal.js';
import type { Period } from '../entities/Period.js';
import type { Wallet } from '../entities/Wallet.js';

/**
 * C2. Wallet Available Balance.
 * Money in a Wallet that is not assigned or reserved.
 */
export function calculateAvailableBalance(
  wallet: Wallet,
  activeAssignments: Assignment[],
  goals: Goal[],
): number {
  const totalAssigned = activeAssignments
    .filter((a) => a.wallet_id === wallet.id)
    .reduce((sum, a) => sum + a.amount, 0);

  const totalReserved = goals
    .filter((g) => g.wallet_id === wallet.id)
    .reduce((sum, g) => sum + g.current_amount, 0);

  return wallet.balance - totalAssigned - totalReserved;
}

/**
 * C2 helper. Returns active assignments for a specific wallet.
 */
export function getActiveAssignmentsForWallet(
  assignments: Assignment[],
  walletId: string,
  activePeriod: Period | null,
): Assignment[] {
  if (!activePeriod) return [];
  return assignments.filter(
    (a) => a.wallet_id === walletId && a.period_id === activePeriod.id,
  );
}
