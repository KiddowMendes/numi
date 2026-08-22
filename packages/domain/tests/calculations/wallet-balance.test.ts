import { describe, it, expect } from 'vitest';
import { calculateWalletBalance } from '../../src/calculations/wallet-balance.js';
import { factories } from '../factories/index.js';

describe('C1 - Wallet Balance Verification', () => {
  it('should match when no transactions exist', () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = calculateWalletBalance(wallet, []);
    expect(result.stored).toBe(100000);
    expect(result.calculated).toBe(0);
    expect(result.matches).toBe(false);
  });

  it('should calculate income correctly', () => {
    const wallet = factories.createWallet({ balance: 15000 });
    const txs = [
      factories.createTransaction({ wallet_id: wallet.id, amount: 10000, type: 'income' }),
      factories.createTransaction({ wallet_id: wallet.id, amount: 5000, type: 'income' }),
    ];
    const result = calculateWalletBalance(wallet, txs);
    expect(result.calculated).toBe(15000);
    expect(result.matches).toBe(true);
  });

  it('should calculate expense correctly', () => {
    const wallet = factories.createWallet({ balance: 5000 });
    const txs = [
      factories.createTransaction({ wallet_id: wallet.id, amount: 10000, type: 'income' }),
      factories.createTransaction({ wallet_id: wallet.id, amount: 5000, type: 'expense' }),
    ];
    const result = calculateWalletBalance(wallet, txs);
    expect(result.calculated).toBe(5000);
    expect(result.matches).toBe(true);
  });

  it('should calculate transfer out correctly', () => {
    const wallet = factories.createWallet({ id: 'w1', balance: 5000 });
    const txs = [
      factories.createTransaction({ wallet_id: 'w1', amount: 10000, type: 'income' }),
      factories.createTransaction({ wallet_id: 'w1', to_wallet_id: 'w2', amount: 5000, type: 'transfer' }),
    ];
    const result = calculateWalletBalance(wallet, txs);
    expect(result.calculated).toBe(5000);
    expect(result.matches).toBe(true);
  });

  it('should calculate transfer in correctly', () => {
    const wallet = factories.createWallet({ id: 'w2', balance: 5000 });
    const txs = [
      factories.createTransaction({ wallet_id: 'w1', to_wallet_id: 'w2', amount: 5000, type: 'transfer' }),
    ];
    const result = calculateWalletBalance(wallet, txs);
    expect(result.calculated).toBe(5000);
    expect(result.matches).toBe(true);
  });

  it('should ignore transactions for other wallets', () => {
    const wallet = factories.createWallet({ id: 'w1', balance: 10000 });
    const txs = [
      factories.createTransaction({ wallet_id: 'w2', amount: 99999, type: 'income' }),
    ];
    const result = calculateWalletBalance(wallet, txs);
    expect(result.calculated).toBe(0);
    expect(result.matches).toBe(false);
  });
});
