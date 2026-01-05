import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { getApiBaseUrl } from "../config.server";
import { fetchSurveyDetail } from "../lib/surveys.server";
import type { SurveyDetail } from "../types/survey";
import { RatingStars } from "../components/ui/rating-stars";
import { HelpIcon } from "../components/ui/help-icon";
import { BreadcrumbLabelSetter } from "../components/common/breadcrumb-label-setter";
import { Button } from "../components/ui/button";
import { ImageGallery } from "../components/ui/image-gallery";
import type { ImageGalleryItem } from "../components/ui/image-gallery";
import {
  AgeIcon,
  AverageEarningIcon,
  SpecIcon,
  WaitTimeIcon,
} from "../components/ui/survey-metric-icons";
import { formatDecimal1 } from "../lib/number-format";

type LoaderData = {
  survey: SurveyDetail | null;
};

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const id = params.id!;

  let survey: SurveyDetail | null = null;
  try {
    survey = await fetchSurveyDetail({ API_BASE_URL: apiBaseUrl }, id);
  } catch (error) {
    console.error("Failed to load survey detail", error);
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
  const visitedPeriodLabel = formatVisitedPeriod(survey.visitedPeriod);
  const shareTitle = `${survey.storeName}${survey.storeBranch ? ` ${survey.storeBranch}` : ""}`;

  const handleShare = async () => {
    const url = window.location.href;
    const data = {
      title: `${shareTitle}のアンケート`,
      text: "マコトクラブの匿名店舗アンケート",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch {
        // 共有をキャンセルした場合は何もしない
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      window.alert("リンクをコピーしました。");
    } catch {
      window.alert("共有に失敗しました。");
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <BreadcrumbLabelSetter
        label={survey.storeName}
        branchName={survey.storeBranch}
        storeId={survey.storeId}
      />
      <div className="rounded-[24px] border border-pink-100 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <p className="text-sm text-slate-500">
                {survey.storePrefecture}
                {survey.storeIndustry ? ` / ${survey.storeIndustry}` : ""}
              </p>
              <p className="text-xs text-slate-400">{visitedPeriodLabel}</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-3xl font-bold text-slate-900">
                {survey.storeName}
                {survey.storeBranch ? ` ${survey.storeBranch}` : ""}
              </h1>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700 shadow-sm transition hover:bg-pink-100"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M15 8a3 3 0 1 0-2.83-4H12a3 3 0 0 0 0 6h.17A3 3 0 0 0 15 8Z" />
                  <path d="M6 14a3 3 0 1 0 2.83 4H9a3 3 0 0 0 0-6h-.17A3 3 0 0 0 6 14Z" />
                  <path d="M18 18a3 3 0 1 0-2.83-4H15a3 3 0 0 0 0 6h.17A3 3 0 0 0 18 18Z" />
                  <path d="M13.2 8.8 8.8 13.2" />
                  <path d="M15.2 15.2 10.8 10.8" />
                </svg>
                共有
              </button>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">満足度</p>
                  <p className="text-3xl font-bold text-pink-700">
                    {(survey.rating ?? 0).toFixed(1)}
                  </p>
                </div>
                <RatingStars value={survey.rating ?? 0} size="lg" />
              </div>
            </div>
            <div className="rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-sm grid grid-cols-2 gap-3">
              <div className="relative rounded-xl border border-pink-100 bg-pink-50 px-3 py-2">
                <HelpIcon
                  containerClassName="absolute right-2 top-2"
                  label={`「アベレージ」の略。\n1日の稼ぎの平均を指す業界用語です。\n\n例)\nアベ10 → 平均で1日10万円の稼ぎ`}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <AverageEarningIcon className="h-5 w-5 text-white" />
                    <span className="font-semibold">アベ</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900 md:text-2xl">
                    {survey.averageEarning}
                    <span className="ml-1 text-sm font-semibold text-slate-500">万円</span>
                  </div>
                </div>
              </div>
              <div className="relative rounded-xl border border-pink-100 bg-pink-50 px-3 py-2">
                <HelpIcon
                  containerClassName="absolute right-2 top-2"
                  label="このアンケート記入者の1日の仕事で待機した平均時間。"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <WaitTimeIcon className="h-5 w-5 text-pink-600" />
                    <span className="font-semibold">待機</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900 md:text-2xl">
                    {formatDecimal1(survey.waitTimeHours)}
                    <span className="ml-1 text-sm font-semibold text-slate-500">時間</span>
                  </div>
                </div>
              </div>
              <div className="relative rounded-xl border border-slate-100 bg-white px-3 py-2">
                <HelpIcon
                  containerClassName="absolute right-2 top-2"
                  label="このアンケート記入者の年齢。"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <AgeIcon className="h-5 w-5 text-pink-600" />
                    <span className="font-semibold">年齢</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-800 md:text-2xl">
                    {survey.age}
                    <span className="ml-1 text-sm font-semibold text-slate-500">歳</span>
                  </div>
                </div>
              </div>
              <div className="relative rounded-xl border border-slate-100 bg-white px-3 py-2">
                <HelpIcon
                  containerClassName="absolute right-2 top-2"
                  label={`「スペック」の略。\n身長cm - 体重kg の数値を指す業界用語。\n\n例)\n155cm / 49kg の場合\n155 - 49 = スペ106`}
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <SpecIcon className="h-5 w-5 text-pink-600" />
                    <span className="font-semibold">スペ</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-800 md:text-2xl">
                    {survey.specScore}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <CommentCard title="客層について" body={survey.customerComment} />
          <CommentCard title="スタッフについて" body={survey.staffComment} />
          <CommentCard title="環境について" body={survey.workEnvironmentComment} />
          <CommentCard title="その他" body={survey.etcComment} />
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

        <div className="flex justify-end">
          <Button variant="secondary" asChild className="shadow-sm shadow-pink-200">
            <a href={`/stores/${survey.storeId}`}>店舗詳細へ戻る</a>
          </Button>
        </div>
      </div>
    </main>
  );
}

function formatVisitedPeriod(value: string) {
  const match = /^(\d{4})-(\d{1,2})$/.exec(value);
  if (!match) return value;
  const month = Number.parseInt(match[2], 10);
  return `${match[1]}年${month}月`;
}

function buildLimitedComment(parts: Array<string | null | undefined>, limit: number) {
  const cleaned = parts
    .map((text) => (text ?? "").trim())
    .filter((text) => text.length > 0);
  if (cleaned.length === 0) return "";
  let combined = "";
  for (const text of cleaned) {
    const next = combined ? `${combined}\n${text}` : text;
    if (next.length > limit) {
      return combined || text;
    }
    combined = next;
  }
  return combined;
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-pink-50 px-3 py-1 font-semibold text-slate-800 border border-pink-100">
      {label}: {value}
    </span>
  );
}

function CommentCard({ title, body }: { title: string; body?: string | null }) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white/95 p-5 shadow-sm space-y-2">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{body || "コメントなし"}</p>
    </div>
  );
}
