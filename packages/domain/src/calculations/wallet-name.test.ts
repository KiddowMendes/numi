import { describe, it, expect } from "vitest";
import { isDuplicateWalletName } from "./wallet-name.js";
import { factories } from "../test-support/index.js";

describe("Wallet Management - Unique Wallet Name Check", () => {
  it("should flag an exact name match", () => {
    const wallets = [factories.createWallet({ id: "w1", name: "Cash" })];
    expect(isDuplicateWalletName(wallets, "Cash")).toBe(true);
  });

  it("should ignore case and surrounding whitespace", () => {
    const wallets = [factories.createWallet({ id: "w1", name: "Cash" })];
    expect(isDuplicateWalletName(wallets, "  cash  ")).toBe(true);
  });

  it("should not flag a distinct name", () => {
    const wallets = [factories.createWallet({ id: "w1", name: "Cash" })];
    expect(isDuplicateWalletName(wallets, "Bank")).toBe(false);
  });

  it("should return false against an empty list", () => {
    expect(isDuplicateWalletName([], "Cash")).toBe(false);
  });

  it("should exclude the row being edited", () => {
    const wallets = [factories.createWallet({ id: "w1", name: "Cash" })];
    expect(isDuplicateWalletName(wallets, "Cash", "w1")).toBe(false);
  });

  it("should still flag another wallet when editing", () => {
    const wallets = [
      factories.createWallet({ id: "w1", name: "Cash" }),
      factories.createWallet({ id: "w2", name: "Bank" }),
    ];
    expect(isDuplicateWalletName(wallets, "Cash", "w2")).toBe(true);
  });
});
