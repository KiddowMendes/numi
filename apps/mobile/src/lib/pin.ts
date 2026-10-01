import * as Crypto from "expo-crypto";

import { secretStore } from "./secret-store";

/** Digits in a PIN. Four is the shortest code that is not trivially guessable. */
export const PIN_LENGTH = 4;

/**
 * Wrong attempts before the pad locks.
 *
 * A speed bump, not a control. Anyone holding an unlocked phone can read the
 * app without the PIN, so this exists to stop a fumbling thumb, not an
 * attacker. See `01_Onboarding/Edge_Cases.md` EC17.
 */
export const PIN_MAX_ATTEMPTS = 5;

export const PIN_LOCKOUT_SECONDS = 30;

/**
 * The keychain key the hash is written under.
 *
 * `numi_wallet` documented this as `numi_pin_hash` but wrote the literal
 * `"pin_hash"` in both its setup and unlock screens. The literal is what a real
 * install has on disk, so the literal is what carries over.
 */
const PIN_KEY = "pin_hash";

/** SHA-256 of the code, hex encoded. Never the code itself. */
export function hashPin(pin: string): Promise<string> {
  // The encoding is passed explicitly rather than left to the default. Native
  // `digestStringAsync` defaults to HEX, but the web implementation dereferences
  // `options.encoding` unguarded and throws a TypeError when it is omitted — so
  // relying on the default silently broke every hash in a browser.
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin, {
    encoding: Crypto.CryptoEncoding.HEX,
  });
}

export async function savePin(pin: string): Promise<void> {
  await secretStore.setItem(PIN_KEY, await hashPin(pin));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await secretStore.getItem(PIN_KEY);
  if (stored === null) return false;
  return (await hashPin(pin)) === stored;
}

export async function hasPin(): Promise<boolean> {
  return (await secretStore.getItem(PIN_KEY)) !== null;
}

/**
 * Wipes the lock. Destructive and irreversible — there is no recovery address,
 * because there is no account.
 */
export async function clearPin(): Promise<void> {
  await secretStore.deleteItem(PIN_KEY);
}

export function isCompletePin(digits: string): boolean {
  return digits.length === PIN_LENGTH && /^\d+$/.test(digits);
}
