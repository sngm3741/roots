import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect } from "react-router";
import { getApiBaseUrl } from "../config.server";
import { Button } from "../components/ui/button";
import type { StoreSummary } from "../types/store";

type LoaderData = {
  stores: StoreSummary[];
};

type ActionData = { error?: string };

export async function loader({ context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  let stores: StoreSummary[] = [];
  try {
    const res = await fetch(new URL("/api/stores?limit=100", apiBaseUrl));
    if (res.ok) {
      const data = await res.json();
      stores = data.items ?? [];
    }
  } catch (error) {
    console.error("管理画面の店舗一覧取得に失敗しました", error);
  }
  return Response.json({ stores });
}

export async function action({ request, context }: ActionFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const formData = await request.formData();
  const recruitmentUrl = String(formData.get("recruitmentUrl") ?? "").trim();
  const businessHoursText = String(formData.get("businessHoursText") ?? "").trim();
  const lineUrl = String(formData.get("lineUrl") ?? "").trim();
  const twitterUrl = String(formData.get("twitterUrl") ?? "").trim();
  const bskyUrl = String(formData.get("bskyUrl") ?? "").trim();

  const payload = {
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    branchName: formData.get("branchName") || undefined,
    prefecture: formData.get("prefecture"),
    area: formData.get("area") || undefined,
    industry: formData.get("industry"),
    genre: formData.get("genre") || undefined,
    phoneNumber: formData.get("phoneNumber") || undefined,
    email: formData.get("email") || undefined,
    lineUrl: lineUrl || undefined,
    twitterUrl: twitterUrl || undefined,
    bskyUrl: bskyUrl || undefined,
    recruitmentUrls: recruitmentUrl ? [recruitmentUrl] : [],
    businessHoursText: businessHoursText || undefined,
  };

  try {
    const res = await fetch(new URL("/api/admin/stores", apiBaseUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return Response.json(
        { error: typeof data?.error === "string" ? data.error : `HTTP ${res.status}` },
        { status: res.status },
      );
    }
  } catch (error) {
    return Response.json(
      { error: "店舗の作成に失敗しました。時間をおいて再度お試しください。" },
      { status: 500 },
    );
  }

  return redirect("/admin/stores");
}

export default function AdminStores() {
  const { stores } = useLoaderData() as LoaderData;
  const actionData = useActionData() as ActionData | undefined;
  const nav = useNavigation();
  const submitting = nav.state === "submitting";

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase text-slate-500 font-semibold">Admin</p>
        <h1 className="text-2xl font-bold text-slate-900">店舗登録</h1>
        <p className="text-sm text-slate-600">Figmaトーンに合わせた管理画面スタイル。</p>
      </header>

      {actionData?.error ? (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{actionData.error}</p>
      ) : null}

      <Form
        method="post"
        className="card-surface grid gap-4 rounded-3xl border border-pink-100/80 bg-white/95 p-6 shadow-sm md:grid-cols-2"
      >
        <Field label="店舗ID (空で自動生成)" name="id" />
        <Field label="店舗名" name="name" required />
        <Field label="支店名" name="branchName" />
        <Field label="都道府県" name="prefecture" required placeholder="例: 東京都" />
        <Field label="エリア" name="area" placeholder="例: 新宿" />
        <Field label="業種" name="industry" required placeholder="例: 風俗 / キャバ" />
        <Field label="ジャンル" name="genre" placeholder="例: ソープ / キャバクラ" />
        <Field label="電話番号" name="phoneNumber" placeholder="例: 03-1234-5678" />
        <Field label="Email" name="email" type="email" placeholder="例: info@example.com" />
        <Field label="LINE URL" name="lineUrl" placeholder="https://line.me/..." />
        <Field label="X(Twitter) URL" name="twitterUrl" placeholder="https://x.com/..." />
        <Field label="Bsky URL" name="bskyUrl" placeholder="https://bsky.app/..." />
        <Field
          label="採用URL"
          name="recruitmentUrl"
          placeholder="https://example.com/recruit"
        />
        <Field
          label="営業時間(自由入力)"
          name="businessHoursText"
          placeholder="例: 24時間 / 24:00~4:00"
        />

        <div className="md:col-span-2">
          <Button type="submit" disabled={submitting} className="w-full shadow-sm shadow-pink-200">
            {submitting ? "保存中..." : "店舗を登録"}
          </Button>
        </div>
      </Form>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">登録済み店舗</h2>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {stores.map((store) => (
            <article
              key={store.id}
              className="rounded-2xl border border-pink-100/80 bg-white/95 p-4 shadow-sm space-y-2"
            >
              <div className="text-xs text-slate-500">{store.id}</div>
              <h3 className="text-lg font-semibold text-slate-900">
                {store.storeName}
                {store.branchName ? ` ${store.branchName}` : ""}
              </h3>
              <p className="text-sm text-slate-600">
                {store.prefecture}
                {store.area ? ` / ${store.area}` : ""} / {store.category}
              </p>
              <div className="text-sm text-slate-600">
                総評: {store.averageRating?.toFixed?.(1) ?? "-"} / 稼ぎ:{" "}
                {store.averageEarningLabel ?? "-"}
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to={`/stores/${store.id}`}>店舗ページ</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

type FieldProps = {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
};

function Field({ label, name, required, placeholder, type = "text", step, min, max }: FieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-800">
        {label} {required ? <span className="text-pink-600">*</span> : null}
      </label>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-sm"
      />
    </div>
  );
}
