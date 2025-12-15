import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { Survey } from "../../types";

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
    <div>
      <div className="section-header">
        <div>
          <h1>アンケート管理</h1>
          <p>アンケートの作成・編集・削除を行います。</p>
        </div>
        <Link to="/surveys/new" className="button">
          新規作成
        </Link>
      </div>

      {error && <div className="alert">{error}</div>}

      {loading ? (
        <p>読込中...</p>
      ) : (
        <table className="table card">
          <thead>
            <tr>
              <th>店舗</th>
              <th>訪問時期</th>
              <th>ステータス</th>
              <th>平均報酬</th>
              <th>評価</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <tr key={survey.id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{survey.storeName}</div>
                  <div style={{ color: "#475569" }}>
                    {survey.storePrefecture} {survey.storeArea ?? ""}
                  </div>
                </td>
                <td>{survey.visitedPeriod}</td>
                <td>
                  <span className={`status-badge ${survey.status}`}>
                    {survey.status === "draft" ? "下書き" : "公開"}
                  </span>
                </td>
                <td>{survey.averageEarning}万円</td>
                <td>{survey.rating} / 5</td>
                <td style={{ display: "flex", gap: "0.5rem" }}>
                  <Link to={`/surveys/${survey.id}/edit`} className="button secondary">
                    編集
                  </Link>
                  <button className="button danger" onClick={() => handleDelete(survey.id)}>
                    削除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
