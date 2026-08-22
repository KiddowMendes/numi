import type {
  User,
  Period,
  Wallet,
  Category,
  Goal,
  Assignment,
  Transaction,
} from './entities/index.js';

export type AppState = {
  user: User;
  activePeriod: Period | null;
  periods: Period[];
  wallets: Wallet[];
  categories: Category[];
  goals: Goal[];
  assignments: Assignment[];
  transactions: Transaction[];
};
