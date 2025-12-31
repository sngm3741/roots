import { useLayoutEffect } from "react";
import { useBreadcrumbOverride } from "./breadcrumb-context";

type Props = {
  label?: string;
  branchName?: string;
  storeId?: string;
};

export const BreadcrumbLabelSetter = ({ label, branchName, storeId }: Props) => {
  const { setLastLabel, setLastStoreId } = useBreadcrumbOverride();

  useLayoutEffect(() => {
    if (label) {
      setLastLabel(branchName ? `${label} ${branchName}` : label);
    }
    if (storeId) {
      setLastStoreId(storeId);
    }
    return () => {
      setLastLabel(undefined);
      setLastStoreId(undefined);
    };
  }, [label, branchName, storeId, setLastLabel, setLastStoreId]);

  return null;
};
