import { create } from "zustand";

import type { AppState, EngineAPI, Transaction } from "@numi/domain";
import { randToCents } from "@numi/utils";

import {
  defaultThemePreference,
  type ThemePreferenceValue,
} from "@numi/design-system";

type TransactionDraft = {
  type: "income" | "expense";
  amount: string;
  categoryId: string | null;
  walletId: string | null;
  note: string;
  date: Date;
};

type TransactionResult =
  | { ok: true; value: Transaction }
  | { ok: false; errors: { code: string; message: string }[] };

/** What `all-set` shows, and what it would show if the user backed out of it. */
export type OnboardingSummary = {
  walletCount: number;
  budgetCount: number;
  lines: string[];
};

function generateId(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return globalThis.crypto.randomUUID();
  }
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type StoreState = {
  /** Current app state snapshot — synced from Engine on every mutation */
  appState: AppState;
  /** Reference to the Engine instance — set once on mount */
  engine: EngineAPI | null;
  /**
   * Whether the user finished `all-set`. Explicit, never derived.
   *
   * It used to be computed in `setEngine` as
   * `!!activePeriod && (assignments || transactions)`, which cannot express the
   * ADR-0002 flow: `quick-setup` is skippable, so onboarding completes with no
   * period and no assignments at all.
   */
  isOnboarded: boolean;
  /** Display name captured on `welcome`. Trimmed before it is stored. */
  userName: string;
  /**
   * Mirrors the keychain, not the source of truth for it.
   *
   * Only ever set after `SecureStore.setItemAsync` resolves. An optimistic flip
   * would strand a user on an `unlock` screen they cannot pass, because the
   * hash was never written. See `Edge_Cases.md` EC19.
   */
  pinSet: boolean;
  /** Cleared on a cold launch, and re-earned by passing `unlock`. */
  isUnlocked: boolean;
  /** Written by `quick-setup`, read by `all-set`. */
  onboardingSummary: OnboardingSummary | null;
  /** Transient draft for the transaction entry form */
  draft: TransactionDraft;
  /** Light/dark choice. Never defaults to `system`. */
  themePreference: ThemePreferenceValue;
};

type StoreActions = {
  /** Called once after Engine is initialized */
  setEngine: (engine: EngineAPI) => void;
  /** Sync store.appState from engine.getState() after a mutation */
  syncFromEngine: () => void;
  /** Complete the onboarding flow and show main tabs */
  completeOnboarding: () => void;
  setUserName: (name: string) => void;
  /** Call only after the keychain write resolves. */
  markPinSet: () => void;
  markUnlocked: () => void;
  setOnboardingSummary: (summary: OnboardingSummary) => void;
  /**
   * Wipe the store back to its first-launch shape.
   *
   * Backs "Forgot PIN? Reset app". The caller is also responsible for
   * `resetEngine()` from `useEngine()` — the engine and the store are separate
   * owners, and stale wallets left in the engine would make the next
   * `createWallet` return TIER_LIMIT_EXCEEDED against a wallet the user can no
   * longer see.
   *
   * `isOnboarded` is cleared too, so the bootstrap gate returns the user to
   * `welcome` rather than onto the empty Home they just reset.
   */
  resetForNewUser: () => void;
  /** Update a single field on the transaction draft */
  setDraftField: <K extends keyof TransactionDraft>(
    key: K,
    value: TransactionDraft[K],
  ) => void;
  /** Reset the draft to its initial state */
  clearDraft: () => void;
  /** Log a transaction from the current draft, sync engine, return result */
  logTransaction: () => TransactionResult;
  /** Set the light/dark choice. Called from Settings. */
  setThemePreference: (preference: ThemePreferenceValue) => void;
};

const INITIAL_DRAFT: TransactionDraft = {
  type: "expense",
  amount: "",
  categoryId: null,
  walletId: null,
  note: "",
  date: new Date(),
};

const INITIAL_APP_STATE: AppState = {
  user: { id: "", tier: "free" },
  activePeriod: null,
  periods: [],
  wallets: [],
  categories: [],
  goals: [],
  assignments: [],
  transactions: [],
};

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  appState: INITIAL_APP_STATE,
  engine: null,
  isOnboarded: false,
  userName: "",
  pinSet: false,
  isUnlocked: false,
  onboardingSummary: null,
  draft: { ...INITIAL_DRAFT },
  themePreference: defaultThemePreference,

  setEngine: (engine) => {
    // `isOnboarded` is deliberately not touched here. It is set by
    // `completeOnboarding` and cleared by `resetForNewUser`, and nothing else.
    set({ engine, appState: engine.getState() });
  },

  syncFromEngine: () => {
    const { engine } = get();
    if (engine) {
      set({ appState: engine.getState() });
    }
  },

  completeOnboarding: () => {
    set({ isOnboarded: true });
  },

  setUserName: (name) => {
    set({ userName: name.trim() });
  },

  markPinSet: () => {
    set({ pinSet: true });
  },

  markUnlocked: () => {
    set({ isUnlocked: true });
  },

  setOnboardingSummary: (summary) => {
    set({ onboardingSummary: summary });
  },

  resetForNewUser: () => {
    set({
      appState: INITIAL_APP_STATE,
      isOnboarded: false,
      userName: "",
      isUnlocked: false,
      onboardingSummary: null,
      draft: { ...INITIAL_DRAFT, date: new Date() },
    });
  },

  setThemePreference: (preference) => {
    set({ themePreference: preference });
  },

  setDraftField: (key, value) => {
    set((state) => ({
      draft: { ...state.draft, [key]: value },
    }));
  },

  clearDraft: () => {
    set({ draft: { ...INITIAL_DRAFT, date: new Date() } });
  },

  logTransaction: () => {
    const { engine, draft, appState } = get();
    if (!engine) {
      return {
        ok: false,
        errors: [{ code: "INVALID_STATE", message: "Engine not initialized" }],
      };
    }

    const walletId = draft.walletId || appState.wallets[0]?.id;
    if (!walletId) {
      return {
        ok: false,
        errors: [{ code: "NOT_FOUND", message: "No wallet available" }],
      };
    }

    const amountCents = randToCents(draft.amount);
    if (amountCents <= 0) {
      return {
        ok: false,
        errors: [
          {
            code: "INVALID_STATE",
            message: "Amount must be greater than zero",
          },
        ],
      };
    }

    const tx: Transaction = {
      id: generateId(),
      amount: amountCents,
      type: draft.type,
      date: new Date(
        draft.date.getFullYear(),
        draft.date.getMonth(),
        draft.date.getDate(),
      ),
      category_id: draft.type === "expense" ? draft.categoryId : null,
      wallet_id: walletId,
      to_wallet_id: null,
      note: draft.note.trim() || null,
      created_at: new Date(),
    };

    const result = engine.recordTransaction(tx);

    if (result.ok) {
      get().syncFromEngine();
      get().clearDraft();
    }

    return result;
  },
}));
