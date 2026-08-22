import { describe, it, expect } from 'vitest';
import { canReserveForGoal } from '../../src/calculations/goal-reservation.js';
import { factories } from '../factories/index.js';

describe('C9 - Goal Reservation Check', () => {
  it('should allow reservation when sufficient available balance', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const goals = [factories.createGoal({ id: 'g1', wallet_id: wallet.id, current_amount: 20000 })];
    const result = canReserveForGoal(wallet, [], goals, 'g1', 30000);
    expect(result).toBe(true);
  });

  it('should reject reservation when insufficient available balance', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const assignments = [factories.createAssignment({ wallet_id: wallet.id, amount: 80000 })];
    const result = canReserveForGoal(wallet, assignments, [], 'new', 30000);
    expect(result).toBe(false);
  });

  it('should exclude the specified goal from calculation', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const goals = [factories.createGoal({ id: 'g1', wallet_id: wallet.id, current_amount: 80000 })];
    // Without excluding g1: available = 100000 - 80000 = 20000
    // Excluding g1: available = 100000 - 0 = 100000
    const result = canReserveForGoal(wallet, [], goals, 'g1', 90000);
    expect(result).toBe(true);
  });
});
