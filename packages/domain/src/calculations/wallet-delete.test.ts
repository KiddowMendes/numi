import { describe, it, expect } from "vitest";
import { canDeleteWallet } from "./wallet-delete.js";
import { factories } from "../test-support/index.js";

describe("Wallet Management - Delete Wallet Check", () => {
  it("should reject when it is the only wallet", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 0 });
    const result = canDeleteWallet(wallet, [wallet], [], [], []);
    expect(result).toEqual({
      valid: false,
      error: "You need at least one wallet",
    });
  });

  it("should let the last wallet reason take precedence", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 500 });
    const result = canDeleteWallet(wallet, [wallet], [], [], []);
    expect(result).toEqual({
      valid: false,
      error: "You need at least one wallet",
    });
  });

  it("should allow an empty wallet when another remains", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 0 });
    const other = factories.createWallet({ id: "w2" });
    const result = canDeleteWallet(wallet, [wallet, other], [], [], []);
    expect(result).toEqual({ valid: true });
  });

  it("should reject a wallet with a transaction as its source", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 0 });
    const other = factories.createWallet({ id: "w2" });
    const transactions = [factories.createTransaction({ wallet_id: "w1" })];
    const result = canDeleteWallet(
      wallet,
      [wallet, other],
      [],
      [],
      transactions,
    );
    expect(result).toEqual({
      valid: false,
      error: "Move or clear this wallet's money first",
    });
  });

  it("should reject a wallet with a transaction as its destination", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 0 });
    const other = factories.createWallet({ id: "w2" });
    const transactions = [
      factories.createTransaction({
        wallet_id: "w2",
        type: "transfer",
        to_wallet_id: "w1",
      }),
    ];
    const result = canDeleteWallet(
      wallet,
      [wallet, other],
      [],
      [],
      transactions,
    );
    expect(result).toEqual({
      valid: false,
      error: "Move or clear this wallet's money first",
    });
  });

  it("should reject a wallet with an assignment", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 0 });
    const other = factories.createWallet({ id: "w2" });
    const assignments = [factories.createAssignment({ wallet_id: "w1" })];
    const result = canDeleteWallet(
      wallet,
      [wallet, other],
      assignments,
      [],
      [],
    );
    expect(result).toEqual({
      valid: false,
      error: "Move or clear this wallet's money first",
    });
  });

  it("should reject a wallet with a goal", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 0 });
    const other = factories.createWallet({ id: "w2" });
    const goals = [factories.createGoal({ wallet_id: "w1" })];
    const result = canDeleteWallet(wallet, [wallet, other], [], goals, []);
    expect(result).toEqual({
      valid: false,
      error: "Move or clear this wallet's money first",
    });
  });

  it("should reject a wallet with a non zero balance", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 100 });
    const other = factories.createWallet({ id: "w2" });
    const result = canDeleteWallet(wallet, [wallet, other], [], [], []);
    expect(result).toEqual({
      valid: false,
      error: "Move or clear this wallet's money first",
    });
  });

  it("should ignore data held by another wallet", () => {
    const wallet = factories.createWallet({ id: "w1", balance: 0 });
    const other = factories.createWallet({ id: "w2" });
    const transactions = [factories.createTransaction({ wallet_id: "w2" })];
    const assignments = [factories.createAssignment({ wallet_id: "w2" })];
    const goals = [factories.createGoal({ wallet_id: "w2" })];
    const result = canDeleteWallet(
      wallet,
      [wallet, other],
      assignments,
      goals,
      transactions,
    );
    expect(result).toEqual({ valid: true });
  });
});
