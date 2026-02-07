import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../ui/utils";

type PillLinkProps = {
  to: string;
  children: ReactNode;
  variant?: "default" | "primary";
  className?: string;
};

const variantClass = {
  default:
    "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:text-white",
  primary:
    "border-blue-200 bg-blue-50 text-blue-700 hover:border-blue-300 hover:bg-blue-100 dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-200 dark:hover:bg-blue-500/20",
};

export default function PillLink({
  to,
  children,
  variant = "default",
  className,
}: PillLinkProps) {
  return (
    <Link
      to={to}
      className={cn(
        "rounded-full border px-4 py-2 font-semibold transition",
        variantClass[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
