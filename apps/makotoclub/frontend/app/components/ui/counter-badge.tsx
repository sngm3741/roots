import type { ReactNode } from "react";

type Props = {
  label: string;
  value: number;
  suffix?: string;
  icon?: ReactNode;
  tone?: "emerald" | "sky";
  className?: string;
};

const toneClasses = {
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  sky: "border-sky-200 bg-sky-50 text-sky-700",
};

export function CounterBadge({
  label,
  value,
  suffix = "",
  icon,
  tone = "emerald",
  className,
}: Props) {
  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold ${toneClasses[tone]} ${className ?? ""}`}
    >
      {icon}
      {label} {value.toLocaleString("ja-JP")} {suffix}
    </div>
  );
}
