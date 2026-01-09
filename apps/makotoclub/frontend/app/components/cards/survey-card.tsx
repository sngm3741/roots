import type { SurveySummary } from "../../types/survey";
import { BarChart3, CircleDollarSign, Clock, MapPin, MessageCircle, ThumbsUp, User } from "lucide-react";
import { RatingStars } from "../ui/rating-stars";
import { formatDecimal1 } from "../../lib/number-format";

type Props = {
  survey: SurveySummary;
  className?: string;
  showStoreInfo?: boolean;
  commentAlwaysEllipsis?: boolean;
};

export function SurveyCard({
  survey,
  className,
  showStoreInfo = true,
  commentAlwaysEllipsis = false,
}: Props) {
  const href = `/surveys/${survey.id}`;
  const commentData = buildComment(
    [
      survey.customerComment,
      survey.staffComment,
      survey.workEnvironmentComment,
      survey.etcComment,
    ],
    80,
    commentAlwaysEllipsis,
  );
  const commentText = commentData.text || "コメントなし";
  const visitedPeriodLabel = formatVisitedPeriod(survey.visitedPeriod);
  const rating = typeof survey.rating === "number" ? survey.rating : 0;
  const helpfulCount = survey.helpfulCount ?? 0;
  const commentCount = survey.commentCount ?? 0;
  const fadeChars = 10;
  const shouldFade = commentData.hasMore;
  const fadeHead = shouldFade
    ? commentText.slice(0, Math.max(0, commentText.length - fadeChars))
    : commentText;
  const fadeTail = shouldFade
    ? commentText.slice(-Math.min(fadeChars, commentText.length))
    : "";

  return (
    <div
      className={`w-full rounded-2xl border border-pink-100/50 bg-gradient-to-br from-pink-50 to-rose-50 p-4 text-left shadow-sm transition-shadow hover:shadow-md ${className ?? ""}`}
    >
      <a
        href={href}
        className="block"
        aria-label={showStoreInfo ? `${survey.storeName}のアンケート詳細へ` : "アンケート詳細へ"}
      >
        <div className="mb-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="rounded-lg bg-pink-500 p-1.5 text-white">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <span className="text-xs font-bold text-pink-700">アンケート</span>
          </div>
            <span className="text-xs font-medium text-gray-600">{visitedPeriodLabel}</span>
          </div>

        {showStoreInfo ? (
          <>
            <h3 className="mb-1.5 text-xl font-bold leading-tight text-gray-900">
              {survey.storeName}
              {survey.storeBranch && (
                <span className="ml-1 text-base font-semibold text-gray-500">
                  {survey.storeBranch}
                </span>
              )}
            </h3>
            <div className="mb-4 flex items-center gap-1 text-xs text-gray-600">
              <MapPin className="h-3.5 w-3.5" />
              <span>{survey.storePrefecture}</span>
            </div>
          </>
        ) : null}

          <div className="rounded-xl bg-white/70 p-3">
            <div className="flex items-center justify-between pr-2">
              <div className="flex items-center gap-2">
                <RatingStars value={rating} size="lg" />
              </div>
              <span className="text-2xl font-bold text-pink-500">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </a>

      <a href={href} className="block" aria-hidden="true">
        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <CircleDollarSign className="h-4 w-4 -translate-y-px text-pink-500" />
              <span className="text-xs text-gray-600">平均稼ぎ</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {Number.isFinite(survey.averageEarning) ? `${survey.averageEarning}万円` : "-"}
            </div>
          </div>
          <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <Clock className="h-4 w-4 -translate-y-px text-pink-500" />
              <span className="text-xs text-gray-600">平均待機</span>
            </div>
            <div className="text-lg font-bold text-gray-900">
              {formatDecimal1(survey.waitTimeHours)}時間
            </div>
          </div>
        </div>

        <div className="mb-3 grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-white/70 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <User className="h-4 w-4 text-pink-500" />
              <span className="text-xs text-gray-600">年齢</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{survey.age}歳</div>
          </div>
          <div className="rounded-xl bg-white/70 p-3">
            <div className="mb-1.5 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-pink-500" />
              <span className="text-xs text-gray-600">スペック</span>
            </div>
            <div className="text-lg font-bold text-gray-900">{survey.specScore}</div>
          </div>
        </div>

        <div className="mb-3 rounded-xl bg-white/70 p-3">
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
            {shouldFade ? (
              <>
                <span>{fadeHead}</span>
                <span className="bg-gradient-to-r from-slate-700 to-slate-700/10 text-transparent bg-clip-text">
                  {fadeTail}
                </span>
              </>
            ) : (
              commentText
            )}
            {commentData.hasMore ? (
              <span className="ml-1 text-xs font-semibold text-pink-500">（もっと読む）</span>
            ) : null}
          </p>
        </div>
      </a>

      <a href={href} className="block" aria-hidden="true">
        <div className="flex w-full items-center justify-between rounded-xl bg-white/70 px-4 py-2.5 text-sm font-medium text-gray-700">
          <div className="flex items-center gap-1.5">
            <ThumbsUp className="h-4 w-4" />
            <span>役に立った {helpfulCount}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <MessageCircle className="h-4 w-4" />
            <span>コメント {commentCount}</span>
          </div>
        </div>
      </a>
    </div>
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

function buildComment(
  parts: Array<string | null | undefined>,
  limit = 120,
  alwaysEllipsis = false,
) {
  const cleaned = parts
    .map((text) => (text ?? "").trim())
    .filter((text) => text.length > 0);
  if (cleaned.length === 0) return { text: "", hasMore: false };
  let combined = "";
  let truncated = false;
  for (const text of cleaned) {
    const separator = combined ? "\n" : "";
    const next = `${combined}${separator}${text}`;
    if (next.length > limit) {
      const remaining = limit - combined.length - separator.length;
      if (remaining > 0) {
        combined = `${combined}${separator}${text.slice(0, remaining)}`;
      }
      truncated = true;
      break;
    }
    combined = next;
  }
  return {
    text: combined,
    hasMore: truncated || (alwaysEllipsis && combined.length > 0),
  };
}
