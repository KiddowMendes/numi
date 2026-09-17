import { create } from 'zustand';

import type { AppState, Transaction } from '@numi/domain';
import type { EngineAPI } from '@numi/domain';

type TransactionDraft = {
  type: 'income' | 'expense';
  amount: string;
  categoryId: string | null;
  walletId: string | null;
  note: string;
  date: Date;
};

type TransactionResult = { ok: true; value: Transaction } | { ok: false; errors: { code: string; message: string }[] };

function generateId(): string {
  if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function parseAmountToCents(input: string): number {
  const cleaned = input.replace(/[^0-9.\-]/g, '');
  return Math.round(parseFloat(cleaned) * 100);
}

type StoreState = {
  /** Current app state snapshot — synced from Engine on every mutation */
  appState: AppState;
  /** Reference to the Engine instance — set once on mount */
  engine: EngineAPI | null;
  /** Whether user has finished the onboarding flow */
  isOnboarded: boolean;
  /** Transient draft for the transaction entry form */
  draft: TransactionDraft;
};

type StoreActions = {
  /** Called once after Engine is initialized */
  setEngine: (engine: EngineAPI) => void;
  /** Sync store.appState from engine.getState() after a mutation */
  syncFromEngine: () => void;
  /** Complete the onboarding flow and show main tabs */
  completeOnboarding: () => void;
  /** Update a single field on the transaction draft */
  setDraftField: <K extends keyof TransactionDraft>(key: K, value: TransactionDraft[K]) => void;
  /** Reset the draft to its initial state */
  clearDraft: () => void;
  /** Log a transaction from the current draft, sync engine, return result */
  logTransaction: () => TransactionResult;
};

const INITIAL_DRAFT: TransactionDraft = {
  type: 'expense',
  amount: '',
  categoryId: null,
  walletId: null,
  note: '',
  date: new Date(),
};

export const useStore = create<StoreState & StoreActions>((set, get) => ({
  appState: {
    user: { id: '', tier: 'free' },
    activePeriod: null,
    periods: [],
    wallets: [],
    categories: [],
    goals: [],
    assignments: [],
    transactions: [],
  },
  engine: null,
  isOnboarded: false,
  draft: { ...INITIAL_DRAFT },

  setEngine: (engine) => {
    const appState = engine.getState();
    set({
      engine,
      appState,
      isOnboarded: !!appState.activePeriod && (appState.assignments.length > 0 || appState.transactions.length > 0),
    });
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
      return { ok: false, errors: [{ code: 'INVALID_STATE', message: 'Engine not initialized' }] };
    }

    const walletId = draft.walletId || appState.wallets[0]?.id;
    if (!walletId) {
      return { ok: false, errors: [{ code: 'NOT_FOUND', message: 'No wallet available' }] };
    }

    const amountCents = parseAmountToCents(draft.amount);
    if (amountCents <= 0) {
      return { ok: false, errors: [{ code: 'INVALID_STATE', message: 'Amount must be greater than zero' }] };
    }

    const tx: Transaction = {
      id: generateId(),
      amount: amountCents,
      type: draft.type,
      date: new Date(draft.date.getFullYear(), draft.date.getMonth(), draft.date.getDate()),
      category_id: draft.type === 'expense' ? draft.categoryId : null,
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
