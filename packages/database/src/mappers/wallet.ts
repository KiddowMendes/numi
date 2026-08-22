import type { Wallet } from '@numi/domain';

export interface WalletRow {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  created_at: string;
}

export function toWallet(row: WalletRow): Wallet {
  return {
    id: row.id,
    name: row.name,
    type: row.type as Wallet['type'],
    balance: row.balance,
    currency: row.currency as Wallet['currency'],
    created_at: new Date(row.created_at),
  };
}

export function toWalletRow(wallet: Wallet): WalletRow {
  return {
    id: wallet.id,
    name: wallet.name,
    type: wallet.type,
    balance: wallet.balance,
    currency: wallet.currency,
    created_at: wallet.created_at.toISOString(),
  };
}
