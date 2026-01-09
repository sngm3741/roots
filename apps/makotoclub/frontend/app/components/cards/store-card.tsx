import type { StoreSummary } from "../../types/store";
import { CircleDollarSign, Clock, FileText, MapPin, Store } from "lucide-react";
import { RatingStars } from "../ui/rating-stars";
import { formatDecimal1 } from "../../lib/number-format";

type Props = {
  store: StoreSummary;
  className?: string;
};

export function StoreCard({ store, className }: Props) {
  const href = `/stores/${store.id}`;
  const rating = typeof store.averageRating === "number" ? store.averageRating : 0;
  const earningLabel =
    store.averageEarningLabel ||
    (Number.isFinite(store.averageEarning) ? `${(store.averageEarning / 10000).toFixed(0)}万円` : "-");
  const waitLabel =
    store.waitTimeLabel ??
    (Number.isFinite(store.waitTimeHours) ? `${formatDecimal1(store.waitTimeHours)}時間` : "-");

  return (
    <a
      href={href}
      className={`w-full rounded-2xl border border-pink-100/60 bg-gradient-to-br from-pink-50 to-rose-50 p-4 text-left shadow-sm transition-shadow hover:shadow-md ${className ?? ""}`}
      aria-label={`${store.storeName}${store.branchName ? ` ${store.branchName}` : ""} の詳細へ`}
    >
      <div className="mb-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="rounded-lg bg-pink-500 p-1.5 text-white">
              <Store className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <span className="text-xs font-bold text-pink-700">店舗</span>
          </div>
          <span className="rounded-full bg-pink-500 px-2.5 py-1 text-xs font-bold text-white">
            {store.category}
          </span>
        </div>

        <h3 className="mb-1.5 text-xl font-bold leading-tight text-gray-900">
          {store.storeName}
          {store.branchName && (
            <span className="ml-1 text-base font-semibold text-gray-500">{store.branchName}</span>
          )}
        </h3>

        <div className="mb-4 flex items-center gap-1 text-xs text-gray-600">
          <MapPin className="h-3.5 w-3.5" />
          <span>{store.prefecture}</span>
        </div>

        <div className="rounded-xl bg-white/70 p-3">
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
        <span className="text-xs text-gray-700">アンケート</span>
        <span className="text-sm font-bold text-pink-600">{store.surveyCount}件</span>
      </div>
    </a>
  );
}
