import type { ReactNode } from "react";
import { cn } from "../ui/utils";
import PageContainer from "../atoms/PageContainer";

type NarrowSectionProps = {
  children: ReactNode;
  className?: string;
  containerClassName?: string;
  size?: "narrow" | "medium" | "wide";
};

export default function NarrowSection({
  children,
  className,
  containerClassName,
  size = "narrow",
}: NarrowSectionProps) {
  return (
    <section className={cn("flex w-full justify-center px-4", className)}>
      <PageContainer size={size} className={containerClassName}>
        {children}
      </PageContainer>
    </section>
  );
}
