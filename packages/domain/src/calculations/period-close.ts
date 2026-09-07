import type { Assignment } from '../entities/Assignment.js';
import type { Period } from '../entities/Period.js';
import type { Transaction } from '../entities/Transaction.js';
import type { Wallet } from '../entities/Wallet.js';
import { calculateAssignmentSpent } from './assignment-spent.js';

/**
 * C14. Period Close Calculation.
 * Returns per-wallet amounts to unassign when closing a period.
 */
export function calculatePeriodClose(
  period: Period,
  assignments: Assignment[],
  transactions: Transaction[],
): {
  perWallet: Record<string, number>;
  totalRemaining: number;
} {
  const perWallet: Record<string, number> = {};
  let totalRemaining = 0;

  for (const assignment of assignments.filter((a) => a.period_id === period.id)) {
    const spent = calculateAssignmentSpent(assignment, transactions, period);
    const remaining = assignment.amount - spent;
    totalRemaining += remaining;

    const walletId = assignment.wallet_id;
    perWallet[walletId] = (perWallet[walletId] ?? 0) + remaining;
  }

  return { perWallet, totalRemaining };
}

export function closePeriodState(
  state: {
    activePeriod: Period | null;
    periods: Period[];
    wallets: Wallet[];
    assignments: Assignment[];
    transactions: Transaction[];
  },
): {
  periods: Period[];
  wallets: Wallet[];
  activePeriod: null;
} {
  if (!state.activePeriod) {
    throw new Error('No active period to close');
  }

  const period = state.activePeriod;
  const { perWallet, totalRemaining } = calculatePeriodClose(period, state.assignments, state.transactions);

  let wallets = state.wallets;
  if (totalRemaining > 0) {
    wallets = state.wallets.map((w) => {
      const unassigned = perWallet[w.id] ?? 0;
      return unassigned > 0 ? { ...w, balance: w.balance + unassigned } : w;
    });
  }

  const periods = state.periods.map((p) => (p.id === period.id ? { ...p, is_active: false } : p));

  return { periods, wallets, activePeriod: null };
}
