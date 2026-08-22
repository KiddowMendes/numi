export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Transaction {
  id: string;
  amount: number; // always positive, in cents
  type: TransactionType;
  date: Date;
  category_id: string | null;
  wallet_id: string; // source, or destination for income
  to_wallet_id: string | null; // destination for transfers only
  note: string | null;
  created_at: Date;
}
