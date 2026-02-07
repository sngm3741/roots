type PortfolioImageProps = {
  image?: string;
  title: string;
};

export default function PortfolioImage({ image, title }: PortfolioImageProps) {
  return (
    <div className="w-full shrink-0 aspect-[16/9] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100/80 dark:border-slate-800 dark:bg-slate-900">
      {image ? (
        <img src={image} alt={`${title}のイメージ`} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
          No Image
        </div>
      )}
    </div>
  );
}
