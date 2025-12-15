import { type LoaderFunctionArgs, useLoaderData } from "react-router";
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
  stores: StoreSummary[];
  surveys: SurveySummary[];
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
    <main className="space-y-12">
      <Hero />
      <div className="mx-auto max-w-5xl space-y-12 px-4">
        <SearchSection />
        <SurveysSection surveys={surveys} />
        <StoresSection stores={stores} />
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-pink-100 bg-gradient-to-br from-white via-pink-50 to-violet-50 px-4 py-12 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
      <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-pink-200/40 blur-3xl" />
      <div className="absolute right-0 -bottom-10 h-64 w-64 rounded-full bg-purple-200/40 blur-3xl" />
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-2 md:px-4">
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-pink-700 shadow-sm">
          テスト
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
            みんなのリアルな声で、<br />お店探しをアップデート。
          </h1>
          <p className="text-base text-slate-700 md:text-lg">
            最新の口コミと店舗情報をまとめてチェック。気になるお店はすぐに詳細へ。
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="lg" asChild>
            <a href="/stores">店舗を探す</a>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <a href="/surveys/new">アンケートを投稿</a>
          </Button>
        </div>
      </div>
    </section>
  );
}

function SearchSection() {
  return (
    <section className="card-surface space-y-5 rounded-3xl border border-pink-100/80 p-6">
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase text-slate-500">Search</p>
        <h2 className="text-xl font-semibold text-slate-900">店舗を検索する</h2>
        <p className="text-sm text-slate-600">
          店名・エリア・業種を入力するか、プリセットから絞り込んでください。
        </p>
      </header>
      <form method="get" action="/stores" className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-3 space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="name">
            キーワード
          </label>
          <Input id="name" name="name" placeholder="店名・業種で検索" aria-label="キーワード検索" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-800" htmlFor="prefecture">
            都道府県
          </label>
          <Select id="prefecture" name="prefecture" defaultValue="">
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
          <Select id="industry" name="industry" defaultValue="">
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
          <Select id="genre" name="genre" defaultValue="">
            <option value="">指定なし</option>
            {GENRE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </div>
        <div className="md:col-span-3 flex items-center justify-end gap-3">
          <Button variant="secondary" asChild>
            <a href="/stores">条件をクリア</a>
          </Button>
          <Button type="submit">検索する</Button>
        </div>
      </form>
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
