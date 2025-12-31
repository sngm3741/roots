import type { SurveySummary } from "../../types/survey";
import { RatingStars } from "../ui/rating-stars";
import {
  AgeIcon,
  AverageEarningIcon,
  SpecIcon,
  WaitTimeIcon,
} from "../ui/survey-metric-icons";
import { CardTypeChip } from "../ui/card-type-chip";

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

export function SurveyCard({ survey, className }: Props) {
  const href = `/surveys/${survey.id}`;
  const comment =
    buildComment([
      survey.customerComment,
      survey.staffComment,
      survey.workEnvironmentComment,
      survey.etcComment,
    ]) || "コメントなし";
  const visitedPeriodLabel = formatVisitedPeriod(survey.visitedPeriod);

  return (
    <a
      href={href}
      className={`w-full bg-pink-50/60 rounded-2xl p-6 border border-pink-100 hover:shadow-lg hover:border-pink-200 transition-all duration-200 text-left ${className ?? ""}`}
      aria-label={`${survey.storeName}のアンケート詳細へ`}
    >
      <div className="mb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <CardTypeChip label="アンケート" variant="survey" />
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <span>{visitedPeriodLabel}</span>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-1 pt-2">
          <span className="mt-[1px]">
            <MapPinIcon />
          </span>
          <span>{survey.storePrefecture}</span>
          {survey.storeArea && <span className="text-gray-400">・</span>}
          {survey.storeArea && <span>{survey.storeArea}</span>}
        </div>
        <h3 className="text-gray-900 mb-1">
          {survey.storeName}
          {survey.storeBranch && <span className="text-gray-600 ml-1">{survey.storeBranch}</span>}
        </h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <RatingStars value={survey.rating ?? 0} size="lg" />
          <span className="text-2xl font-bold text-red-500">
            {(survey.rating ?? 0).toFixed(1)}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <AverageEarningIcon className="h-4 w-4 text-white" />
            <span>平均稼ぎ</span>
          </div>
          <span className="text-sm text-gray-900">
            {Number.isFinite(survey.averageEarning) ? `${survey.averageEarning}万円` : "-"}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <WaitTimeIcon className="h-4 w-4 text-pink-600" />
            <span>平均待機時間</span>
          </div>
          <span className="text-sm text-gray-900">{survey.waitTimeHours}時間</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <AgeIcon className="h-4 w-4 text-pink-600" />
            <span>年齢</span>
          </div>
          <span className="text-sm text-gray-900">{survey.age}歳</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <SpecIcon className="h-4 w-4 text-pink-600" />
            <span>スペック</span>
          </div>
          <span className="text-sm text-gray-900">{survey.specScore}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-gray-100 mb-3">
        <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-4">
          {comment.length > 120 ? `${comment.slice(0, 120)}...` : comment}
        </p>
      </div>

    </a>
  );
}

function formatVisitedPeriod(value: string) {
  if (!value) return "-";
  const [year, month] = value.split("-");
  if (!year || !month) return value;
  const monthNumber = Number(month);
  if (!Number.isFinite(monthNumber)) return value;
  return `${year}年${monthNumber}月`;
}

function buildComment(parts: Array<string | null | undefined>) {
  const cleaned = parts
    .map((text) => (text ?? "").trim())
    .filter((text) => text.length > 0);
  if (cleaned.length === 0) return "";
  let combined = "";
  for (const text of cleaned) {
    const next = combined ? `${combined}\n${text}` : text;
    if (next.length > 120) {
      return combined || text;
    }
    combined = next;
  }
  return combined;
}
