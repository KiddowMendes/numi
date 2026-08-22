import type { Goal } from '../entities/Goal.js';

/**
 * C8. Goal Progress.
 * Returns percentage (0-100) and remaining amount in cents.
 */
export function calculateGoalProgress(goal: Goal): { percentage: number; remaining: number } {
  const remaining = Math.max(0, goal.target_amount - goal.current_amount);

  if (goal.target_amount <= 0) {
    return { percentage: 100, remaining: 0 };
  }

  const raw = (goal.current_amount / goal.target_amount) * 100;
  const percentage = Math.min(100, Math.floor(raw));

  return { percentage, remaining };
}
