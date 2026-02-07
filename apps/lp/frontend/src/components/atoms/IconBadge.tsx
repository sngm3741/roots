import type { ReactNode } from "react";
import { cn } from "../ui/utils";

type IconBadgeProps = {
  className?: string;
  children: ReactNode;
};

export default function IconBadge({ className, children }: IconBadgeProps) {
  return (
    <span
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-slate-800 dark:text-slate-100",
        className,
      )}
    >
      {children}
    </span>
  );
}
