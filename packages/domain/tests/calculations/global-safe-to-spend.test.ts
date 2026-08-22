import { describe, it, expect } from 'vitest';
import { calculateGlobalSafeToSpend } from '../../src/calculations/global-safe-to-spend.js';
import { factories } from '../factories/index.js';

describe('C3 - Global Safe-to-Spend', () => {
  it('should sum available balances across wallets', () => {
    const wallets = [
      factories.createWallet({ id: 'w1', balance: 100000 }),
      factories.createWallet({ id: 'w2', balance: 50000 }),
    ];
    const result = calculateGlobalSafeToSpend(wallets, [], []);
    expect(result).toBe(150000);
  });

  it('should subtract assignments across wallets', () => {
    const wallets = [
      factories.createWallet({ id: 'w1', balance: 100000 }),
      factories.createWallet({ id: 'w2', balance: 50000 }),
    ];
    const assignments = [
      factories.createAssignment({ wallet_id: 'w1', amount: 30000 }),
      factories.createAssignment({ wallet_id: 'w2', amount: 10000 }),
    ];
    const result = calculateGlobalSafeToSpend(wallets, assignments, []);
    expect(result).toBe(110000);
  });

  it('should return 0 when fully allocated', () => {
    const wallets = [
      factories.createWallet({ id: 'w1', balance: 100000 }),
    ];
    const assignments = [
      factories.createAssignment({ wallet_id: 'w1', amount: 100000 }),
    ];
    const result = calculateGlobalSafeToSpend(wallets, assignments, []);
    expect(result).toBe(0);
  });

  it('should return 0 for empty wallets', () => {
    const result = calculateGlobalSafeToSpend([], [], []);
    expect(result).toBe(0);
  });
});
