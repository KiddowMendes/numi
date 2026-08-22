import type { Transaction } from '../entities/Transaction.js';
import type { Wallet } from '../entities/Wallet.js';

/**
 * C1. Wallet Balance Verification.
 * Verifies that a Wallet's stored balance matches its Transaction history.
 */
export function calculateWalletBalance(
  wallet: Wallet,
  transactions: Transaction[],
): { stored: number; calculated: number; matches: boolean } {
  const calculated = transactions
    .filter(
      (t) =>
        t.wallet_id === wallet.id ||
        (t.type === 'transfer' && t.to_wallet_id === wallet.id),
    )
    .reduce((sum, t) => {
      if (t.type === 'income') return sum + t.amount;
      if (t.type === 'expense') return sum - t.amount;
      if (t.type === 'transfer' && t.to_wallet_id === wallet.id) return sum + t.amount;
      // transfer out (wallet_id matches)
      return sum - t.amount;
    }, 0);

  return {
    stored: wallet.balance,
    calculated,
    matches: wallet.balance === calculated,
  };
}
