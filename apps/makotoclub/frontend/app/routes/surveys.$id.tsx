import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { getApiBaseUrl } from "../config.server";
import { fetchSurveyDetail } from "../lib/surveys.server";
import type { SurveyDetail } from "../types/survey";
import { RatingStars } from "../components/ui/rating-stars";
import { BreadcrumbLabelSetter } from "../components/common/breadcrumb-label-setter";
import { Button } from "../components/ui/button";

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

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <BreadcrumbLabelSetter label={survey.storeName} branchName={survey.storeBranch} />
      <div className="rounded-[24px] border border-pink-100 bg-white/90 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">
              {survey.storePrefecture}
              {survey.storeArea ? ` / ${survey.storeArea}` : ""}
            </p>
            <h1 className="text-3xl font-bold text-slate-900">
              {survey.storeName}
              {survey.storeBranch ? ` ${survey.storeBranch}` : ""}
            </h1>
            <div className="flex flex-wrap gap-2 text-xs text-slate-600">
              <InfoPill label="訪問時期" value={survey.visitedPeriod} />
              <InfoPill label="稼ぎ" value={`${survey.averageEarning} 万円`} />
              <InfoPill label="待機" value={`${survey.waitTimeHours} 時間`} />
              <InfoPill label="年齢" value={`${survey.age}`} />
              <InfoPill label="スペ" value={`${survey.specScore}`} />
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-3 border border-pink-100">
            <div className="text-center">
              <p className="text-xs font-semibold text-slate-700">評価</p>
              <p className="text-2xl font-bold text-pink-700">{(survey.rating ?? 0).toFixed(1)}</p>
            </div>
            <RatingStars value={survey.rating ?? 0} />
          </div>
        </div>

        <section className="grid gap-4 md:grid-cols-2">
          <CommentCard title="お客さんの質" body={survey.customerComment} />
          <CommentCard title="スタッフ" body={survey.staffComment} />
          <CommentCard title="職場環境" body={survey.workEnvironmentComment} />
          <CommentCard title="その他" body={survey.etcComment} />
        </section>

        <div className="flex justify-end">
          <Button variant="secondary" asChild className="shadow-sm shadow-pink-200">
            <a href={`/stores/${survey.storeId}`}>店舗詳細へ戻る</a>
          </Button>
        </div>
      </div>
    </main>
  );
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
      <p className="text-sm text-slate-700">{body || "コメントなし"}</p>
    </div>
  );
}
