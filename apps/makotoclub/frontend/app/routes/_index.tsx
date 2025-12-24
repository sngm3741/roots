import { useEffect, useState } from "react";
import { type LoaderFunctionArgs, Form, useLoaderData } from "react-router";
import { Button } from "../components/ui/button";
import { fetchStores } from "../lib/stores.server";
import { fetchSurveys } from "../lib/surveys.server";
import { getApiBaseUrl } from "../config.server";
import type { StoreSummary } from "../types/store";
import type { SurveySummary } from "../types/survey";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { StoreCard } from "../components/cards/store-card";
import { SurveyCard } from "../components/cards/survey-card";

type LoaderData = {
  apiBaseUrl: string;
  target: "surveys" | "stores";
  filters: Record<string, string>;
  hasFilters: boolean;
  sort: string;
  page: number;
  limit: number;
  total: number;
  stores: StoreSummary[];
  surveys: SurveySummary[];
  surveysTotal: number;
};

const PREFS = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const INDUSTRY_OPTIONS = ["デリヘル", "ホテヘル", "箱ヘル", "ソープ", "DC", "風エス", "メンエス"];

const GENRE_OPTIONS = ["熟女", "学園系", "スタンダード", "格安店", "高級店"];

export async function loader({ context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const url = new URL(request.url);
  const target = url.searchParams.get("target") === "stores" ? "stores" : "surveys";
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "5");
  const sortParam = url.searchParams.get("sort") || "";
  const name = url.searchParams.get("name")?.trim() || undefined;
  const prefecture = url.searchParams.get("prefecture")?.trim() || undefined;
  const industry = url.searchParams.get("industry")?.trim() || undefined;
  const genre = url.searchParams.get("genre")?.trim() || undefined;
  const spec = parseNumberParam(url.searchParams.get("spec"));
  const age = parseNumberParam(url.searchParams.get("age"));
  const hasFilters = Boolean(
    name || prefecture || industry || genre || spec !== null || age !== null,
  );
  const sort = sortParam || (hasFilters ? "rating" : "newest");
  const filters = Object.fromEntries(url.searchParams.entries());

  let stores: StoreSummary[] = [];
  let surveys: SurveySummary[] = [];
  let total = 0;
  let surveysTotal = 0;

  try {
    const [surveysCountRes, targetRes] = await Promise.all([
      fetchSurveys({ API_BASE_URL: apiBaseUrl }, { sort: "newest", limit: 1 }),
      target === "surveys"
        ? fetchSurveys(
            { API_BASE_URL: apiBaseUrl },
            {
              page,
              limit,
              sort,
              name,
              prefecture,
              industry,
              genre,
              spec: spec ?? undefined,
              age: age ?? undefined,
            },
          )
        : fetchStores(
            { API_BASE_URL: apiBaseUrl },
            {
              page,
              limit,
              sort,
              name,
              prefecture,
              industry,
              genre,
              spec: spec ?? undefined,
              age: age ?? undefined,
            },
          ),
    ]);
    surveysTotal = surveysCountRes.total ?? surveysCountRes.items.length ?? 0;
    if (target === "surveys") {
      surveys = targetRes.items;
      total = targetRes.total;
    } else {
      stores = targetRes.items;
      total = targetRes.total;
    }
  } catch (error) {
    console.error("Failed to fetch data for index loader", error);
    stores = [];
    surveys = [];
    surveysTotal = 0;
    total = 0;
  }

  return Response.json({
    apiBaseUrl,
    target,
    filters,
    hasFilters,
    sort,
    page,
    limit,
    total,
    stores,
    surveys,
    surveysTotal,
  });
}

export default function Index() {
  const { stores, surveys, surveysTotal, target, filters, hasFilters, sort, page, limit, total } =
    useLoaderData() as LoaderData;

  return (
    <main className="space-y-2">
      <Hero surveysTotal={surveysTotal} />
      <div className="mx-auto max-w-5xl space-y-12 px-4">
        <div className="relative">
          <SearchGuide className="absolute left-1/2 top-0 -translate-x-1/2 translate-y-12 md:translate-y-15" />
          <div className="pt-10 md:pt-12">
            <SearchSection target={target} filters={filters} />
          </div>
        </div>
        <ResultsSection
          target={target}
          surveys={surveys}
          stores={stores}
          total={total}
          page={page}
          limit={limit}
          sort={sort}
          filters={filters}
          hasFilters={hasFilters}
        />
      </div>
    </main>
  );
}

function Hero({ surveysTotal }: { surveysTotal: number }) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const durationMs = 900;
    const target = Math.max(0, surveysTotal);
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / durationMs);
      setDisplayCount(Math.floor(target * progress));
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        setDisplayCount(target);
      }
    };

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [surveysTotal]);

  return (
    <section className="relative mx-auto max-w-5xl overflow-hidden rounded-[28px] py-20 text-center">
      <div className="relative flex flex-col items-center justify-center gap-6">
        <img
          src="/logo.jpeg"
          alt="マコトクラブ"
          className="h-20 w-20 rounded-2xl object-cover md:h-24 md:w-24"
        />
        <div className="space-y-2 text-center">
          <h1 className="font-bold text-4xl text-pink-600 md:text-4xl">#マコトクラブ</h1>
          <p className="font-bold text-lg text-slate-500 md:text-base">みんなのリアルな声で、</p>
          <p className="font-bold text-lg text-slate-500 md:text-base">自分にピッタリのお店を。</p>
        </div>
      </div>
      <div className="mt-10 flex justify-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 text-emerald-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 11h6" />
            <path d="M9 15h4" />
            <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
            <path d="M14 3v4h4" />
            <path d="M8 7h4" />
            <path d="M9 18l2 2 4-4" />
          </svg>
          {/* NOTE: とりあえずはったりでアンケート数 の2倍に...(^ω^;) */}
          掲載数 {(displayCount*2).toLocaleString("ja-JP")} +
        </div>
      </div>
    </section>
  );
}

function SearchGuide({ className = "" }: { className?: string }) {
  return (
    <div className={`pointer-events-none relative mx-auto flex w-full max-w-5xl flex-col items-center text-pink-600 ${className}`}>
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

function SearchSection({
  target,
  filters,
}: {
  target: "surveys" | "stores";
  filters: Record<string, string>;
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuLabel, setMenuLabel] = useState(target === "stores" ? "店舗情報" : "アンケート");
  const [menuClosing, setMenuClosing] = useState(false);
  const closeMenu = () => {
    setMenuClosing(true);
    window.setTimeout(() => {
      setMenuOpen(false);
      setMenuClosing(false);
    }, 200);
  };
  useEffect(() => {
    setMenuLabel(target === "stores" ? "店舗情報" : "アンケート");
  }, [target]);
  const targetValue = menuLabel === "店舗情報" ? "stores" : "surveys";
  const extraFilters = (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="md:col-span-3 space-y-2">
        <label className="text-sm font-semibold text-slate-800" htmlFor="name">
          キーワード
        </label>
        <Input
          id="name"
          name="name"
          placeholder="店名・業種で検索"
          aria-label="キーワード検索"
          defaultValue={filters.name || ""}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800" htmlFor="prefecture">
          都道府県
        </label>
        <Select id="prefecture" name="prefecture" defaultValue={filters.prefecture || ""}>
          <option value="">指定なし</option>
          {PREFS.map((pref) => (
            <option key={pref} value={pref}>
              {pref}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800" htmlFor="industry">
          業種
        </label>
        <Select id="industry" name="industry" defaultValue={filters.industry || ""}>
          <option value="">指定なし</option>
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-semibold text-slate-800" htmlFor="genre">
          ジャンル
        </label>
        <Select id="genre" name="genre" defaultValue={filters.genre || ""}>
          <option value="">指定なし</option>
          {GENRE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );

  return (
    <section className="rounded-[32px] border border-slate-200/80 bg-slate-50/70 px-1 pb-1 pt-2">
      <div className="relative flex min-h-[36px] items-center justify-between pb-1">
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
        <div className="relative">
          <button
            type="button"
            className="grid w-32 grid-cols-[20px_auto] items-center justify-center gap-1 rounded-full px-2 text-sm font-semibold text-slate-700"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="flex items-center justify-center">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path
                d="M8.86464 13.2068L5.96851 16.103L8.86464 19M18.0334 16.103H5.9668"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M15.1371 10.7931L18.0332 7.89701L15.1371 5M5.96875 7.89683H18.0354"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              </svg>
            </span>
            <span>{menuLabel}</span>
          </button>
          <div
            role="menu"
            className={`absolute right-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xl shadow-black/5 transition-all duration-200 ease-out ${
              menuOpen ? "scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
            } ${menuClosing ? "scale-95 opacity-0" : ""}`}
            aria-hidden={!menuOpen}
          >
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              role="menuitem"
              onClick={() => {
                setMenuLabel("アンケート");
                closeMenu();
              }}
            >
              <span>アンケート</span>
              {menuLabel === "アンケート" && (
                <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              role="menuitem"
              onClick={() => {
                setMenuLabel("店舗情報");
                closeMenu();
              }}
            >
              <span>店舗情報</span>
              {menuLabel === "店舗情報" && (
                <span className="ml-auto inline-flex h-5 w-5 items-center justify-center rounded-full bg-pink-100 text-pink-600">
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
      <Form method="get" action="/" preventScrollReset className="space-y-5">
        <input type="hidden" name="target" value={targetValue} />
        <div
          className={`pointer-events-none overflow-hidden transition-all duration-300 ease-out ${
            filtersOpen
              ? "mb-4 max-h-[520px] translate-y-0 scale-100 opacity-100"
              : "mb-0 max-h-0 -translate-y-2 scale-95 opacity-0"
          }`}
          aria-hidden={!filtersOpen}
        >
          <div className="pointer-events-auto card-surface !shadow-none space-y-5 rounded-3xl border border-pink-100/80 bg-white/95 p-5 md:p-6">
            {extraFilters}
          </div>
        </div>
        <div className="card-surface !shadow-none space-y-5 rounded-3xl border border-pink-100/80 p-5 md:p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800" htmlFor="spec">
                スペック
              </label>
              <Input
                id="spec"
                name="spec"
                type="number"
                placeholder="例: 80"
                min={0}
                defaultValue={filters.spec || ""}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-800" htmlFor="age">
                年齢
              </label>
              <Input
                id="age"
                name="age"
                type="number"
                placeholder="例: 22"
                min={18}
                defaultValue={filters.age || ""}
              />
            </div>
            <div className="md:col-span-3 flex items-center justify-end gap-3">
              <Button variant="secondary" asChild>
                <a href={`/?target=${targetValue}`}>条件をクリア</a>
              </Button>
              <Button type="submit">検索する</Button>
            </div>
          </div>
        </div>
      </Form>
    </section>
  );
}

const SORT_OPTIONS = [
  { value: "newest", label: "新着順" },
  { value: "earning", label: "稼ぎ順" },
  { value: "rating", label: "評価順" },
];

function ResultsSection({
  target,
  surveys,
  stores,
  total,
  page,
  limit,
  sort,
  filters,
  hasFilters,
}: {
  target: "surveys" | "stores";
  surveys: SurveySummary[];
  stores: StoreSummary[];
  total: number;
  page: number;
  limit: number;
  sort: string;
  filters: Record<string, string>;
  hasFilters: boolean;
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isSurvey = target === "surveys";
  const itemsEmpty = isSurvey ? surveys.length === 0 : stores.length === 0;
  const title = isSurvey ? "アンケート" : "店舗情報";
  const headline = hasFilters ? `${title}の検索結果` : `新着${title}`;
  return (
    <section className="space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase font-semibold text-slate-500">
            {isSurvey ? "Surveys" : "Stores"}
          </p>
          <h2 className="text-xl font-semibold text-slate-900">{headline}</h2>
        </div>
        <SortBar target={target} filters={filters} sort={sort} />
      </header>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isSurvey
          ? surveys.map((survey) => <SurveyCard key={survey.id} survey={survey} />)
          : stores.map((store) => <StoreCard key={store.id} store={store} />)}
        {itemsEmpty && (
          <div className="text-sm text-slate-600">
            {isSurvey ? "条件に合うアンケートがありません。" : "条件に合う店舗情報がありません。"}
          </div>
        )}
      </div>
      <Pagination current={page} totalPages={totalPages} target={target} filters={filters} sort={sort} />
    </section>
  );
}

function SortBar({
  target,
  filters,
  sort,
}: {
  target: "surveys" | "stores";
  filters: Record<string, string>;
  sort: string;
}) {
  const { name, prefecture, industry, genre, spec, age } = filters;
  return (
    <Form
      method="get"
      action="/"
      preventScrollReset
      className="flex flex-wrap items-center gap-2 text-sm text-slate-700"
    >
      <input type="hidden" name="target" value={target} />
      {name && <input type="hidden" name="name" value={name} />}
      {prefecture && <input type="hidden" name="prefecture" value={prefecture} />}
      {industry && <input type="hidden" name="industry" value={industry} />}
      {genre && <input type="hidden" name="genre" value={genre} />}
      {spec && <input type="hidden" name="spec" value={spec} />}
      {age && <input type="hidden" name="age" value={age} />}
      {SORT_OPTIONS.map((opt) => (
        <Button
          key={opt.value}
          type="submit"
          variant={sort === opt.value ? "primary" : "ghost"}
          size="sm"
          name="sort"
          value={opt.value}
        >
          {opt.label}
        </Button>
      ))}
      <input type="hidden" name="page" value="1" />
    </Form>
  );
}

function Pagination({
  current,
  totalPages,
  target,
  filters,
  sort,
}: {
  current: number;
  totalPages: number;
  target: "surveys" | "stores";
  filters: Record<string, string>;
  sort: string;
}) {
  const prev = current > 1 ? current - 1 : null;
  const next = current < totalPages ? current + 1 : null;
  const makeHref = (page: number) => {
    const params = new URLSearchParams();
    params.set("target", target);
    params.set("page", String(page));
    if (sort) params.set("sort", sort);
    if (filters.name) params.set("name", filters.name);
    if (filters.prefecture) params.set("prefecture", filters.prefecture);
    if (filters.industry) params.set("industry", filters.industry);
    if (filters.genre) params.set("genre", filters.genre);
    if (filters.spec) params.set("spec", filters.spec);
    if (filters.age) params.set("age", filters.age);
    return `/?${params.toString()}`;
  };
  return (
    <div className="flex items-center justify-center gap-3 text-sm text-slate-700">
      <Button variant="ghost" size="sm" asChild disabled={!prev}>
        <a href={prev ? makeHref(prev) : undefined}>前へ</a>
      </Button>
      <span className="rounded-full bg-white/80 px-3 py-1 text-slate-800 shadow-sm border border-slate-100">
        {current} / {totalPages}
      </span>
      <Button variant="ghost" size="sm" asChild disabled={!next}>
        <a href={next ? makeHref(next) : undefined}>次へ</a>
      </Button>
    </div>
  );
}

function parseNumberParam(value: string | null) {
  if (value === null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
}
