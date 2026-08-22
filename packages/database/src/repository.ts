import type { Database } from 'sql.js';
import type {
  User,
  Period,
  Wallet,
  Category,
  Goal,
  Assignment,
  Transaction,
} from '@numi/domain';
import type { AppState } from '@numi/domain';

import { runMigrations } from './migrations/index.js';
import { queryAll, queryOne, execute } from './schema.js';
import {
  toUser,
  toPeriod,
  toWallet,
  toCategory,
  toGoal,
  toAssignment,
  toTransaction,
} from './mappers/index.js';

export class Repository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
    this.db.run('PRAGMA journal_mode = WAL');
    this.db.run('PRAGMA foreign_keys = ON');
    runMigrations(this.db);
  }

  loadState(): AppState {
    const user = this.getUser();
    if (!user) {
      throw new Error('No user found — database not initialized');
    }

    const activePeriod = this.getActivePeriod();
    const periods = this.getAllPeriods();
    const wallets = this.getAllWallets();
    const categories = this.getAllCategories();
    const goals = this.getAllGoals();
    const assignments = this.getAllAssignments();
    const transactions = this.getAllTransactions();

    return {
      user,
      activePeriod,
      periods,
      wallets,
      categories,
      goals,
      assignments,
      transactions,
    };
  }

  saveState(state: AppState): void {
    this.db.run('BEGIN TRANSACTION');
    try {
      this.upsertUser(state.user);

      for (const period of state.periods) {
        this.upsertPeriod(period);
      }

      for (const wallet of state.wallets) {
        this.upsertWallet(wallet);
      }

      for (const category of state.categories) {
        this.upsertCategory(category);
      }

      for (const goal of state.goals) {
        this.upsertGoal(goal);
      }

      for (const assignment of state.assignments) {
        this.upsertAssignment(assignment);
      }

      for (const transaction of state.transactions) {
        this.upsertTransaction(transaction);
      }

      this.db.run('COMMIT');
    } catch (err) {
      this.db.run('ROLLBACK');
      throw err;
    }
  }

  // --- User ---

  getUser(): User | null {
    const row = queryOne(this.db, 'SELECT * FROM users LIMIT 1');
    return row ? toUser(row as { id: string; tier: string }) : null;
  }

  upsertUser(user: User): void {
    execute(this.db, 'INSERT OR REPLACE INTO users (id, tier) VALUES (?, ?)', [user.id, user.tier]);
  }

  // --- Period ---

  getActivePeriod(): Period | null {
    const row = queryOne(this.db, 'SELECT * FROM periods WHERE is_active = 1 LIMIT 1');
    return row ? toPeriod(row as never) : null;
  }

  getAllPeriods(): Period[] {
    const rows = queryAll(this.db, 'SELECT * FROM periods');
    return rows.map((r) => toPeriod(r as never));
  }

  upsertPeriod(period: Period): void {
    execute(
      this.db,
      `INSERT OR REPLACE INTO periods (id, name, start_date, end_date, is_active, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        period.id,
        period.name,
        period.start_date.toISOString(),
        period.end_date.toISOString(),
        period.is_active ? 1 : 0,
        period.created_at.toISOString(),
      ],
    );
  }

  // --- Wallet ---

  getAllWallets(): Wallet[] {
    const rows = queryAll(this.db, 'SELECT * FROM wallets');
    return rows.map((r) => toWallet(r as never));
  }

  upsertWallet(wallet: Wallet): void {
    execute(
      this.db,
      `INSERT OR REPLACE INTO wallets (id, name, type, balance, currency, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [wallet.id, wallet.name, wallet.type, wallet.balance, wallet.currency, wallet.created_at.toISOString()],
    );
  }

  // --- Category ---

  getAllCategories(): Category[] {
    const rows = queryAll(this.db, 'SELECT * FROM categories');
    return rows.map((r) => toCategory(r as never));
  }

  upsertCategory(category: Category): void {
    execute(
      this.db,
      `INSERT OR REPLACE INTO categories (id, name, color, icon, is_default, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category.id,
        category.name,
        category.color,
        category.icon,
        category.is_default ? 1 : 0,
        category.created_at.toISOString(),
      ],
    );
  }

  // --- Goal ---

  getAllGoals(): Goal[] {
    const rows = queryAll(this.db, 'SELECT * FROM goals');
    return rows.map((r) => toGoal(r as never));
  }

  upsertGoal(goal: Goal): void {
    execute(
      this.db,
      `INSERT OR REPLACE INTO goals (id, name, target_amount, current_amount, deadline, wallet_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        goal.id,
        goal.name,
        goal.target_amount,
        goal.current_amount,
        goal.deadline ? goal.deadline.toISOString() : null,
        goal.wallet_id,
        goal.created_at.toISOString(),
      ],
    );
  }

  // --- Assignment ---

  getAllAssignments(): Assignment[] {
    const rows = queryAll(this.db, 'SELECT * FROM assignments');
    return rows.map((r) => toAssignment(r as never));
  }

  upsertAssignment(assignment: Assignment): void {
    execute(
      this.db,
      `INSERT OR REPLACE INTO assignments (id, period_id, category_id, wallet_id, amount, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        assignment.id,
        assignment.period_id,
        assignment.category_id,
        assignment.wallet_id,
        assignment.amount,
        assignment.created_at.toISOString(),
      ],
    );
  }

  // --- Transaction ---

  getAllTransactions(): Transaction[] {
    const rows = queryAll(this.db, 'SELECT * FROM transactions');
    return rows.map((r) => toTransaction(r as never));
  }

  upsertTransaction(transaction: Transaction): void {
    execute(
      this.db,
      `INSERT OR REPLACE INTO transactions (id, amount, type, date, category_id, wallet_id, to_wallet_id, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.amount,
        transaction.type,
        transaction.date.toISOString(),
        transaction.category_id,
        transaction.wallet_id,
        transaction.to_wallet_id,
        transaction.note,
        transaction.created_at.toISOString(),
      ],
    );
  }

  // --- Cleanup ---

  clearAll(): void {
    this.db.run(`
      DELETE FROM transactions;
      DELETE FROM assignments;
      DELETE FROM goals;
      DELETE FROM categories;
      DELETE FROM wallets;
      DELETE FROM periods;
      DELETE FROM users;
      DELETE FROM schema_version;
    `);
  }
}
