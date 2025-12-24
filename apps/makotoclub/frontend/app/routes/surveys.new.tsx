import { Form, useActionData, useNavigation } from "react-router";
import { useRef, useState } from "react";
import { type ActionFunctionArgs, redirect } from "react-router";
import { getApiBaseUrl } from "../config.server";
import { Button } from "../components/ui/button";
import { RatingStars } from "../components/ui/rating-stars";

type ActionError = { error: string };

const WORK_TYPE_OPTIONS = ["在籍", "出稼ぎ"];

const PREFS = [
  "北海道",
  "青森県",
  "岩手県",
  "宮城県",
  "秋田県",
  "山形県",
  "福島県",
  "茨城県",
  "栃木県",
  "群馬県",
  "埼玉県",
  "千葉県",
  "東京都",
  "神奈川県",
  "新潟県",
  "富山県",
  "石川県",
  "福井県",
  "山梨県",
  "長野県",
  "岐阜県",
  "静岡県",
  "愛知県",
  "三重県",
  "滋賀県",
  "京都府",
  "大阪府",
  "兵庫県",
  "奈良県",
  "和歌山県",
  "鳥取県",
  "島根県",
  "岡山県",
  "広島県",
  "山口県",
  "徳島県",
  "香川県",
  "愛媛県",
  "高知県",
  "福岡県",
  "佐賀県",
  "長崎県",
  "熊本県",
  "大分県",
  "宮崎県",
  "鹿児島県",
  "沖縄県",
];

const INDUSTRY_OPTIONS = [
  "デリヘル",
  "ホテヘル",
  "箱ヘル",
  "ソープ",
  "DC",
  "風エス",
  "メンエス",
];

export async function action({ request, context }: ActionFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const formData = await request.formData();

  const ageRaw = formData.get("age");
  const specRaw = formData.get("specScore");
  const waitRaw = formData.get("waitTimeHours");
  const earnRaw = formData.get("averageEarning");
  const ratingRaw = formData.get("rating");
  const castBackRaw = formData.get("castBack");

  const ageVal = ageRaw === null || ageRaw === "" ? NaN : Number(ageRaw);
  const specVal = specRaw === null || specRaw === "" ? NaN : Number(specRaw);
  const waitVal = waitRaw === null || waitRaw === "" ? NaN : Number(waitRaw);
  const earnVal = earnRaw === null || earnRaw === "" ? NaN : Number(earnRaw);
  const ratingVal = ratingRaw === null || ratingRaw === "" ? NaN : Number(ratingRaw);
  const castBackVal =
    castBackRaw === null || castBackRaw === "" ? null : Number((castBackRaw as string).trim());
  const castBackProvided = castBackVal !== null;
  const castBackValid = castBackVal !== null && Number.isFinite(castBackVal);

  if (
    !Number.isFinite(ageVal) ||
    !Number.isFinite(specVal) ||
    !Number.isFinite(waitVal) ||
    !Number.isFinite(earnVal) ||
    !Number.isFinite(ratingVal) ||
    ageVal < 18 ||
    ageVal > 50 ||
    specVal < 50 ||
    specVal > 140 ||
    waitVal < 0 ||
    waitVal > 24 ||
    earnVal < 0 ||
    earnVal > 30 ||
    (castBackProvided && !castBackValid) ||
    (castBackValid && castBackVal < 0) ||
    (castBackValid && castBackVal > 30000) ||
    ratingVal < 0 ||
    ratingVal > 5
  ) {
    return new Response(JSON.stringify({ error: "必須項目が未入力、または範囲外の値があります" }), {
      status: 400,
    });
  }

  const fileEntries = (formData.getAll("images").filter((f) => f instanceof File) as File[]).slice(
    0,
    5,
  );
  const uploadedUrls: string[] = [];
  for (const file of fileEntries) {
    if (!file || file.size === 0) continue;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(new URL("/api/uploads", apiBaseUrl), {
      method: "POST",
      body: fd,
    });
    if (res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data?.url) uploadedUrls.push(data.url);
    }
  }

  const payload = {
    storeName: (formData.get("storeName") as string | null)?.trim() || "",
    branchName: (formData.get("branchName") as string | null)?.trim() || undefined,
    prefecture: (formData.get("prefecture") as string | null) || "",
    industry: (formData.get("industry") as string | null) || "",
    visitedPeriod: (formData.get("visitedPeriod") as string | null) || "",
    workType: (formData.get("workType") as string | null) || "",
    age: ageVal,
    specScore: specVal,
    waitTimeHours: waitVal,
    averageEarning: earnVal,
    castBack: castBackValid ? castBackVal : undefined,
    customerComment: (formData.get("customerComment") as string | null)?.trim() || undefined,
    staffComment: (formData.get("staffComment") as string | null)?.trim() || undefined,
    workEnvironmentComment:
      (formData.get("workEnvironmentComment") as string | null)?.trim() || undefined,
    etcComment: (formData.get("etcComment") as string | null)?.trim() || undefined,
    emailAddress: (formData.get("emailAddress") as string | null)?.trim() || undefined,
    imageUrls: uploadedUrls.length ? uploadedUrls : undefined,
    rating: ratingVal,
  };

  try {
    const res = await fetch(new URL("/api/surveys", apiBaseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message =
        typeof data?.error === "string"
          ? data.error
          : `投稿に失敗しました (HTTP ${res.status})`;
      return new Response(JSON.stringify({ error: message }), { status: res.status });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "投稿に失敗しました";
    return new Response(JSON.stringify({ error: message }), { status: 500 });
  }

  return redirect("/surveys");
}

export default function NewSurvey() {
  const actionData = useActionData<ActionError>();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ url: string; name: string } | null>(null);
  const [age, setAge] = useState<number>(18);
  const [specScore, setSpecScore] = useState<number>(50);
  const [rating, setRating] = useState<number>(0);
  const [waitTime, setWaitTime] = useState<number>(0);
  const [averageEarning, setAverageEarning] = useState<number>(0);
  const [castBack, setCastBack] = useState<number>(0);
  const [ageTouched, setAgeTouched] = useState(false);
  const [specTouched, setSpecTouched] = useState(false);
  const [ratingTouched, setRatingTouched] = useState(false);
  const [waitTouched, setWaitTouched] = useState(false);
  const [earningTouched, setEarningTouched] = useState(false);
  const [castTouched, setCastTouched] = useState(false);
  const MAX_IMAGES = 5;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const remainingSlots = Math.max(0, MAX_IMAGES - selectedFiles.length);
  const baseInputClass =
    "w-full min-w-0 max-w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-base md:text-sm";

  const syncInputFiles = (files: File[]) => {
    if (!fileInputRef.current) return;
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    fileInputRef.current.files = dt.files;
  };

  const handleAddFiles = (files: FileList | null) => {
    if (!files || remainingSlots <= 0) return;
    const incoming = Array.from(files);
    const valid = incoming.filter((f) => f.type.startsWith("image/") && f.size <= MAX_SIZE);
    if (valid.length === 0) {
      setImageError("画像は5MB以内の画像ファイルのみ対応しています。");
      return;
    }
    setImageError(null);
    const allowed = valid.slice(0, remainingSlots);
    const next = [
      ...selectedFiles,
      ...allowed.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ].slice(0, MAX_IMAGES);
    setSelectedFiles(next);
    syncInputFiles(next.map((n) => n.file));
  };

  const handleRemoveFile = (index: number) => {
    const target = selectedFiles[index];
    if (target?.preview) URL.revokeObjectURL(target.preview);
    const next = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(next);
    syncInputFiles(next.map((n) => n.file));
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase text-slate-500 font-semibold">Surveys</p>
          <h1 className="text-2xl font-bold text-slate-900">アンケート投稿</h1>
          <p className="text-sm text-slate-600">
            PayPay 1000円の送付を希望する場合はメールアドレスを記入してください。
          </p>
        </div>
        <Button
          type="submit"
          form="survey-form"
          disabled={isSubmitting}
          className="shadow-sm shadow-pink-200"
        >
          {isSubmitting ? "送信中..." : "投稿する"}
        </Button>
      </header>

      {actionData?.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionData.error}</p>
      ) : null}

      <Form
        id="survey-form"
        method="post"
        className="space-y-6"
        encType="multipart/form-data"
        replace
      >
        {/* 店舗情報 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">店舗情報</h2>
            <span className="text-xs text-pink-600">必須は赤印</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="店名" required>
              <input id="storeName" name="storeName" required className={baseInputClass} />
            </FormField>
            <FormField label="支店名">
              <input id="branchName" name="branchName" className={baseInputClass} />
            </FormField>
            <FormField label="都道府県" required>
              <select id="prefecture" name="prefecture" required className={baseInputClass}>
                <option value="">選択してください</option>
                {PREFS.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="業種" required>
              <select id="industry" name="industry" required className={baseInputClass}>
                <option value="">選択してください</option>
                {INDUSTRY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        </section>

        {/* アンケート内容 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">アンケート内容</h2>
            <span className="text-xs text-pink-600">必須は赤印</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="働いた時期" required>
              <input
                id="visitedPeriod"
                name="visitedPeriod"
                required
                type="month"
                placeholder="2025-01"
                className={baseInputClass}
              />
            </FormField>
            <FormField label="勤務形態" required>
              <select id="workType" name="workType" required className={baseInputClass}>
                <option value="">選択してください</option>
                {WORK_TYPE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </FormField>

            {/* 年齢スライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                年齢 (18-50+)<span className="ml-1 text-pink-600">*</span>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>年齢</span>
                <span className="font-semibold">
                  {ageTouched ? `${age} 歳` : "未設定"}
                </span>
              </div>
              <input type="hidden" name="age" value={ageTouched ? age : ""} />
              <input
                type="range"
                min="18"
                max="50"
                step="1"
                value={age}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const clamped = Math.min(50, Math.max(18, val));
                  if (!Number.isFinite(clamped)) return;
                  setAgeTouched(true);
                  setAge(clamped);
                }}
                className="w-full accent-pink-500"
              />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>18</span>
                  <span>34</span>
                  <span>50+</span>
                </div>
              </div>
            </div>

            {/* スペックスライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                スペック (50-140)<span className="ml-1 text-pink-600">*</span>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>スペック</span>
                <span className="font-semibold">{specTouched ? specScore : "未設定"}</span>
              </div>
              <input type="hidden" name="specScore" value={specTouched ? specScore : ""} />
              <input
                type="range"
                min="50"
                max="140"
                step="1"
                value={specScore}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const clamped = Math.min(140, Math.max(50, val));
                  if (!Number.isFinite(clamped)) return;
                  setSpecTouched(true);
                  setSpecScore(clamped);
                }}
                className="w-full accent-pink-500"
              />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>50</span>
                  <span>95</span>
                  <span>140</span>
                </div>
              </div>
            </div>

            {/* 平均待機時間スライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                平均待機時間 (0-24h)<span className="ml-1 text-pink-600">*</span>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>平均待機時間</span>
                  <span className="font-semibold">{waitTouched ? `${waitTime} 時間` : "未設定"}</span>
                </div>
                <input type="hidden" name="waitTimeHours" value={waitTouched ? waitTime : ""} />
                <input
                  type="range"
                  min="0"
                  max="24"
                  step="1"
                  value={waitTime}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const clamped = Math.min(24, Math.max(0, val));
                    if (!Number.isFinite(clamped)) return;
                    setWaitTouched(true);
                    setWaitTime(clamped);
                  }}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0h</span>
                  <span>12h</span>
                  <span>24h</span>
                </div>
              </div>
            </div>

            {/* 平均稼ぎスライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                平均稼ぎ (0-30万円)<span className="ml-1 text-pink-600">*</span>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>平均稼ぎ</span>
                  <span className="font-semibold">
                    {earningTouched ? `${averageEarning} 万円` : "未設定"}
                  </span>
                </div>
                <input type="hidden" name="averageEarning" value={earningTouched ? averageEarning : ""} />
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="1"
                  value={averageEarning}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const clamped = Math.min(30, Math.max(0, val));
                    if (!Number.isFinite(clamped)) return;
                    setEarningTouched(true);
                    setAverageEarning(clamped);
                  }}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0万円</span>
                  <span>15万円</span>
                  <span>30万円</span>
                </div>
              </div>
            </div>

            {/* キャストバックスライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                キャストバック (60分単価)<span className="ml-1 text-pink-600">*</span>
              </div>
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>キャストバック</span>
                  <span className="font-semibold">
                    {castTouched ? `${castBack.toLocaleString()} 円` : "未設定"}
                  </span>
                </div>
                <input type="hidden" name="castBack" value={castTouched ? castBack : ""} />
                <input
                  type="range"
                  min="0"
                  max="30000"
                  step="1000"
                  value={castBack}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    const clamped = Math.min(30000, Math.max(0, val));
                    if (!Number.isFinite(clamped)) return;
                    setCastTouched(true);
                    setCastBack(clamped);
                  }}
                  className="w-full accent-pink-500"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>0円</span>
                  <span>15,000円</span>
                  <span>30,000円</span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* コメント & 画像 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900">コメント & 画像</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextAreaField id="customerComment" label="客層の印象" />
            <TextAreaField id="staffComment" label="スタッフ対応" />
            <TextAreaField id="workEnvironmentComment" label="職場環境" />
            <TextAreaField id="etcComment" label="その他" />
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-slate-800">画像 (最大5枚、5MBまで)</label>
              <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <span>
                    {selectedFiles.length > 0
                      ? `${selectedFiles.length}/${MAX_IMAGES}件の画像を選択中`
                      : "まだ画像は選択されていません"}
                  </span>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={remainingSlots <= 0}
                  >
                    📷 画像を追加
                  </Button>
                </div>
                {imageError ? <p className="text-xs text-red-600">{imageError}</p> : null}
                <input
                  ref={fileInputRef}
                  type="file"
                  name="images"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleAddFiles(e.target.files)}
                />
                {selectedFiles.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedFiles.map((item, index) => (
                      <li
                        key={`${item.preview}-${index}`}
                        className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                      >
                        <button
                          type="button"
                          className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                          onClick={() => setModalImage({ url: item.preview, name: item.file.name })}
                        >
                          <img src={item.preview} alt={item.file.name} className="h-full w-full object-cover" />
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-slate-700" title={item.file.name}>
                            {item.file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {Math.max(0.1, item.file.size / (1024 * 1024)).toFixed(1)}MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          aria-label="画像を削除"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 text-red-500"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                            <path d="M5 6l1 14h12l1-14" />
                          </svg>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        {/* 連絡先 & 総合評価 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900">連絡先 & 総合評価</h2>
          <div className="space-y-4">
            <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-4">
                <div className="scale-125 transform">
                  <RatingStars value={ratingTouched ? rating : 0} />
                </div>
                <span className="text-base text-slate-800 font-semibold">
                  {ratingTouched ? `${rating.toFixed(1)} / 5.0` : "未設定"}
                </span>
              </div>
              <input type="hidden" name="rating" value={ratingTouched ? rating : ""} />
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  const clamped = Math.min(5, Math.max(0, val));
                  const rounded = Math.round(clamped * 10) / 10;
                  if (!Number.isFinite(rounded)) return;
                  setRatingTouched(true);
                  setRating(rounded);
                }}
                className="w-full accent-pink-500"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0</span>
                <span>2.5</span>
                <span>5.0</span>
              </div>
            </div>
            <FormField label="連絡先メールアドレス (任意)">
              <input
                id="emailAddress"
                name="emailAddress"
                type="email"
                placeholder="example@makoto-club.jp"
                className={baseInputClass}
              />
            </FormField>
          </div>
        </section>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "送信中..." : "投稿する"}
        </Button>
      </Form>

      {modalImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-2xl bg-white p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-slate-700 shadow"
              onClick={() => setModalImage(null)}
              aria-label="閉じる"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
            <div className="aspect-video overflow-hidden rounded-xl bg-slate-50">
              <img
                src={modalImage.url}
                alt={modalImage.name}
                className="h-full w-full object-contain"
              />
            </div>
            <p className="mt-2 truncate text-xs text-slate-600">{modalImage.name}</p>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label} {required && <span className="text-pink-600">*</span>}
      </label>
      {children}
    </div>
  );
}

function TextAreaField({ id, label }: { id: string; label: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        name={id}
        rows={3}
        className="w-full min-w-0 max-w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-base md:text-sm"
      />
    </div>
  );
}
