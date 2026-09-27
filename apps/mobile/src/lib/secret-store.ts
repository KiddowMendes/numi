import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

export type SecretStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  deleteItem(key: string): Promise<void>;
};

/**
 * Web stand-in for the keychain.
 *
 * `expo-secure-store` ships no web implementation — the module resolves to an
 * empty object — so every call on it throws in a browser and no secret can be
 * written or read. `localStorage` is the narrowest thing that works: the app is
 * offline-only and account-less, so there is no remote copy to sync and no
 * server to authenticate against. It is a browser store, not a keychain, and a
 * web build should not be read as a hardened one.
 */
const WEB_PREFIX = "numi.secret.";

/**
 * `localStorage` access throws outright when storage is blocked (private mode,
 * third-party cookie denial), so the handle is resolved once and defensively.
 */
function webStorage(): Storage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

const webSecrets: SecretStore = {
  async getItem(key) {
    try {
      return webStorage()?.getItem(WEB_PREFIX + key) ?? null;
    } catch {
      return null;
    }
  },

  // Writes deliberately do not catch. A secret that silently fails to persist
  // leaves the user locked out of an app that believes it stored one, which is
  // worse than a visible failure the caller can report.
  async setItem(key, value) {
    const storage = webStorage();
    if (!storage) {
      throw new Error("Web storage is unavailable");
    }
    storage.setItem(WEB_PREFIX + key, value);
  },

  async deleteItem(key) {
    try {
      webStorage()?.removeItem(WEB_PREFIX + key);
    } catch {
      // Nothing to delete if storage is gone; the secret is already unreadable.
    }
  },
};

const keychain: SecretStore = {
  getItem: (key) => SecureStore.getItemAsync(key),
  setItem: (key, value) => SecureStore.setItemAsync(key, value),
  deleteItem: (key) => SecureStore.deleteItemAsync(key),
};

export const secretStore: SecretStore =
  Platform.OS === "web" ? webSecrets : keychain;
