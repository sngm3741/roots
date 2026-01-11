import { useLayoutEffect } from "react";
import { useBreadcrumbOverride } from "./breadcrumb-context";

type Props = {
  label?: string;
  branchName?: string;
  storeId?: string;
  detailLabel?: string;
};

export const BreadcrumbLabelSetter = ({ label, branchName, storeId, detailLabel }: Props) => {
  const { setLastLabel, setLastStoreId, setLastDetailLabel } = useBreadcrumbOverride();

  useLayoutEffect(() => {
    if (label) {
      setLastLabel(branchName ? `${label} ${branchName}` : label);
    }
    if (storeId) {
      setLastStoreId(storeId);
    }
    if (detailLabel) {
      setLastDetailLabel(detailLabel);
    }
    return () => {
      setLastLabel(undefined);
      setLastStoreId(undefined);
      setLastDetailLabel(undefined);
    };
  }, [label, branchName, storeId, detailLabel, setLastLabel, setLastStoreId, setLastDetailLabel]);

  return null;
};
