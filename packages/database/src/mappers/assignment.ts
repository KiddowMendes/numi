import type { Assignment } from '@numi/domain';

export interface AssignmentRow {
  id: string;
  period_id: string;
  category_id: string;
  wallet_id: string;
  amount: number;
  created_at: string;
}

export function toAssignment(row: AssignmentRow): Assignment {
  return {
    id: row.id,
    period_id: row.period_id,
    category_id: row.category_id,
    wallet_id: row.wallet_id,
    amount: row.amount,
    created_at: new Date(row.created_at),
  };
}

export function toAssignmentRow(assignment: Assignment): AssignmentRow {
  return {
    id: assignment.id,
    period_id: assignment.period_id,
    category_id: assignment.category_id,
    wallet_id: assignment.wallet_id,
    amount: assignment.amount,
    created_at: assignment.created_at.toISOString(),
  };
}
