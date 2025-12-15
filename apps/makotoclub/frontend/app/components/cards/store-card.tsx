import type { StoreSummary } from "../../types/store";
import { RatingStars } from "../ui/rating-stars";

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

function ClockIcon() {
  return (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
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
    <span className="inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-semibold bg-pink-50 text-pink-700 border-pink-100">
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
      className={`w-full bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-pink-200 transition-all duration-200 text-left ${className ?? ""}`}
      aria-label={`${store.storeName}${store.branchName ? ` ${store.branchName}` : ""} の詳細へ`}
    >
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPinIcon />
          <span>{store.prefecture}</span>
          {store.area && <span className="text-gray-400">・</span>}
          {store.area && <span>{store.area}</span>}
        </div>
        <h3 className="text-gray-900 mb-1">
          {store.storeName}
          {store.branchName && <span className="text-gray-600 ml-1">{store.branchName}</span>}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge>{store.category}</Badge>
        {store.genre && <Badge>{store.genre}</Badge>}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">評価</span>
          <RatingStars value={store.averageRating ?? 0} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className="flex items-center justify-center w-4 h-4 text-base">¥</span>
            <span>平均稼ぎ</span>
          </div>
          <span className="text-sm text-gray-900">{earningLabel}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <ClockIcon />
            <span>平均待機</span>
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
