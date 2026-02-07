import { Link } from "react-router-dom";
import type { LogItem } from "../../data/logs";

type LogTimelineItemProps = {
  item: LogItem;
  isLast: boolean;
};

export default function LogTimelineItem({ item, isLast }: LogTimelineItemProps) {
  return (
    <div className="relative flex items-stretch gap-4">
      {!isLast && (
        <span className="absolute left-[13px] top-8 bottom-[-24px] w-px border-l border-dashed border-slate-300 dark:border-slate-700" />
      )}
      <div className="flex flex-col items-center self-stretch">
        <span
          className={`z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white ${
            item.iconClass
          }`}
        >
          {item.icon}
        </span>
      </div>
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3 text-caption text-slate-500 dark:text-slate-400">
          <span>{item.label}</span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-caption text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {item.time}
          </span>
        </div>
        {item.internal ? (
          <Link
            to={item.url}
            className="mt-3 block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-body font-semibold text-slate-700 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {item.title}
            <div className="mt-1 text-caption font-normal text-slate-500 dark:text-slate-400">
              {item.subtitle}
            </div>
          </Link>
        ) : (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="mt-3 block rounded-2xl border border-slate-200 bg-white px-4 py-3 text-body font-semibold text-slate-700 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            {item.title}
            <div className="mt-1 text-caption font-normal text-slate-500 dark:text-slate-400">
              {item.subtitle}
            </div>
          </a>
        )}
      </div>
    </div>
  );
}
