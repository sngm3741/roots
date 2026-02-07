import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { cn } from "../ui/utils";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  requireScroll?: boolean;
};

export default function ScrollReveal({
  children,
  className,
  requireScroll = false,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let didSetupObserver = false;

    const revealNow = () => {
      element.classList.add("is-visible");
    };

    const setupObserver = () => {
      if (didSetupObserver) return;
      didSetupObserver = true;
      if (prefersReducedMotion) {
        revealNow();
        return;
      }
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.15,
          rootMargin: "0px 0px -10% 0px",
        },
      );
      observer.observe(element);
    };

    if (!requireScroll) {
      setupObserver();
      return;
    }

    const onScroll = () => {
      setupObserver();
      window.removeEventListener("scroll", onScroll);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [requireScroll]);

  return (
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
}
