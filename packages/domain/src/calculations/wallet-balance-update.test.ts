import { describe, it, expect } from "vitest";
import { canUpdateWalletBalance } from "./wallet-balance-update.js";
import { factories } from "../test-support/index.js";

describe("Wallet Management - Wallet Balance Update Check", () => {
  it("should allow a balance above the committed money", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100000 });
    const result = canUpdateWalletBalance(wallet, [], [], 100000);
    expect(result).toEqual({ valid: true });
  });

  it("should allow a balance equal to the committed money", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100000 });
    const assignments = [
      factories.createAssignment({ wallet_id: "w1", amount: 80000 }),
    ];
    const result = canUpdateWalletBalance(wallet, assignments, [], 80000);
    expect(result).toEqual({ valid: true });
  });

  it("should reject a balance below the assigned money", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100000 });
    const assignments = [
      factories.createAssignment({ wallet_id: "w1", amount: 80000 }),
    ];
    const result = canUpdateWalletBalance(wallet, assignments, [], 50000);
    expect(result).toEqual({
      valid: false,
      error: "Balance is below committed money",
    });
  });

  it("should count assignments and goal reserves together", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100000 });
    const assignments = [
      factories.createAssignment({ wallet_id: "w1", amount: 50000 }),
    ];
    const goals = [
      factories.createGoal({ wallet_id: "w1", current_amount: 30000 }),
    ];
    const result = canUpdateWalletBalance(wallet, assignments, goals, 79000);
    expect(result).toEqual({
      valid: false,
      error: "Balance is below committed money",
    });
  });

  it("should ignore commitments held by another wallet", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100000 });
    const assignments = [
      factories.createAssignment({ wallet_id: "w2", amount: 90000 }),
    ];
    const goals = [
      factories.createGoal({ wallet_id: "w2", current_amount: 90000 }),
    ];
    const result = canUpdateWalletBalance(wallet, assignments, goals, 0);
    expect(result).toEqual({ valid: true });
  });
});
