import { describe, it, expect } from 'vitest';
import { canExpense } from '../../src/calculations/expense-validation.js';
import { factories } from '../factories/index.js';

describe('C12 - Expense Validation', () => {
  it('should allow expense within available balance', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canExpense(wallet, [], [], 50000);
    expect(result).toBe(true);
  });

  it('should reject expense exceeding available balance', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canExpense(wallet, [], [], 150000);
    expect(result).toBe(false);
  });

  it('should account for assignments', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const assignments = [factories.createAssignment({ wallet_id: wallet.id, amount: 90000 })];
    const result = canExpense(wallet, assignments, [], 20000);
    expect(result).toBe(false);
  });

  it('should allow expense exactly equal to available', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canExpense(wallet, [], [], 100000);
    expect(result).toBe(true);
  });
});
