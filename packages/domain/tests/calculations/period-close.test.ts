import { describe, it, expect } from 'vitest';
import { calculatePeriodClose } from '../../src/calculations/period-close.js';
import { factories } from '../factories/index.js';

describe('C14 - Period Close Calculation', () => {
  it('should return 0 when no assignments', () => {
    const period = factories.createPeriod({ id: 'p1' });
    const result = calculatePeriodClose(period, [], []);
    expect(result.totalRemaining).toBe(0);
    expect(result.perWallet).toEqual({});
  });

  it('should sum unspent per wallet', () => {
    const period = factories.createPeriod({ id: 'p1' });
    const assignments = [
      factories.createAssignment({ id: 'a1', period_id: 'p1', wallet_id: 'w1', amount: 50000, category_id: 'c1' }),
      factories.createAssignment({ id: 'a2', period_id: 'p1', wallet_id: 'w1', amount: 30000, category_id: 'c2' }),
      factories.createAssignment({ id: 'a3', period_id: 'p1', wallet_id: 'w2', amount: 20000, category_id: 'c3' }),
    ];
    const result = calculatePeriodClose(period, assignments, []);
    expect(result.perWallet['w1']).toBe(80000);
    expect(result.perWallet['w2']).toBe(20000);
    expect(result.totalRemaining).toBe(100000);
  });

  it('should subtract spent from remaining', () => {
    const now = new Date();
    const period = factories.createPeriod({
      id: 'p1',
      start_date: new Date(now.getFullYear(), now.getMonth(), 1),
      end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    });
    const assignments = [
      factories.createAssignment({ id: 'a1', period_id: 'p1', wallet_id: 'w1', amount: 50000, category_id: 'c1' }),
    ];
    const txs = [
      factories.createTransaction({
        category_id: 'c1',
        wallet_id: 'w1',
        amount: 20000,
        type: 'expense',
        date: new Date(now.getFullYear(), now.getMonth(), 15),
      }),
    ];
    const result = calculatePeriodClose(period, assignments, txs);
    expect(result.totalRemaining).toBe(30000);
  });
});
