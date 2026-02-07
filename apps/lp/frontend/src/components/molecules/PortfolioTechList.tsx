type PortfolioTechListProps = {
  tech: string[];
};

export default function PortfolioTechList({ tech }: PortfolioTechListProps) {
  return (
    <div className="mt-4 flex min-w-0 flex-wrap gap-2">
      {tech.map((item) => (
        <span
          key={item}
          className="max-w-full overflow-hidden break-all rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-caption font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
        >
          {item}
        </span>
      ))}
    </div>
  );
}
