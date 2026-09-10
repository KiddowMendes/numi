import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { createEngine, type EngineAPI } from '@numi/domain';
import type { AppState } from '@numi/domain';

import { useStore } from './store';

type EngineContextValue = {
  engine: EngineAPI;
};

const EngineContext = createContext<EngineContextValue | null>(null);

export function useEngine(): EngineContextValue {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine must be used within <EngineProvider>');
  return ctx;
}

type Props = { children: ReactNode };

function createInitialState(): AppState {
  const now = new Date();

  return {
    user: { id: 'user-1', tier: 'free' },
    activePeriod: null,
    periods: [],
    wallets: [],
    categories: [
      {
        id: 'cat-food',
        name: 'Food',
        color: '#FF5733',
        icon: 'fork.knife',
        is_default: true,
        created_at: now,
      },
      {
        id: 'cat-transport',
        name: 'Transport',
        color: '#3498DB',
        icon: 'car.fill',
        is_default: true,
        created_at: now,
      },
      {
        id: 'cat-entertainment',
        name: 'Entertainment',
        color: '#9B59B6',
        icon: 'film.fill',
        is_default: true,
        created_at: now,
      },
    ],
    goals: [],
    assignments: [],
    transactions: [],
  };
}

export function EngineProvider({ children }: Props) {
  const engine = useMemo(() => createEngine(createInitialState()), []);

  useEffect(() => {
    useStore.getState().setEngine(engine);
  }, [engine]);

  return (
    <EngineContext.Provider value={{ engine }}>
      {children}
    </EngineContext.Provider>
  );
}
