import * as React from "react";
import { cn } from "../../lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "card-surface rounded-2xl border border-pink-100/60 bg-white/90 p-6 shadow-xl shadow-pink-100/50",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";
