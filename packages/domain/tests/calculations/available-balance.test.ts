import { describe, it, expect } from 'vitest';
import { calculateAvailableBalance, getActiveAssignmentsForWallet } from '../../src/calculations/available-balance.js';
import { factories } from '../factories/index.js';

describe('C2 - Wallet Available Balance', () => {
  it('should return full balance when no assignments or goals', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = calculateAvailableBalance(wallet, [], []);
    expect(result).toBe(100000);
  });

  it('should subtract assigned amounts', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const assignments = [
      factories.createAssignment({ wallet_id: wallet.id, amount: 30000 }),
      factories.createAssignment({ wallet_id: wallet.id, amount: 20000 }),
    ];
    const result = calculateAvailableBalance(wallet, assignments, []);
    expect(result).toBe(50000);
  });

  it('should subtract reserved (goal current_amount)', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const goals = [
      factories.createGoal({ wallet_id: wallet.id, current_amount: 40000 }),
    ];
    const result = calculateAvailableBalance(wallet, [], goals);
    expect(result).toBe(60000);
  });

  it('should subtract both assignments and goals', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const assignments = [
      factories.createAssignment({ wallet_id: wallet.id, amount: 30000 }),
    ];
    const goals = [
      factories.createGoal({ wallet_id: wallet.id, current_amount: 20000 }),
    ];
    const result = calculateAvailableBalance(wallet, assignments, goals);
    expect(result).toBe(50000);
  });

  it('should ignore assignments for other wallets', () => {
    const wallet = factories.createWallet({ id: 'w1', balance: 100000 });
    const assignments = [
      factories.createAssignment({ wallet_id: 'w2', amount: 99999 }),
    ];
    const result = calculateAvailableBalance(wallet, assignments, []);
    expect(result).toBe(100000);
  });
});

describe('C2 helper - getActiveAssignmentsForWallet', () => {
  it('should return empty if no active period', () => {
    const result = getActiveAssignmentsForWallet([], 'w1', null);
    expect(result).toEqual([]);
  });

  it('should filter by wallet and period', () => {
    const period = factories.createPeriod({ id: 'p1' });
    const assignments = [
      factories.createAssignment({ wallet_id: 'w1', period_id: 'p1', amount: 1000 }),
      factories.createAssignment({ wallet_id: 'w1', period_id: 'p2', amount: 2000 }),
      factories.createAssignment({ wallet_id: 'w2', period_id: 'p1', amount: 3000 }),
    ];
    const result = getActiveAssignmentsForWallet(assignments, 'w1', period);
    expect(result).toHaveLength(1);
    expect(result[0].amount).toBe(1000);
  });
});
