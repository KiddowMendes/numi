import { describe, it, expect, beforeEach } from 'vitest';
import { createEngine } from '../../src/api/EngineAPI.js';
import { factories } from '../factories/index.js';
import type { AppState } from '../../src/state.js';

function makeState(overrides: Partial<AppState> = {}): AppState {
  const user = factories.createUser({ id: 'user1', tier: 'freemium' });
  const wallet = factories.createWallet({ id: 'w1', balance: 100000 });
  const category = factories.createCategory({ id: 'c1' });
  const period = factories.createPeriod({ id: 'p1', is_active: true });

  return {
    user,
    activePeriod: period,
    periods: [period],
    wallets: [wallet],
    categories: [category],
    goals: [],
    assignments: [],
    transactions: [],
    ...overrides,
  };
}

describe('EngineAPI', () => {
  beforeEach(() => {
    factories.resetIds();
  });

  describe('getState', () => {
    it('should return the current state', () => {
      const state = makeState();
      const engine = createEngine(state);
      const result = engine.getState();
      expect(result.user.id).toBe('user1');
      expect(result.wallets).toHaveLength(1);
    });
  });

  describe('recordTransaction', () => {
    it('should record income', () => {
      const engine = createEngine(makeState());
      const tx = factories.createTransaction({
        wallet_id: 'w1',
        amount: 5000,
        type: 'income',
      });
      const result = engine.recordTransaction(tx);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.amount).toBe(5000);
      }
    });

    it('should update wallet balance after income', () => {
      const engine = createEngine(makeState());
      engine.recordTransaction(
        factories.createTransaction({ wallet_id: 'w1', amount: 5000, type: 'income' }),
      );
      const balance = engine.getWalletBalance('w1');
      expect(balance.ok).toBe(true);
      if (balance.ok) {
        expect(balance.value).toBe(105000);
      }
    });

    it('should record expense and update balance', () => {
      const engine = createEngine(makeState());
      engine.recordTransaction(
        factories.createTransaction({ wallet_id: 'w1', amount: 3000, type: 'expense', category_id: 'c1' }),
      );
      const balance = engine.getWalletBalance('w1');
      expect(balance.ok).toBe(true);
      if (balance.ok) {
        expect(balance.value).toBe(97000);
      }
    });

    it('should fail expense with no category', () => {
      const engine = createEngine(makeState());
      const result = engine.recordTransaction(
        factories.createTransaction({ wallet_id: 'w1', amount: 3000, type: 'expense', category_id: null }),
      );
      expect(result.ok).toBe(false);
    });

    it('should fail expense with insufficient balance', () => {
      const engine = createEngine(makeState());
      const result = engine.recordTransaction(
        factories.createTransaction({ wallet_id: 'w1', amount: 200000, type: 'expense', category_id: 'c1' }),
      );
      expect(result.ok).toBe(false);
    });

    it('should fail for nonexistent wallet', () => {
      const engine = createEngine(makeState());
      const result = engine.recordTransaction(
        factories.createTransaction({ wallet_id: 'nonexistent', amount: 1000, type: 'income' }),
      );
      expect(result.ok).toBe(false);
    });

    it('should record transfer and update both balances', () => {
      const state = makeState({
        wallets: [
          factories.createWallet({ id: 'w1', balance: 100000 }),
          factories.createWallet({ id: 'w2', balance: 0 }),
        ],
      });
      const engine = createEngine(state);
      const result = engine.recordTransaction(
        factories.createTransaction({
          wallet_id: 'w1',
          to_wallet_id: 'w2',
          amount: 30000,
          type: 'transfer',
        }),
      );
      expect(result.ok).toBe(true);
      const b1 = engine.getWalletBalance('w1');
      const b2 = engine.getWalletBalance('w2');
      if (b1.ok && b2.ok) {
        expect(b1.value).toBe(70000);
        expect(b2.value).toBe(30000);
      }
    });

    it('should fail transfer to same wallet', () => {
      const engine = createEngine(makeState());
      const result = engine.recordTransaction(
        factories.createTransaction({
          wallet_id: 'w1',
          to_wallet_id: 'w1',
          amount: 5000,
          type: 'transfer',
        }),
      );
      expect(result.ok).toBe(false);
    });

    it('should fail transfer without to_wallet_id', () => {
      const engine = createEngine(makeState());
      const result = engine.recordTransaction(
        factories.createTransaction({
          wallet_id: 'w1',
          to_wallet_id: null,
          amount: 5000,
          type: 'transfer',
        }),
      );
      expect(result.ok).toBe(false);
    });

    it('should fail transfer to nonexistent destination wallet', () => {
      const engine = createEngine(makeState());
      const result = engine.recordTransaction(
        factories.createTransaction({
          wallet_id: 'w1',
          to_wallet_id: 'nonexistent',
          amount: 5000,
          type: 'transfer',
        }),
      );
      expect(result.ok).toBe(false);
    });

    it('should not modify third wallet during transfer', () => {
      const state = makeState({
        wallets: [
          factories.createWallet({ id: 'w1', balance: 100000 }),
          factories.createWallet({ id: 'w2', balance: 50000 }),
          factories.createWallet({ id: 'w3', balance: 75000 }),
        ],
      });
      const engine = createEngine(state);
      const tx = factories.createTransaction({
        id: 'tx1',
        wallet_id: 'w1',
        to_wallet_id: 'w2',
        amount: 20000,
        type: 'transfer',
      });
      engine.recordTransaction(tx);
      const w3 = engine.getWalletBalance('w3');
      if (w3.ok) expect(w3.value).toBe(75000);
    });
  });

  describe('deleteTransaction', () => {
    it('should delete and reverse balance', () => {
      const engine = createEngine(makeState());
      const tx = factories.createTransaction({
        id: 'tx1',
        wallet_id: 'w1',
        amount: 5000,
        type: 'income',
      });
      engine.recordTransaction(tx);
      const result = engine.deleteTransaction('tx1');
      expect(result.ok).toBe(true);
      const balance = engine.getWalletBalance('w1');
      if (balance.ok) {
        expect(balance.value).toBe(100000);
      }
    });

    it('should delete transfer and reverse both wallets', () => {
      const state = makeState({
        wallets: [
          factories.createWallet({ id: 'w1', balance: 100000 }),
          factories.createWallet({ id: 'w2', balance: 50000 }),
          factories.createWallet({ id: 'w3', balance: 75000 }),
        ],
      });
      const engine = createEngine(state);
      const tx = factories.createTransaction({
        id: 'tx1',
        wallet_id: 'w1',
        to_wallet_id: 'w2',
        amount: 20000,
        type: 'transfer',
      });
      engine.recordTransaction(tx);
      const result = engine.deleteTransaction('tx1');
      expect(result.ok).toBe(true);
      const w1Balance = engine.getWalletBalance('w1');
      const w2Balance = engine.getWalletBalance('w2');
      const w3Balance = engine.getWalletBalance('w3');
      if (w1Balance.ok) expect(w1Balance.value).toBe(100000);
      if (w2Balance.ok) expect(w2Balance.value).toBe(50000);
      if (w3Balance.ok) expect(w3Balance.value).toBe(75000);
    });

    it('should delete expense and reverse balance', () => {
      const engine = createEngine(makeState());
      const tx = factories.createTransaction({
        id: 'tx1',
        wallet_id: 'w1',
        category_id: 'c1',
        amount: 5000,
        type: 'expense',
      });
      engine.recordTransaction(tx);
      const balanceBefore = engine.getWalletBalance('w1');
      if (balanceBefore.ok) expect(balanceBefore.value).toBe(95000);
      const result = engine.deleteTransaction('tx1');
      expect(result.ok).toBe(true);
      const balanceAfter = engine.getWalletBalance('w1');
      if (balanceAfter.ok) expect(balanceAfter.value).toBe(100000);
    });

    it('should fail for nonexistent transaction', () => {
      const engine = createEngine(makeState());
      const result = engine.deleteTransaction('nonexistent');
      expect(result.ok).toBe(false);
    });
  });

  describe('createAssignment', () => {
    it('should create assignment when within balance', () => {
      const engine = createEngine(makeState());
      const assignment = factories.createAssignment({
        wallet_id: 'w1',
        period_id: 'p1',
        category_id: 'c1',
        amount: 30000,
      });
      const result = engine.createAssignment(assignment);
      expect(result.ok).toBe(true);
    });

    it('should fail when exceeding available balance', () => {
      const engine = createEngine(makeState());
      const result = engine.createAssignment(
        factories.createAssignment({ wallet_id: 'w1', amount: 200000 }),
      );
      expect(result.ok).toBe(false);
    });

    it('should fail for nonexistent wallet', () => {
      const engine = createEngine(makeState());
      const result = engine.createAssignment(
        factories.createAssignment({ wallet_id: 'nonexistent', amount: 30000 }),
      );
      expect(result.ok).toBe(false);
    });
  });

  describe('deleteAssignment', () => {
    it('should delete assignment', () => {
      const engine = createEngine(makeState());
      engine.createAssignment(
        factories.createAssignment({ id: 'a1', wallet_id: 'w1', amount: 30000 }),
      );
      const result = engine.deleteAssignment('a1');
      expect(result.ok).toBe(true);
    });

    it('should fail for nonexistent assignment', () => {
      const engine = createEngine(makeState());
      const result = engine.deleteAssignment('nonexistent');
      expect(result.ok).toBe(false);
    });
  });

  describe('createWallet', () => {
    it('should create wallet within tier limits', () => {
      const engine = createEngine(makeState());
      const result = engine.createWallet(
        factories.createWallet({ id: 'w2', balance: 50000 }),
      );
      expect(result.ok).toBe(true);
    });

    it('should fail when exceeding tier limits', () => {
      const state = makeState({
        wallets: [
          factories.createWallet({ id: 'w1' }),
          factories.createWallet({ id: 'w2' }),
          factories.createWallet({ id: 'w3' }),
        ],
      });
      const engine = createEngine(state);
      const result = engine.createWallet(factories.createWallet({ id: 'w4' }));
      expect(result.ok).toBe(false);
    });
  });

  describe('createGoal', () => {
    it('should create goal within tier limits', () => {
      const engine = createEngine(makeState());
      const result = engine.createGoal(
        factories.createGoal({ wallet_id: 'w1', target_amount: 200000 }),
      );
      expect(result.ok).toBe(true);
    });

    it('should fail when exceeding tier limits', () => {
      const state = makeState({
        goals: [
          factories.createGoal({ id: 'g1', wallet_id: 'w1' }),
          factories.createGoal({ id: 'g2', wallet_id: 'w1' }),
          factories.createGoal({ id: 'g3', wallet_id: 'w1' }),
        ],
      });
      const engine = createEngine(state);
      const result = engine.createGoal(
        factories.createGoal({ wallet_id: 'w1' }),
      );
      expect(result.ok).toBe(false);
    });

    it('should fail for nonexistent wallet', () => {
      const engine = createEngine(makeState());
      const result = engine.createGoal(
        factories.createGoal({ wallet_id: 'nonexistent', target_amount: 50000 }),
      );
      expect(result.ok).toBe(false);
    });
  });

  describe('updateGoal', () => {
    it('should update goal current_amount', () => {
      const state = makeState({
        goals: [factories.createGoal({ id: 'g1', current_amount: 10000 })],
      });
      const engine = createEngine(state);
      const result = engine.updateGoal('g1', { current_amount: 25000 });
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.current_amount).toBe(25000);
      }
    });

    it('should update goal with multiple goals in state', () => {
      const state = makeState({
        goals: [
          factories.createGoal({ id: 'g1', target_amount: 100000, current_amount: 0 }),
          factories.createGoal({ id: 'g2', target_amount: 50000, current_amount: 0 }),
        ],
      });
      const engine = createEngine(state);
      const result = engine.updateGoal('g1', { current_amount: 25000 });
      expect(result.ok).toBe(true);
      const g2 = engine.getState().goals.find((g) => g.id === 'g2');
      expect(g2?.current_amount).toBe(0);
    });

    it('should fail for nonexistent goal', () => {
      const engine = createEngine(makeState());
      const result = engine.updateGoal('nonexistent', { current_amount: 1000 });
      expect(result.ok).toBe(false);
    });
  });

  describe('deleteGoal', () => {
    it('should delete goal', () => {
      const state = makeState({
        goals: [factories.createGoal({ id: 'g1' })],
      });
      const engine = createEngine(state);
      const result = engine.deleteGoal('g1');
      expect(result.ok).toBe(true);
    });

    it('should fail for nonexistent goal', () => {
      const engine = createEngine(makeState());
      const result = engine.deleteGoal('nonexistent');
      expect(result.ok).toBe(false);
    });
  });

  describe('getWalletBalance', () => {
    it('should return wallet balance', () => {
      const engine = createEngine(makeState());
      const result = engine.getWalletBalance('w1');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(100000);
      }
    });

    it('should fail for nonexistent wallet', () => {
      const engine = createEngine(makeState());
      const result = engine.getWalletBalance('nonexistent');
      expect(result.ok).toBe(false);
    });
  });

  describe('getAvailableBalance', () => {
    it('should return full balance when nothing allocated', () => {
      const engine = createEngine(makeState());
      const result = engine.getAvailableBalance('w1');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(100000);
      }
    });

    it('should subtract assignments', () => {
      const state = makeState({
        assignments: [factories.createAssignment({ wallet_id: 'w1', amount: 30000 })],
      });
      const engine = createEngine(state);
      const result = engine.getAvailableBalance('w1');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(70000);
      }
    });

    it('should fail for nonexistent wallet', () => {
      const engine = createEngine(makeState());
      const result = engine.getAvailableBalance('nonexistent');
      expect(result.ok).toBe(false);
    });
  });

  describe('getDailySafeToSpend', () => {
    it('should return a value', () => {
      const engine = createEngine(makeState());
      const result = engine.getDailySafeToSpend();
      expect(result.ok).toBe(true);
    });
  });

  describe('getAssignmentSpent', () => {
    it('should return 0 when no transactions', () => {
      const state = makeState({
        assignments: [factories.createAssignment({ id: 'a1', wallet_id: 'w1', category_id: 'c1', period_id: 'p1' })],
      });
      const engine = createEngine(state);
      const result = engine.getAssignmentSpent('a1');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(0);
      }
    });

    it('should fail for nonexistent assignment', () => {
      const engine = createEngine(makeState());
      const result = engine.getAssignmentSpent('nonexistent');
      expect(result.ok).toBe(false);
    });

    it('should fail when no active period', () => {
      const state = makeState({
        activePeriod: undefined,
        assignments: [factories.createAssignment({ id: 'a1', wallet_id: 'w1', category_id: 'c1', period_id: 'p1' })],
      });
      const engine = createEngine(state);
      const result = engine.getAssignmentSpent('a1');
      expect(result.ok).toBe(false);
    });
  });

  describe('getAssignmentRemaining', () => {
    it('should equal assignment amount when nothing spent', () => {
      const state = makeState({
        assignments: [factories.createAssignment({ id: 'a1', amount: 50000, wallet_id: 'w1', category_id: 'c1', period_id: 'p1' })],
      });
      const engine = createEngine(state);
      const result = engine.getAssignmentRemaining('a1');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe(50000);
      }
    });

    it('should fail for nonexistent assignment', () => {
      const engine = createEngine(makeState());
      const result = engine.getAssignmentRemaining('nonexistent');
      expect(result.ok).toBe(false);
    });

    it('should fail when no active period', () => {
      const state = makeState({
        activePeriod: undefined,
        assignments: [factories.createAssignment({ id: 'a1', wallet_id: 'w1', category_id: 'c1', period_id: 'p1' })],
      });
      const engine = createEngine(state);
      const result = engine.getAssignmentRemaining('a1');
      expect(result.ok).toBe(false);
    });
  });

  describe('getGoalProgress', () => {
    it('should calculate progress', () => {
      const state = makeState({
        goals: [factories.createGoal({ id: 'g1', target_amount: 100000, current_amount: 25000 })],
      });
      const engine = createEngine(state);
      const result = engine.getGoalProgress('g1');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.percentage).toBe(25);
        expect(result.value.remaining).toBe(75000);
      }
    });

    it('should fail for nonexistent goal', () => {
      const engine = createEngine(makeState());
      const result = engine.getGoalProgress('nonexistent');
      expect(result.ok).toBe(false);
    });
  });

  describe('checkConservation', () => {
    it('should report valid when balanced', () => {
      const engine = createEngine(makeState());
      const result = engine.checkConservation();
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.valid).toBe(true);
        expect(result.value.discrepancy).toBe(0);
      }
    });
  });
});
