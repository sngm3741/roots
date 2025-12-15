import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/client";
import { SurveyPayload } from "../../types";

type Props = { mode: "create" | "edit" };

const emptySurvey: SurveyPayload = {
  storeId: "",
  storeName: "",
  storeBranch: "",
  storePrefecture: "",
  storeArea: "",
  storeIndustry: "",
  storeGenre: "",
  visitedPeriod: "",
  workType: "",
  age: 0,
  specScore: 0,
  waitTimeHours: 0,
  averageEarning: 0,
  rating: 0,
  status: "draft",
  customerComment: "",
};

export const SurveyFormPage = ({ mode }: Props) => {
  const params = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState<SurveyPayload>(emptySurvey);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (mode === "edit" && params.id) {
        try {
          const survey = await adminApi.getSurvey(params.id);
          setForm(survey);
        } catch (err) {
          setError(err instanceof Error ? err.message : "取得に失敗しました");
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    load();
  }, [mode, params.id]);

  const handleChange = (key: keyof SurveyPayload, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value } as SurveyPayload));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (mode === "create") {
        await adminApi.createSurvey(form);
      } else if (params.id) {
        await adminApi.updateSurvey(params.id, form);
      }
      navigate("/surveys");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  if (loading) return <p>読込中...</p>;

  return (
    <div>
      <div className="section-header">
        <div>
          <h1>アンケート{mode === "create" ? "作成" : "編集"}</h1>
          <p>アンケート内容を入力してください。</p>
        </div>
        <button className="button outline" onClick={() => navigate(-1)}>
          戻る
        </button>
      </div>

      {error && <div className="alert">{error}</div>}

      <form className="card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div>
            <label className="label">店舗ID</label>
            <input className="input" value={form.storeId} onChange={(e) => handleChange("storeId", e.target.value)} required />
          </div>
          <div>
            <label className="label">店舗名</label>
            <input className="input" value={form.storeName} onChange={(e) => handleChange("storeName", e.target.value)} required />
          </div>
          <div>
            <label className="label">支店名</label>
            <input className="input" value={form.storeBranch ?? ""} onChange={(e) => handleChange("storeBranch", e.target.value)} />
          </div>
          <div>
            <label className="label">都道府県</label>
            <input
              className="input"
              value={form.storePrefecture}
              onChange={(e) => handleChange("storePrefecture", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label">エリア</label>
            <input className="input" value={form.storeArea ?? ""} onChange={(e) => handleChange("storeArea", e.target.value)} />
          </div>
          <div>
            <label className="label">業態</label>
            <input className="input" value={form.storeIndustry} onChange={(e) => handleChange("storeIndustry", e.target.value)} />
          </div>
          <div>
            <label className="label">ジャンル</label>
            <input className="input" value={form.storeGenre ?? ""} onChange={(e) => handleChange("storeGenre", e.target.value)} />
          </div>
          <div>
            <label className="label">訪問時期</label>
            <input className="input" value={form.visitedPeriod} onChange={(e) => handleChange("visitedPeriod", e.target.value)} />
          </div>
          <div>
            <label className="label">働き方</label>
            <input className="input" value={form.workType} onChange={(e) => handleChange("workType", e.target.value)} />
          </div>
          <div>
            <label className="label">年齢</label>
            <input type="number" className="input" value={form.age} onChange={(e) => handleChange("age", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">接客スコア</label>
            <input
              type="number"
              className="input"
              value={form.specScore}
              onChange={(e) => handleChange("specScore", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">待機時間</label>
            <input
              type="number"
              className="input"
              value={form.waitTimeHours}
              onChange={(e) => handleChange("waitTimeHours", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">平均報酬</label>
            <input
              type="number"
              className="input"
              value={form.averageEarning}
              onChange={(e) => handleChange("averageEarning", Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">評価 (0-5)</label>
            <input type="number" className="input" value={form.rating} onChange={(e) => handleChange("rating", Number(e.target.value))} />
          </div>
          <div>
            <label className="label">コメント</label>
            <textarea
              className="input"
              style={{ minHeight: "100px" }}
              value={form.customerComment ?? ""}
              onChange={(e) => handleChange("customerComment", e.target.value)}
            />
          </div>
          <div>
            <label className="label">ステータス</label>
            <select
              className="input"
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value as SurveyPayload["status"])}
            >
              <option value="draft">下書き</option>
              <option value="published">公開</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: "1.25rem", display: "flex", gap: "0.75rem" }}>
          <button type="submit" className="button">
            {mode === "create" ? "作成" : "更新"}
          </button>
          <button type="button" className="button outline" onClick={() => navigate("/surveys")}>キャンセル</button>
        </div>
      </form>
    </div>
  );
};
