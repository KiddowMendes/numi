import type { Wallet } from "../entities/Wallet";

/**
 * Wallet Management. Unique Wallet Name Check.
 * Wallet names are unique across all wallets, compared trimmed and case
 * insensitive. The row being edited is excluded so a rename to its own name is
 * not treated as a conflict.
 */
export function isDuplicateWalletName(
  wallets: Wallet[],
  name: string,
  excludeId?: string,
): boolean {
  const target = name.trim().toLowerCase();
  return wallets.some(
    (w) => w.id !== excludeId && w.name.trim().toLowerCase() === target,
  );
}
