import type { ReactNode } from "react";
import { clsx } from "clsx";

type StaticPageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

type StaticPageSectionProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function StaticPageLayout({
  title,
  description,
  children,
  className,
}: StaticPageLayoutProps) {
  return (
    <main className={clsx("mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-6", className)}>
      <header className="space-y-2">
        <p className="text-xs uppercase text-slate-500 font-semibold">Static</p>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description ? <p className="text-sm text-slate-600">{description}</p> : null}
      </header>
      {children}
    </main>
  );
}

export function StaticPageSection({ title, children, className }: StaticPageSectionProps) {
  return (
    <section
      className={clsx(
        "card-surface space-y-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6",
        className,
      )}
    >
      {title ? <h2 className="text-lg font-semibold text-slate-900">{title}</h2> : null}
      {children}
    </section>
  );
}
