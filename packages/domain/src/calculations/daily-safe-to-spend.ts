import type { Assignment } from '../entities/Assignment';
import type { Goal } from '../entities/Goal';
import type { Period } from '../entities/Period';
import type { Wallet } from '../entities/Wallet';
import { calculateGlobalSafeToSpend } from './global-safe-to-spend';
import { calculateDaysRemaining } from './days-remaining';

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
