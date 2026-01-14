import { useEffect, useMemo, useState } from "react";
import { StoreCard } from "../components/cards/store-card";
import { SurveyCard } from "../components/cards/survey-card";
import type { StoreDetail } from "../types/store";
import type { SurveyDetail } from "../types/survey";
import { getStoreBookmarks, useStoreBookmarks } from "../lib/store-bookmarks";
import { getSurveyBookmarks, useSurveyBookmarks } from "../lib/survey-bookmarks";

export default function BookmarksPage() {
  const { bookmarkIds: storeBookmarkIds } = useStoreBookmarks();
  const { bookmarkIds: surveyBookmarkIds } = useSurveyBookmarks();
  const [activeTab, setActiveTab] = useState<"stores" | "surveys">("stores");
  const [stores, setStores] = useState<StoreDetail[]>([]);
  const [surveys, setSurveys] = useState<SurveyDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSurveyLoading, setIsSurveyLoading] = useState(false);

  const orderedStoreIds = useMemo(() => storeBookmarkIds, [storeBookmarkIds]);
  const orderedSurveyIds = useMemo(() => surveyBookmarkIds, [surveyBookmarkIds]);

  useEffect(() => {
    let isMounted = true;
    const ids = orderedStoreIds.length ? orderedStoreIds : getStoreBookmarks();
    if (ids.length === 0) {
      setStores([]);
      return;
    }
    setIsLoading(true);
    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/stores/${id}`);
          if (!res.ok) return null;
          return (await res.json()) as StoreDetail;
        } catch {
          return null;
        }
      }),
    )
      .then((results) => {
        if (!isMounted) return;
        const byId = new Map(results.filter(Boolean).map((store) => [store!.id, store!]));
        const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as StoreDetail[];
        setStores(ordered);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [orderedStoreIds]);

  useEffect(() => {
    let isMounted = true;
    const ids = orderedSurveyIds.length ? orderedSurveyIds : getSurveyBookmarks();
    if (ids.length === 0) {
      setSurveys([]);
      return;
    }
    setIsSurveyLoading(true);
    Promise.all(
      ids.map(async (id) => {
        try {
          const res = await fetch(`/api/surveys/${id}`);
          if (!res.ok) return null;
          return (await res.json()) as SurveyDetail;
        } catch {
          return null;
        }
      }),
    )
      .then((results) => {
        if (!isMounted) return;
        const byId = new Map(results.filter(Boolean).map((item) => [item!.id, item!]));
        const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as SurveyDetail[];
        setSurveys(ordered);
      })
      .finally(() => {
        if (isMounted) setIsSurveyLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [orderedSurveyIds]);

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-2 space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("stores")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "stores"
              ? "bg-pink-500 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
          }`}
        >
          店舗 ({storeBookmarkIds.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("surveys")}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "surveys"
              ? "bg-pink-500 text-white shadow-sm"
              : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
          }`}
        >
          アンケート ({surveyBookmarkIds.length})
        </button>
      </div>

      {activeTab === "stores" ? (
        isLoading ? (
          <div className="rounded-2xl border border-pink-100 bg-white/95 p-6 text-sm text-slate-600">
            読み込み中です...
          </div>
        ) : stores.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {stores.map((store) => (
              <StoreCard key={store.id} store={store} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-pink-100 bg-white/95 p-6 text-sm text-slate-600">
            まだ気になる店舗がありません。
          </div>
        )
      ) : isSurveyLoading ? (
        <div className="rounded-2xl border border-pink-100 bg-white/95 p-6 text-sm text-slate-600">
          読み込み中です...
        </div>
      ) : surveys.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {surveys.map((survey) => (
            <SurveyCard key={survey.id} survey={survey} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-pink-100 bg-white/95 p-6 text-sm text-slate-600">
          まだ気になるアンケートがありません。
        </div>
      )}
    </main>
  );
}
