import type { Transaction } from '@numi/domain';

export interface TransactionRow {
  id: string;
  amount: number;
  type: string;
  date: string;
  category_id: string | null;
  wallet_id: string;
  to_wallet_id: string | null;
  note: string | null;
  created_at: string;
}

export function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    type: row.type as Transaction['type'],
    date: new Date(row.date),
    category_id: row.category_id,
    wallet_id: row.wallet_id,
    to_wallet_id: row.to_wallet_id,
    note: row.note,
    created_at: new Date(row.created_at),
  };
}

export function toTransactionRow(transaction: Transaction): TransactionRow {
  return {
    id: transaction.id,
    amount: transaction.amount,
    type: transaction.type,
    date: transaction.date.toISOString(),
    category_id: transaction.category_id,
    wallet_id: transaction.wallet_id,
    to_wallet_id: transaction.to_wallet_id,
    note: transaction.note,
    created_at: transaction.created_at.toISOString(),
  };
}
