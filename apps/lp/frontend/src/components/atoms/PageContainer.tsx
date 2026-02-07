import type { ReactNode } from "react";
import { cn } from "../ui/utils";

type PageContainerProps = {
  children: ReactNode;
  size?: "narrow" | "medium" | "wide";
  className?: string;
};

const sizeClass = {
  narrow: "w-[min(360px,92vw)]",
  medium: "w-[min(420px,94vw)]",
  wide: "w-full max-w-3xl",
};

export default function PageContainer({
  children,
  size = "wide",
  className,
}: PageContainerProps) {
  return <div className={cn("mx-auto", sizeClass[size], className)}>{children}</div>;
}
