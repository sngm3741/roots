import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "../components/ui/button";
import { fetchStores } from "../lib/stores.server";
import { getApiBaseUrl } from "../config.server";
import type { StoreSummary } from "../types/store";

type LoaderData = {
  stores: StoreSummary[];
  total: number;
  page: number;
  limit: number;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "10");

  let stores: StoreSummary[] = [];
  let total = 0;
  try {
    const res = await fetchStores(
      { API_BASE_URL: apiBaseUrl },
      {
        page,
        limit,
        prefecture: url.searchParams.get("prefecture") || undefined,
        area: url.searchParams.get("area") || undefined,
        industry: url.searchParams.get("industry") || undefined,
        genre: url.searchParams.get("genre") || undefined,
        name: url.searchParams.get("name") || undefined,
        sort: url.searchParams.get("sort") || undefined,
      },
    );
    stores = res.items;
    total = res.total;
  } catch (error) {
    console.error("Failed to load stores", error);
  }

  return Response.json<LoaderData>({ stores, total, page, limit });
}

export default function Stores() {
  const { stores } = useLoaderData<typeof loader>();

  return (
    <main className="container mx-auto px-4 py-12 space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-slate-500 font-semibold">Stores</p>
          <h1 className="text-2xl font-bold text-slate-900">店舗一覧</h1>
        </div>
        <Button asChild variant="secondary">
          <a href="/surveys/new">アンケートを投稿</a>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <article
            key={store.id}
            className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm space-y-2"
          >
            <div className="text-sm text-slate-500">
              {store.prefecture}
              {store.area ? ` / ${store.area}` : ""}
            </div>
            <h2 className="text-lg font-semibold text-slate-900">
              {store.storeName}
              {store.branchName ? ` ${store.branchName}` : ""}
            </h2>
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
    </main>
  );
}
