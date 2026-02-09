import { Link, type LoaderFunctionArgs, useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from "../config.server";
import { fetchSurveyDetail } from "../lib/surveys.server";
import type { SurveyDetail } from "../types/survey";
import { RatingStars } from "../components/ui/rating-stars";
import { HelpIcon } from "../components/ui/help-icon";
import { BreadcrumbLabelSetter } from "../components/common/breadcrumb-label-setter";
import { ImageGallery } from "../components/ui/image-gallery";
import type { ImageGalleryItem } from "../components/ui/image-gallery";
import { formatDecimal1 } from "../lib/number-format";
import { buildLimitedComment } from "../lib/comment-text";
import { formatVisitedPeriod } from "../lib/date-format";
import { useSurveyBookmark } from "../lib/survey-bookmarks";
import {
  BarChart3,
  CircleDollarSign,
  Clock,
  Heart,
  MapPin,
  Share2,
  ThumbsUp,
  User,
} from "lucide-react";

type LoaderData = {
  survey: SurveyDetail | null;
};

export const meta = ({
  data,
  params,
}: {
  data?: LoaderData;
  params: { id?: string };
}) => {
  const survey = data?.survey ?? null;
  const titleBase = survey
    ? `${survey.storeName}${survey.storeBranch ? ` ${survey.storeBranch}` : ""}${
        survey.storePrefecture
          ? ` (${survey.storePrefecture}${survey.storeArea ? ` ${survey.storeArea}` : ""})`
          : ""
      }`
    : "アンケート";
  const title = `${titleBase}`;
  const description = survey && "アンケートの投稿でPayPay最大500円プレゼント中🎁";
  const image = `https://makoto-club.com/api/og/surveys/${params.id ?? ""}`;
  const url = `https://makoto-club.com/surveys/${params.id ?? ""}`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "マコトクラブ" },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const id = params.id!;

  let survey: SurveyDetail | null = null;
  try {
    survey = await fetchSurveyDetail({ API_BASE_URL: apiBaseUrl }, id);
  } catch (error) {
    console.error("アンケート詳細の取得に失敗しました", error);
  }

  return Response.json({ survey });
}

export default function SurveyDetailPage() {
  const { survey } = useLoaderData() as LoaderData;

  if (!survey) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">アンケート情報を取得できませんでした。</p>
      </main>
    );
  }

  const comment = buildLimitedComment(
    [
      survey.customerComment,
      survey.staffComment,
      survey.workEnvironmentComment,
      survey.etcComment,
    ],
    60,
  );
  const galleryItems: ImageGalleryItem[] = (survey.imageUrls ?? []).map((url) => ({
    url,
    surveyId: survey.id,
    comment,
  }));
  const visitedPeriodLabel = formatVisitedPeriod(survey.visitedPeriod ?? "");
  const shareTitle = `${survey.storeName}${survey.storeBranch ? ` ${survey.storeBranch}` : ""}`;
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(survey.helpfulCount ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isBookmarked, toggle } = useSurveyBookmark(survey.id);
  const helpfulKey = `survey-helpful:${survey.id}`;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(helpfulKey);
      if (stored === "1") {
        setIsHelpful(true);
      }
    } catch {
      // localStorage が使えない環境では無視
    }
  }, [helpfulKey]);

  const handleShare = async () => {
    const url = window.location.href;
    const data = {
      title: `${shareTitle}のアンケート`,
      text: "#マコトクラブ",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      window.alert("リンクをコピーしました。");
    } catch {
      window.alert("共有に失敗しました。");
    }
  };

  const handleHelpfulClick = async () => {
    if (isHelpful || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${survey.id}/helpful`, { method: "POST" });
      if (!res.ok) {
        setIsSubmitting(false);
        return;
      }
      const data = (await res.json()) as { count?: number };
      if (typeof data.count === "number") {
        setHelpfulCount(data.count);
      }
      setIsHelpful(true);
      try {
        window.localStorage.setItem(helpfulKey, "1");
      } catch {
        // localStorage が使えない環境では無視
      }
    } catch {
      // 表示用なので失敗は無視
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <BreadcrumbLabelSetter
        label={survey.storeName}
        branchName={survey.storeBranch}
        storeId={survey.storeId}
      />
      <div className="space-y-6">
        <section className="rounded-2xl border border-pink-100/50 bg-gradient-to-br from-pink-50 to-rose-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500 text-white">
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
              <span className="text-xs font-bold text-pink-700 leading-none">アンケート</span>
            </div>
            <button
              type="button"
              onClick={toggle}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                isBookmarked
                  ? "border-pink-200 bg-pink-100 text-pink-600"
                  : "border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300"
              }`}
              aria-label="アンケートをお気に入り"
              aria-pressed={isBookmarked}
            >
              <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>

          <Link
            to={`/stores/${survey.storeId}`}
            className="mb-1.5 block text-xl font-bold leading-tight text-gray-900 transition hover:text-pink-600"
          >
            {survey.storeName}
            {survey.storeBranch ? ` ${survey.storeBranch}` : ""}
          </Link>

          <div className="mb-4 flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5" />
            <span>{survey.storePrefecture}</span>
          </div>

          <div className="rounded-xl bg-white/70 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RatingStars value={survey.rating ?? 0} size="lg" />
              </div>
              <span className="text-2xl font-bold text-pink-500">
                {(survey.rating ?? 0).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
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

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <User className="h-4 w-4 text-pink-500" />
                <span className="text-xs text-gray-600">年齢</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{survey.age}歳</div>
            </div>
            <div className="relative flex flex-col items-start rounded-xl bg-white/70 p-3">
              <HelpIcon
                containerClassName="absolute right-2 top-2"
                label={`「スペック」の略。\n身長cm - 体重kg の数値を指す業界用語。\n\n例)\n155cm / 49kg の場合\n155 - 49 = スペ106`}
              />
              <div className="mb-1.5 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-pink-500" />
                <span className="text-xs text-gray-600">スペック</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{survey.specScore}</div>
            </div>
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-end text-xs text-gray-500">
              {visitedPeriodLabel}
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleHelpfulClick}
                disabled={isHelpful || isSubmitting}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition ${
                  isHelpful
                    ? "border-pink-100 bg-pink-100 text-pink-600"
                    : "border-pink-100 bg-white/70 text-pink-700 hover:bg-white"
                }`}
              >
                <ThumbsUp className="h-4 w-4" />
                役に立った ({helpfulCount})
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/70 px-3 py-1 text-xs font-semibold text-pink-700 shadow-sm transition hover:bg-white"
              >
                <Share2 className="h-4 w-4" />
                
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {renderCommentCards({
            customer: survey.customerComment,
            staff: survey.staffComment,
            environment: survey.workEnvironmentComment,
            etc: survey.etcComment,
          })}
        </section>

        {galleryItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">投稿画像</h2>
              <p className="text-xs text-slate-500">左右にスワイプできます</p>
            </div>
            <ImageGallery items={galleryItems} hideCaption hideModalDetails />
          </section>
        )}

      </div>
    </main>
  );
}

function isCommentAvailable(text?: string | null) {
  return Boolean(text && text.trim().length > 0);
}

function renderCommentCards(comments: {
  customer?: string | null;
  staff?: string | null;
  environment?: string | null;
  etc?: string | null;
}) {
  const entries = [
    { key: "customer", title: "客層について", body: comments.customer },
    { key: "staff", title: "スタッフについて", body: comments.staff },
    { key: "environment", title: "環境について", body: comments.environment },
    { key: "etc", title: "その他", body: comments.etc },
  ].filter((entry) => isCommentAvailable(entry.body));

  if (entries.length === 1) {
    return <SurveyCommentCard body={entries[0].body} hideTitle />;
  }

  return entries.map((entry) => (
    <SurveyCommentCard key={entry.key} title={entry.title} body={entry.body} />
  ));
}

function SurveyCommentCard({
  title,
  body,
  hideTitle = false,
}: {
  title?: string;
  body?: string | null;
  hideTitle?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white/95 p-5 shadow-sm space-y-2">
      {hideTitle ? null : <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
      <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{body || "コメントなし"}</p>
    </div>
  );
}
