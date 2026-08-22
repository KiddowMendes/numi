import type { User } from '../../src/entities/User.js';
import type { Period } from '../../src/entities/Period.js';
import type { Wallet } from '../../src/entities/Wallet.js';
import type { Category } from '../../src/entities/Category.js';
import type { Goal } from '../../src/entities/Goal.js';
import type { Assignment } from '../../src/entities/Assignment.js';
import type { Transaction } from '../../src/entities/Transaction.js';

let idCounter = 0;

function uid(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

function resetIds(): void {
  idCounter = 0;
}

function createUser(overrides: Partial<User> = {}): User {
  return {
    id: uid('user'),
    tier: 'freemium',
    ...overrides,
  };
}

function createPeriod(overrides: Partial<Period> = {}): Period {
  const now = new Date();
  return {
    id: uid('period'),
    name: 'Current Period',
    start_date: new Date(now.getFullYear(), now.getMonth(), 1),
    end_date: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    is_active: true,
    created_at: now,
    ...overrides,
  };
}

function createWallet(overrides: Partial<Wallet> = {}): Wallet {
  return {
    id: uid('wallet'),
    name: 'Main Wallet',
    type: 'main',
    balance: 100000,
    currency: 'ZAR',
    ...overrides,
  };
}

function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: uid('cat'),
    name: 'Groceries',
    color: '#4CAF50',
    icon: '🛒',
    is_default: false,
    ...overrides,
  };
}

function createGoal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: uid('goal'),
    name: 'Emergency Fund',
    target_amount: 500000,
    current_amount: 100000,
    deadline: null,
    wallet_id: 'wallet_1',
    ...overrides,
  };
}

function createAssignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: uid('assign'),
    period_id: 'period_1',
    category_id: 'cat_1',
    wallet_id: 'wallet_1',
    amount: 20000,
    ...overrides,
  };
}

function createTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: uid('tx'),
    amount: 5000,
    type: 'expense',
    date: new Date(),
    category_id: 'cat_1',
    wallet_id: 'wallet_1',
    to_wallet_id: null,
    note: null,
    ...overrides,
  };
}

export const factories = {
  resetIds,
  createUser,
  createPeriod,
  createWallet,
  createCategory,
  createGoal,
  createAssignment,
  createTransaction,
};
