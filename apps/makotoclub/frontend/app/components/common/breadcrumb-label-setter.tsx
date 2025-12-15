import { useEffect } from "react";
import { useBreadcrumbOverride } from "./breadcrumb-context";

type Props = {
  label?: string;
  branchName?: string;
};

export const BreadcrumbLabelSetter = ({ label, branchName }: Props) => {
  const { setLastLabel } = useBreadcrumbOverride();

  useEffect(() => {
    if (label) {
      setLastLabel(branchName ? `${label} ${branchName}` : label);
    }
    return () => setLastLabel(undefined);
  }, [label, branchName, setLastLabel]);

  return null;
};
