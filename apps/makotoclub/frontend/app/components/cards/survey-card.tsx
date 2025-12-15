import type { SurveySummary } from "../../types/survey";
import { RatingStars } from "../ui/rating-stars";

type Props = {
  survey: SurveySummary;
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

function CalendarIcon() {
  return (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "gray" | "purple" }) {
  const base = "inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-semibold";
  const variants: Record<string, string> = {
    default: "bg-pink-50 text-pink-700 border-pink-100",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
  };
  return <span className={`${base} ${variants[variant] ?? variants.default}`}>{children}</span>;
}

export function SurveyCard({ survey, className }: Props) {
  const href = `/surveys/${survey.id}`;
  const comment =
    survey.customerComment ||
    survey.workEnvironmentComment ||
    survey.staffComment ||
    survey.etcComment ||
    "コメントなし";
  const createdAt = new Date(survey.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <a
      href={href}
      className={`w-full bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-pink-200 transition-all duration-200 text-left ${className ?? ""}`}
      aria-label={`${survey.storeName}のアンケート詳細へ`}
    >
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPinIcon />
          <span>{survey.storePrefecture}</span>
          {survey.storeArea && <span className="text-gray-400">・</span>}
          {survey.storeArea && <span>{survey.storeArea}</span>}
        </div>
        <h3 className="text-gray-900 mb-1">
          {survey.storeName}
          {survey.storeBranch && <span className="text-gray-600 ml-1">{survey.storeBranch}</span>}
        </h3>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="default">{survey.visitedPeriod}</Badge>
        <Badge variant="gray">{survey.age}歳</Badge>
        <Badge variant="purple">スペック {survey.specScore}</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">満足度</span>
          <RatingStars value={survey.rating ?? 0} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className="flex items-center justify-center w-4 h-4 text-base">¥</span>
            <span>稼ぎ</span>
          </div>
          <span className="text-sm text-gray-900">
            {Number.isFinite(survey.averageEarning)
              ? `${(survey.averageEarning / 10000).toFixed(0)}万円`
              : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <ClockIcon />
            <span>待機時間</span>
          </div>
          <span className="text-sm text-gray-900">{survey.waitTimeHours}時間</span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 mb-3">
        <p className="text-sm text-gray-600 line-clamp-2">{comment.length > 60 ? `${comment.slice(0, 60)}...` : comment}</p>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <CalendarIcon />
        <span>{createdAt}</span>
      </div>
    </a>
  );
}
