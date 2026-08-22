import { describe, it, expect } from 'vitest';
import { calculateAssignmentRemaining } from '../../src/calculations/assignment-remaining.js';
import { factories } from '../factories/index.js';

describe('C7 - Assignment Remaining', () => {
  it('should equal assignment amount when no transactions', () => {
    const assignment = factories.createAssignment({ amount: 50000 });
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 31),
    });
    const result = calculateAssignmentRemaining(assignment, [], period);
    expect(result).toBe(50000);
  });

  it('should subtract spent from assignment amount', () => {
    const assignment = factories.createAssignment({ amount: 50000, category_id: 'c1', wallet_id: 'w1' });
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 31),
    });
    const txs = [
      factories.createTransaction({ category_id: 'c1', wallet_id: 'w1', amount: 20000, type: 'expense', date: new Date(2026, 0, 10) }),
    ];
    const result = calculateAssignmentRemaining(assignment, txs, period);
    expect(result).toBe(30000);
  });

  it('should return negative when overspent', () => {
    const assignment = factories.createAssignment({ amount: 10000, category_id: 'c1', wallet_id: 'w1' });
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 31),
    });
    const txs = [
      factories.createTransaction({ category_id: 'c1', wallet_id: 'w1', amount: 15000, type: 'expense', date: new Date(2026, 0, 10) }),
    ];
    const result = calculateAssignmentRemaining(assignment, txs, period);
    expect(result).toBe(-5000);
  });
});
