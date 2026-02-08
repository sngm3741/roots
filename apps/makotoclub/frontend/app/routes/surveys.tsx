import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "../components/ui/button";
import { fetchSurveys } from "../lib/surveys.server";
import { getApiBaseUrl } from "../config.server";
import type { SurveySummary } from "../types/survey";
import { Form } from "react-router";
import { Input } from "../components/ui/input";
import { Select } from "../components/ui/select";
import { SurveyCard } from "../components/cards/survey-card";

type LoaderData = {
  surveys: SurveySummary[];
  total: number;
  page: number;
  limit: number;
  sort: string;
  filters: Record<string, string>;
};

export async function loader({ request, context }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "10");
  const spec = parseNumberParam(url.searchParams.get("spec"));
  const age = parseNumberParam(url.searchParams.get("age"));
  const sortParam = url.searchParams.get("sort") || "";
  const name = url.searchParams.get("name")?.trim() || undefined;
  const prefecture = url.searchParams.get("prefecture")?.trim() || undefined;
  const industry = url.searchParams.get("industry")?.trim() || undefined;
  const genre = url.searchParams.get("genre")?.trim() || undefined;
  const visitedPeriod = url.searchParams.get("visitedPeriod")?.trim() || undefined;
  const hasFilters = Boolean(
    name || prefecture || industry || genre || visitedPeriod || spec !== null || age !== null,
  );
  const sort = sortParam || (hasFilters ? "rating" : "newest");
  const filters = Object.fromEntries(url.searchParams.entries());

  let surveys: SurveySummary[] = [];
  let total = 0;
  try {
    const res = await fetchSurveys(
      { API_BASE_URL: apiBaseUrl },
      {
        page,
        limit,
        sort,
        name,
        prefecture,
        industry,
        genre,
        visitedPeriod,
        spec: spec ?? undefined,
        age: age ?? undefined,
      },
    );
    surveys = res.items;
    total = res.total;
  } catch (error) {
    console.error("Failed to load surveys", error);
  }

  return Response.json({ surveys, total, page, limit, sort, filters });
}

export default function Surveys() {
  const { surveys, total, page, limit, sort, filters } = useLoaderData() as LoaderData;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="space-y-8 pb-12 pt-6">
      <div className="mx-auto max-w-5xl space-y-8 px-4">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs uppercase text-slate-500 font-semibold">Surveys</p>
            <h1 className="text-2xl font-bold text-slate-900">アンケート一覧</h1>
          </div>
          <Button asChild className="shadow-sm shadow-pink-200">
            <a href="/new">アンケートを投稿</a>
          </Button>
        </header>

        <SearchForm filters={filters} />
        <SortBar sort={sort} filters={filters} />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
          {surveys.length === 0 && (
            <p className="text-sm text-slate-600">アンケートがありません。</p>
          )}
        </div>
        <Pagination current={page} totalPages={totalPages} filters={filters} />
      </div>
    </main>
  );
}

const SORT_OPTIONS = [
  { value: "newest", label: "新着順" },
  { value: "earning", label: "稼ぎ順" },
  { value: "rating", label: "満足度順" },
];

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

const INDUSTRY_OPTIONS = [
  "デリヘル",
  "ホテヘル",
  "箱ヘル",
  "ソープ",
  "DC",
  "風エス",
  "メンエス",
];

const GENRE_OPTIONS = ["熟女", "学園系", "スタンダード", "格安店", "高級店"];

function SortBar({ sort, filters }: { sort: string; filters: Record<string, string> }) {
  const { name, prefecture, industry, genre, visitedPeriod, spec, age } = filters;
  return (
    <Form
      method="get"
      preventScrollReset
      className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-700 rounded-2xl border border-pink-100/80 bg-white/80 px-4 py-3 shadow-sm"
    >
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-700">並び替え</p>
        <div className="flex flex-wrap gap-2">
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
        </div>
      </div>
      {name && <input type="hidden" name="name" value={name} />}
      {prefecture && <input type="hidden" name="prefecture" value={prefecture} />}
      {industry && <input type="hidden" name="industry" value={industry} />}
      {genre && <input type="hidden" name="genre" value={genre} />}
      {visitedPeriod && <input type="hidden" name="visitedPeriod" value={visitedPeriod} />}
      {spec && <input type="hidden" name="spec" value={spec} />}
      {age && <input type="hidden" name="age" value={age} />}
      <input type="hidden" name="page" value="1" />
    </Form>
  );
}

function Pagination({
  current,
  totalPages,
  filters,
}: {
  current: number;
  totalPages: number;
  filters: Record<string, string>;
}) {
  const prev = current > 1 ? current - 1 : null;
  const next = current < totalPages ? current + 1 : null;
  const buildHref = (page: number) => {
    const params = new URLSearchParams(filters);
    params.set("page", String(page));
    return `?${params.toString()}`;
  };
  return (
    <div className="flex items-center justify-center gap-3 text-sm text-slate-700">
      <Button variant="ghost" size="sm" asChild disabled={!prev}>
        <a href={prev ? buildHref(prev) : undefined}>前へ</a>
      </Button>
      <span className="rounded-full bg-white/80 px-3 py-1 text-slate-800 shadow-sm border border-slate-100">
        {current} / {totalPages}
      </span>
      <Button variant="ghost" size="sm" asChild disabled={!next}>
        <a href={next ? buildHref(next) : undefined}>次へ</a>
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

function SearchForm({ filters }: { filters: Record<string, string> }) {
  return (
    <Form
      method="get"
      preventScrollReset
      className="card-surface space-y-5 rounded-3xl border border-pink-100/80 p-6"
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="spec">
            スペック
          </label>
          <Input id="spec" name="spec" type="number" placeholder="例: 80" min={0} defaultValue={filters.spec || ""} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="age">
            年齢
          </label>
          <Input id="age" name="age" type="number" placeholder="例: 22" min={18} defaultValue={filters.age || ""} />
        </div>
        <div className="md:col-span-3 space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="name">
            キーワード
          </label>
          <Input
            id="name"
            name="name"
            placeholder="店名・エリア・業種で検索"
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
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="visitedPeriod">
            訪問月
          </label>
          <Input
            id="visitedPeriod"
            name="visitedPeriod"
            placeholder="2025-01"
            defaultValue={filters.visitedPeriod || ""}
          />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" asChild>
          <a href="/surveys">条件をクリア</a>
        </Button>
        <Button type="submit">検索する</Button>
      </div>
    </Form>
  );
}
