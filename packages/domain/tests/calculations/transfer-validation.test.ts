import { describe, it, expect } from 'vitest';
import { canTransfer } from '../../src/calculations/transfer-validation.js';
import { factories } from '../factories/index.js';

describe('C11 - Transfer Validation', () => {
  it('should allow valid transfer', () => {
    const from = factories.createWallet({ id: 'from', balance: 100000 });
    const to = factories.createWallet({ id: 'to', balance: 0 });
    const result = canTransfer(from, to, [], [], 50000);
    expect(result.valid).toBe(true);
  });

  it('should reject transfer to same wallet', () => {
    const wallet = factories.createWallet({ id: 'w1', balance: 100000 });
    const result = canTransfer(wallet, wallet, [], [], 50000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Cannot transfer to same wallet');
  });

  it('should reject insufficient balance', () => {
    const from = factories.createWallet({ id: 'from', balance: 10000 });
    const to = factories.createWallet({ id: 'to', balance: 0 });
    const result = canTransfer(from, to, [], [], 50000);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Insufficient balance');
  });

  it('should account for assignments in available balance', () => {
    const from = factories.createWallet({ id: 'from', balance: 100000 });
    const to = factories.createWallet({ id: 'to', balance: 0 });
    const assignments = [factories.createAssignment({ wallet_id: 'from', amount: 80000 })];
    const result = canTransfer(from, to, assignments, [], 30000);
    expect(result.valid).toBe(false);
  });
});
