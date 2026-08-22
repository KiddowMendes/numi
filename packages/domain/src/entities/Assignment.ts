export interface Assignment {
  id: string;
  period_id: string;
  category_id: string;
  wallet_id: string;
  amount: number; // in cents, planned/committed
  created_at: Date;
}
