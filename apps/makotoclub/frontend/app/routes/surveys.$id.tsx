import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { getApiBaseUrl } from "../config.server";
import { fetchSurveyDetail } from "../lib/surveys.server";
import type { SurveyDetail } from "../types/survey";

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

  return Response.json<LoaderData>({ survey });
}

export default function SurveyDetailPage() {
  const { survey } = useLoaderData<typeof loader>();

  if (!survey) {
    return (
      <main className="container mx-auto px-4 py-12">
        <p className="text-slate-600">アンケート情報を取得できませんでした。</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-slate-500">
          {survey.storePrefecture}
          {survey.storeArea ? ` / ${survey.storeArea}` : ""}
        </p>
        <h1 className="text-3xl font-bold text-slate-900">
          {survey.storeName}
          {survey.storeBranch ? ` ${survey.storeBranch}` : ""}
        </h1>
        <div className="flex flex-wrap gap-3 text-sm text-slate-700">
          <span>訪問時期: {survey.visitedPeriod}</span>
          <span>評価: {survey.rating?.toFixed?.(1) ?? "-"}</span>
          <span>女子給: {survey.averageEarning} 万円</span>
          <span>待機時間: {survey.waitTimeHours} 時間</span>
        </div>
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">お客さんの質</h2>
          <p className="text-sm text-slate-700">
            {survey.customerComment || "コメントなし"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">スタッフ・環境</h2>
          <p className="text-sm text-slate-700">
            {survey.workEnvironmentComment || "コメントなし"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2">
          <h2 className="text-lg font-semibold text-slate-900">バック・その他</h2>
          <p className="text-sm text-slate-700">{survey.castBack || "コメントなし"}</p>
          <p className="text-sm text-slate-700">{survey.etcComment || ""}</p>
        </div>
      </section>
    </main>
  );
}
