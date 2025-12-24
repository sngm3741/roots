import { useState } from "react";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "../components/ui/button";
import { fetchStores } from "../lib/stores.server";
import { fetchSurveys } from "../lib/surveys.server";
import { getApiBaseUrl } from "../config.server";
import type { StoreSummary } from "../types/store";
import type { SurveySummary } from "../types/survey";
import { Input } from "../components/ui/input";
import { StoreCard } from "../components/cards/store-card";
import { SurveyCard } from "../components/cards/survey-card";

type LoaderData = {
  apiBaseUrl: string;
  stores: StoreSummary[];
  surveys: SurveySummary[];
};

export async function loader({ context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);

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
    stores = [];
    surveys = [];
  }

  return Response.json({
    apiBaseUrl,
    stores,
    surveys,
  });
}

export default function Index() {
  const { stores, surveys } = useLoaderData() as LoaderData;

  return (
    <main className="space-y-2">
      <Hero />
      <div className="mx-auto max-w-5xl space-y-12 px-4">
        <SearchGuide />
        <SearchSection />
        <SurveysSection surveys={surveys} />
        <StoresSection stores={stores} />
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] p-6 text-center md:px-8 md:py-20">
      <div className="relative flex flex-col items-center justify-center gap-5">
        <img
          src="/logo.jpeg"
          alt="マコトクラブ"
          className="h-20 w-20 rounded-2xl object-cover md:h-24 md:w-24"
        />
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-4xl text-pink-600 md:text-4xl">#マコトクラブ</h1>
          <p className="font-bold text-lg text-slate-500 md:text-base">みんなのリアルな声で、</p>
          <p className="font-bold text-lg text-slate-500 md:text-base">あなたにピッタリのお店を。</p>
        </div>
      </div>
    </section>
  );
}

function SearchGuide() {
  return (
    <div className="pointer-events-none relative mx-auto flex w-full max-w-5xl translate-x-8 flex-col items-center text-pink-600 md:translate-x-10">
      <h2 className="text-center text-base font-semibold leading-[1.3] md:text-base rotate-4">
        スペ・年齢で絞り込み！
      </h2>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 86"
        className="mt-1 w-5"
        style={{ transform: "scaleX(-1) rotate(-2deg)" }}
        aria-hidden="true"
      >
        <path
          d="M7.56192 40.4608C8.15817 41.2839 8.82796 42.2863 8.45988 43.2339C6.25154 48.9197 6.0619 55.2592 7.2044 61.251C8.34724 67.2427 10.7693 72.9247 13.6468 78.3031C12.0242 78.3763 10.5521 77.406 8.96586 77.0572C7.37965 76.7085 5.23093 77.5014 5.29847 79.1241C5.35162 80.3988 6.71295 81.1499 7.88804 81.6471C10.6975 82.836 13.5074 84.025 16.3171 85.2139C17.2318 85.6009 18.2218 85.9958 19.1907 85.7785C20.6445 85.4523 21.4423 83.9266 22.0478 82.5652C23.2785 79.7992 24.5093 77.0328 25.74 74.2665C26.1503 73.3442 26.5677 72.392 26.595 71.3831C26.6221 70.3741 26.162 69.2825 25.2413 68.8684C24.2713 68.4323 23.0867 68.8831 22.3577 69.6576C21.6287 70.4322 21.2531 71.4649 20.8959 72.4668C20.3 74.1394 19.7039 75.8116 19.1078 77.4839C12.7369 68.3247 10.3336 56.5018 12.6231 45.5823C20.6501 50.9164 31.738 51.2159 40.0413 46.3231C42.7194 44.7449 45.154 42.6226 46.6271 39.8857C48.1005 37.1485 48.5091 33.7429 47.2473 30.9022C45.2914 26.4989 40.0112 24.5615 35.1969 24.3683C25.6364 23.9847 16.0405 29.0244 10.9298 37.1136C5.10672 26.9807 4.08367 14.2215 8.21786 3.29054C8.62916 2.20329 7.68279 0.934948 6.53541 0.749838C5.38784 0.564421 4.23455 1.2381 3.53684 2.16756C2.83909 3.09737 2.51284 4.24745 2.23416 5.37576C-0.693149 17.2316 0.395505 30.5727 7.56192 40.4608ZM14.7532 40.6965C18.936 33.1922 27.8194 28.5949 36.3617 29.5141C38.8825 29.7852 41.6788 30.7681 42.6341 33.1168C43.2485 34.6275 42.922 36.4039 42.0856 37.8039C41.2493 39.204 39.9585 40.2761 38.5992 41.177C35.0496 43.53 30.8218 44.8963 26.5633 44.874C22.3048 44.8517 18.0358 43.4096 14.7532 40.6965Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

function SearchSection() {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const searchForm = (
    <form method="get" action="/surveys" className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800" htmlFor="specMin">
          スペック
        </label>
        <Input id="specMin" name="specMin" type="number" placeholder="例: 80" min={0} />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800" htmlFor="ageMin">
          年齢
        </label>
        <Input id="ageMin" name="ageMin" type="number" placeholder="例: 22" min={18} />
      </div>
      <div className="md:col-span-3 flex items-center justify-end gap-3">
        <Button variant="secondary" asChild>
          <a href="/surveys">条件をクリア</a>
        </Button>
        <Button type="submit">検索する</Button>
      </div>
    </form>
  );

  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-slate-50/70 px-1 pb-1 pt-2 md:px-6 md:pb-2 md:pt-12">
      <div className="relative flex min-h-[36px] items-center pb-2">
        <button
          type="button"
          aria-pressed={filtersOpen}
          className="flex items-center gap-2 rounded-full px-2 text-sm font-semibold text-slate-700"
          onClick={() => setFiltersOpen((value) => !value)}
        >
          <span className={`inline-flex h-6 w-10 items-center rounded-full transition-colors ${filtersOpen ? "bg-pink-500" : "bg-slate-200"}`}>
            <span
              className={`ml-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${filtersOpen ? "translate-x-4" : "translate-x-0"}`}
            />
          </span>
          条件を追加
        </button>
      </div>
      <div
        className={`pointer-events-none overflow-hidden transition-all duration-300 ease-out ${
          filtersOpen ? "mb-4 max-h-[520px] translate-y-0 scale-100 opacity-100" : "mb-0 max-h-0 -translate-y-2 scale-95 opacity-0"
        }`}
        aria-hidden={!filtersOpen}
      >
        <div className="pointer-events-auto card-surface !shadow-none space-y-5 rounded-3xl border border-pink-100/80 bg-white/95 p-5 md:p-6">
          {searchForm}
        </div>
      </div>
      <div className="card-surface !shadow-none space-y-5 rounded-3xl border border-pink-100/80 p-5 md:p-6">
        {searchForm}
      </div>
    </section>
  );
}

function SurveysSection({ surveys }: { surveys: SurveySummary[] }) {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase font-semibold text-slate-500">Surveys</p>
          <h2 className="text-xl font-semibold text-slate-900">新着アンケート</h2>
        </div>
        <Button variant="secondary" asChild>
          <a href="/surveys">もっと見る</a>
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {surveys.map((survey) => (
          <SurveyCard key={survey.id} survey={survey} />
        ))}
        {surveys.length === 0 && (
          <div className="text-sm text-slate-600">まだアンケートがありません。</div>
        )}
      </div>
    </section>
  );
}

function StoresSection({ stores }: { stores: StoreSummary[] }) {
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase font-semibold text-slate-500">Stores</p>
          <h2 className="text-xl font-semibold text-slate-900">新着店舗</h2>
        </div>
        <Button variant="secondary" asChild>
          <a href="/stores">もっと見る</a>
        </Button>
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
        {stores.length === 0 && (
          <div className="text-sm text-slate-600">まだ店舗がありません。</div>
        )}
      </div>
    </section>
  );
}
