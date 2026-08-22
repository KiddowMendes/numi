import { describe, it, expect } from 'vitest';
import {
  toUser,
  toUserRow,
  toPeriod,
  toPeriodRow,
  toWallet,
  toWalletRow,
  toCategory,
  toCategoryRow,
  toGoal,
  toGoalRow,
  toAssignment,
  toAssignmentRow,
  toTransaction,
  toTransactionRow,
} from '../src/mappers/index.js';

describe('User mapper', () => {
  it('converts row to entity', () => {
    const row = { id: 'u1', tier: 'freemium' };
    const user = toUser(row);
    expect(user).toEqual({ id: 'u1', tier: 'freemium' });
  });

  it('converts entity to row', () => {
    const user = { id: 'u1', tier: 'premium' as const };
    const row = toUserRow(user);
    expect(row).toEqual({ id: 'u1', tier: 'premium' });
  });
});

describe('Period mapper', () => {
  it('converts row to entity with dates', () => {
    const row = {
      id: 'p1',
      name: 'Week 1',
      start_date: '2025-01-06T00:00:00.000Z',
      end_date: '2025-01-12T00:00:00.000Z',
      is_active: 1,
      created_at: '2025-01-06T00:00:00.000Z',
    };
    const period = toPeriod(row);
    expect(period.start_date).toBeInstanceOf(Date);
    expect(period.end_date).toBeInstanceOf(Date);
    expect(period.is_active).toBe(true);
  });

  it('converts inactive period', () => {
    const row = {
      id: 'p2',
      name: 'Week 2',
      start_date: '2025-01-13T00:00:00.000Z',
      end_date: '2025-01-19T00:00:00.000Z',
      is_active: 0,
      created_at: '2025-01-13T00:00:00.000Z',
    };
    const period = toPeriod(row);
    expect(period.is_active).toBe(false);
  });

  it('converts entity to row', () => {
    const period = {
      id: 'p1',
      name: 'Week 1',
      start_date: new Date('2025-01-06'),
      end_date: new Date('2025-01-12'),
      is_active: true,
      created_at: new Date('2025-01-06'),
    };
    const row = toPeriodRow(period);
    expect(row.is_active).toBe(1);
    expect(typeof row.start_date).toBe('string');
  });
});

describe('Wallet mapper', () => {
  it('converts row to entity', () => {
    const row = {
      id: 'w1',
      name: 'Cash',
      type: 'cash',
      balance: 50000,
      currency: 'ZAR',
      created_at: '2025-01-06T00:00:00.000Z',
    };
    const wallet = toWallet(row);
    expect(wallet.balance).toBe(50000);
    expect(wallet.type).toBe('cash');
    expect(wallet.created_at).toBeInstanceOf(Date);
  });

  it('converts entity to row', () => {
    const wallet = {
      id: 'w1',
      name: 'Bank',
      type: 'bank' as const,
      balance: 100000,
      currency: 'ZAR' as const,
      created_at: new Date('2025-01-06'),
    };
    const row = toWalletRow(wallet);
    expect(row.balance).toBe(100000);
    expect(row.type).toBe('bank');
  });
});

describe('Category mapper', () => {
  it('converts row to entity', () => {
    const row = {
      id: 'c1',
      name: 'Food',
      color: '#FF5733',
      icon: 'utensils',
      is_default: 1,
      created_at: '2025-01-06T00:00:00.000Z',
    };
    const cat = toCategory(row);
    expect(cat.is_default).toBe(true);
    expect(cat.color).toBe('#FF5733');
  });

  it('converts non-default category', () => {
    const row = {
      id: 'c2',
      name: 'Custom',
      color: '#000000',
      icon: 'star',
      is_default: 0,
      created_at: '2025-01-06T00:00:00.000Z',
    };
    const cat = toCategory(row);
    expect(cat.is_default).toBe(false);
  });

  it('converts entity to row', () => {
    const cat = {
      id: 'c1',
      name: 'Food',
      color: '#FF5733',
      icon: 'utensils',
      is_default: true,
      created_at: new Date('2025-01-06'),
    };
    const row = toCategoryRow(cat);
    expect(row.is_default).toBe(1);
  });
});

describe('Goal mapper', () => {
  it('converts row to entity with deadline', () => {
    const row = {
      id: 'g1',
      name: 'Laptop',
      target_amount: 1500000,
      current_amount: 500000,
      deadline: '2025-06-01T00:00:00.000Z',
      wallet_id: 'w1',
      created_at: '2025-01-06T00:00:00.000Z',
    };
    const goal = toGoal(row);
    expect(goal.deadline).toBeInstanceOf(Date);
    expect(goal.target_amount).toBe(1500000);
  });

  it('converts row with null deadline', () => {
    const row = {
      id: 'g2',
      name: 'Emergency Fund',
      target_amount: 1000000,
      current_amount: 0,
      deadline: null,
      wallet_id: 'w1',
      created_at: '2025-01-06T00:00:00.000Z',
    };
    const goal = toGoal(row);
    expect(goal.deadline).toBeNull();
  });

  it('converts entity to row', () => {
    const goal = {
      id: 'g1',
      name: 'Laptop',
      target_amount: 1500000,
      current_amount: 500000,
      deadline: new Date('2025-06-01'),
      wallet_id: 'w1',
      created_at: new Date('2025-01-06'),
    };
    const row = toGoalRow(goal);
    expect(row.deadline).toBe('2025-06-01T00:00:00.000Z');
  });

  it('converts entity with null deadline to row', () => {
    const goal = {
      id: 'g2',
      name: 'Emergency Fund',
      target_amount: 1000000,
      current_amount: 0,
      deadline: null,
      wallet_id: 'w1',
      created_at: new Date('2025-01-06'),
    };
    const row = toGoalRow(goal);
    expect(row.deadline).toBeNull();
  });
});

describe('Assignment mapper', () => {
  it('converts row to entity', () => {
    const row = {
      id: 'a1',
      period_id: 'p1',
      category_id: 'c1',
      wallet_id: 'w1',
      amount: 300000,
      created_at: '2025-01-06T00:00:00.000Z',
    };
    const assignment = toAssignment(row);
    expect(assignment.amount).toBe(300000);
    expect(assignment.created_at).toBeInstanceOf(Date);
  });

  it('converts entity to row', () => {
    const assignment = {
      id: 'a1',
      period_id: 'p1',
      category_id: 'c1',
      wallet_id: 'w1',
      amount: 300000,
      created_at: new Date('2025-01-06'),
    };
    const row = toAssignmentRow(assignment);
    expect(row.amount).toBe(300000);
    expect(typeof row.created_at).toBe('string');
  });
});

describe('Transaction mapper', () => {
  it('converts row to entity', () => {
    const row = {
      id: 't1',
      amount: 50000,
      type: 'expense',
      date: '2025-01-07T00:00:00.000Z',
      category_id: 'c1',
      wallet_id: 'w1',
      to_wallet_id: null,
      note: 'Lunch',
      created_at: '2025-01-07T00:00:00.000Z',
    };
    const tx = toTransaction(row);
    expect(tx.type).toBe('expense');
    expect(tx.note).toBe('Lunch');
    expect(tx.to_wallet_id).toBeNull();
  });

  it('converts transfer row', () => {
    const row = {
      id: 't2',
      amount: 100000,
      type: 'transfer',
      date: '2025-01-07T00:00:00.000Z',
      category_id: null,
      wallet_id: 'w1',
      to_wallet_id: 'w2',
      note: null,
      created_at: '2025-01-07T00:00:00.000Z',
    };
    const tx = toTransaction(row);
    expect(tx.type).toBe('transfer');
    expect(tx.to_wallet_id).toBe('w2');
    expect(tx.category_id).toBeNull();
  });

  it('converts entity to row', () => {
    const tx = {
      id: 't1',
      amount: 50000,
      type: 'income' as const,
      date: new Date('2025-01-07'),
      category_id: null,
      wallet_id: 'w1',
      to_wallet_id: null,
      note: 'Salary',
      created_at: new Date('2025-01-07'),
    };
    const row = toTransactionRow(tx);
    expect(row.type).toBe('income');
    expect(row.note).toBe('Salary');
    expect(typeof row.date).toBe('string');
  });
});
