import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { Survey } from "../../types";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";

export const SurveyListPage = () => {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-pink-500">Survey Manager</p>
          <h1 className="text-2xl font-bold">アンケート管理</h1>
          <p className="text-sm text-slate-600">アンケートの作成・編集・削除を行います。</p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-600">読込中...</p>
      ) : (
        <div className="grid gap-4">
          {surveys.map((survey) => (
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
                    訪問時期: {survey.visitedPeriod} / 平均報酬: {survey.averageEarning}万円 / 評価: {survey.rating} / 5
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
