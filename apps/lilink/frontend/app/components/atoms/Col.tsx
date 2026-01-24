type ColProps = {
  children: React.ReactNode;
  span: number;
  start?: number;
  rowSpan?: number;
  smSpan?: number;
  mdSpan?: number;
  lgSpan?: number;
  xlSpan?: number;
  className?: string;
};

const joinClass = (...values: Array<string | undefined | false>) =>
  values.filter(Boolean).join(" ");

const SPAN_CLASS = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
} as const;

const START_CLASS = {
  1: "col-start-1",
  2: "col-start-2",
  3: "col-start-3",
  4: "col-start-4",
  5: "col-start-5",
  6: "col-start-6",
  7: "col-start-7",
  8: "col-start-8",
  9: "col-start-9",
  10: "col-start-10",
  11: "col-start-11",
  12: "col-start-12",
} as const;

const ROW_SPAN_CLASS = {
  1: "row-span-1",
  2: "row-span-2",
} as const;

const spanClass = (span?: number, prefix?: string) =>
  span ? `${prefix ?? ""}${SPAN_CLASS[span as keyof typeof SPAN_CLASS]}` : undefined;

const startClass = (start?: number, prefix?: string) =>
  start
    ? `${prefix ?? ""}${START_CLASS[start as keyof typeof START_CLASS]}`
    : undefined;

const rowSpanClass = (span?: number, prefix?: string) =>
  span
    ? `${prefix ?? ""}${ROW_SPAN_CLASS[span as keyof typeof ROW_SPAN_CLASS]}`
    : undefined;

export function Col({
  children,
  span,
  start,
  rowSpan,
  smSpan,
  mdSpan,
  lgSpan,
  xlSpan,
  className,
}: ColProps) {
  return (
    <div
      className={joinClass(
        spanClass(span),
        startClass(start),
        rowSpanClass(rowSpan),
        spanClass(smSpan, "sm:"),
        spanClass(mdSpan, "md:"),
        spanClass(lgSpan, "lg:"),
        spanClass(xlSpan, "xl:"),
        className,
      )}
    >
      {children}
    </div>
  );
}
