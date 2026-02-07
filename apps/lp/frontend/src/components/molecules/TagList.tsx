type TagListProps = {
  tags: string[];
};

export default function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-caption font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          #{tag}
        </span>
      ))}
    </div>
  );
}
