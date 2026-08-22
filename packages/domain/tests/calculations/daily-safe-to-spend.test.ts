import { describe, it, expect } from 'vitest';
import { calculateDailySafeToSpend } from '../../src/calculations/daily-safe-to-spend.js';
import { factories } from '../factories/index.js';

describe('C5 - Daily Safe-to-Spend', () => {
  it('should return null if no active period', () => {
    const result = calculateDailySafeToSpend([], [], [], null, new Date());
    expect(result.value).toBeNull();
    expect(result.daysRemaining).toBeNull();
  });

  it('should return null daysRemaining if period ended', () => {
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 15),
    });
    const today = new Date(2026, 0, 20);
    const result = calculateDailySafeToSpend([], [], [], period, today);
    expect(result.daysRemaining).toBe(0);
    expect(result.value).toBeNull();
  });

  it('should divide global safe-to-spend by days remaining', () => {
    const wallets = [factories.createWallet({ balance: 100000 })];
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 11),
    });
    const today = new Date(2026, 0, 1);
    const result = calculateDailySafeToSpend(wallets, [], [], period, today);
    expect(result.value).toBe(10000);
    expect(result.daysRemaining).toBe(10);
  });

  it('should floor the result', () => {
    const wallets = [factories.createWallet({ balance: 10000 })];
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 4),
    });
    const today = new Date(2026, 0, 1);
    const result = calculateDailySafeToSpend(wallets, [], [], period, today);
    // 10000 / 3 = 3333.33 → 3333
    expect(result.value).toBe(3333);
  });

  it('should return 0 when safe-to-spend is 0', () => {
    const wallets = [factories.createWallet({ balance: 0 })];
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 11),
    });
    const today = new Date(2026, 0, 1);
    const result = calculateDailySafeToSpend(wallets, [], [], period, today);
    expect(result.value).toBe(0);
  });

  it('should subtract assignments and goals from wallets', () => {
    const wallets = [factories.createWallet({ balance: 100000 })];
    const assignments = [
      factories.createAssignment({ wallet_id: wallets[0].id, amount: 40000 }),
    ];
    const goals = [
      factories.createGoal({ wallet_id: wallets[0].id, current_amount: 20000 }),
    ];
    const period = factories.createPeriod({
      start_date: new Date(2026, 0, 1),
      end_date: new Date(2026, 0, 11),
    });
    const today = new Date(2026, 0, 1);
    const result = calculateDailySafeToSpend(wallets, assignments, goals, period, today);
    // 100000 - 40000 - 20000 = 40000 / 10 = 4000
    expect(result.value).toBe(4000);
  });
});
