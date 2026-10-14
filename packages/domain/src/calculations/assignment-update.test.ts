import { describe, it, expect } from "vitest";
import { canUpdateAssignment } from "./assignment-update.js";
import { factories } from "../test-support/index.js";

describe("C11 - Assignment Update Check", () => {
  it("should allow when within balance", () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canUpdateAssignment(wallet, [], [], "a1", 50000);
    expect(result).toBe(true);
  });

  it("should reject when exceeding balance", () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canUpdateAssignment(wallet, [], [], "a1", 150000);
    expect(result).toBe(false);
  });

  it("should exclude the edited row so its old amount is not counted twice", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100000 });
    const assignments = [
      factories.createAssignment({ id: "a1", wallet_id: "w1", amount: 80000 }),
    ];
    // Raising the edited row to the full balance is allowed: the 80000 it
    // already holds is not added on top.
    const result = canUpdateAssignment(wallet, assignments, [], "a1", 100000);
    expect(result).toBe(true);
  });

  it("should still count the other rows", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100000 });
    const assignments = [
      factories.createAssignment({ id: "a1", wallet_id: "w1", amount: 30000 }),
      factories.createAssignment({ id: "a2", wallet_id: "w1", amount: 40000 }),
    ];
    const result = canUpdateAssignment(wallet, assignments, [], "a1", 70000);
    expect(result).toBe(false);
  });

  it("should account for goals", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100000 });
    const goals = [
      factories.createGoal({ wallet_id: "w1", current_amount: 70000 }),
    ];
    const result = canUpdateAssignment(wallet, [], goals, "a1", 40000);
    expect(result).toBe(false);
  });

  it("should allow exact balance match", () => {
    const wallet = factories.createWallet({ balance: 100000 });
    const result = canUpdateAssignment(wallet, [], [], "a1", 100000);
    expect(result).toBe(true);
  });
});
