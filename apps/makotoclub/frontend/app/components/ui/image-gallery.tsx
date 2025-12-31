import { useEffect, useMemo, useState } from "react";
import { Button } from "./button";

export type ImageGalleryItem = {
  url: string;
  surveyId: string;
  comment?: string | null;
};

type Props = {
  items: ImageGalleryItem[];
  hideCaption?: boolean;
  hideModalDetails?: boolean;
};

const toSummary = (text?: string | null) => {
  const trimmed = (text ?? "").trim();
  if (!trimmed) return "コメントなし";
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}...` : trimmed;
};

export function ImageGallery({ items, hideCaption = false, hideModalDetails = false }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const activeItem = activeIndex != null ? items[activeIndex] : null;
  const activeSummary = useMemo(() => toSummary(activeItem?.comment), [activeItem?.comment]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }
    };
    if (activeItem) {
      window.addEventListener("keydown", onKeyDown);
      return () => window.removeEventListener("keydown", onKeyDown);
    }
    return undefined;
  }, [activeItem]);

  if (items.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {items.map((item, index) => (
          <button
            key={`${item.url}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className="group relative min-w-[220px] max-w-[260px] snap-start overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.18)]"
            aria-label="投稿画像を拡大表示"
          >
            <img
              src={item.url}
              alt="投稿画像"
              className="h-56 w-full object-cover"
              loading="lazy"
            />
            {!hideCaption && (
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/80 via-slate-900/40 to-transparent px-3 py-2 text-left text-xs text-white">
                <span className="inline-block whitespace-pre-wrap break-words rounded-md bg-slate-900/50 px-2 py-1">
                  {toSummary(item.comment)}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>

      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/60"
            aria-label="閉じる"
            onClick={() => setActiveIndex(null)}
          />
          <div className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.3)]">
            <div className="relative">
              <img src={activeItem.url} alt="投稿画像の拡大" className="max-h-[70vh] w-full object-contain bg-slate-950" />
              <button
                type="button"
                className="absolute right-4 top-4 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                onClick={() => setActiveIndex(null)}
              >
                閉じる
              </button>
            </div>
            {!hideModalDetails && (
              <div className="space-y-3 px-5 py-4">
                <p className="text-sm text-slate-700">{activeSummary}</p>
                <div className="flex justify-end">
                  <Button asChild>
                    <a href={`/surveys/${activeItem.surveyId}`}>このアンケートを見る</a>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
