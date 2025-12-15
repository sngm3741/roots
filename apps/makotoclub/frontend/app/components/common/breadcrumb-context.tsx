import { createContext, useContext, useState } from "react";

type BreadcrumbOverride = {
  lastLabel?: string;
  setLastLabel: (label?: string) => void;
};

const BreadcrumbContext = createContext<BreadcrumbOverride>({
  lastLabel: undefined,
  setLastLabel: () => {},
});

export const BreadcrumbProvider = ({ children }: { children: React.ReactNode }) => {
  const [lastLabel, setLastLabel] = useState<string | undefined>(undefined);
  return (
    <BreadcrumbContext.Provider value={{ lastLabel, setLastLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbOverride = () => useContext(BreadcrumbContext);
