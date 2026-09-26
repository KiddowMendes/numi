/**
 * Polyfill Web / Node APIs missing in Hermes / React Native environment.
 */
const g = typeof globalThis !== "undefined" ? (globalThis as any) : {};

if (typeof g.crypto === "undefined") {
  g.crypto = {};
}

if (typeof g.crypto.randomUUID !== "function") {
  g.crypto.randomUUID = function randomUUID(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };
}

if (typeof g.global !== "undefined" && typeof g.global.crypto === "undefined") {
  g.global.crypto = g.crypto;
}
