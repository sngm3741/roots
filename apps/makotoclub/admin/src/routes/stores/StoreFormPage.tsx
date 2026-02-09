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

const isHttpsUrl = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const emptyStore: StorePayload = {
  id: "",
  storeName: "",
  branchName: "",
  prefecture: "",
  area: "",
  category: "",
  genre: "",
  phoneNumber: "",
  email: "",
  lineUrl: "",
  twitterUrl: "",
  bskyUrl: "",
  womenRecruitmentPageMissing: false,
  businessHours: { open: "" },
  castBack: undefined,
  recruitmentUrls: [""],
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
            businessHours: store.businessHours ?? { open: "" },
            recruitmentUrls:
              (store.recruitmentUrls ?? []).length > 0 ? (store.recruitmentUrls ?? []) : [""],
            womenRecruitmentPageMissing: Boolean(store.womenRecruitmentPageMissing),
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
      return { ...prev, recruitmentUrls: next.length > 0 ? next : [""] };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const urls = (form.recruitmentUrls ?? []).map((url) => url.trim()).filter(Boolean);
    if (urls.some((url) => !isHttpsUrl(url))) {
      setError("採用ページは https のURLのみ登録できます。");
      return;
    }
    const lineUrl = form.lineUrl?.trim() ?? "";
    if (lineUrl && !isHttpsUrl(lineUrl)) {
      setError("LINE URLは https のURLのみ登録できます。");
      return;
    }
    const twitterUrl = form.twitterUrl?.trim() ?? "";
    if (twitterUrl && !isHttpsUrl(twitterUrl)) {
      setError("X(Twitter) URLは https のURLのみ登録できます。");
      return;
    }
    const bskyUrl = form.bskyUrl?.trim() ?? "";
    if (bskyUrl && !isHttpsUrl(bskyUrl)) {
      setError("Bsky URLは https のURLのみ登録できます。");
      return;
    }
    const email = form.email?.trim() ?? "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Emailの形式が不正です。");
      return;
    }
    const businessHoursText = form.businessHours?.open?.trim() ?? "";
    const businessHours = businessHoursText ? { open: businessHoursText } : undefined;
    const payload = {
      ...form,
      email: email || undefined,
      lineUrl: lineUrl || undefined,
      twitterUrl: twitterUrl || undefined,
      bskyUrl: bskyUrl || undefined,
      businessHours,
      recruitmentUrls: urls,
    };
    try {
      if (mode === "create") {
        await adminApi.createStore(payload);
      } else if (params.id) {
        await adminApi.updateStore(params.id, payload);
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
          <div className="space-y-2">
            <Label>電話番号</Label>
            <Input
              value={form.phoneNumber ?? ""}
              onChange={(e) => handleChange("phoneNumber", e.target.value)}
              placeholder="例: 03-1234-5678"
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email ?? ""}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="例: info@example.com"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>LINE URL（連絡先）</Label>
            <Input
              value={form.lineUrl ?? ""}
              onChange={(e) => handleChange("lineUrl", e.target.value)}
              placeholder="https://line.me/..."
            />
          </div>
          <div className="space-y-2">
            <Label>X(Twitter) URL（SNS）</Label>
            <Input
              value={form.twitterUrl ?? ""}
              onChange={(e) => handleChange("twitterUrl", e.target.value)}
              placeholder="https://x.com/..."
            />
          </div>
          <div className="space-y-2">
            <Label>Bsky URL（SNS）</Label>
            <Input
              value={form.bskyUrl ?? ""}
              onChange={(e) => handleChange("bskyUrl", e.target.value)}
              placeholder="https://bsky.app/..."
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
          <div className="space-y-2 md:col-span-2">
            <label className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-3 text-sm text-slate-800">
              <input
                type="checkbox"
                checked={Boolean(form.womenRecruitmentPageMissing)}
                onChange={(e) => handleChange("womenRecruitmentPageMissing", e.target.checked)}
              />
              公式HP先で女性求人ページが見当たらない
            </label>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>営業時間（自由入力）</Label>
            <Input
              value={form.businessHours?.open ?? ""}
              onChange={(e) => handleChange("businessHours", { open: e.target.value })}
              placeholder="例: 24時間 / 24:00~4:00"
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
