export const LIST_SORT_OPTIONS = [
  { value: "newest", label: "新着順" },
  { value: "earning", label: "稼ぎ順" },
  { value: "rating", label: "満足度順" },
] as const;

export const LIST_SORT_OPTIONS_WITH_DEFAULT = [
  { value: "", label: "新着順" },
  { value: "earning", label: "稼ぎ順" },
  { value: "rating", label: "満足度順" },
] as const;

export type ListSortValue = (typeof LIST_SORT_OPTIONS)[number]["value"];
