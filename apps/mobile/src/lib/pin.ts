import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

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
  // The encoding argument is omitted deliberately: `digestStringAsync` defaults
  // to HEX, and expo-crypto's exported `EncodingType` is not part of the
  // package's public type surface in SDK 57.
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, pin);
}

export async function savePin(pin: string): Promise<void> {
  await SecureStore.setItemAsync(PIN_KEY, await hashPin(pin));
}

export async function verifyPin(pin: string): Promise<boolean> {
  const stored = await SecureStore.getItemAsync(PIN_KEY);
  if (stored === null) return false;
  return (await hashPin(pin)) === stored;
}

export async function hasPin(): Promise<boolean> {
  return (await SecureStore.getItemAsync(PIN_KEY)) !== null;
}

/**
 * Wipes the lock. Destructive and irreversible — there is no recovery address,
 * because there is no account.
 */
export async function clearPin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
}

export function isCompletePin(digits: string): boolean {
  return digits.length === PIN_LENGTH && /^\d+$/.test(digits);
}
