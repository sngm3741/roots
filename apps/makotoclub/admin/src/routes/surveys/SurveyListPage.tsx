import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { Survey } from "../../types";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { Label } from "../../components/ui/label";

export const SurveyListPage = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [sortOption, setSortOption] = useState("createdAt-desc");

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminApi.listSurveys();
      setSurveys(res.items);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("アンケートを削除しますか？")) return;
    try {
      await adminApi.deleteSurvey(id);
      setSurveys((prev) => prev.filter((survey) => survey.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "削除に失敗しました");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const counts = useMemo(() => {
    const published = surveys.filter((survey) => survey.status === "published").length;
    const draft = surveys.filter((survey) => survey.status === "draft").length;
    return { total: surveys.length, published, draft };
  }, [surveys]);

  const filteredSurveys = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    let result = [...surveys];

    if (statusFilter !== "all") {
      result = result.filter((survey) => survey.status === statusFilter);
    }

    if (normalizedKeyword) {
      result = result.filter((survey) => {
        const haystack = [
          survey.storeName,
          survey.branchName ?? "",
          survey.prefecture ?? "",
          survey.area ?? "",
          survey.industry ?? "",
          survey.genre ?? "",
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(normalizedKeyword);
      });
    }

    const sorters: Record<string, (a: Survey, b: Survey) => number> = {
      "createdAt-desc": (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      "createdAt-asc": (a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt),
      "rating-desc": (a, b) => (b.rating ?? 0) - (a.rating ?? 0),
      "rating-asc": (a, b) => (a.rating ?? 0) - (b.rating ?? 0),
      "averageEarning-desc": (a, b) => (b.averageEarning ?? 0) - (a.averageEarning ?? 0),
      "averageEarning-asc": (a, b) => (a.averageEarning ?? 0) - (b.averageEarning ?? 0),
    };

    const sorter = sorters[sortOption] ?? sorters["createdAt-desc"];
    return result.sort(sorter);
  }, [surveys, statusFilter, keyword, sortOption]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-pink-500">Survey Manager</p>
          <h1 className="text-2xl font-bold">アンケート管理</h1>
          <p className="text-sm text-slate-600">アンケートの作成・編集・削除を行います。</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">総件数</p>
            <p className="text-2xl font-semibold">{counts.total}</p>
          </div>
          <Badge>ALL</Badge>
        </Card>
        <Card className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">公開</p>
            <p className="text-2xl font-semibold">{counts.published}</p>
          </div>
          <Badge>公開</Badge>
        </Card>
        <Card className="flex items-center justify-between px-4 py-3">
          <div>
            <p className="text-xs text-slate-500">下書き</p>
            <p className="text-2xl font-semibold">{counts.draft}</p>
          </div>
          <Badge variant="outline">下書き</Badge>
        </Card>
      </div>

      <Card className="grid gap-4 p-4 md:grid-cols-[1fr_220px_220px_auto] md:items-end">
        <div className="space-y-2">
          <Label htmlFor="survey-keyword">キーワード</Label>
          <Input
            id="survey-keyword"
            placeholder="店舗名・支店名・都道府県・業種など"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="survey-status">ステータス</Label>
          <Select id="survey-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as "all" | "published" | "draft")}>
            <option value="all">すべて</option>
            <option value="published">公開のみ</option>
            <option value="draft">下書きのみ</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="survey-sort">並び替え</Label>
          <Select id="survey-sort" value={sortOption} onChange={(event) => setSortOption(event.target.value)}>
            <option value="createdAt-desc">新着順</option>
            <option value="createdAt-asc">古い順</option>
            <option value="rating-desc">満足度が高い順</option>
            <option value="rating-asc">満足度が低い順</option>
            <option value="averageEarning-desc">平均稼ぎが高い順</option>
            <option value="averageEarning-asc">平均稼ぎが低い順</option>
          </Select>
        </div>
        <Button
          variant="secondary"
          onClick={() => {
            setKeyword("");
            setStatusFilter("all");
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
        <div className="grid gap-4">
          <p className="text-sm text-slate-600">検索結果: {filteredSurveys.length}件</p>
          {filteredSurveys.map((survey) => (
            <Card key={survey.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{survey.storeName}</h3>
                    <Badge variant={survey.status === "draft" ? "outline" : "default"}>
                      {survey.status === "draft" ? "下書き" : "公開"}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {survey.storePrefecture} {survey.storeArea ?? ""}
                  </p>
                  <p className="text-sm text-slate-600">
                    訪問時期: {survey.visitedPeriod} / 平均報酬: {survey.averageEarning}万円 / 満足度: {survey.rating} / 5
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button asChild variant="secondary" size="sm">
                    <Link to={`/surveys/${survey.id}/edit`}>編集</Link>
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(survey.id)}>
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
