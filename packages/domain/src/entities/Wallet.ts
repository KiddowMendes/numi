export type WalletType = 'cash' | 'bank' | 'stokvel' | 'mashonisa' | 'savings';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number; // stored in cents, integer
  currency: 'ZAR';
  created_at: Date;
}
