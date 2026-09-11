import type { Assignment } from '../entities/Assignment';
import type { Period } from '../entities/Period';
import type { Transaction } from '../entities/Transaction';
import { calculateAssignmentSpent } from './assignment-spent';

/**
 * C7. Assignment Remaining.
 * assignment_remaining = assignment.amount - assignment_spent
 * Can be negative (overspent).
 */
export function calculateAssignmentRemaining(
  assignment: Assignment,
  transactions: Transaction[],
  period: Period,
): number {
  const spent = calculateAssignmentSpent(assignment, transactions, period);
  return assignment.amount - spent;
}
