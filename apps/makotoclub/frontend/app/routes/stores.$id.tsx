import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
import { fetchStoreDetail } from "../lib/stores.server";
import { fetchStoreComments } from "../lib/comments.server";
import { getApiBaseUrl } from "../config.server";
import type { StoreDetail } from "../types/store";
import type { StoreComment } from "../types/comment";
import { RatingStars } from "../components/ui/rating-stars";
import { BreadcrumbLabelSetter } from "../components/common/breadcrumb-label-setter";
import { ImageGallery } from "../components/ui/image-gallery";
import type { ImageGalleryItem } from "../components/ui/image-gallery";
import { SurveyCount } from "../components/ui/survey-count";
import { PostIcon } from "../components/ui/post-icon";
import { formatDecimal1 } from "../lib/number-format";
import { buildLimitedComment } from "../lib/comment-text";
import { CommentComposer } from "../components/comments/comment-composer";
import { CommentList } from "../components/comments/comment-list";
import {
  Briefcase,
  Building2,
  CircleDollarSign,
  Clock,
  Heart,
  MapPin,
  Mail,
  MessageCircle,
  Phone,
  Store,
  Globe,
  Tag,
  Timer,
} from "lucide-react";
import { SurveyCard } from "../components/cards/survey-card";
import { useStoreBookmark } from "../lib/store-bookmarks";

type LoaderData = {
  store: StoreDetail | null;
  comments: StoreComment[];
};

const SORT_OPTIONS = [
  { value: "newest", label: "新着順" },
  { value: "earning", label: "稼ぎ順" },
  { value: "rating", label: "満足度順" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const storeId = params.id!;

  let store: StoreDetail | null = null;
  let comments: StoreComment[] = [];
  try {
    store = await fetchStoreDetail({ API_BASE_URL: apiBaseUrl }, storeId);
    if (store?.id) {
      comments = await fetchStoreComments({ API_BASE_URL: apiBaseUrl }, store.id);
    }
  } catch (error) {
    console.error("Failed to load store detail", error);
  }

  return Response.json({ store, comments });
}

export default function StoreDetailPage() {
  const { store, comments: initialComments } = useLoaderData() as LoaderData;
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [comments, setComments] = useState<StoreComment[]>(initialComments);
  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const [commentPage, setCommentPage] = useState(1);
  const commentPageSize = 5;
  const commentMaxChars = 1000;
  const { isBookmarked, toggle } = useStoreBookmark(store?.id ?? "");

  if (!store) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">店舗情報を取得できませんでした。</p>
      </main>
    );
  }

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const waitLabel =
    store.waitTimeLabel ??
    (Number.isFinite(store.waitTimeHours) ? `${formatDecimal1(store.waitTimeHours)}時間` : "-");

  const photoItems: ImageGalleryItem[] = (store.surveys ?? []).flatMap((survey) => {
    const comment = buildLimitedComment(
      [
        survey.customerComment,
        survey.staffComment,
        survey.workEnvironmentComment,
        survey.etcComment,
      ],
      60,
    );
    return (survey.imageUrls ?? []).map((url) => ({
      url,
      surveyId: survey.id,
      comment,
    }));
  });

  const surveys = store.surveys ?? [];
  const totalSurveys = surveys.length;
  const sortedSurveys = useMemo(() => {
    const copy = [...surveys];
    if (sort === "earning") {
      copy.sort((a, b) => (b.averageEarning ?? 0) - (a.averageEarning ?? 0));
      return copy;
    }
    if (sort === "rating") {
      copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      return copy;
    }
    copy.sort((a, b) => {
      const aTime = Date.parse(a.visitedPeriod ?? "") || 0;
      const bTime = Date.parse(b.visitedPeriod ?? "") || 0;
      return bTime - aTime;
    });
    return copy;
  }, [surveys, sort]);
  const totalPages = Math.max(1, Math.ceil(totalSurveys / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedSurveys = sortedSurveys.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  const orderedComments = useMemo(() => {
    const list = [...comments];
    list.sort((a, b) => {
      const aSeq = typeof a.seq === "number" ? a.seq : null;
      const bSeq = typeof b.seq === "number" ? b.seq : null;
      if (aSeq !== null && bSeq !== null) {
        return aSeq - bSeq;
      }
      const aTime = Date.parse(a.createdAt) || 0;
      const bTime = Date.parse(b.createdAt) || 0;
      return aTime - bTime;
    });
    return list;
  }, [comments]);

  const totalCommentPages = Math.max(1, Math.ceil(orderedComments.length / commentPageSize));
  const pagedComments = useMemo(() => {
    const start = (commentPage - 1) * commentPageSize;
    return orderedComments.slice(start, start + commentPageSize);
  }, [orderedComments, commentPage, commentPageSize]);

  const commentsByParent = useMemo(() => {
    const map = new Map<string | null, StoreComment[]>();
    for (const comment of comments) {
      const key = comment.parentId ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(comment);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const aTime = Date.parse(a.createdAt) || 0;
        const bTime = Date.parse(b.createdAt) || 0;
        return aTime - bTime;
      });
    }
    return map;
  }, [comments]);

  const replyCountById = useMemo(() => {
    const map = new Map<string, number>();
    for (const [key, list] of commentsByParent.entries()) {
      if (key) {
        map.set(key, list.length);
      }
    }
    return map;
  }, [commentsByParent]);

  const commentNumberById = useMemo(() => {
    const map = new Map<string, number>();
    orderedComments.forEach((comment, index) => {
      if (typeof comment.seq === "number") {
        map.set(comment.id, comment.seq);
      } else {
        map.set(comment.id, index + 1);
      }
    });
    return map;
  }, [orderedComments]);

  useEffect(() => {
    if (commentPage > totalCommentPages) {
      setCommentPage(totalCommentPages);
    }
  }, [commentPage, totalCommentPages]);

  const submitComment = async (params: {
    body: string;
    authorName: string;
    parentId?: string | null;
  }) => {
    const body = params.body.trim();
    const authorName = params.authorName.trim();
    if (!body) {
      setCommentError("コメント本文が必要です。");
      return;
    }
    if (body.length > 1000) {
      setCommentError("コメントは1000文字以内で入力してください。");
      return;
    }
    if (authorName.length > 40) {
      setCommentError("ハンドルネームは40文字以内で入力してください。");
      return;
    }
    setCommentError(null);
    setIsCommentSubmitting(true);
    try {
      const res = await fetch(`/api/stores/${store.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          authorName: authorName || undefined,
          parentId: params.parentId ?? undefined,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setCommentError(msg || "投稿に失敗しました。");
        setIsCommentSubmitting(false);
        return;
      }
      const data = (await res.json()) as StoreComment;
      setComments((prev) => {
        const next = [...prev, data];
        const nextPages = Math.max(1, Math.ceil(next.length / commentPageSize));
        setCommentPage(nextPages);
        return next;
      });
      setCommentBody("");
      setCommentName("");
      setReplyBody("");
      setReplyName("");
      setReplyToId(null);
      requestAnimationFrame(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
        commentsEndRef.current?.focus();
      });
    } catch {
      setCommentError("投稿に失敗しました。");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleSortChange = (value: SortKey) => {
    setSort(value);
    setPage(1);
  };

  const handleReply = (id: string) => {
    setReplyToId(id);
    setReplyName("");
    setReplyBody("");
    setCommentError(null);
  };

  const renderReplyForm = (comment: StoreComment) => (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-semibold text-slate-600">返信</div>
      <CommentComposer
        variant="reply"
        name={replyName}
        body={replyBody}
        onNameChange={setReplyName}
        onBodyChange={setReplyBody}
        onSubmit={() =>
          submitComment({ body: replyBody, authorName: replyName, parentId: comment.id })
        }
        isSubmitting={isCommentSubmitting}
        bodyMaxLength={commentMaxChars}
        submitLabel="返信投稿"
      />
    </div>
  );

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <BreadcrumbLabelSetter
        label={store.storeName}
        branchName={store.branchName}
        storeId={store.id}
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-pink-100/60 bg-gradient-to-br from-pink-50 to-rose-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500 text-white">
                <Store className="h-4 w-4" strokeWidth={2.5} />
              </div>
              <span className="text-xs font-bold text-pink-700 leading-none">店舗</span>
            </div>
            <button
              type="button"
              onClick={toggle}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                isBookmarked
                  ? "border-pink-200 bg-pink-100 text-pink-600"
                  : "border-slate-200 bg-white/80 text-slate-500 hover:border-slate-300"
              }`}
              aria-label="店舗をブックマーク"
              aria-pressed={isBookmarked}
            >
              <Heart className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`} />
            </button>
          </div>

          <h1 className="mb-1.5 text-xl font-bold leading-tight text-gray-900">
            {store.storeName}
            {store.branchName ? ` ${store.branchName}` : ""}
          </h1>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5" />
            <span>{store.prefecture}</span>
            {store.area ? <span className="text-gray-400">・</span> : null}
            {store.area ? <span>{store.area}</span> : null}
          </div>
          {store.category ? (
            <span className="mt-2 inline-flex rounded-full bg-pink-500/10 px-2.5 py-1 text-xs font-semibold text-pink-700">
              {store.category}
            </span>
          ) : null}

          <div className="mt-4 rounded-xl bg-white/70 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RatingStars value={store.averageRating ?? 0} size="lg" />
              </div>
              <span className="text-2xl font-bold text-pink-500">
                {(store.averageRating ?? 0).toFixed(1)}
              </span>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <CircleDollarSign className="h-4 w-4 -translate-y-px text-pink-500" />
                <span className="text-xs text-gray-600">平均稼ぎ</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {store.averageEarningLabel ?? "-"}
              </div>
            </div>
            <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Clock className="h-4 w-4 -translate-y-px text-pink-500" />
                <span className="text-xs text-gray-600">平均待機</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{waitLabel}</div>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-pink-200/60 pt-2.5">
            <SurveyCount count={store.surveys?.length ?? 0} />
            <Button asChild size="sm" className="rounded-full px-4">
              <a
                href={`/new?${new URLSearchParams({
                  storeName: store.storeName,
                  branchName: store.branchName ?? "",
                  prefecture: store.prefecture,
                  industry: store.category ?? "",
                  genre: store.genre ?? "",
                }).toString()}`}
                className="flex items-center gap-2"
              >
                <PostIcon className="h-4 w-4" />
                投稿する
              </a>
            </Button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-pink-100/70 bg-white shadow-[0_14px_40px_rgba(15,23,42,0.06)]">
          <div className="bg-gradient-to-r from-pink-200 to-rose-200 px-5 py-4">
            <h2 className="text-lg font-bold text-pink-600">店舗基本情報</h2>
          </div>
          <div className="divide-y divide-gray-100">
            <InfoRow icon={<Building2 className="h-5 w-5" />} label="都道府県" value={store.prefecture} />
            {store.area && (
              <InfoRow icon={<MapPin className="h-5 w-5" />} label="エリア" value={store.area} />
            )}
            <InfoRow
              icon={<Briefcase className="h-5 w-5" />}
              label="業種"
              value={store.category ?? "-"}
            />
            {store.genre && (
              <InfoRow icon={<Tag className="h-5 w-5" />} label="ジャンル" value={store.genre} />
            )}
            <InfoRow
              icon={<Timer className="h-5 w-5" />}
              label="営業時間"
              value={
                store.businessHours
                  ? `${store.businessHours.open} - ${store.businessHours.close}`
                  : "-"
              }
            />
            <InfoRow icon={<Phone className="h-5 w-5" />} label="TEL" value="-" />
            <InfoRow icon={<Mail className="h-5 w-5" />} label="Email" value="-" />
            <InfoRow icon={<Globe className="h-5 w-5" />} label="公式HP" value="-" />
            <InfoRow icon={<MessageCircle className="h-5 w-5" />} label="お店からのコメント" value="-" />
          </div>
        </section>
      </div>

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold text-slate-700">
            {totalSurveys.toLocaleString("ja-JP")} 件
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
            {SORT_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={sort === opt.value ? "primary" : "ghost"}
                size="sm"
                onClick={() => handleSortChange(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {totalSurveys ? (
            pagedSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                showStoreInfo={false}
                commentAlwaysEllipsis
              />
            ))
          ) : (
            <div className="space-y-3 rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-sm">
              <p className="text-sm text-slate-600">アンケートがありません。</p>
              <Button asChild>
                <a href="/new">アンケートを追加する</a>
              </Button>
            </div>
          )}
        </div>
        <Pagination
          variant="simple"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>

      {photoItems.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-slate-900">投稿写真</h2>
            <p className="text-xs text-slate-500">左右にスワイプできます</p>
          </div>
          <ImageGallery items={photoItems} />
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-slate-900">コメント</h2>
          <span className="text-xs text-slate-500">
            {orderedComments.length.toLocaleString("ja-JP")}件
          </span>
        </div>

        {commentError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {commentError}
          </div>
        ) : null}

        <div className="rounded-2xl border border-pink-100 bg-white/95 p-4 shadow-sm">
          <CommentComposer
            name={commentName}
            body={commentBody}
            onNameChange={setCommentName}
            onBodyChange={setCommentBody}
            onSubmit={() =>
              submitComment({ body: commentBody, authorName: commentName, parentId: null })
            }
            isSubmitting={isCommentSubmitting}
            bodyMaxLength={commentMaxChars}
            submitLabel="コメント投稿"
          />
        </div>

        {orderedComments.length > 0 ? (
          <>
            <CommentList
              comments={pagedComments}
              commentNumberById={commentNumberById}
              replyCountById={replyCountById}
              activeReplyId={replyToId}
              onReply={handleReply}
              renderReplyForm={renderReplyForm}
            />
            <Pagination
              currentPage={commentPage}
              totalPages={totalCommentPages}
              onPageChange={setCommentPage}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-pink-100 bg-white/95 p-4 text-sm text-slate-600">
            まだコメントがありません。
          </div>
        )}

        <div ref={commentsEndRef} tabIndex={-1} />
      </section>
    </main>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group flex items-start gap-3 px-5 py-4 transition-all hover:bg-pink-50/60">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-300 to-rose-300 text-white shadow-sm">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-xs font-medium text-gray-500">{label}</div>
        <div className="text-base font-semibold text-gray-900">{value}</div>
      </div>
    </div>
  );
}
