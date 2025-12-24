import { forwardRef, type SelectHTMLAttributes } from "react";
import { clsx } from "clsx";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={clsx(
        "w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-base text-slate-900 shadow-sm transition-all md:text-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-200 focus-visible:ring-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
