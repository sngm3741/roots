import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { adminApi } from "../../api/client";
import { Store } from "../../types";

export const StoreListPage = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>店舗管理</h1>
          <p>店舗情報の作成・編集・削除を行います。</p>
        </div>
        <Link to="/stores/new" className="button">
          新規追加
        </Link>
      </div>

      {error && <div className="alert">{error}</div>}
      {loading ? (
        <p>読込中...</p>
      ) : (
        <div className="list-grid">
          {stores.map((store) => (
            <div key={store.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <div>
                  <h3 style={{ margin: "0 0 0.5rem" }}>{store.storeName}</h3>
                  <p style={{ margin: 0, color: "#475569" }}>
                    {store.prefecture} {store.area ?? ""} / {store.category}
                  </p>
                  <p style={{ margin: "0.5rem 0", color: "#475569" }}>
                    平均評価: {store.averageRating.toFixed(1)} / 平均時給: {store.averageEarningLabel ?? "-"}
                  </p>
                  <p style={{ margin: 0, color: "#475569" }}>
                    アンケート: {store.surveyCount}件 / 役立ち度: {store.helpfulCount ?? 0}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <Link to={`/stores/${store.id}/edit`} className="button secondary" style={{ textAlign: "center" }}>
                    編集
                  </Link>
                  <button className="button danger" onClick={() => handleDelete(store.id)}>
                    削除
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
