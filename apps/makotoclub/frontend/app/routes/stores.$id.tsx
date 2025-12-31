import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { Button } from "../components/ui/button";
import { fetchStoreDetail } from "../lib/stores.server";
import { getApiBaseUrl } from "../config.server";
import type { StoreDetail } from "../types/store";
import { RatingStars } from "../components/ui/rating-stars";
import { BreadcrumbLabelSetter } from "../components/common/breadcrumb-label-setter";
import { ImageGallery } from "../components/ui/image-gallery";
import type { ImageGalleryItem } from "../components/ui/image-gallery";
import { SurveyCount } from "../components/ui/survey-count";
import { PostIcon } from "../components/ui/post-icon";
import { formatDecimal1 } from "../lib/number-format";

type LoaderData = {
  store: StoreDetail | null;
};

function MapPinIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10Z" />
      <circle cx="12" cy="11" r="2" />
    </svg>
  );
}

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const storeId = params.id!;

  let store: StoreDetail | null = null;
  try {
    store = await fetchStoreDetail({ API_BASE_URL: apiBaseUrl }, storeId);
  } catch (error) {
    console.error("Failed to load store detail", error);
  }

  return Response.json({ store });
}

export default function StoreDetailPage() {
  const { store } = useLoaderData() as LoaderData;

  if (!store) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">店舗情報を取得できませんでした。</p>
      </main>
    );
  }

  const waitLabel =
    store.waitTimeLabel ??
    (Number.isFinite(store.waitTimeHours) ? `${formatDecimal1(store.waitTimeHours)}時間` : "-");

  const photoItems: ImageGalleryItem[] = (store.surveys ?? []).flatMap((survey) => {
    const comment =
      survey.customerComment ||
      survey.workEnvironmentComment ||
      survey.staffComment ||
      survey.etcComment ||
      "";
    return (survey.imageUrls ?? []).map((url) => ({
      url,
      surveyId: survey.id,
      comment,
    }));
  });

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <BreadcrumbLabelSetter
        label={store.storeName}
        branchName={store.branchName}
        storeId={store.id}
      />

      <div className="rounded-[24px] border border-sky-100 bg-sky-50/60 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">
              {store.storeName}
              {store.branchName ? ` ${store.branchName}` : ""}
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <RatingStars value={store.averageRating ?? 0} size="lg" />
              <span className="text-3xl font-bold text-red-500">
                {(store.averageRating ?? 0).toFixed(1)}
              </span>
            </div>
            <SurveyCount count={store.surveys?.length ?? 0} />
          </div>
          <div className="w-full max-w-sm rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50 to-white p-4 shadow-sm shadow-pink-200">
            <Button asChild className="w-full rounded-full py-6 text-base font-semibold">
              <a
                href={`/surveys/new?${new URLSearchParams({
                  storeName: store.storeName,
                  branchName: store.branchName ?? "",
                  prefecture: store.prefecture,
                  industry: store.category ?? "",
                  genre: store.genre ?? "",
                }).toString()}`}
                className="flex items-center justify-center gap-3"
              >
                <PostIcon className="h-5 w-5" />
                <span className="flex flex-col items-center leading-tight">
                  <span className="text-xs font-medium">この店舗のアンケートを</span>
                  <span className="text-base font-semibold">投稿する</span>
                </span>
              </a>
            </Button>
            <div className="px-2 mt-2 text-xs font-semibold text-pink-700">
            <p>
              アンケートの投稿で
            </p>
            <p>
            PayPayプレゼントキャンペーン中 🎁
            </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-[2fr_1fr]">
          <section className="rounded-2xl border border-pink-100 bg-white/90 p-5 shadow-sm space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">店舗基本情報</h2>
            <div className="text-sm text-slate-700 space-y-2">
              <div className="grid gap-2 md:grid-cols-2">
                <InfoChip label="都道府県" value={store.prefecture} />
                {store.area && <InfoChip label="エリア" value={store.area} />}
                <InfoChip label="業種" value={store.category ?? "-"} />
                {store.genre && <InfoChip label="ジャンル" value={store.genre} />}
                <InfoChip label="稼ぎ平均" value={store.averageEarningLabel ?? "-"} />
                <InfoChip label="待機時間" value={waitLabel} />
                {store.businessHours && (
                  <InfoChip
                    label="営業時間"
                    value={`${store.businessHours.open} - ${store.businessHours.close}`}
                  />
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">最近のアンケート</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {store.surveys?.length ? (
            store.surveys.map((survey) => (
              <article
                key={survey.id}
                className="rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-[0_14px_40px_rgba(15,23,42,0.08)] space-y-2"
              >
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="font-semibold text-slate-800">{survey.visitedPeriod}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-pink-700">
                      {(survey.rating ?? 0).toFixed(1)}
                    </span>
                    <RatingStars value={survey.rating ?? 0} />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                  <span className="rounded-full bg-pink-50 px-2.5 py-1 border border-pink-100">
                    年齢: {survey.age}
                  </span>
                  <span className="rounded-full bg-pink-50 px-2.5 py-1 border border-pink-100">
                    稼ぎ: {survey.averageEarning}万
                  </span>
                  <span className="rounded-full bg-pink-50 px-2.5 py-1 border border-pink-100">
                    待機: {formatDecimal1(survey.waitTimeHours)}h
                  </span>
                </div>
                <p className="text-sm text-slate-700 line-clamp-3">
                  {survey.customerComment || survey.workEnvironmentComment || "コメントなし"}
                </p>
                <Button variant="ghost" size="sm" asChild>
                  <a href={`/surveys/${survey.id}`}>詳しく読む</a>
                </Button>
              </article>
            ))
          ) : (
            <div className="space-y-3 rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-sm">
              <p className="text-sm text-slate-600">アンケートがありません。</p>
              <Button asChild>
                <a href="/surveys/new">アンケートを追加する</a>
              </Button>
            </div>
          )}
        </div>
      </section>

      {photoItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">投稿写真</h2>
            <p className="text-xs text-slate-500">左右にスワイプして確認できます</p>
          </div>
          <ImageGallery items={photoItems} />
        </section>
      )}
    </main>
  );
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800">
      <div className="flex items-center gap-2">
        <span
          className="w-1/3 block font-semibold"
          style={{ textAlign: "justify", textAlignLast: "justify" }}
        >
          {label}:
        </span>
        <span className="w-1/2 font-medium text-slate-700">{value}</span>
      </div>
    </div>
  );
}
