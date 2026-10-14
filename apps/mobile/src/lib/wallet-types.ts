import type { WalletType } from "@numi/domain";

import type { IconName } from "@/components/app-icon";

/**
 * The wallet types v1 offers, and how each one reads on screen. Kept in one
 * place so the sheet's picker, the wallets screen, and the home group cannot
 * drift apart. `mashonisa` is deliberately absent from the picker (Premium v2,
 * see spec 0003), but every type still gets a label and a glyph so a stored row
 * of any type renders.
 */
export type WalletTypeOption = {
  value: WalletType;
  label: string;
  icon: IconName;
};

export const WALLET_TYPES: readonly WalletTypeOption[] = [
  { value: "cash", label: "Cash", icon: "catOther" },
  { value: "bank", label: "Bank", icon: "balance" },
  { value: "stokvel", label: "Stokvel", icon: "coins" },
  { value: "savings", label: "Savings", icon: "goal" },
];

const LABELS: Record<WalletType, string> = {
  cash: "Cash",
  bank: "Bank",
  stokvel: "Stokvel",
  savings: "Savings",
  mashonisa: "Mashonisa",
};

const ICONS: Record<WalletType, IconName> = {
  cash: "catOther",
  bank: "balance",
  stokvel: "coins",
  savings: "goal",
  mashonisa: "coins",
};

export function walletTypeLabel(type: WalletType): string {
  return LABELS[type];
}

export function walletTypeIcon(type: WalletType): IconName {
  return ICONS[type];
}
