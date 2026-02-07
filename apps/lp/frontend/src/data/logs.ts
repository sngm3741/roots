import type { NoteMeta } from "./notes";
import { getNotesByCategory } from "./notes";

export type LogFilter = "writing" | "release" | "misc";

export type LogItem = {
  icon: string;
  iconClass: string;
  label: string;
  time: string;
  title: string;
  subtitle: string;
  url: string;
  internal?: boolean;
};

const toWritingItem = (note: { meta: NoteMeta }, label: string): LogItem => ({
  icon: "✍️",
  iconClass: "text-blue-600",
  label,
  time: note.meta.displayDate,
  title: note.meta.title,
  subtitle: note.meta.author,
  url: `/notes/${note.meta.slug}`,
  internal: true,
});

export const releaseItems = (_label: string): LogItem[] => [];

export const miscItems = (_label: string): LogItem[] => [];

export const getLogItems = (filter: LogFilter, labels: { writing: string; release: string; misc: string }) => {
  if (filter === "release") return releaseItems(labels.release);
  if (filter === "misc") return miscItems(labels.misc);
  return getNotesByCategory("writing").map((note) =>
    toWritingItem(note, labels.writing.replace("{site}", note.meta.site)),
  );
};
