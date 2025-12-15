import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { Survey } from "../../types";

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
    <div>
      <div className="section-header">
        <div>
          <h1>下書きアンケート</h1>
          <p>公開前のアンケート一覧です。編集して公開に進められます。</p>
        </div>
        <Link to="/surveys/new" className="button">
          新規作成
        </Link>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>読込中...</p>
      ) : drafts.length === 0 ? (
        <p>下書きはありません。</p>
      ) : (
        <table className="table card">
          <thead>
            <tr>
              <th>店舗</th>
              <th>訪問時期</th>
              <th>平均報酬</th>
              <th>評価</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((survey) => (
              <tr key={survey.id}>
                <td>{survey.storeName}</td>
                <td>{survey.visitedPeriod}</td>
                <td>{survey.averageEarning}万円</td>
                <td>{survey.rating} / 5</td>
                <td>
                  <Link to={`/surveys/${survey.id}/edit`} className="button secondary">
                    編集
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
