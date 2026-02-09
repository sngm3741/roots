import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { adminApi } from "../../api/client";
import { Store, SurveyPayload } from "../../types";
import { WORK_TYPES } from "@makotoclub/shared";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select } from "../../components/ui/select";
import { Card } from "../../components/ui/card";

type Props = { mode: "create" | "edit" };

type SurveyFormState = Omit<
  SurveyPayload,
  "age" | "specScore" | "waitTimeHours" | "averageEarning" | "castBack" | "imageUrls"
> & {
  age: string;
  specScore: string;
  waitTimeHours: string;
  averageEarning: string;
  castBack?: string;
  imageUrls?: string[];
};

const emptySurvey: SurveyFormState = {
  storeId: "",
  storeName: "",
  branchName: "",
  prefecture: "",
  industry: "",
  industryOther: "",
  genre: "",
  visitedPeriod: "",
  workType: "",
  workTypeOther: "",
  age: "",
  specScore: "",
  waitTimeHours: "",
  averageEarning: "",
  castBack: "",
  rating: 0,
  customerComment: "",
  staffComment: "",
  workEnvironmentComment: "",
  etcComment: "",
  emailAddress: "",
  imageUrls: [],
};

const toFormState = (survey: SurveyPayload): SurveyFormState => ({
  ...survey,
  age: Number.isFinite(survey.age) ? String(survey.age) : "",
  specScore: Number.isFinite(survey.specScore) ? String(survey.specScore) : "",
  waitTimeHours: Number.isFinite(survey.waitTimeHours) ? String(survey.waitTimeHours) : "",
  averageEarning: Number.isFinite(survey.averageEarning) ? String(survey.averageEarning) : "",
  castBack: typeof survey.castBack === "number" ? String(survey.castBack) : "",
  emailAddress: survey.emailAddress ?? "",
  imageUrls: survey.imageUrls ?? [],
});

const BSKY_MAX_TEXT = 290;

const normalizeShareText = (value: string | undefined) => {
  const trimmed = (value ?? "").trim();
  return trimmed.length > 0 ? trimmed : "（未入力）";
};

const buildBskyShareText = (form: SurveyFormState, surveyUrl: string) => {
  const sections = [
    `🔸客層\n${normalizeShareText(form.customerComment)}`,
    `🔸スタッフ\n${normalizeShareText(form.staffComment)}`,
    `🔸環境\n${normalizeShareText(form.workEnvironmentComment)}`,
    `🔸その他\n${normalizeShareText(form.etcComment)}`,
  ];
  const body = sections.join("\n\n");
  const fullText = `${body}\n\n${surveyUrl}`;
  if (fullText.length <= BSKY_MAX_TEXT) return fullText;

  const suffix = `...\n\n${surveyUrl}`;
  const available = BSKY_MAX_TEXT - suffix.length;
  if (available <= 0) return surveyUrl;

  const clippedBody = body.slice(0, available).trimEnd();
  if (!clippedBody) return surveyUrl;
  return `${clippedBody}...\n\n${surveyUrl}`;
};

export const SurveyFormPage = ({ mode }: Props) => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState<SurveyFormState>(emptySurvey);
  const [loading, setLoading] = useState(mode === "edit");
  const [error, setError] = useState<string | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const surveyPublicUrl = params.id ? `https://makoto-club.com/surveys/${params.id}` : "";
  const bskyShareText = useMemo(() => {
    if (!surveyPublicUrl) return "";
    return buildBskyShareText(form, surveyPublicUrl);
  }, [form, surveyPublicUrl]);
  const bskyShareUrl = bskyShareText
    ? `https://bsky.app/intent/compose?text=${encodeURIComponent(bskyShareText)}`
    : "";

  useEffect(() => {
    const load = async () => {
      try {
        if (mode === "edit" && params.id) {
          const survey = await adminApi.getSurvey(params.id);
          setForm(toFormState(survey));
          setIsReadOnly(survey.status === "draft");
          if (survey.storeId) {
            const fetchedStore = await adminApi.getStore(survey.storeId);
            setStore(fetchedStore);
          }
        } else {
          setIsReadOnly(false);
          const storeId = searchParams.get("storeId");
          if (!storeId) {
            setError("店舗カードの「アンケート追加」から遷移してください（storeId がありません）。");
            return;
          }
          const fetchedStore = await adminApi.getStore(storeId);
          setStore(fetchedStore);
          setForm({
            ...emptySurvey,
            storeId: fetchedStore.id,
            storeName: fetchedStore.storeName,
            branchName: fetchedStore.branchName ?? "",
            prefecture: fetchedStore.prefecture,
            industry: fetchedStore.category ?? "",
            genre: fetchedStore.genre ?? "",
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [mode, params.id, searchParams]);

  const handleChange = (key: keyof SurveyFormState, value: unknown) => {
    setForm((prev) => ({ ...prev, [key]: value } as SurveyFormState));
  };

  const removeImage = (index: number) => {
    setForm((prev) => {
      const next = [...(prev.imageUrls ?? [])];
      next.splice(index, 1);
      return { ...prev, imageUrls: next };
    });
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploadedUrls: string[] = [];
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/uploads", { method: "POST", body: formData });
        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "画像アップロードに失敗しました");
        }
        const data = (await res.json()) as { url: string };
        if (!data.url) throw new Error("アップロードURLが取得できませんでした");
        uploadedUrls.push(data.url);
      }
      setForm((prev) => ({ ...prev, imageUrls: [...(prev.imageUrls ?? []), ...uploadedUrls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "画像アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  };

  const parseIntField = (value: string, label: string, required = true) => {
    const trimmed = value.trim();
    if (!trimmed) {
      if (required) setError(`${label}は必須です`);
      return required ? null : undefined;
    }
    if (!/^\d+$/.test(trimmed)) {
      setError(`${label}は整数で入力してください`);
      return null;
    }
    return Number(trimmed);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      return;
    }
    setError(null);
    if (!form.storeId) {
      setError("店舗が指定されていません。店舗一覧からアンケートを追加してください。");
      return;
    }
    const age = parseIntField(form.age, "年齢");
    if (age == null) return;
    const specScore = parseIntField(form.specScore, "スペック");
    if (specScore == null) return;
    if (specScore < 50 || specScore > 140) {
      setError("スペックは50〜140の範囲で入力してください");
      return;
    }
    const waitTimeHours = parseIntField(form.waitTimeHours, "待機時間");
    if (waitTimeHours == null) return;
    const averageEarning = parseIntField(form.averageEarning, "平均稼ぎ");
    if (averageEarning == null) return;
    const castBack = parseIntField(form.castBack ?? "", "キャストバック", false);
    if (castBack === null) return;
    const payload: SurveyPayload = {
      ...form,
      age,
      specScore,
      waitTimeHours,
      averageEarning,
      castBack,
      emailAddress: form.emailAddress?.trim() ? form.emailAddress.trim() : undefined,
      imageUrls: form.imageUrls ?? [],
    };
    try {
      if (mode === "create") {
        await adminApi.createSurvey(payload);
      } else if (params.id) {
        await adminApi.updateSurvey(params.id, payload);
      }
      navigate("/surveys");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  if (loading) return <p>読込中...</p>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-pink-500">Survey Form</p>
          <h1 className="text-2xl font-bold">
            {isReadOnly ? "投稿アンケート詳細" : `アンケート${mode === "create" ? "作成" : "編集"}`}
          </h1>
          <p className="text-sm text-slate-600">
            {isReadOnly ? "投稿内容の確認専用ページです（編集はできません）。" : "アンケート内容を入力してください。"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {bskyShareUrl ? (
            <Button asChild variant="secondary">
              <a href={bskyShareUrl} target="_blank" rel="noreferrer">
                Bskyに共有
              </a>
            </Button>
          ) : null}
          <Button variant="outline" onClick={() => navigate(-1)}>
            戻る
          </Button>
        </div>
      </div>

      {error && <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-red-700">{error}</div>}

      <Card>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <input type="hidden" name="storeId" value={form.storeId} />

          <fieldset className="space-y-4" disabled={isReadOnly}>
            {(store || form.storeName) && (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>店舗名</Label>
                  <Input value={store?.storeName ?? form.storeName ?? ""} disabled readOnly />
                </div>
                <div className="space-y-2">
                  <Label>支店名</Label>
                  <Input value={store?.branchName ?? form.branchName ?? ""} disabled readOnly />
                </div>
                <div className="space-y-2">
                  <Label>都道府県</Label>
                  <Input value={store?.prefecture ?? form.prefecture ?? ""} disabled readOnly />
                </div>
                <div className="space-y-2">
                  <Label>業種</Label>
                  <Input value={store?.category ?? form.industry ?? ""} disabled readOnly />
                </div>
                {form.industry === "その他" && (
                  <div className="space-y-2">
                    <Label>その他の業種</Label>
                    <Input
                      value={form.industryOther ?? ""}
                      onChange={(e) => handleChange("industryOther", e.target.value)}
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>ジャンル</Label>
                  <Input value={store?.genre ?? form.genre ?? ""} disabled readOnly />
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>働いた時期</Label>
                <Input
                  type="month"
                  value={form.visitedPeriod}
                  onChange={(e) => handleChange("visitedPeriod", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>勤務形態</Label>
                <Select value={form.workType} onChange={(e) => handleChange("workType", e.target.value)} required>
                  <option value="">選択してください</option>
                  {WORK_TYPES.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
              </div>
              {form.workType === "その他" && (
                <div className="space-y-2">
                  <Label>その他の勤務形態</Label>
                  <Input
                    value={form.workTypeOther ?? ""}
                    onChange={(e) => handleChange("workTypeOther", e.target.value)}
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                    placeholder="自由記入"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>年齢</Label>
                <Input
                  inputMode="numeric"
                  value={form.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="例: 23"
                />
              </div>
              <div className="space-y-2">
                <Label>スペック (50-140)</Label>
                <Input
                  inputMode="numeric"
                  value={form.specScore}
                  onChange={(e) => handleChange("specScore", e.target.value)}
                  placeholder="例: 90"
                />
              </div>
              <div className="space-y-2">
                <Label>待機時間 (0-24h)</Label>
                <Input
                  inputMode="numeric"
                  value={form.waitTimeHours}
                  onChange={(e) => handleChange("waitTimeHours", e.target.value)}
                  placeholder="例: 3"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>平均稼ぎ (0-30 万円)</Label>
                <Input
                  inputMode="numeric"
                  value={form.averageEarning}
                  onChange={(e) => handleChange("averageEarning", e.target.value)}
                  placeholder="例: 12"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>キャストバック (0-30000 円)</Label>
                <Input
                  inputMode="numeric"
                  value={form.castBack ?? ""}
                  onChange={(e) => handleChange("castBack", e.target.value)}
                  placeholder="未入力可"
                />
              </div>
              <div className="space-y-2">
                <Label>満足度 (0-5)</Label>
                <Input
                  type="number"
                  min={0}
                  max={5}
                  step={0.1}
                  value={form.rating}
                  onChange={(e) => handleChange("rating", Number(e.target.value))}
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>客層の印象</Label>
                <Textarea
                  minLength={0}
                  rows={3}
                  value={form.customerComment ?? ""}
                  onChange={(e) => handleChange("customerComment", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>スタッフ対応</Label>
                <Textarea rows={3} value={form.staffComment ?? ""} onChange={(e) => handleChange("staffComment", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>職場環境</Label>
                <Textarea
                  rows={3}
                  value={form.workEnvironmentComment ?? ""}
                  onChange={(e) => handleChange("workEnvironmentComment", e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>その他</Label>
                <Textarea rows={3} value={form.etcComment ?? ""} onChange={(e) => handleChange("etcComment", e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>連絡先メール (任意)</Label>
                <Input
                  type="email"
                  value={form.emailAddress ?? ""}
                  onChange={(e) => handleChange("emailAddress", e.target.value)}
                  placeholder="example@makoto-club.jp"
                />
              </div>
              {!isReadOnly && (
                <div className="space-y-2 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>画像（再アップロード用）</Label>
                      <p className="text-xs text-slate-600">draft の画像を確認後、確定用画像をアップロードしてください。</p>
                    </div>
                  </div>
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    onChange={(e) => handleUpload(e.target.files)}
                  />
                  {uploading && <p className="text-xs text-slate-500">アップロード中...</p>}
                  {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
                  <div className="grid gap-3">
                    {(form.imageUrls ?? []).map((url, index) => (
                      <div key={`${url}-${index}`} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2">
                        <img src={url} alt={`確定画像 ${index + 1}`} className="h-16 w-16 rounded-md object-cover" loading="lazy" />
                        <div className="flex-1 text-xs text-slate-600 break-all">{url}</div>
                        <Button type="button" size="sm" variant="ghost" onClick={() => removeImage(index)}>
                          削除
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500">画像は任意です。</p>
                </div>
              )}
            </div>
          </fieldset>

          {isReadOnly && (
            <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="space-y-1">
                <Label>投稿画像</Label>
                <p className="text-xs text-slate-600">投稿時の画像URL一覧です。必要ならダウンロードして再アップロードしてください。</p>
              </div>
              {(form.imageUrls ?? []).length === 0 ? (
                <p className="text-sm text-slate-600">投稿画像はありません。</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(form.imageUrls ?? []).map((url, index) => (
                    <a
                      key={`${url}-${index}`}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-2 transition hover:border-pink-200"
                    >
                      <img
                        src={url}
                        alt={`投稿画像 ${index + 1}`}
                        className="h-16 w-16 rounded-md object-cover"
                        loading="lazy"
                      />
                      <span className="text-xs text-slate-600 group-hover:text-slate-900">画像を開く</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {!isReadOnly && (
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">{mode === "create" ? "作成" : "更新"}</Button>
              <Button type="button" variant="outline" onClick={() => navigate("/surveys")}>
                キャンセル
              </Button>
            </div>
          )}
        </form>
      </Card>
    </div>
  );
};
