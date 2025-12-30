import { Form, useActionData, useNavigation, useSubmit } from "react-router";
import { useEffect, useRef, useState } from "react";
import { type ActionFunctionArgs, redirect } from "react-router";
import { getApiBaseUrl } from "../config.server";
import { Button } from "../components/ui/button";
import { RatingStars } from "../components/ui/rating-stars";
import { HelpIcon } from "../components/ui/help-icon";
import { Controller, type UseFormRegister, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

type ActionError = { error: string };

const WORK_TYPE_OPTIONS = ["在籍", "出稼ぎ", "その他"];

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
  "その他",
];

const surveySchema = z
  .object({
    storeName: z.string().trim().min(1, "店名の入力がされていません"),
    branchName: z.string().trim().optional().or(z.literal("")),
    prefecture: z.string().min(1, "都道府県の入力がされていません"),
    industry: z.string().min(1, "業種の入力がされていません"),
    industryOther: z.string().trim().optional().or(z.literal("")),
    visitedPeriod: z
      .string()
      .min(1, "働いた時期の入力がされていません")
      .regex(/^\d{4}-\d{2}$/, "働いた時期の形式が正しくありません"),
    workType: z.string().min(1, "勤務形態の入力がされていません"),
    workTypeOther: z.string().trim().optional().or(z.literal("")),
    age: z
      .number({ required_error: "年齢の入力がされていません" })
      .min(18, "年齢は18〜50で入力してください")
      .max(50, "年齢は18〜50で入力してください"),
    specScore: z
      .number({ required_error: "スペックの入力がされていません" })
      .min(50, "スペックは50〜140で入力してください")
      .max(140, "スペックは50〜140で入力してください"),
    waitTimeHours: z
      .number({ required_error: "待機時間の入力がされていません" })
      .min(0, "待機時間は0〜24で入力してください")
      .max(24, "待機時間は0〜24で入力してください"),
    averageEarning: z
      .number({ required_error: "稼ぎの入力がされていません" })
      .min(0, "稼ぎは0〜30で入力してください")
      .max(30, "稼ぎは0〜30で入力してください"),
    castBack: z
      .number()
      .min(0, "キャストバックは0〜30000で入力してください")
      .max(30000, "キャストバックは0〜30000で入力してください")
      .optional(),
    rating: z
      .number({ required_error: "満足度の入力がされていません" })
      .min(0, "満足度は0〜5で入力してください")
      .max(5, "満足度は0〜5で入力してください"),
    customerComment: z.string().trim().optional().or(z.literal("")),
    staffComment: z.string().trim().optional().or(z.literal("")),
    workEnvironmentComment: z.string().trim().optional().or(z.literal("")),
    etcComment: z.string().trim().optional().or(z.literal("")),
    emailAddress: z
      .string()
      .trim()
      .email("メールアドレスの形式が正しくありません")
      .optional()
      .or(z.literal("")),
  })
  .refine(
    (data) => data.industry !== "その他" || Boolean(data.industryOther?.trim()),
    {
      path: ["industryOther"],
      message: "その他の業種の入力がされていません",
    },
  )
  .refine(
    (data) => data.workType !== "その他" || Boolean(data.workTypeOther?.trim()),
    {
      path: ["workTypeOther"],
      message: "その他の勤務形態の入力がされていません",
    },
  );

type SurveyFormValues = z.infer<typeof surveySchema>;

export async function action({ request, context }: ActionFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const formData = await request.formData();

  const ageRaw = formData.get("age");
  const specRaw = formData.get("specScore");
  const waitRaw = formData.get("waitTimeHours");
  const earnRaw = formData.get("averageEarning");
  const ratingRaw = formData.get("rating");
  const castBackRaw = formData.get("castBack");
  const industryVal = (formData.get("industry") as string | null) || "";
  const workTypeVal = (formData.get("workType") as string | null) || "";
  const industryOtherVal = (formData.get("industryOther") as string | null)?.trim() || "";
  const workTypeOtherVal = (formData.get("workTypeOther") as string | null)?.trim() || "";

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
    (industryVal === "その他" && industryOtherVal === "") ||
    (workTypeVal === "その他" && workTypeOtherVal === "") ||
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
    industry: industryVal,
    industryOther: industryVal === "その他" ? industryOtherVal : undefined,
    visitedPeriod: (formData.get("visitedPeriod") as string | null) || "",
    workType: workTypeVal,
    workTypeOther: workTypeVal === "その他" ? workTypeOtherVal : undefined,
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
  const submit = useSubmit();
  const isSubmitting = navigation.state === "submitting";
  const {
    register,
    handleSubmit,
    setValue,
    setFocus,
    control,
    watch,
    formState: { errors, submitCount },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(surveySchema),
    shouldFocusError: false,
    defaultValues: {
      storeName: "",
      branchName: "",
      prefecture: "",
      industry: "",
      industryOther: "",
      visitedPeriod: "",
      workType: "",
      workTypeOther: "",
      customerComment: "",
      staffComment: "",
      workEnvironmentComment: "",
      etcComment: "",
      emailAddress: "",
    },
  });
  const [selectedFiles, setSelectedFiles] = useState<{ file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [modalImage, setModalImage] = useState<{ url: string; name: string } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [ageUi, setAgeUi] = useState<number>(18);
  const [specUi, setSpecUi] = useState<number>(50);
  const [ratingUi, setRatingUi] = useState<number>(0);
  const [waitUi, setWaitUi] = useState<number>(0);
  const [earnUi, setEarnUi] = useState<number>(0);
  const [castUi, setCastUi] = useState<number>(0);
  const MAX_IMAGES = 5;
  const MAX_SIZE = 5 * 1024 * 1024; // 5MB

  const remainingSlots = Math.max(0, MAX_IMAGES - selectedFiles.length);
  const industry = watch("industry");
  const workType = watch("workType");
  const industryOther = watch("industryOther");
  const workTypeOther = watch("workTypeOther");
  const isIndustryOther = industry === "その他";
  const isWorkTypeOther = workType === "その他";
  const industryOtherError =
    errors.industryOther?.message ??
    (submitCount > 0 && isIndustryOther && !industryOther?.trim()
      ? "その他の業種の入力がされていません"
      : undefined);
  const workTypeOtherError =
    errors.workTypeOther?.message ??
    (submitCount > 0 && isWorkTypeOther && !workTypeOther?.trim()
      ? "その他の勤務形態の入力がされていません"
      : undefined);
  const baseInputClass =
    "box-border w-full min-w-0 max-w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-base md:text-sm";

  useEffect(() => {
    if (actionData?.error) {
      setServerError(actionData.error);
    }
  }, [actionData?.error]);

  useEffect(() => {
    if (!isIndustryOther) {
      setValue("industryOther", "");
    }
  }, [isIndustryOther, setValue]);

  useEffect(() => {
    if (!isWorkTypeOther) {
      setValue("workTypeOther", "");
    }
  }, [isWorkTypeOther, setValue]);

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

  const onSubmit = handleSubmit((data) => {
    const formData = new FormData();
    const appendIfPresent = (key: string, value?: string) => {
      if (!value) return;
      const trimmed = value.trim();
      if (trimmed) formData.set(key, trimmed);
    };

    formData.set("storeName", data.storeName.trim());
    appendIfPresent("branchName", data.branchName);
    formData.set("prefecture", data.prefecture);
    formData.set("industry", data.industry);
    appendIfPresent("industryOther", data.industryOther);
    formData.set("visitedPeriod", data.visitedPeriod);
    formData.set("workType", data.workType);
    appendIfPresent("workTypeOther", data.workTypeOther);
    formData.set("age", String(data.age));
    formData.set("specScore", String(data.specScore));
    formData.set("waitTimeHours", String(data.waitTimeHours));
    formData.set("averageEarning", String(data.averageEarning));
    if (typeof data.castBack === "number") {
      formData.set("castBack", String(data.castBack));
    }
    formData.set("rating", String(data.rating));
    appendIfPresent("customerComment", data.customerComment);
    appendIfPresent("staffComment", data.staffComment);
    appendIfPresent("workEnvironmentComment", data.workEnvironmentComment);
    appendIfPresent("etcComment", data.etcComment);
    appendIfPresent("emailAddress", data.emailAddress);

    selectedFiles.forEach((item) => {
      formData.append("images", item.file);
    });

    submit(formData, {
      method: "post",
      encType: "multipart/form-data",
      replace: true,
    });
  }, () => {
    const order: (keyof SurveyFormValues)[] = [
      "storeName",
      "prefecture",
      "industry",
      "industryOther",
      "visitedPeriod",
      "workType",
      "workTypeOther",
      "age",
      "specScore",
      "waitTimeHours",
      "averageEarning",
      "castBack",
      "rating",
      "emailAddress",
    ];

    for (const field of order) {
      if (field === "industryOther" && !isIndustryOther) continue;
      if (field === "workTypeOther" && !isWorkTypeOther) continue;
      const fieldError = errors[field];
      const forceOtherError =
        (field === "industryOther" && isIndustryOther && !industryOther?.trim()) ||
        (field === "workTypeOther" && isWorkTypeOther && !workTypeOther?.trim());
      if (fieldError || forceOtherError) {
        setFocus(field);
        break;
      }
    }
  });

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">アンケート投稿</h1>
          <p className="text-sm text-slate-600">
            🎁 アンケートの回答者にPayPay1000円分プレゼント 🎁
          </p>
        </div>
      </header>

      <Form
        id="survey-form"
        method="post"
        className="space-y-6"
        encType="multipart/form-data"
        replace
        noValidate
        onSubmit={onSubmit}
      >
        {/* 店舗情報 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">店舗情報</h2>
            <span className="text-xs text-pink-600">必須は赤印</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="店名" required errorMessage={errors.storeName?.message}>
              <input id="storeName" {...register("storeName")} className={baseInputClass} />
            </FormField>
            <FormField label="支店名">
              <input id="branchName" {...register("branchName")} className={baseInputClass} />
            </FormField>
            <FormField label="都道府県" required errorMessage={errors.prefecture?.message}>
              <select id="prefecture" {...register("prefecture")} className={baseInputClass}>
                <option value="">選択してください</option>
                {PREFS.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField
              label="業種"
              required
              errorMessage={errors.industry?.message}
            >
              <>
                <select
                  id="industry"
                  className={baseInputClass}
                  {...register("industry")}
                >
                  <option value="">選択してください</option>
                  {INDUSTRY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isIndustryOther ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <label className="text-sm font-semibold text-slate-800" htmlFor="industryOther">
                    その他の業種を記入
                  </label>
                  <textarea
                    id="industryOther"
                    rows={3}
                    disabled={!isIndustryOther}
                    className={`${baseInputClass} mt-2 min-h-[96px]`}
                    {...register("industryOther")}
                  />
                  {industryOtherError ? <FieldError message={industryOtherError} /> : null}
                </div>
              </>
            </FormField>
          </div>
        </section>

        {/* アンケート内容 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">アンケート</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="働いた時期" required errorMessage={errors.visitedPeriod?.message}>
              <input
                id="visitedPeriod"
                type="month"
                placeholder="2025-01"
                className={baseInputClass}
                {...register("visitedPeriod")}
              />
            </FormField>
            <FormField
              label="勤務形態"
              required
              errorMessage={errors.workType?.message}
            >
              <>
                <select
                  id="workType"
                  className={baseInputClass}
                  {...register("workType")}
                >
                  <option value="">選択してください</option>
                  {WORK_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isWorkTypeOther ? "mt-2 max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <label className="text-sm font-semibold text-slate-800" htmlFor="workTypeOther">
                    その他の勤務形態を記入
                  </label>
                  <textarea
                    id="workTypeOther"
                    rows={3}
                    disabled={!isWorkTypeOther}
                    className={`${baseInputClass} mt-2 min-h-[96px]`}
                    {...register("workTypeOther")}
                  />
                  {workTypeOtherError ? <FieldError message={workTypeOtherError} /> : null}
                </div>
              </>
            </FormField>

            {/* 年齢スライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                年齢<span className="ml-1 text-pink-600">*</span>
              </div>
              <Controller
                name="age"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span className="font-semibold">
                        {typeof field.value === "number" ? `${field.value} 歳` : "未設定"}
                      </span>
                    </div>
                    <input
                      ref={field.ref}
                      name={field.name}
                      type="range"
                      min="18"
                      max="50"
                      step="1"
                      value={ageUi}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const clamped = Math.min(50, Math.max(18, val));
                        if (!Number.isFinite(clamped)) return;
                        setAgeUi(clamped);
                        field.onChange(clamped);
                      }}
                      className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>18</span>
                      <span>34</span>
                      <span>50以上</span>
                    </div>
                  </div>
                )}
              />
              {errors.age?.message ? <FieldError message={errors.age.message} /> : null}
            </div>

            {/* スペックスライダー */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
                <div className="flex items-center gap-1.5">
                  <span>スペック</span>
                  <span className="text-pink-600">*</span>
                </div>
                <HelpIcon
                  label={
                    "『スペック』\n身長cm - 体重kgの数値\n\n例)\n155cm/49kg の場合\n155 - 49 = スペ106"
                  }
                  iconClassName="h-6 w-6 text-slate-500"
                />
              </div>
              <Controller
                name="specScore"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span className="font-semibold">
                        {typeof field.value === "number" ? field.value : "未設定"}
                      </span>
                    </div>
                    <input
                      ref={field.ref}
                      name={field.name}
                      type="range"
                      min="50"
                      max="140"
                      step="1"
                      value={specUi}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const clamped = Math.min(140, Math.max(50, val));
                        if (!Number.isFinite(clamped)) return;
                        setSpecUi(clamped);
                        field.onChange(clamped);
                      }}
                      className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>50以下</span>
                      <span>95</span>
                      <span>140以上</span>
                    </div>
                  </div>
                )}
              />
              {errors.specScore?.message ? (
                <FieldError message={errors.specScore.message} />
              ) : null}
            </div>

            {/* 平均待機時間スライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                1日の平均待機時間<span className="ml-1 text-pink-600">*</span>
              </div>
              <Controller
                name="waitTimeHours"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span className="font-semibold">
                        {typeof field.value === "number" ? `${field.value} 時間` : "未設定"}
                      </span>
                    </div>
                    <input
                      ref={field.ref}
                      name={field.name}
                      type="range"
                      min="0"
                      max="24"
                      step="1"
                      value={waitUi}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const clamped = Math.min(24, Math.max(0, val));
                        if (!Number.isFinite(clamped)) return;
                        setWaitUi(clamped);
                        field.onChange(clamped);
                      }}
                      className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0h</span>
                      <span>12h</span>
                      <span>24h</span>
                    </div>
                  </div>
                )}
              />
              {errors.waitTimeHours?.message ? (
                <FieldError message={errors.waitTimeHours.message} />
              ) : null}
            </div>

            {/* 平均稼ぎスライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                1日の平均稼ぎ<span className="ml-1 text-pink-600">*</span>
              </div>
              <Controller
                name="averageEarning"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span className="font-semibold">
                        {typeof field.value === "number" ? `${field.value} 万円` : "未設定"}
                      </span>
                    </div>
                    <input
                      ref={field.ref}
                      name={field.name}
                      type="range"
                      min="0"
                      max="20"
                      step="1"
                      value={earnUi}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const clamped = Math.min(30, Math.max(0, val));
                        if (!Number.isFinite(clamped)) return;
                        setEarnUi(clamped);
                        field.onChange(clamped);
                      }}
                      className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0万円</span>
                      <span>10万円</span>
                      <span>20万円</span>
                    </div>
                  </div>
                )}
              />
              {errors.averageEarning?.message ? (
                <FieldError message={errors.averageEarning.message} />
              ) : null}
            </div>

            {/* キャストバックスライダー */}
            <div className="space-y-2">
              <div className="text-sm font-semibold text-slate-800">
                キャストバック (60分単価)
              </div>
              <Controller
                name="castBack"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between text-sm text-slate-700">
                      <span className="font-semibold">
                        {typeof field.value === "number"
                          ? `${field.value.toLocaleString()} 円`
                          : "未設定"}
                      </span>
                    </div>
                    <input
                      ref={field.ref}
                      name={field.name}
                      type="range"
                      min="0"
                      max="20000"
                      step="500"
                      value={castUi}
                      onBlur={field.onBlur}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        const clamped = Math.min(30000, Math.max(0, val));
                        if (!Number.isFinite(clamped)) return;
                        setCastUi(clamped);
                        field.onChange(clamped);
                      }}
                      className="w-full accent-pink-500"
                    />
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>0円</span>
                      <span>10,000円</span>
                      <span>20,000円</span>
                    </div>
                  </div>
                )}
              />
              {errors.castBack?.message ? <FieldError message={errors.castBack.message} /> : null}
            </div>

          </div>
        </section>

        {/* コメント */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900">コメント</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <TextAreaField id="customerComment" label="客層について" register={register} />
            <TextAreaField id="staffComment" label="スタッフ対応について" register={register} />
            <TextAreaField id="workEnvironmentComment" label="環境について" register={register} />
            <TextAreaField id="etcComment" label="その他(稼ぎや全体的な感想など)" register={register} />
          </div>
        </section>

        {/* 画像 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900">画像</h2>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-800">最大5枚・各5MBまで</label>
            <div className="space-y-3 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
              <div
                className={`flex flex-wrap items-center gap-2 text-xs text-slate-600 ${
                  selectedFiles.length > 0 ? "justify-between" : "justify-center"
                }`}
              >
                {selectedFiles.length > 0 ? (
                  <span>{`${selectedFiles.length}/${MAX_IMAGES}件の画像を選択中`}</span>
                ) : (
                  <span className="sr-only">画像は未選択</span>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={remainingSlots <= 0}
                >
                  <span className="inline-flex items-center gap-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 512 512"
                      className="h-4 w-4 text-pink-600"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M78.01 78.01V512H512V78.01H78.01zM472.987 472.987H117.022V117.022h355.965v355.965z" />
                      <path d="M142.17 404.714h305.67c3.055 0 5.859-1.676 7.306-4.366 1.448-2.681 1.303-5.95-.381-8.494l-94.854-143.716c-3.84-5.82-10.346-9.316-17.324-9.316-6.971.015-13.476 3.519-17.308 9.355L258.46 349.863l-36.879-41.801c-4.281-4.845-10.574-7.427-17.019-6.962-6.452.457-12.319 3.901-15.861 9.301l-53.464 81.469c-1.676 2.552-1.813 5.805-.365 8.487 1.447 2.688 4.251 4.357 7.298 4.357z" />
                      <path d="M220.065 269.4c23.228 0 42.053-18.824 42.053-42.052s-18.825-42.052-42.053-42.052c-23.228 0-42.06 18.824-42.06 42.052S196.837 269.4 220.065 269.4z" />
                      <path d="M433.99 39.013V0H0v433.99h39.013v-39.012V39.013h355.965z" />
                    </svg>
                    画像を追加する
                  </span>
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
        </section>

        {/* 満足度 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            満足度<span className="ml-1 text-pink-600">*</span>
          </h2>
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
            <Controller
              name="rating"
              control={control}
              render={({ field }) => (
                <>
                  <div className="flex items-center gap-4">
                    <div className="scale-125 transform">
                      <RatingStars
                        value={typeof field.value === "number" ? field.value : 0}
                      />
                    </div>
                    <span className="text-base text-slate-800 font-semibold">
                      {typeof field.value === "number"
                        ? `${field.value.toFixed(1)} / 5.0`
                        : "未設定"}
                    </span>
                  </div>
                  <input
                    ref={field.ref}
                    name={field.name}
                    type="range"
                    min="0"
                    max="5"
                    step="0.1"
                    value={ratingUi}
                    onBlur={field.onBlur}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      const clamped = Math.min(5, Math.max(0, val));
                      const rounded = Math.round(clamped * 10) / 10;
                      if (!Number.isFinite(rounded)) return;
                      setRatingUi(rounded);
                      field.onChange(rounded);
                    }}
                    className="w-full accent-pink-500"
                  />
                </>
              )}
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span>0</span>
              <span>2.5</span>
              <span>5.0</span>
            </div>
            {errors.rating?.message ? <FieldError message={errors.rating.message} /> : null}
          </div>
        </section>

        {/* 連絡先 */}
        <section className="card-surface space-y-4 rounded-3xl border border-pink-100/80 p-6">
          <h2 className="text-lg font-semibold text-slate-900">連絡先</h2>
          <p className="text-sm text-slate-500">
            報酬のPayPayを受け取り希望の方は入力してください。
          </p>
          <FormField
            label="メールアドレス"
            errorMessage={errors.emailAddress?.message}
          >
            <input
              id="emailAddress"
              type="email"
              placeholder="example@makoto-club.jp"
              className={baseInputClass}
              {...register("emailAddress")}
            />
          </FormField>
        </section>

        <Button type="submit" className="w-full">
          {isSubmitting ? "送信中..." : "投稿する"}
        </Button>
      </Form>

      {serverError ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setServerError(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-semibold text-slate-900">
              アンケートの送信に失敗しました
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              アンケートの送信に失敗しました。バグ報告はこちらまでご連絡ください。
            </p>
            <a
              href="/contact"
              className="mt-3 inline-flex items-center justify-center rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-600 transition hover:border-pink-300 hover:bg-pink-100"
            >
              バグ報告はこちらまで
            </a>
            <p className="mt-2 text-xs text-slate-500">可能ならスクショもお願いします🙇</p>
            <p className="mt-3 text-xs text-slate-400">{serverError}</p>
            <div className="mt-4 flex justify-end">
              <Button type="button" onClick={() => setServerError(null)}>
                閉じる
              </Button>
            </div>
          </div>
        </div>
      ) : null}

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

function FormField({
  label,
  required,
  errorMessage,
  children,
}: {
  label: string;
  required?: boolean;
  errorMessage?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label} {required && <span className="text-pink-600">*</span>}
      </label>
      {children}
      {errorMessage ? <FieldError message={errorMessage} /> : null}
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return <p className="text-sm font-semibold text-red-600">{message}</p>;
}

type CommentField = "customerComment" | "staffComment" | "workEnvironmentComment" | "etcComment";

function TextAreaField({
  id,
  label,
  register,
}: {
  id: CommentField;
  label: string;
  register: UseFormRegister<SurveyFormValues>;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800" htmlFor={id}>
        {label}
      </label>
      <textarea
        id={id}
        rows={3}
        className="box-border w-full min-w-0 max-w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-base md:text-sm"
        {...register(id)}
      />
    </div>
  );
}
