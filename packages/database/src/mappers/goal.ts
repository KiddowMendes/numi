import type { Goal } from '@numi/domain';

export interface GoalRow {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  wallet_id: string;
  created_at: string;
}

export function toGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    target_amount: row.target_amount,
    current_amount: row.current_amount,
    deadline: row.deadline ? new Date(row.deadline) : null,
    wallet_id: row.wallet_id,
    created_at: new Date(row.created_at),
  };
}

export function toGoalRow(goal: Goal): GoalRow {
  return {
    id: goal.id,
    name: goal.name,
    target_amount: goal.target_amount,
    current_amount: goal.current_amount,
    deadline: goal.deadline ? goal.deadline.toISOString() : null,
    wallet_id: goal.wallet_id,
    created_at: goal.created_at.toISOString(),
  };
}
