import { createContext, useContext, useState } from "react";

type BreadcrumbOverride = {
  lastLabel?: string;
  lastStoreId?: string;
  lastDetailLabel?: string;
  setLastLabel: (label?: string) => void;
  setLastStoreId: (storeId?: string) => void;
  setLastDetailLabel: (label?: string) => void;
};

const BreadcrumbContext = createContext<BreadcrumbOverride>({
  lastLabel: undefined,
  lastStoreId: undefined,
  lastDetailLabel: undefined,
  setLastLabel: () => {},
  setLastStoreId: () => {},
  setLastDetailLabel: () => {},
});

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastLabel, setLastLabel] = useState<string | undefined>(undefined);
  const [lastStoreId, setLastStoreId] = useState<string | undefined>(undefined);
  const [lastDetailLabel, setLastDetailLabel] = useState<string | undefined>(undefined);
  return (
    <BreadcrumbContext.Provider
      value={{
        lastLabel,
        lastStoreId,
        lastDetailLabel,
        setLastLabel,
        setLastStoreId,
        setLastDetailLabel,
      }}
    >
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbOverride = () => useContext(BreadcrumbContext);
