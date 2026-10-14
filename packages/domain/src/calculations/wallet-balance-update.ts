import type { Assignment } from "../entities/Assignment";
import type { Goal } from "../entities/Goal";
import type { Wallet } from "../entities/Wallet";

/**
 * Wallet Management. Wallet Balance Update Check.
 * A wallet's new balance may not drop below the money committed to it: every
 * assignment for the wallet (across all periods) plus the reserves held by its
 * goals. This is the same lifetime window the available balance uses, so the
 * edit check can never disagree with the available balance the rest of the app
 * reads.
 */
export function canUpdateWalletBalance(
  wallet: Wallet,
  assignments: Assignment[],
  goals: Goal[],
  newBalance: number,
): { valid: true } | { valid: false; error: string } {
  const committed =
    assignments
      .filter((a) => a.wallet_id === wallet.id)
      .reduce((sum, a) => sum + a.amount, 0) +
    goals
      .filter((g) => g.wallet_id === wallet.id)
      .reduce((sum, g) => sum + g.current_amount, 0);

  if (newBalance < committed) {
    return { valid: false, error: "Balance is below committed money" };
  }

  return { valid: true };
}
