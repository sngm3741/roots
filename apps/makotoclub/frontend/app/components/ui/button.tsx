import { Slot } from "@radix-ui/react-slot";
import { type ButtonHTMLAttributes, forwardRef } from "react";
import { clsx } from "clsx";

type Variant = "primary" | "secondary" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#f472b6] to-[#a855f7] text-white shadow-md shadow-pink-200 hover:brightness-105 focus-visible:ring-[#f472b6] disabled:opacity-60",
  secondary:
    "bg-white text-slate-900 border border-slate-200 hover:border-pink-200 hover:bg-pink-50 focus-visible:ring-[#f472b6] disabled:opacity-60",
  ghost:
    "text-slate-900 hover:bg-pink-50 focus-visible:ring-pink-200 disabled:opacity-60",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-lg",
  md: "h-10 px-4 text-sm rounded-xl",
  lg: "h-11 px-5 text-base rounded-xl",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: Variant;
  size?: Size;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, asChild, variant = "primary", size = "md", ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref as any}
      className={clsx(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    />
  );
});
