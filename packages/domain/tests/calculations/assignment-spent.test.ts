import { describe, it, expect } from 'vitest';
import { calculateAssignmentSpent } from '../../src/calculations/assignment-spent.js';
import { factories } from '../factories/index.js';

describe('C6 - Assignment Spent', () => {
  it('should return 0 when no transactions', () => {
    const assignment = factories.createAssignment({ category_id: 'c1', wallet_id: 'w1' });
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 31),
    });
    const result = calculateAssignmentSpent(assignment, [], period);
    expect(result).toBe(0);
  });

  it('should sum expenses for matching category and wallet', () => {
    const assignment = factories.createAssignment({ category_id: 'c1', wallet_id: 'w1' });
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 31),
    });
    const txs = [
      factories.createTransaction({ category_id: 'c1', wallet_id: 'w1', amount: 1000, type: 'expense', date: new Date(2026, 0, 10) }),
      factories.createTransaction({ category_id: 'c1', wallet_id: 'w1', amount: 2000, type: 'expense', date: new Date(2026, 0, 15) }),
    ];
    const result = calculateAssignmentSpent(assignment, txs, period);
    expect(result).toBe(3000);
  });

  it('should ignore non-expense transactions', () => {
    const assignment = factories.createAssignment({ category_id: 'c1', wallet_id: 'w1' });
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 31),
    });
    const txs = [
      factories.createTransaction({ category_id: 'c1', wallet_id: 'w1', amount: 5000, type: 'income', date: new Date(2026, 0, 10) }),
    ];
    const result = calculateAssignmentSpent(assignment, txs, period);
    expect(result).toBe(0);
  });

  it('should ignore out-of-period transactions', () => {
    const assignment = factories.createAssignment({ category_id: 'c1', wallet_id: 'w1' });
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 10),
      end_date: new Date(2026, 0, 20),
    });
    const txs = [
      factories.createTransaction({ category_id: 'c1', wallet_id: 'w1', amount: 1000, type: 'expense', date: new Date(2026, 0, 5) }),
      factories.createTransaction({ category_id: 'c1', wallet_id: 'w1', amount: 2000, type: 'expense', date: new Date(2026, 0, 25) }),
    ];
    const result = calculateAssignmentSpent(assignment, txs, period);
    expect(result).toBe(0);
  });
});
