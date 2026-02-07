import { useState } from "react";
import LogFilterButton from "../molecules/LogFilterButton";
import LogTimelineItem from "../molecules/LogTimelineItem";
import { getLogItems, LogFilter } from "../../data/logs";
import NarrowSection from "../molecules/NarrowSection";
import { useI18n } from "../../contexts/I18nContext";

export default function LogTimeline() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<LogFilter>("writing");
  const items = getLogItems(filter, {
    writing: t("log.label.published"),
    release: t("log.label.release"),
    misc: t("log.label.newOss"),
  });

  return (
    <NarrowSection className="pb-10" containerClassName="min-h-[340px]">
        <div className="pb-6">
          <div className="flex items-center justify-center gap-3">
            <LogFilterButton
              active={filter === "writing"}
              icon="✍️"
              label={t("log.filter.writing")}
              onClick={() => setFilter("writing")}
            />
            <LogFilterButton
              active={filter === "release"}
              icon="🎉"
              label={t("log.filter.release")}
              onClick={() => setFilter("release")}
            />
            <LogFilterButton
              active={filter === "misc"}
              icon="🧩"
              label={t("log.filter.misc")}
              onClick={() => setFilter("misc")}
            />
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-body-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            記事がありません
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((item, index) => (
              <LogTimelineItem
                key={`${item.title}-${item.time}`}
                item={item}
                isLast={index === items.length - 1}
              />
            ))}
          </div>
        )}
    </NarrowSection>
  );
}
