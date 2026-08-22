import type { Assignment } from '../entities/Assignment.js';
import type { Goal } from '../entities/Goal.js';
import type { Wallet } from '../entities/Wallet.js';
import { calculateAvailableBalance } from './available-balance.js';

/**
 * C3. Global Safe-to-Spend.
 * Total uncommitted money across all Wallets.
 */
export function calculateGlobalSafeToSpend(
  wallets: Wallet[],
  assignments: Assignment[],
  goals: Goal[],
): number {
  return wallets.reduce(
    (sum, w) => sum + calculateAvailableBalance(w, assignments, goals),
    0,
  );
}
