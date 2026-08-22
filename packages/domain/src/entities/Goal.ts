export interface Goal {
  id: string;
  name: string;
  target_amount: number; // in cents
  current_amount: number; // reserved so far, in cents
  deadline: Date | null;
  wallet_id: string;
  created_at: Date;
}
