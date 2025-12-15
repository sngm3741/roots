import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/client";
import { StorePayload } from "../../types";

type Props = { mode: "create" | "edit" };

const emptyStore: StorePayload = {
  id: "",
  storeName: "",
  branchName: "",
  prefecture: "",
  area: "",
  category: "",
  genre: "",
  unitPrice: "",
  businessHours: { open: "", close: "" },
  averageRating: 0,
  averageEarning: 0,
  averageEarningLabel: "",
  waitTimeHours: 0,
  waitTimeLabel: "",
  surveyCount: 0,
  helpfulCount: 0,
};

export const StoreFormPage = ({ mode }: Props) => {
  const navigate = useNavigate();
  const params = useParams();
  const [form, setForm] = useState<StorePayload>(emptyStore);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (mode === "edit" && params.id) {
        try {
          const store = await adminApi.getStore(params.id);
          setForm({
            ...store,
            businessHours: store.businessHours ?? { open: "", close: "" },
          });
        } catch (err) {
          setError(err instanceof Error ? err.message : "取得に失敗しました");
        } finally {
          setLoading(false);
        }
      }
    };
    load();
  }, [mode, params.id]);

  const handleChange = (key: keyof StorePayload, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value } as StorePayload));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await adminApi.createStore(form);
      } else if (params.id) {
        await adminApi.updateStore(params.id, form);
      }
      navigate("/stores");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  if (loading) return <p>読込中...</p>;

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>店舗{mode === "create" ? "作成" : "編集"}</h1>
          <p>基本情報を入力してください。</p>
        </div>
        <button className="button outline" onClick={() => navigate(-1)}>
          戻る
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label className="label">店舗名</label>
            <input className="input" value={form.storeName} onChange={(e) => handleChange("storeName", e.target.value)} required />
          </div>
          <div>
            <label className="label">支店名</label>
            <input className="input" value={form.branchName ?? ""} onChange={(e) => handleChange("branchName", e.target.value)} />
          </div>
          <div>
            <label className="label">都道府県</label>
            <input className="input" value={form.prefecture} onChange={(e) => handleChange("prefecture", e.target.value)} required />
          </div>
          <div>
            <label className="label">エリア</label>
            <input className="input" value={form.area ?? ""} onChange={(e) => handleChange("area", e.target.value)} />
          </div>
          <div>
            <label className="label">カテゴリ</label>
            <input className="input" value={form.category} onChange={(e) => handleChange("category", e.target.value)} required />
          </div>
          <div>
            <label className="label">ジャンル</label>
            <input className="input" value={form.genre ?? ""} onChange={(e) => handleChange("genre", e.target.value)} />
          </div>
          <div>
            <label className="label">客単価</label>
            <input className="input" value={form.unitPrice ?? ""} onChange={(e) => handleChange("unitPrice", e.target.value)} />
          </div>
          <div>
            <label className="label">平均時給ラベル</label>
            <input className="input" value={form.averageEarningLabel ?? ""} onChange={(e) => handleChange("averageEarningLabel", e.target.value)} />
          </div>
          <div>
            <label className="label">待機時間ラベル</label>
            <input className="input" value={form.waitTimeLabel ?? ""} onChange={(e) => handleChange("waitTimeLabel", e.target.value)} />
          </div>
          <div>
            <label className="label">平均評価 (0-5)</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className="input"
              value={form.averageRating}
              onChange={(e) => handleChange("averageRating", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">平均時給(数値)</label>
            <input
              type="number"
              className="input"
              value={form.averageEarning}
              onChange={(e) => handleChange("averageEarning", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">アンケート数</label>
            <input
              type="number"
              className="input"
              value={form.surveyCount}
              onChange={(e) => handleChange("surveyCount", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">役立ち度</label>
            <input
              type="number"
              className="input"
              value={form.helpfulCount ?? 0}
              onChange={(e) => handleChange("helpfulCount", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">営業時間（開始）</label>
            <input
              className="input"
              value={form.businessHours?.open ?? ""}
              onChange={(e) =>
                handleChange("businessHours", { ...form.businessHours, open: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">営業時間（終了）</label>
            <input
              className="input"
              value={form.businessHours?.close ?? ""}
              onChange={(e) =>
                handleChange("businessHours", { ...form.businessHours, close: e.target.value })
              }
            />
          </div>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
          <button type="submit" className="button">
            {mode === "create" ? "作成" : "更新"}
          </button>
          <button type="button" className="button outline" onClick={() => navigate("/stores")}>キャンセル</button>
        </div>
      </form>
    </div>
  );
};
