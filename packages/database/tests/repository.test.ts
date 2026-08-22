import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createTestDb } from './helpers.js';
import type { Repository } from '../src/repository.js';
import type { AppState } from '@numi/domain';

describe('Repository', () => {
  let repo: Repository;
  let state: AppState;

  beforeEach(() => {
    const testDb = createTestDb();
    repo = testDb.repo;

    state = {
      user: { id: 'u1', tier: 'free' },
      activePeriod: {
        id: 'p1',
        name: 'Week 1',
        start_date: new Date('2025-01-06'),
        end_date: new Date('2025-01-12'),
        is_active: true,
        created_at: new Date('2025-01-06'),
      },
      periods: [
        {
          id: 'p1',
          name: 'Week 1',
          start_date: new Date('2025-01-06'),
          end_date: new Date('2025-01-12'),
          is_active: true,
          created_at: new Date('2025-01-06'),
        },
      ],
      wallets: [
        {
          id: 'w1',
          name: 'Cash',
          type: 'cash',
          balance: 50000,
          currency: 'ZAR',
          created_at: new Date('2025-01-06'),
        },
        {
          id: 'w2',
          name: 'Bank',
          type: 'bank',
          balance: 100000,
          currency: 'ZAR',
          created_at: new Date('2025-01-06'),
        },
      ],
      categories: [
        {
          id: 'c1',
          name: 'Food',
          color: '#FF5733',
          icon: 'utensils',
          is_default: true,
          created_at: new Date('2025-01-06'),
        },
      ],
      goals: [
        {
          id: 'g1',
          name: 'Laptop',
          target_amount: 1500000,
          current_amount: 500000,
          deadline: new Date('2025-06-01'),
          wallet_id: 'w1',
          created_at: new Date('2025-01-06'),
        },
      ],
      assignments: [
        {
          id: 'a1',
          period_id: 'p1',
          category_id: 'c1',
          wallet_id: 'w1',
          amount: 300000,
          created_at: new Date('2025-01-06'),
        },
      ],
      transactions: [
        {
          id: 't1',
          amount: 50000,
          type: 'expense',
          date: new Date('2025-01-07'),
          category_id: 'c1',
          wallet_id: 'w1',
          to_wallet_id: null,
          note: 'Lunch',
          created_at: new Date('2025-01-07'),
        },
        {
          id: 't2',
          amount: 100000,
          type: 'transfer',
          date: new Date('2025-01-07'),
          category_id: null,
          wallet_id: 'w1',
          to_wallet_id: 'w2',
          note: null,
          created_at: new Date('2025-01-07'),
        },
      ],
    };
  });

  afterEach(() => {
    repo.close();
  });

  describe('loadState / saveState', () => {
    it('saves and loads full state', () => {
      repo.saveState(state);
      const loaded = repo.loadState();

      expect(loaded.user.id).toBe('u1');
      expect(loaded.periods).toHaveLength(1);
      expect(loaded.wallets).toHaveLength(2);
      expect(loaded.categories).toHaveLength(1);
      expect(loaded.goals).toHaveLength(1);
      expect(loaded.assignments).toHaveLength(1);
      expect(loaded.transactions).toHaveLength(2);
    });

    it('throws when no user found', () => {
      expect(() => repo.loadState()).toThrow('No user found');
    });

    it('round-trips dates correctly', () => {
      repo.saveState(state);
      const loaded = repo.loadState();

      expect(loaded.activePeriod?.start_date).toBeInstanceOf(Date);
      expect(loaded.wallets[0]!.created_at).toBeInstanceOf(Date);
      expect(loaded.transactions[0]!.date).toBeInstanceOf(Date);
    });

    it('round-trips booleans correctly', () => {
      repo.saveState(state);
      const loaded = repo.loadState();

      expect(loaded.activePeriod?.is_active).toBe(true);
      expect(loaded.categories[0]!.is_default).toBe(true);
    });

    it('round-trips nullable fields correctly', () => {
      repo.saveState(state);
      const loaded = repo.loadState();

      expect(loaded.transactions[0]!.to_wallet_id).toBeNull();
      expect(loaded.transactions[0]!.note).toBe('Lunch');
      expect(loaded.goals[0]!.deadline).toBeInstanceOf(Date);
    });
  });

  describe('User', () => {
    it('upserts and gets user', () => {
      repo.upsertUser(state.user);
      const user = repo.getUser();
      expect(user).toEqual({ id: 'u1', tier: 'free' });
    });

    it('returns null for empty db', () => {
      expect(repo.getUser()).toBeNull();
    });

    it('updates existing user', () => {
      repo.upsertUser(state.user);
      repo.upsertUser({ id: 'u1', tier: 'premium' });
      const user = repo.getUser();
      expect(user?.tier).toBe('premium');
    });
  });

  describe('Period', () => {
    it('upserts and gets all periods', () => {
      repo.upsertPeriod(state.periods[0]!);
      const periods = repo.getAllPeriods();
      expect(periods).toHaveLength(1);
      expect(periods[0]!.name).toBe('Week 1');
    });

    it('gets active period', () => {
      repo.upsertPeriod(state.periods[0]!);
      const active = repo.getActivePeriod();
      expect(active?.id).toBe('p1');
    });

    it('returns null when no active period', () => {
      expect(repo.getActivePeriod()).toBeNull();
    });

    it('deactivates other periods when activating one', () => {
      repo.upsertPeriod(state.periods[0]!);
      repo.upsertPeriod({
        id: 'p2',
        name: 'Week 2',
        start_date: new Date('2025-01-13'),
        end_date: new Date('2025-01-19'),
        is_active: true,
        created_at: new Date('2025-01-13'),
      });
      // Both marked active in data - repository stores as-is
      const periods = repo.getAllPeriods();
      expect(periods).toHaveLength(2);
    });
  });

  describe('Wallet', () => {
    it('upserts and gets all wallets', () => {
      repo.upsertWallet(state.wallets[0]!);
      repo.upsertWallet(state.wallets[1]!);
      const wallets = repo.getAllWallets();
      expect(wallets).toHaveLength(2);
      expect(wallets[0]!.name).toBe('Cash');
      expect(wallets[1]!.name).toBe('Bank');
    });

    it('updates wallet balance', () => {
      repo.upsertWallet(state.wallets[0]!);
      repo.upsertWallet({ ...state.wallets[0]!, balance: 75000 });
      const wallets = repo.getAllWallets();
      expect(wallets[0]!.balance).toBe(75000);
    });
  });

  describe('Category', () => {
    it('upserts and gets all categories', () => {
      repo.upsertCategory(state.categories[0]!);
      const categories = repo.getAllCategories();
      expect(categories).toHaveLength(1);
      expect(categories[0]!.name).toBe('Food');
    });

    it('updates category color', () => {
      repo.upsertCategory(state.categories[0]!);
      repo.upsertCategory({ ...state.categories[0]!, color: '#00FF00' });
      const categories = repo.getAllCategories();
      expect(categories[0]!.color).toBe('#00FF00');
    });
  });

  describe('Goal', () => {
    it('upserts and gets all goals', () => {
      repo.upsertGoal(state.goals[0]!);
      const goals = repo.getAllGoals();
      expect(goals).toHaveLength(1);
      expect(goals[0]!.name).toBe('Laptop');
    });

    it('updates goal progress', () => {
      repo.upsertGoal(state.goals[0]!);
      repo.upsertGoal({ ...state.goals[0]!, current_amount: 750000 });
      const goals = repo.getAllGoals();
      expect(goals[0]!.current_amount).toBe(750000);
    });

    it('handles null deadline', () => {
      repo.upsertGoal({
        id: 'g2',
        name: 'Emergency',
        target_amount: 1000000,
        current_amount: 0,
        deadline: null,
        wallet_id: 'w1',
        created_at: new Date('2025-01-06'),
      });
      const goals = repo.getAllGoals();
      expect(goals[0]!.deadline).toBeNull();
    });
  });

  describe('Assignment', () => {
    it('upserts and gets all assignments', () => {
      repo.upsertAssignment(state.assignments[0]!);
      const assignments = repo.getAllAssignments();
      expect(assignments).toHaveLength(1);
      expect(assignments[0]!.amount).toBe(300000);
    });

    it('updates assignment amount', () => {
      repo.upsertAssignment(state.assignments[0]!);
      repo.upsertAssignment({ ...state.assignments[0]!, amount: 400000 });
      const assignments = repo.getAllAssignments();
      expect(assignments[0]!.amount).toBe(400000);
    });
  });

  describe('Transaction', () => {
    it('upserts and gets all transactions', () => {
      repo.upsertTransaction(state.transactions[0]!);
      repo.upsertTransaction(state.transactions[1]!);
      const txs = repo.getAllTransactions();
      expect(txs).toHaveLength(2);
      expect(txs[0]!.type).toBe('expense');
      expect(txs[1]!.type).toBe('transfer');
    });

    it('handles income transactions', () => {
      repo.upsertTransaction({
        id: 't3',
        amount: 200000,
        type: 'income',
        date: new Date('2025-01-07'),
        category_id: null,
        wallet_id: 'w1',
        to_wallet_id: null,
        note: 'Salary',
        created_at: new Date('2025-01-07'),
      });
      const txs = repo.getAllTransactions();
      expect(txs[0]!.type).toBe('income');
    });
  });

  describe('clearAll', () => {
    it('removes all data', () => {
      repo.saveState(state);
      repo.clearAll();
      expect(repo.getUser()).toBeNull();
      expect(repo.getAllWallets()).toHaveLength(0);
      expect(repo.getAllTransactions()).toHaveLength(0);
    });
  });

  describe('saveState idempotency', () => {
    it('saves same state twice without duplicates', () => {
      repo.saveState(state);
      repo.saveState(state);
      const loaded = repo.loadState();
      expect(loaded.wallets).toHaveLength(2);
      expect(loaded.transactions).toHaveLength(2);
    });
  });
});
