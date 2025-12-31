import type { StoreSummary } from "../../types/store";
import { RatingStars } from "../ui/rating-stars";
import { AverageEarningIcon, WaitTimeIcon } from "../ui/survey-metric-icons";
import { CardTypeChip } from "../ui/card-type-chip";

type Props = {
  store: StoreSummary;
  className?: string;
};

function MapPinIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

function MessageSquareIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
    </svg>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-semibold bg-sky-500/50 text-slate-100 border-slate-100">
      {children}
    </span>
  );
}

export function StoreCard({ store, className }: Props) {
  const href = `/stores/${store.id}`;
  const earningLabel =
    store.averageEarningLabel ||
    (Number.isFinite(store.averageEarning) ? `${(store.averageEarning / 10000).toFixed(0)}万円` : "-");
  const waitLabel = store.waitTimeLabel || `${store.waitTimeHours || 0}時間`;

  return (
    <a
      href={href}
      className={`w-full bg-sky-50/60 rounded-2xl p-6 border border-sky-100 hover:shadow-lg hover:border-sky-200 transition-all duration-200 text-left ${className ?? ""}`}
      aria-label={`${store.storeName}${store.branchName ? ` ${store.branchName}` : ""} の詳細へ`}
    >
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <CardTypeChip label="店舗" variant="store" />
          <Badge>{store.category}</Badge>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-1 pt-2">
          <span className="mt-[1px]">
            <MapPinIcon />
          </span>
          <span>{store.prefecture}</span>
          {store.area && <span className="text-gray-400">・</span>}
          {store.area && <span>{store.area}</span>}
        </div>
        <h3 className="text-gray-900 mb-1">
          {store.storeName}
          {store.branchName && <span className="text-gray-600 ml-1">{store.branchName}</span>}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RatingStars value={store.averageRating ?? 0} size="lg" />
          <span className="text-2xl font-bold text-red-500">
            {(store.averageRating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <AverageEarningIcon className="h-4 w-4 text-white" />
            <span>平均稼ぎ</span>
          </div>
          <span className="text-sm text-gray-900">{earningLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <WaitTimeIcon className="h-4 w-4 text-pink-600" />
            <span>平均待機時間</span>
          </div>
          <span className="text-sm text-gray-900">{waitLabel}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MessageSquareIcon />
          <span>{store.surveyCount}件のアンケート</span>
        </div>
      </div>
    </a>
  );
}
