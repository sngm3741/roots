import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { Store } from "../../types";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const STORE_LIST_FILTERS_STORAGE_KEY = "makotoclub_admin_store_list_filters_v1";
const DEFAULT_SORT_OPTIONS = ["createdAt-desc"];

const normalizeText = (value: string | undefined) => (value ?? "").trim().toLowerCase();

const compareText = (a: string | undefined, b: string | undefined) =>
  normalizeText(a).localeCompare(normalizeText(b), "ja");

const compareNumber = (a: number | undefined, b: number | undefined) => (a ?? 0) - (b ?? 0);

const compareDateAsc = (a: string | undefined, b: string | undefined) =>
  Date.parse(a ?? "") - Date.parse(b ?? "");

const compareDateDesc = (a: string | undefined, b: string | undefined) =>
  Date.parse(b ?? "") - Date.parse(a ?? "");

const hasText = (value: string | undefined) => normalizeText(value).length > 0;

const hasRecruitmentUrl = (store: Store) =>
  Array.isArray(store.recruitmentUrls) &&
  store.recruitmentUrls.some((url) => typeof url === "string" && url.trim().length > 0);

const hasBusinessHours = (store: Store) => hasText(store.businessHours?.open);

const baseSorter = (a: Store, b: Store) => compareDateDesc(a.createdAt, b.createdAt);

type SortDef = {
  value: string;
  label: string;
  compare?: (a: Store, b: Store) => number;
  filter?: (store: Store) => boolean;
};

const SORT_DEFINITIONS: SortDef[] = [
  { value: "createdAt-desc", label: "新着順", compare: (a, b) => compareDateDesc(a.createdAt, b.createdAt) },
  { value: "createdAt-asc", label: "古い順", compare: (a, b) => compareDateAsc(a.createdAt, b.createdAt) },
  { value: "storeName-asc", label: "店舗名（昇順）", compare: (a, b) => compareText(a.storeName, b.storeName) },
  { value: "storeName-desc", label: "店舗名（降順）", compare: (a, b) => compareText(b.storeName, a.storeName) },
  { value: "prefecture-asc", label: "都道府県（昇順）", compare: (a, b) => compareText(a.prefecture, b.prefecture) },
  { value: "prefecture-desc", label: "都道府県（降順）", compare: (a, b) => compareText(b.prefecture, a.prefecture) },
  { value: "area-asc", label: "エリア（昇順）", compare: (a, b) => compareText(a.area, b.area) },
  { value: "area-desc", label: "エリア（降順）", compare: (a, b) => compareText(b.area, a.area) },
  { value: "category-asc", label: "業種（昇順）", compare: (a, b) => compareText(a.category, b.category) },
  { value: "category-desc", label: "業種（降順）", compare: (a, b) => compareText(b.category, a.category) },
  { value: "genre-asc", label: "ジャンル（昇順）", compare: (a, b) => compareText(a.genre, b.genre) },
  { value: "genre-desc", label: "ジャンル（降順）", compare: (a, b) => compareText(b.genre, a.genre) },
  { value: "averageRating-desc", label: "満足度が高い順", compare: (a, b) => compareNumber(b.averageRating, a.averageRating) },
  { value: "averageRating-asc", label: "満足度が低い順", compare: (a, b) => compareNumber(a.averageRating, b.averageRating) },
  { value: "surveyCount-desc", label: "アンケート件数が多い順", compare: (a, b) => compareNumber(b.surveyCount, a.surveyCount) },
  { value: "surveyCount-asc", label: "アンケート件数が少ない順", compare: (a, b) => compareNumber(a.surveyCount, b.surveyCount) },
  { value: "helpfulCount-desc", label: "役立ち度が高い順", compare: (a, b) => compareNumber(b.helpfulCount, a.helpfulCount) },
  { value: "helpfulCount-asc", label: "役立ち度が低い順", compare: (a, b) => compareNumber(a.helpfulCount, b.helpfulCount) },
  {
    value: "missing-recruitmentUrls-first",
    label: "採用URL未登録のみ",
    filter: (store) => !hasRecruitmentUrl(store),
  },
  {
    value: "registered-recruitmentUrls-first",
    label: "採用URL登録済みのみ",
    filter: (store) => hasRecruitmentUrl(store),
  },
  {
    value: "missing-email-first",
    label: "メール未登録のみ",
    filter: (store) => !hasText(store.email),
  },
  {
    value: "registered-email-first",
    label: "メール登録済みのみ",
    filter: (store) => hasText(store.email),
  },
  {
    value: "missing-phone-first",
    label: "電話番号未登録のみ",
    filter: (store) => !hasText(store.phoneNumber),
  },
  {
    value: "registered-phone-first",
    label: "電話番号登録済みのみ",
    filter: (store) => hasText(store.phoneNumber),
  },
  {
    value: "missing-line-first",
    label: "LINE未登録のみ",
    filter: (store) => !hasText(store.lineUrl),
  },
  {
    value: "registered-line-first",
    label: "LINE登録済みのみ",
    filter: (store) => hasText(store.lineUrl),
  },
  {
    value: "missing-twitter-first",
    label: "X未登録のみ",
    filter: (store) => !hasText(store.twitterUrl),
  },
  {
    value: "registered-twitter-first",
    label: "X登録済みのみ",
    filter: (store) => hasText(store.twitterUrl),
  },
  {
    value: "missing-bsky-first",
    label: "Bsky未登録のみ",
    filter: (store) => !hasText(store.bskyUrl),
  },
  {
    value: "registered-bsky-first",
    label: "Bsky登録済みのみ",
    filter: (store) => hasText(store.bskyUrl),
  },
  {
    value: "missing-businessHours-first",
    label: "営業時間未登録のみ",
    filter: (store) => !hasBusinessHours(store),
  },
  {
    value: "registered-businessHours-first",
    label: "営業時間登録済みのみ",
    filter: (store) => hasBusinessHours(store),
  },
];

const SORT_VALUES = new Set(SORT_DEFINITIONS.map((item) => item.value));
const SORTER_MAP = Object.fromEntries(
  SORT_DEFINITIONS.filter((item) => item.compare).map((item) => [item.value, item.compare!]),
) as Record<string, (a: Store, b: Store) => number>;
const FILTER_MAP = Object.fromEntries(
  SORT_DEFINITIONS.filter((item) => item.filter).map((item) => [item.value, item.filter!]),
) as Record<string, (store: Store) => boolean>;

const loadPersistedFilters = () => {
  if (typeof window === "undefined") {
    return { keyword: "", sortOptions: DEFAULT_SORT_OPTIONS };
  }
  try {
    const raw = window.localStorage.getItem(STORE_LIST_FILTERS_STORAGE_KEY);
    if (!raw) return { keyword: "", sortOptions: DEFAULT_SORT_OPTIONS };
    const parsed = JSON.parse(raw) as {
      keyword?: string;
      sortOption?: string;
      sortOptions?: string[];
    };
    const persistedSortOptions = Array.isArray(parsed.sortOptions)
      ? parsed.sortOptions
      : typeof parsed.sortOption === "string"
        ? [parsed.sortOption]
        : [];
    const sortOptions = persistedSortOptions.filter((value) => SORT_VALUES.has(value));
    return {
      keyword: typeof parsed.keyword === "string" ? parsed.keyword : "",
      sortOptions: sortOptions.length > 0 ? sortOptions : DEFAULT_SORT_OPTIONS,
    };
  } catch {
    return { keyword: "", sortOptions: DEFAULT_SORT_OPTIONS };
  }
};

export const StoreListPage = () => {
  const initialFilters = loadPersistedFilters();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState(initialFilters.keyword);
  const [sortOptions, setSortOptions] = useState(initialFilters.sortOptions);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminApi.listStores();
      setStores(res.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("店舗を削除しますか？")) return;
    try {
      await adminApi.deleteStore(id);
      setStores((prev) => prev.filter((store) => store.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      STORE_LIST_FILTERS_STORAGE_KEY,
      JSON.stringify({ keyword, sortOptions }),
    );
  }, [keyword, sortOptions]);

  const toggleSortOption = (optionValue: string) => {
    setSortOptions((prev) => {
      if (prev.includes(optionValue)) {
        const next = prev.filter((value) => value !== optionValue);
        return next.length > 0 ? next : [...DEFAULT_SORT_OPTIONS];
      }
      return [...prev, optionValue];
    });
  };

  const totalCount = stores.length;

  const filteredStores = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    let result = [...stores];

    if (normalizedKeyword) {
      result = result.filter((store) => {
        const haystack = [store.storeName, store.prefecture, store.category].join(" ").toLowerCase();
        return haystack.includes(normalizedKeyword);
      });
    }

    const effectiveSortOptions = sortOptions.length > 0 ? sortOptions : DEFAULT_SORT_OPTIONS;
    for (const option of effectiveSortOptions) {
      const predicate = FILTER_MAP[option];
      if (!predicate) continue;
      result = result.filter((store) => predicate(store));
    }
    const orderingOptions = effectiveSortOptions.filter((option) => Boolean(SORTER_MAP[option]));
    return result.sort((a, b) => {
      for (const option of orderingOptions) {
        const sorter = SORTER_MAP[option];
        if (!sorter) continue;
        const compared = sorter(a, b);
        if (compared !== 0) return compared;
      }
      return baseSorter(a, b);
    });
  }, [stores, keyword, sortOptions]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-pink-500">Store Manager</p>
          <h1 className="text-2xl font-bold">店舗管理</h1>
          <p className="text-sm text-slate-600">店舗情報の作成・編集・削除を行います。</p>
        </div>
        <Button asChild>
          <Link to="/stores/new">新規追加</Link>
        </Button>
      </div>

      <Card className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs text-slate-500">総件数</p>
          <p className="text-2xl font-semibold">{totalCount}</p>
        </div>
        <Badge>ALL</Badge>
      </Card>

      <Card className="grid gap-4 p-4 md:grid-cols-[1fr_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="store-keyword">キーワード</Label>
          <Input
            id="store-keyword"
            placeholder="店舗名・都道府県・業種で検索"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setKeyword("");
            setSortOptions([...DEFAULT_SORT_OPTIONS]);
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(STORE_LIST_FILTERS_STORAGE_KEY);
            }
          }}
        >
          リセット
        </Button>
        <div className="space-y-2 md:col-span-2">
          <Label>絞り込み/並び替え（複数選択・左から優先）</Label>
          <div className="flex flex-wrap gap-2">
            {SORT_DEFINITIONS.map((option) => {
              const active = sortOptions.includes(option.value);
              return (
                <Button
                  key={option.value}
                  type="button"
                  size="sm"
                  variant={active ? "primary" : "outline"}
                  className={
                    active
                      ? "border-pink-700 bg-pink-600 text-white shadow-sm shadow-pink-200 hover:bg-pink-700"
                      : "border-slate-300 bg-slate-100 text-slate-700 hover:border-slate-400 hover:bg-slate-200"
                  }
                  onClick={() => toggleSortOption(option.value)}
                >
                  {option.label}
                </Button>
              );
            })}
          </div>
        </div>
      </Card>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-600">読込中...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <p className="text-sm text-slate-600 md:col-span-2">検索結果: {filteredStores.length}件</p>
          {filteredStores.map((store) => (
            <Card key={store.id} className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {store.storeName}
                      {store.branchName ? ` ${store.branchName}` : ""}
                    </h3>
                    <Badge>{store.category}</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {store.prefecture} {store.area ?? ""} / {store.genre ?? "ジャンル未設定"}
                  </p>
                  <p className="text-sm text-slate-600">
                    平均満足度: <span className="font-semibold">{store.averageRating.toFixed(1)}</span> / 平均時給:{" "}
                    {store.averageEarningLabel ?? "-"}
                  </p>
                  <p className="text-sm text-slate-600">
                    アンケート: {store.surveyCount}件 / 役立ち度: {store.helpfulCount ?? 0}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/stores/${store.id}/edit`}>編集</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to={`/surveys/new?storeId=${store.id}`}>アンケート追加</Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(store.id)}>
                    削除
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
