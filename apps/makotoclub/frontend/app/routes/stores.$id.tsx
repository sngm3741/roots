import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "../components/ui/button";
import { fetchStoreDetail } from "../lib/stores.server";
import { getApiBaseUrl } from "../config.server";
import type { StoreDetail } from "../types/store";

type LoaderData = {
  store: StoreDetail | null;
};

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const storeId = params.id!;

  let store: StoreDetail | null = null;
  try {
    store = await fetchStoreDetail({ API_BASE_URL: apiBaseUrl }, storeId);
  } catch (error) {
    console.error("Failed to load store detail", error);
  }

  return Response.json<LoaderData>({ store });
}

export default function StoreDetailPage() {
  const { store } = useLoaderData<typeof loader>();

  if (!store) {
    return (
      <main className="container mx-auto px-4 py-12">
        <p className="text-slate-600">店舗情報を取得できませんでした。</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-slate-500">
            {store.prefecture}
            {store.area ? ` / ${store.area}` : ""}
          </p>
          <h1 className="text-3xl font-bold text-slate-900">
            {store.storeName}
            {store.branchName ? ` ${store.branchName}` : ""}
          </h1>
          <div className="flex flex-wrap gap-3 text-sm text-slate-700">
            <span>業種: {store.category}</span>
            {store.genre && <span>ジャンル: {store.genre}</span>}
            {store.unitPrice && <span>女子給: {store.unitPrice}</span>}
          </div>
        </div>
        <Button asChild variant="secondary">
          <a href="/surveys/new">アンケートを投稿</a>
        </Button>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">概要</h2>
        <div className="text-sm text-slate-700 space-y-1">
          <p>総評: {store.averageRating?.toFixed?.(1) ?? "-"}</p>
          <p>女子給平均: {store.averageEarningLabel ?? "-"}</p>
          <p>待機時間: {store.waitTimeLabel ?? "-"}</p>
          {store.businessHours && (
            <p>
              営業時間: {store.businessHours.open} - {store.businessHours.close}
            </p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">最近のアンケート</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {store.surveys?.length ? (
            store.surveys.map((survey) => (
              <article
                key={survey.id}
                className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>{survey.visitedPeriod}</span>
                  <span>評価: {survey.rating?.toFixed?.(1) ?? "-"}</span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-3">
                  {survey.customerComment || survey.workEnvironmentComment || "コメントなし"}
                </p>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/surveys/${survey.id}`}>詳しく読む</a>
                </Button>
              </article>
            ))
          ) : (
            <p className="text-sm text-slate-600">アンケートがありません。</p>
          )}
        </div>
      </section>
    </main>
  );
}
