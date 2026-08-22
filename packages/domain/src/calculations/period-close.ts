import type { Assignment } from '../entities/Assignment.js';
import type { Period } from '../entities/Period.js';
import type { Transaction } from '../entities/Transaction.js';
import { calculateAssignmentSpent } from './assignment-spent.js';

/**
 * C14. Period Close Calculation.
 * Returns per-wallet amounts to unassign when closing a period.
 */
export function calculatePeriodClose(
  period: Period,
  assignments: Assignment[],
  transactions: Transaction[],
): {
  perWallet: Record<string, number>;
  totalRemaining: number;
} {
  const perWallet: Record<string, number> = {};
  let totalRemaining = 0;

  for (const assignment of assignments.filter((a) => a.period_id === period.id)) {
    const spent = calculateAssignmentSpent(assignment, transactions, period);
    const remaining = assignment.amount - spent;
    totalRemaining += remaining;

    const walletId = assignment.wallet_id;
    perWallet[walletId] = (perWallet[walletId] ?? 0) + assignment.amount;
  }

  return { perWallet, totalRemaining };
}
