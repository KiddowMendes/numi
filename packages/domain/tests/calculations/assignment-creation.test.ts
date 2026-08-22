import { describe, it, expect } from 'vitest';
import { canCreateAssignment } from '../../src/calculations/assignment-creation.js';
import { factories } from '../factories/index.js';

describe('C10 - Assignment Creation Check', () => {
  it('should allow when within balance', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canCreateAssignment(wallet, [], [], 50000);
    expect(result).toBe(true);
  });

  it('should reject when exceeding balance', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canCreateAssignment(wallet, [], [], 150000);
    expect(result).toBe(false);
  });

  it('should account for existing assignments', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const assignments = [factories.createAssignment({ wallet_id: wallet.id, amount: 80000 })];
    const result = canCreateAssignment(wallet, assignments, [], 30000);
    expect(result).toBe(false);
  });

  it('should account for goals', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const goals = [factories.createGoal({ wallet_id: wallet.id, current_amount: 70000 })];
    const result = canCreateAssignment(wallet, [], goals, 40000);
    expect(result).toBe(false);
  });

  it('should allow exact balance match', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canCreateAssignment(wallet, [], [], 100000);
    expect(result).toBe(true);
  });
});
