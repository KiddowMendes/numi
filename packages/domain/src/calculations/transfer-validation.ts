import type { Assignment } from "../entities/Assignment";
import type { Goal } from "../entities/Goal";
import type { Wallet } from "../entities/Wallet";
import { calculateAvailableBalance } from "./available-balance";

/**
 * C11. Transfer Validation.
 * Checks if a transfer between two wallets is valid.
 */
export function canTransfer(
  fromWallet: Wallet,
  toWallet: Wallet,
  assignments: Assignment[],
  goals: Goal[],
  amount: number,
): { valid: true } | { valid: false; error: string } {
  if (fromWallet.id === toWallet.id) {
    return { valid: false, error: "Cannot transfer to same wallet" };
  }

  const available = calculateAvailableBalance(fromWallet, assignments, goals);
  if (available < amount) {
    return { valid: false, error: "Insufficient balance" };
  }

  return { valid: true };
}
