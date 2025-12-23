import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { Store } from "../../types";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Label } from "../../components/ui/label";

export const StoreListPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [sortOption, setSortOption] = useState("createdAt-desc");

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

    const sorters: Record<string, (a: Store, b: Store) => number> = {
      "createdAt-desc": (a, b) => Date.parse(b.createdAt ?? "") - Date.parse(a.createdAt ?? ""),
      "createdAt-asc": (a, b) => Date.parse(a.createdAt ?? "") - Date.parse(b.createdAt ?? ""),
      "averageRating-desc": (a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0),
      "averageRating-asc": (a, b) => (a.averageRating ?? 0) - (b.averageRating ?? 0),
    };

    const sorter = sorters[sortOption] ?? sorters["createdAt-desc"];
    return result.sort(sorter);
  }, [stores, keyword, sortOption]);

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

      <Card className="grid gap-4 p-4 md:grid-cols-[1fr_220px_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="store-keyword">キーワード</Label>
          <Input
            id="store-keyword"
            placeholder="店舗名・都道府県・業種で検索"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="store-sort">並び替え</Label>
          <Select id="store-sort" value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
            <option value="createdAt-desc">新着順</option>
            <option value="createdAt-asc">古い順</option>
            <option value="averageRating-desc">評価が高い順</option>
            <option value="averageRating-asc">評価が低い順</option>
          </Select>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setKeyword("");
            setSortOption("createdAt-desc");
          }}
        >
          リセット
        </Button>
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
                    平均評価: <span className="font-semibold">{store.averageRating.toFixed(1)}</span> / 平均時給:{" "}
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
