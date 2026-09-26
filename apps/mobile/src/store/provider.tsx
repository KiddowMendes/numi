import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from "react";
import { createEngine, type AppState, type EngineAPI } from "@numi/domain";
import { categoryAccents } from "@numi/design-system";

import { useStore } from "./store";

type EngineContextValue = {
  engine: EngineAPI;
};

const EngineContext = createContext<EngineContextValue | null>(null);

export function useEngine(): EngineContextValue {
  const ctx = useContext(EngineContext);
  if (!ctx) throw new Error("useEngine must be used within <EngineProvider>");
  return ctx;
}

type Props = { children: ReactNode };

function createInitialState(): AppState {
  const now = new Date();

  return {
    user: { id: "user-1", tier: "free" },
    activePeriod: null,
    periods: [],
    wallets: [],
    categories: [
      {
        id: "cat-food",
        name: "Food",
        color: categoryAccents.food.light,
        icon: "ForkKnife",
        is_default: true,
        created_at: now,
      },
      {
        id: "cat-transport",
        name: "Transport",
        color: categoryAccents.transport.light,
        icon: "Bus",
        is_default: true,
        created_at: now,
      },
      {
        id: "cat-entertainment",
        name: "Entertainment",
        color: categoryAccents.social.light,
        icon: "UsersThree",
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
