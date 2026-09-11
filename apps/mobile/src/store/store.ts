import { create } from 'zustand';

import type { AppState } from '@numi/domain';
import type { EngineAPI } from '@numi/domain';

type StoreState = {
  /** Current app state snapshot — synced from Engine on every mutation */
  appState: AppState;
  /** Reference to the Engine instance — set once on mount */
  engine: EngineAPI | null;
  /** Whether user has finished the onboarding flow */
  isOnboarded: boolean;
};

type StoreActions = {
  /** Called once after Engine is initialized */
  setEngine: (engine: EngineAPI) => void;
  /** Sync store.appState from engine.getState() after a mutation */
  syncFromEngine: () => void;
  /** Complete the onboarding flow and show main tabs */
  completeOnboarding: () => void;
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
}));
