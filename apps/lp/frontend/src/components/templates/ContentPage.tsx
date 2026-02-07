import type { ReactNode } from "react";
import { cn } from "../ui/utils";
import PageContainer from "../atoms/PageContainer";

type ContentPageProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
};

export default function ContentPage({
  children,
  className,
  containerClassName,
}: ContentPageProps) {
  return (
    <div
      className={cn(
        "min-h-screen bg-white px-6 py-12 text-slate-900 dark:bg-slate-950 dark:text-slate-100",
        className,
      )}
    >
      <PageContainer className={containerClassName}>{children}</PageContainer>
    </div>
  );
}
