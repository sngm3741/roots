import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "../components/ui/button";
import { fetchStores } from "../lib/stores.server";
import { fetchSurveys } from "../lib/surveys.server";
import { getApiBaseUrl } from "../config.server";
import type { StoreSummary } from "../types/store";
import type { SurveySummary } from "../types/survey";

type LoaderData = {
  apiBaseUrl: string;
  stores: StoreSummary[];
  surveys: SurveySummary[];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const url = new URL(request.url);
  const controller = new AbortController();
  request.signal.addEventListener("abort", () => controller.abort());

  let stores: StoreSummary[] = [];
  let surveys: SurveySummary[] = [];

  try {
    const [surveysRes, storesRes] = await Promise.all([
      fetchSurveys({ API_BASE_URL: apiBaseUrl }, { sort: "newest", limit: 3 }),
      fetchStores({ API_BASE_URL: apiBaseUrl }, { limit: 3 }),
    ]);
    stores = storesRes.items;
    surveys = surveysRes.items;
  } catch (error) {
    console.error("Failed to fetch data for index loader", error);
    // API 未起動時でもページが表示されるように握りつぶす
    stores = [];
    surveys = [];
  }

  return Response.json<LoaderData>({
    apiBaseUrl,
    stores,
    surveys,
  });
}

export default function Index() {
  const { stores, surveys } = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto px-4 py-12 space-y-12">
      <section className="rounded-3xl border border-slate-200 bg-white/80 shadow-lg p-8 space-y-4">
        <p className="text-[11px] font-semibold tracking-[0.25em] text-slate-600 uppercase">
          #匿名店舗アンケート
        </p>
        <h1 className="text-3xl font-bold text-pink-600 leading-tight">
          みんなのリアルな声から、自分にぴったりのお店を。
        </h1>
        <p className="text-sm text-slate-700">
          アンケートの投稿で <span className="font-bold text-pink-600">PayPay 1000円 プレゼント🎁</span>
        </p>
        <div className="flex gap-3 flex-wrap">
          <Button asChild>
            <a href="/surveys/new">アンケートを投稿する</a>
          </Button>
          <Button variant="secondary" asChild>
            <a href="/surveys">アンケートを見る</a>
          </Button>
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">新着アンケート</h2>
          <a className="text-sm text-blue-600 font-semibold hover:underline" href="/surveys">
            すべて見る
          </a>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {surveys.map((survey) => (
            <article
              key={survey.id}
              className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2"
            >
              <div className="text-sm text-slate-500">
                {survey.storePrefecture}
                {survey.storeArea ? ` / ${survey.storeArea}` : ""}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {survey.storeName}
                {survey.storeBranch ? ` ${survey.storeBranch}` : ""}
              </h3>
              <p className="text-sm text-slate-700 line-clamp-3">
                {survey.customerComment || survey.workEnvironmentComment || "コメントなし"}
              </p>
              <div className="text-xs text-slate-500">
                口コミ投稿日: {new Date(survey.createdAt).toLocaleDateString("ja-JP")}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <header className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">新着店舗情報</h2>
          <a className="text-sm text-blue-600 font-semibold hover:underline" href="/stores">
            すべて見る
          </a>
        </header>
        <div className="grid gap-4 md:grid-cols-3">
          {stores.map((store) => (
            <article
              key={store.id}
              className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2"
            >
              <div className="text-sm text-slate-500">
                {store.prefecture}
                {store.area ? ` / ${store.area}` : ""}
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                {store.storeName}
                {store.branchName ? ` ${store.branchName}` : ""}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span>総評: {store.averageRating?.toFixed?.(1) ?? "-"}</span>
                <span>女子給: {store.averageEarningLabel ?? "-"}</span>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <a href={`/stores/${store.id}`}>詳しく見る</a>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
