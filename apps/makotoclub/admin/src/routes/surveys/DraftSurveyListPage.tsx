import { useEffect, useState } from "react";
import { adminApi } from "../../api/client";
import { Survey } from "../../types";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui/button";

export const DraftSurveyListPage = () => {
  const [drafts, setDrafts] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminApi.listDraftSurveys();
        setDrafts(res.items);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-pink-500">投稿アンケート</p>
          <h1 className="text-2xl font-bold">ユーザー投稿一覧</h1>
          <p className="text-sm text-slate-600">
            frontend で投稿された内容をここで確認し、店舗を紐付けた新規アンケートを手入力してください（このページでは編集しません）。
          </p>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      {loading ? (
        <p className="text-sm text-slate-600">読込中...</p>
      ) : drafts.length === 0 ? (
        <p className="text-sm text-slate-600">投稿アンケートはありません。</p>
      ) : (
        <div className="grid gap-4">
          {drafts.map((survey) => (
            <Card key={survey.id} className="flex flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  {(() => {
                    const industryLabel =
                      survey.industry === "その他" && survey.industryOther
                        ? `その他（${survey.industryOther}）`
                        : survey.industry;
                    const workTypeLabel =
                      survey.workType === "その他" && survey.workTypeOther
                        ? `その他（${survey.workTypeOther}）`
                        : survey.workType;
                    return (
                      <>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      {survey.storeName}
                      {survey.branchName ? ` ${survey.branchName}` : ""}
                    </h3>
                    <Badge variant="outline">投稿</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    訪問時期: {survey.visitedPeriod} / 勤務形態: {workTypeLabel}
                  </p>
                  <p className="text-sm text-slate-600">
                    平均報酬: {survey.averageEarning}万円 / 満足度: {survey.rating} / 5
                  </p>
                  <p className="text-sm text-slate-600">
                    {survey.prefecture} {survey.area ?? ""} / 業種: {industryLabel} / ジャンル: {survey.genre ?? "-"}
                  </p>
                      </>
                    );
                  })()}
                </div>
                <Button asChild size="sm" variant="secondary">
                  <Link to={`/surveys/${survey.id}/edit`}>詳細を見る</Link>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
