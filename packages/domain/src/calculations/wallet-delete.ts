import type { Assignment } from "../entities/Assignment";
import type { Goal } from "../entities/Goal";
import type { Transaction } from "../entities/Transaction";
import type { Wallet } from "../entities/Wallet";

/**
 * Wallet Management. Delete Wallet Check.
 * A wallet can be deleted only when at least one other wallet remains, it holds
 * no transaction (as source or destination), no assignment, no goal, and a zero
 * balance. The last wallet reason takes precedence, so removing a wallet never
 * destroys money silently or leaves the app without a wallet.
 */
export function canDeleteWallet(
  wallet: Wallet,
  wallets: Wallet[],
  assignments: Assignment[],
  goals: Goal[],
  transactions: Transaction[],
): { valid: true } | { valid: false; error: string } {
  if (wallets.length <= 1) {
    return { valid: false, error: "You need at least one wallet" };
  }

  const hasTransaction = transactions.some(
    (t) => t.wallet_id === wallet.id || t.to_wallet_id === wallet.id,
  );
  const hasAssignment = assignments.some((a) => a.wallet_id === wallet.id);
  const hasGoal = goals.some((g) => g.wallet_id === wallet.id);

  if (hasTransaction || hasAssignment || hasGoal || wallet.balance !== 0) {
    return { valid: false, error: "Move or clear this wallet's money first" };
  }

  return { valid: true };
}
