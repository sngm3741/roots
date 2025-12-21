import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { adminApi } from "../../api/client";
import { StorePayload } from "../../types";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card } from "../../components/ui/card";
import { Select } from "../../components/ui/select";
import { PREFECTURES, INDUSTRY_OPTIONS, GENRE_OPTIONS } from "../../constants/options";

type Props = { mode: "create" | "edit" };

const emptyStore: StorePayload = {
  id: "",
  storeName: "",
  branchName: "",
  prefecture: "",
  area: "",
  category: "",
  genre: "",
  businessHours: { open: "", close: "" },
  castBack: undefined,
  recruitmentUrls: [],
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

  const handleRecruitmentUrlChange = (index: number, value: string) => {
    setForm((prev) => {
      const next = [...(prev.recruitmentUrls ?? [])];
      next[index] = value;
      return { ...prev, recruitmentUrls: next };
    });
  };

  const addRecruitmentUrl = () => {
    setForm((prev) => ({ ...prev, recruitmentUrls: [...(prev.recruitmentUrls ?? []), ""] }));
  };

  const removeRecruitmentUrl = (index: number) => {
    setForm((prev) => {
      const next = [...(prev.recruitmentUrls ?? [])];
      next.splice(index, 1);
      return { ...prev, recruitmentUrls: next };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const urls = (form.recruitmentUrls ?? []).map((url) => url.trim()).filter(Boolean);
    if (urls.some((url) => !url.startsWith("https://"))) {
      setError("採用ページは https のURLのみ登録できます。");
      return;
    }
    const open = form.businessHours?.open?.trim() ?? "";
    const close = form.businessHours?.close?.trim() ?? "";
    if ((open && !close) || (!open && close)) {
      setError("営業時間は開始・終了の両方を入力してください。");
      return;
    }
    const businessHours = open && close ? { open, close } : undefined;
    try {
      if (mode === "create") {
        await adminApi.createStore({ ...form, businessHours, recruitmentUrls: urls });
      } else if (params.id) {
        await adminApi.updateStore(params.id, { ...form, businessHours, recruitmentUrls: urls });
      }
      navigate("/stores");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  if (loading) return <p>読込中...</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-pink-500">Store Form</p>
          <h1 className="text-2xl font-bold">店舗{mode === "create" ? "作成" : "編集"}</h1>
          <p className="text-sm text-slate-600">基本情報を入力してください。</p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          戻る
        </Button>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>店舗名</Label>
            <Input value={form.storeName} onChange={(e) => handleChange("storeName", e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label>支店名</Label>
            <Input value={form.branchName ?? ""} onChange={(e) => handleChange("branchName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>都道府県</Label>
            <Select value={form.prefecture} onChange={(e) => handleChange("prefecture", e.target.value)} required>
              <option value="">選択してください</option>
              {PREFECTURES.map((pref) => (
                <option key={pref} value={pref}>
                  {pref}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>エリア</Label>
            <Input value={form.area ?? ""} onChange={(e) => handleChange("area", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>業種</Label>
            <Select value={form.category} onChange={(e) => handleChange("category", e.target.value)} required>
              <option value="">選択してください</option>
              {INDUSTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>ジャンル</Label>
            <Select value={form.genre ?? ""} onChange={(e) => handleChange("genre", e.target.value)}>
              <option value="">選択してください</option>
              {GENRE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>キャストバック（60分）</Label>
            <Input
              type="number"
              min={0}
              step={1000}
              value={form.castBack ?? ""}
              onChange={(e) => handleChange("castBack", e.target.value === "" ? undefined : Number(e.target.value))}
              placeholder="例: 7000"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label>採用ページ</Label>
              <Button type="button" size="sm" variant="secondary" onClick={addRecruitmentUrl}>
                URLを追加
              </Button>
            </div>
            <div className="grid gap-3">
              {(form.recruitmentUrls ?? []).map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    className="flex-1"
                    placeholder="https://example.com/recruit"
                    value={url}
                    onChange={(e) => handleRecruitmentUrlChange(index, e.target.value)}
                  />
                  <Button type="button" size="sm" variant="ghost" onClick={() => removeRecruitmentUrl(index)}>
                    削除
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-slate-600">任意。https URLのみ。空欄は削除してください。</p>
          </div>
          <div className="space-y-2">
            <Label>営業時間（開始）</Label>
            <Input
              value={form.businessHours?.open ?? ""}
              onChange={(e) => handleChange("businessHours", { ...form.businessHours, open: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>営業時間（終了）</Label>
            <Input
              value={form.businessHours?.close ?? ""}
              onChange={(e) => handleChange("businessHours", { ...form.businessHours, close: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button type="submit">{mode === "create" ? "作成" : "更新"}</Button>
          <Button type="button" variant="outline" onClick={() => navigate("/stores")}>
            キャンセル
          </Button>
        </div>
        </form>
      </Card>
    </div>
  );
};
