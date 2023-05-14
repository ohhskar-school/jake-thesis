import { createContext, useContext, useEffect } from "react";

import { store } from "@/store";
import type { IStore } from "@/store";

const storeContext = createContext<IStore | null>(null);

interface StoreProviderProps {
  children: React.ReactNode;
}
export function StoreProvider({ children }: StoreProviderProps) {
  return <storeContext.Provider value={store}>{children}</storeContext.Provider>;
}

export function StorePersistor({ children }: StoreProviderProps) {
  const { restoreCache } = useStore();

  useEffect(() => {
    restoreCache();

    // we only want to restore the cache on first load, after hydration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

export default function useStore(): IStore {
  const store = useContext(storeContext);

  if (!store) {
    throw new Error("useStore: store is null");
  }

  return store;
}
