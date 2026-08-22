import type { Assignment } from '../entities/Assignment.js';
import type { Goal } from '../entities/Goal.js';
import type { Period } from '../entities/Period.js';
import type { Wallet } from '../entities/Wallet.js';
import { calculateGlobalSafeToSpend } from './global-safe-to-spend.js';
import { calculateDaysRemaining } from './days-remaining.js';

/**
 * C5. Daily Safe-to-Spend.
 * The single most important number in NUMI.
 * Returns NULL if no active period or days_remaining <= 0.
 */
export function calculateDailySafeToSpend(
  wallets: Wallet[],
  assignments: Assignment[],
  goals: Goal[],
  activePeriod: Period | null,
  today: Date,
): { value: number | null; daysRemaining: number | null } {
  const days = calculateDaysRemaining(activePeriod, today);

  if (days === null || days <= 0) {
    return { value: null, daysRemaining: days };
  }

  const global = calculateGlobalSafeToSpend(wallets, assignments, goals);

  if (global <= 0) {
    return { value: global, daysRemaining: days };
  }

  return {
    value: Math.floor(global / days),
    daysRemaining: days,
  };
}
