import clsx from "clsx";

type Tag = { label: string };

type Props = {
  tags: Tag[];
  className?: string;
};

export function TagList({ tags, className }: Props) {
  if (!tags.length) return null;
  return (
    <div className={clsx("flex flex-wrap gap-2 text-xs text-slate-600", className)}>
      {tags.map((tag, idx) => (
        <span
          key={`${tag.label}-${idx}`}
          className="rounded-full bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-1 font-semibold text-slate-800 shadow-sm border border-pink-100"
        >
          {tag.label}
        </span>
      ))}
    </div>
  );
}
