import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import initSqlJs from 'sql.js';

import { Repository } from '@numi/database';
import { createEngine, type EngineAPI } from '@numi/domain';
import type { AppState } from '@numi/domain';

import { useStore } from './store';

type EngineContextValue = {
  repository: Repository;
  engine: EngineAPI;
};

const EngineContext = createContext<EngineContextValue | null>(null);

export function useEngine(): EngineContextValue {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error('useEngine must be used within <EngineProvider>');
  return ctx;
}

type Props = { children: ReactNode };

export function EngineProvider({ children }: Props) {
  const [ctx, setCtx] = useState<EngineContextValue | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const SQL = await initSqlJs();
      const db = new SQL.Database();
      const repository = new Repository(db);

      // Seed fresh state if no user exists
      if (!repository.getUser()) {
        const now = new Date();
        repository.upsertUser({ id: 'user-1', tier: 'free' });
        repository.upsertCategory({
          id: 'cat-food',
          name: 'Food',
          color: '#FF5733',
          icon: 'fork.knife',
          is_default: true,
          created_at: now,
        });
        repository.upsertCategory({
          id: 'cat-transport',
          name: 'Transport',
          color: '#3498DB',
          icon: 'car.fill',
          is_default: true,
          created_at: now,
        });
        repository.upsertCategory({
          id: 'cat-entertainment',
          name: 'Entertainment',
          color: '#9B59B6',
          icon: 'film.fill',
          is_default: true,
          created_at: now,
        });
      }

      const state = repository.loadState();
      const engine = createEngine(state);

      if (!cancelled) {
        setCtx({ repository, engine });
        useStore.getState().setEngine(engine);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ctx) return null;

  return (
    <EngineContext.Provider value={ctx}>
      {children}
    </EngineContext.Provider>
  );
}
