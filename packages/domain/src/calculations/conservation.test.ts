import { describe, it, expect } from "vitest";
import { checkConservation } from "./conservation.js";
import { factories } from "../test-support/index.js";

describe("C15 - Conservation of Money", () => {
  it("should be valid when fully balanced", () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const wallets = [wallet];
    const assignments = [
      factories.createAssignment({ wallet_id: wallet.id, amount: 30000 }),
    ];
    const goals = [
      factories.createGoal({ wallet_id: wallet.id, current_amount: 20000 }),
    ];
    // available = 100000 - 30000 - 20000 = 50000
    // 50000 + 30000 + 20000 = 100000 ✓
    const result = checkConservation(wallets, assignments, goals);
    expect(result.valid).toBe(true);
    expect(result.discrepancy).toBe(0);
  });

  it("should detect discrepancy when money is missing", () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const wallets = [wallet];
    // All 100000 assigned, but wallet says 100000
    const assignments = [
      factories.createAssignment({ wallet_id: wallet.id, amount: 100000 }),
    ];
    // available = 0, assigned = 100000, reserved = 0 → sum = 100000 ✓
    const result = checkConservation(wallets, assignments, []);
    expect(result.valid).toBe(true);
  });

  it("should detect discrepancy when wallets don't match", () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const wallets = [wallet];
    const assignments = [
      factories.createAssignment({ wallet_id: wallet.id, amount: 50000 }),
      factories.createAssignment({ wallet_id: wallet.id, amount: 50000 }),
      factories.createAssignment({ wallet_id: wallet.id, amount: 50000 }),
    ];
    // available = 100000 - 150000 = -50000
    // -50000 + 150000 + 0 = 100000 ✓
    const result = checkConservation(wallets, assignments, []);
    expect(result.valid).toBe(true);
  });

  it("should return valid for empty state", () => {
    const result = checkConservation([], [], []);
    expect(result.valid).toBe(true);
    expect(result.discrepancy).toBe(0);
  });
});
