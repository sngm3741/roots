import { Form, useActionData, useNavigation } from "react-router";
import { type ActionFunctionArgs, redirect } from "react-router";
import { getApiBaseUrl } from "../config.server";
import { Button } from "../components/ui/button";

type ActionError = { error: string };

const AGE_OPTIONS = ["18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30+"];
const WAIT_TIME_OPTIONS = [
  { value: "0", label: "0時間" },
  { value: "1", label: "1時間" },
  { value: "2", label: "2時間" },
  { value: "3", label: "3時間" },
  { value: "4", label: "4時間" },
  { value: "5", label: "5時間以上" },
];
const AVERAGE_EARNING_OPTIONS = [
  { value: "0", label: "0万円" },
  { value: "5", label: "5万円" },
  { value: "10", label: "10万円" },
  { value: "20", label: "20万円" },
  { value: "30", label: "30万円以上" },
];

export async function action({ request, context }: ActionFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const formData = await request.formData();

  const payload = {
    storeName: (formData.get("storeName") as string | null)?.trim() || "",
    branchName: (formData.get("branchName") as string | null)?.trim() || undefined,
    prefecture: (formData.get("prefecture") as string | null) || "",
    industry: (formData.get("industry") as string | null) || "",
    visitedPeriod: (formData.get("visitedPeriod") as string | null) || "",
    workType: (formData.get("workType") as string | null) || "",
    age: Number(formData.get("age") || "0"),
    specScore: Number(formData.get("specScore") || "0"),
    waitTimeHours: Number(formData.get("waitTimeHours") || "0"),
    averageEarning: Number(formData.get("averageEarning") || "0"),
    castBack: (formData.get("castBack") as string | null)?.trim() || undefined,
    customerComment: (formData.get("customerComment") as string | null)?.trim() || undefined,
    staffComment: (formData.get("staffComment") as string | null)?.trim() || undefined,
    workEnvironmentComment:
      (formData.get("workEnvironmentComment") as string | null)?.trim() || undefined,
    etcComment: (formData.get("etcComment") as string | null)?.trim() || undefined,
    emailAddress: (formData.get("emailAddress") as string | null)?.trim() || undefined,
    rating: Number(formData.get("rating") || "0"),
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

  return (
    <main className="container mx-auto px-4 py-12 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase text-slate-500 font-semibold">New Survey</p>
        <h1 className="text-2xl font-bold text-slate-900">アンケート投稿</h1>
        <p className="text-sm text-slate-600">
          PayPay 1000円の送付を希望する場合はメールアドレスを記入してください。
        </p>
      </header>

      {actionData?.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionData.error}</p>
      ) : null}

      <Form method="post" className="space-y-6 max-w-3xl">
        <Field label="店舗名" name="storeName" required placeholder="例: やりすぎ娘" />
        <Field label="支店名" name="branchName" placeholder="例: 新宿店" />
        <Field label="都道府県" name="prefecture" required as="select">
          <option value="">選択してください</option>
          {/* Prefecture一覧は簡略化。必要なら全件列挙 */}
          <option value="東京都">東京都</option>
          <option value="大阪府">大阪府</option>
          <option value="愛知県">愛知県</option>
        </Field>
        <Field label="業種" name="industry" required placeholder="例: 風俗 / キャバ" />
        <Field label="働いた時期" name="visitedPeriod" required type="month" />
        <Field label="勤務形態" name="workType" required as="select">
          <option value="">選択してください</option>
          <option value="在籍">在籍</option>
          <option value="出稼ぎ">出稼ぎ</option>
        </Field>
        <Field label="年齢" name="age" required as="select">
          <option value="">選択してください</option>
          {AGE_OPTIONS.map((age) => (
            <option key={age} value={age}>
              {age}
            </option>
          ))}
        </Field>
        <Field label="スペック (1-10)" name="specScore" type="number" min={1} max={10} required />
        <Field label="待機時間" name="waitTimeHours" required as="select">
          <option value="">選択してください</option>
          {WAIT_TIME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Field>
        <Field label="平均稼ぎ" name="averageEarning" required as="select">
          <option value="">選択してください</option>
          {AVERAGE_EARNING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Field>
        <Field label="キャストバック (任意)" name="castBack" placeholder="例: 10000 / 応相談" />
        <TextArea label="客層の印象" name="customerComment" />
        <TextArea label="スタッフ対応" name="staffComment" />
        <TextArea label="職場環境" name="workEnvironmentComment" />
        <TextArea label="その他" name="etcComment" />
        <Field
          label="連絡先メールアドレス (任意)"
          name="emailAddress"
          type="email"
          placeholder="example@makoto-club.jp"
        />
        <Field
          label="満足度 (0-5)"
          name="rating"
          type="number"
          min={0}
          max={5}
          step={0.1}
          defaultValue="0"
        />

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "送信中..." : "投稿する"}
        </Button>
      </Form>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: string;
  as?: "input" | "select";
  children?: React.ReactNode;
};

function Field({
  label,
  name,
  required,
  placeholder,
  type = "text",
  min,
  max,
  step,
  defaultValue,
  as = "input",
  children,
}: FieldProps) {
  const baseClass =
    "w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white";

  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-800">
        {label} {required ? <span className="text-pink-600">*</span> : null}
      </label>
      {as === "select" ? (
        <select name={name} required={required} className={baseClass} defaultValue={defaultValue}>
          {children}
        </select>
      ) : (
        <input
          name={name}
          type={type}
          required={required}
          placeholder={placeholder}
          min={min}
          max={max}
          step={step}
          defaultValue={defaultValue}
          className={baseClass}
        />
      )}
    </div>
  );
}

function TextArea({ label, name }: { label: string; name: string }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-slate-800">{label}</label>
      <textarea
        name={name}
        rows={4}
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none bg-white"
      />
    </div>
  );
}
