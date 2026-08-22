import { describe, it, expect } from 'vitest';
import { calculateGoalProgress } from '../../src/calculations/goal-progress.js';
import { factories } from '../factories/index.js';

describe('C8 - Goal Progress', () => {
  it('should return 0% when no progress', () => {
    const goal = factories.createGoal({ target_amount: 100000, current_amount: 0 });
    const result = calculateGoalProgress(goal);
    expect(result.percentage).toBe(0);
    expect(result.remaining).toBe(100000);
  });

  it('should calculate percentage correctly', () => {
    const goal = factories.createGoal({ target_amount: 100000, current_amount: 30000 });
    const result = calculateGoalProgress(goal);
    expect(result.percentage).toBe(30);
    expect(result.remaining).toBe(70000);
  });

  it('should floor the percentage', () => {
    const goal = factories.createGoal({ target_amount: 100000, current_amount: 33333 });
    const result = calculateGoalProgress(goal);
    expect(result.percentage).toBe(33);
  });

  it('should cap at 100%', () => {
    const goal = factories.createGoal({ target_amount: 100000, current_amount: 100000 });
    const result = calculateGoalProgress(goal);
    expect(result.percentage).toBe(100);
    expect(result.remaining).toBe(0);
  });

  it('should cap at 100% when over-funded', () => {
    const goal = factories.createGoal({ target_amount: 100000, current_amount: 150000 });
    const result = calculateGoalProgress(goal);
    expect(result.percentage).toBe(100);
    expect(result.remaining).toBe(0);
  });

  it('should handle zero target', () => {
    const goal = factories.createGoal({ target_amount: 0, current_amount: 0 });
    const result = calculateGoalProgress(goal);
    expect(result.percentage).toBe(100);
    expect(result.remaining).toBe(0);
  });
});
