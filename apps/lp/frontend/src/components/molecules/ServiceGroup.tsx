import { Check } from "lucide-react";

type ServiceGroupProps = {
  title: string;
  items: string[];
};

export default function ServiceGroup({ title, items }: ServiceGroupProps) {
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 text-white dark:bg-emerald-500">
          <Check size={12} aria-hidden="true" />
        </span>
        <p className="text-body font-semibold text-slate-700 dark:text-white">
          {title}
        </p>
      </div>
      <div className="relative mt-2 space-y-2 pl-6 text-body-sm text-slate-500 dark:text-slate-300">
        <span className="absolute left-[7px] top-1 h-[calc(100%-4px)] w-px bg-blue-100 dark:bg-slate-700" />
        {items.map((item) => (
          <div key={item} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-slate-500/70 dark:bg-slate-300" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
