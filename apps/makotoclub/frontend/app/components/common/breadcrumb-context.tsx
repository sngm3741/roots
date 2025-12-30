import { createContext, useContext, useState } from "react";

type BreadcrumbOverride = {
  lastLabel?: string;
  lastStoreId?: string;
  setLastLabel: (label?: string) => void;
  setLastStoreId: (storeId?: string) => void;
};

const BreadcrumbContext = createContext<BreadcrumbOverride>({
  lastLabel: undefined,
  lastStoreId: undefined,
  setLastLabel: () => {},
  setLastStoreId: () => {},
});

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastLabel, setLastLabel] = useState<string | undefined>(undefined);
  const [lastStoreId, setLastStoreId] = useState<string | undefined>(undefined);
  return (
    <BreadcrumbContext.Provider value={{ lastLabel, lastStoreId, setLastLabel, setLastStoreId }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbOverride = () => useContext(BreadcrumbContext);
