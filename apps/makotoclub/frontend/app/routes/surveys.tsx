import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "../components/ui/button";
import { fetchSurveys } from "../lib/surveys.server";
import { getApiBaseUrl } from "../config.server";
import type { SurveySummary } from "../types/survey";

type LoaderData = {
  surveys: SurveySummary[];
  total: number;
  page: number;
  limit: number;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "10");
  const sort = url.searchParams.get("sort") || "newest";

  let surveys: SurveySummary[] = [];
  let total = 0;
  try {
    const res = await fetchSurveys({ API_BASE_URL: apiBaseUrl }, { page, limit, sort });
    surveys = res.items;
    total = res.total;
  } catch (error) {
    console.error("Failed to load surveys", error);
  }

  return Response.json<LoaderData>({ surveys, total, page, limit });
}

export default function Surveys() {
  const { surveys } = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-slate-500 font-semibold">Surveys</p>
          <h1 className="text-2xl font-bold text-slate-900">アンケート一覧</h1>
        </div>
        <Button asChild>
          <a href="/surveys/new">アンケートを投稿</a>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <article
            key={survey.id}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2"
          >
            <div className="text-sm text-slate-500">
              {survey.storePrefecture}
              {survey.storeArea ? ` / ${survey.storeArea}` : ""}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {survey.storeName}
              {survey.storeBranch ? ` ${survey.storeBranch}` : ""}
            </h2>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span>評価: {survey.rating?.toFixed?.(1) ?? "-"}</span>
              <span>女子給: {survey.averageEarning} 万円</span>
            </div>
            <p className="text-sm text-slate-700 line-clamp-3">
              {survey.customerComment || survey.workEnvironmentComment || "コメントなし"}
            </p>
            <Button variant="ghost" size="sm" asChild>
              <a href={`/surveys/${survey.id}`}>詳しく見る</a>
            </Button>
          </article>
        ))}
      </div>
    </main>
  );
}
