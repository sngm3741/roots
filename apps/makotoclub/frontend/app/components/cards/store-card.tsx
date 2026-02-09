import { Link } from "react-router";
import type { StoreSummary } from "../../types/store";
import { CircleDollarSign, Clock, FileText, Heart, MapPin, Store } from "lucide-react";
import { RatingStars } from "../ui/rating-stars";
import { formatDecimal1 } from "../../lib/number-format";
import { useStoreBookmark } from "../../lib/store-bookmarks";

type Props = {
  store: StoreSummary;
  className?: string;
};

export function StoreCard({ store, className }: Props) {
  const href = `/stores/${store.id}`;
  const { isBookmarked, toggle } = useStoreBookmark(store.id);
  const rating = typeof store.averageRating === "number" ? store.averageRating : 0;
  const earningLabel =
    store.averageEarningLabel ||
    (Number.isFinite(store.averageEarning) ? `${(store.averageEarning / 10000).toFixed(0)}万円` : "-");
  const waitLabel =
    store.waitTimeLabel ??
    (Number.isFinite(store.waitTimeHours) ? `${formatDecimal1(store.waitTimeHours)}時間` : "-");

  return (
    <Link
      to={href}
      className={`w-full rounded-2xl border border-pink-100/60 bg-gradient-to-br from-pink-50 to-rose-50 p-4 text-left shadow-sm transition-shadow hover:shadow-md ${className ?? ""}`}
      aria-label={`${store.storeName}${store.branchName ? ` ${store.branchName}` : ""} の詳細へ`}
    >
      <div className="mb-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500 text-white">
              <Store className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-pink-700 leading-none">店舗</span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.preventDefault();
              toggle();
            }}
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
              isBookmarked
                ? "border-pink-200 bg-pink-100 text-pink-600"
                : "border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300"
            }`}
            aria-label="店舗をブックマーク"
            aria-pressed={isBookmarked}
          >
            <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
          </button>
        </div>

        <h3 className="mb-1.5 text-xl font-bold leading-tight text-gray-900">
          {store.storeName}
          {store.branchName && (
            <span className="ml-1 text-base font-semibold text-gray-500">{store.branchName}</span>
          )}
        </h3>

        <div className="flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          <span>{store.prefecture}</span>
        </div>
        <span className="mt-2 inline-flex rounded-full bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-700">
          {store.category}
        </span>

        <div className="mt-4 rounded-xl bg-white/70 p-3">
          <div className="flex items-center justify-between pr-2">
            <div className="flex items-center gap-2">
              <RatingStars value={rating} size="lg" />
            </div>
            <span className="text-2xl font-bold text-pink-500">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2.5">
        <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <CircleDollarSign className="h-4 w-4 -translate-y-px text-pink-500" />
            <span className="text-xs text-gray-600">平均稼ぎ</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{earningLabel}</div>
        </div>
        <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
          <div className="mb-1.5 flex items-center gap-1.5">
            <Clock className="h-4 w-4 -translate-y-px text-pink-500" />
            <span className="text-xs text-gray-600">平均待機</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{waitLabel}</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 border-t border-pink-200/60 pt-2.5">
        <FileText className="h-4 w-4 text-pink-500" />
        <span className="text-sm font-bold text-pink-600">{store.surveyCount}件</span>
      </div>
    </Link>
  );
}
