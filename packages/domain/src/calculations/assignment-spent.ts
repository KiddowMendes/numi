import type { Assignment } from '../entities/Assignment.js';
import type { Period } from '../entities/Period.js';
import type { Transaction } from '../entities/Transaction.js';

/**
 * C6. Assignment Spent.
 * How much of an Assignment has actually been used.
 */
export function calculateAssignmentSpent(
  assignment: Assignment,
  transactions: Transaction[],
  period: Period,
): number {
  return transactions
    .filter(
      (t) =>
        t.type === 'expense' &&
        t.category_id === assignment.category_id &&
        t.wallet_id === assignment.wallet_id &&
        t.date >= period.start_date &&
        t.date <= period.end_date,
    )
    .reduce((sum, t) => sum + t.amount, 0);
}
