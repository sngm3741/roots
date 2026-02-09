import {
  Link,
  type LoaderFunctionArgs,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import { Pagination } from "../components/ui/pagination";
import { fetchStoreDetail } from "../lib/stores.server";
import { fetchStoreComments } from "../lib/comments.server";
import { getApiBaseUrl } from "../config.server";
import type { StoreDetail } from "../types/store";
import type { StoreComment, StoreCommentListResponse } from "../types/comment";
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
import { BlueskyIcon, XIcon } from "../components/ui/social-icons";
import {
  Briefcase,
  Building2,
  CircleDollarSign,
  Clock,
  Heart,
  ImageIcon,
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
import { LIST_SORT_OPTIONS, type ListSortValue } from "../lib/sort-options";
import { trackOutboundClick } from "../lib/outbound-click";

type LoaderData = {
  store: StoreDetail | null;
  commentList: StoreCommentListResponse;
  linkPreview: LinkPreview | null;
};

const COMMENT_PAGE_SIZE = 5;

type LinkPreview = {
  url: string;
  image: string | null;
  title: string | null;
  siteName: string | null;
};

function normalizeExternalUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function buildLineAppUrl(value: string): string | null {
  const normalized = normalizeExternalUrl(value);
  const match = normalized.match(/^https?:\/\/line\.me\/ti\/p\/([^/?#]+)/i);
  if (!match?.[1]) return null;
  return `line://ti/p/${match[1]}`;
}

function pickRecruitmentUrl(urls: string[] | undefined) {
  return (urls ?? []).find((value) => typeof value === "string" && value.trim().length > 0);
}

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const requestUrl = new URL(request.url);
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, requestUrl.origin);
  const storeId = params.id!;
  const pageRaw = Number(requestUrl.searchParams.get("commentPage") ?? "1");
  const commentPage = Number.isFinite(pageRaw) && pageRaw >= 1 ? Math.floor(pageRaw) : 1;

  let store: StoreDetail | null = null;
  let commentList: StoreCommentListResponse = {
    items: [],
    total: 0,
    page: commentPage,
    limit: COMMENT_PAGE_SIZE,
  };
  let linkPreview: LinkPreview | null = null;
  try {
    store = await fetchStoreDetail({ API_BASE_URL: apiBaseUrl }, storeId);
    if (store?.id) {
      commentList = await fetchStoreComments({ API_BASE_URL: apiBaseUrl }, store.id, {
        page: commentPage,
        limit: COMMENT_PAGE_SIZE,
      });
    }
    const recruitmentUrl = pickRecruitmentUrl(store?.recruitmentUrls);
    if (recruitmentUrl) {
      const previewRes = await fetch(
        new URL(
          `/api/link-preview?url=${encodeURIComponent(normalizeExternalUrl(recruitmentUrl))}`,
          apiBaseUrl,
        ),
      );
      if (previewRes.ok) {
        linkPreview = (await previewRes.json()) as LinkPreview;
      }
    }
  } catch (error) {
    console.error("店舗詳細の取得に失敗しました", error);
  }

  return Response.json({ store, commentList, linkPreview });
}

export default function StoreDetailPage() {
  const { store, commentList: initialCommentList, linkPreview } = useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const location = useLocation();
  const [sort, setSort] = useState<ListSortValue>("newest");
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const [comments, setComments] = useState<StoreComment[]>(initialCommentList.items);
  const [commentTotal, setCommentTotal] = useState(initialCommentList.total);
  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const commentsEndRef = useRef<HTMLDivElement | null>(null);
  const currentCommentPage = initialCommentList.page;
  const commentPageSize = initialCommentList.limit;
  const totalCommentPages = Math.max(1, Math.ceil(commentTotal / commentPageSize));
  const commentMaxChars = 1000;
  const [isLinkPreviewImageError, setIsLinkPreviewImageError] = useState(false);
  const { isBookmarked, toggle } = useStoreBookmark(store?.id ?? "");

  if (!store) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">店舗情報を取得できませんでした。</p>
      </main>
    );
  }

  useEffect(() => {
    setComments(initialCommentList.items);
    setCommentTotal(initialCommentList.total);
  }, [initialCommentList.items, initialCommentList.total]);

  useEffect(() => {
    setIsLinkPreviewImageError(false);
  }, [linkPreview?.image]);

  const waitLabel =
    store.waitTimeLabel ??
    (Number.isFinite(store.waitTimeHours) ? `${formatDecimal1(store.waitTimeHours)}時間` : "-");
  const recruitmentUrl = pickRecruitmentUrl(store.recruitmentUrls);
  const normalizedRecruitmentUrl = recruitmentUrl ? normalizeExternalUrl(recruitmentUrl) : null;
  const normalizedLineUrl = store.lineUrl ? normalizeExternalUrl(store.lineUrl) : null;
  const lineAppUrl = store.lineUrl ? buildLineAppUrl(store.lineUrl) : null;
  const normalizedTwitterUrl = store.twitterUrl ? normalizeExternalUrl(store.twitterUrl) : null;
  const normalizedBskyUrl = store.bskyUrl ? normalizeExternalUrl(store.bskyUrl) : null;
  const hasLinkPreviewImage = Boolean(linkPreview?.image) && !isLinkPreviewImageError;

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
    const offset = (currentCommentPage - 1) * commentPageSize;
    orderedComments.forEach((comment, index) => {
      if (typeof comment.seq === "number") {
        map.set(comment.id, comment.seq);
      } else {
        map.set(comment.id, offset + index + 1);
      }
    });
    return map;
  }, [orderedComments, currentCommentPage, commentPageSize]);

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
      await res.json();
      const nextTotal = commentTotal + 1;
      const nextPages = Math.max(1, Math.ceil(nextTotal / commentPageSize));
      setCommentBody("");
      setCommentName("");
      setReplyBody("");
      setReplyName("");
      setReplyToId(null);
      const searchParams = new URLSearchParams(location.search);
      searchParams.set("commentPage", String(nextPages));
      navigate(`${location.pathname}?${searchParams.toString()}`, { replace: false });
    } catch {
      setCommentError("投稿に失敗しました。");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  const handleSortChange = (value: ListSortValue) => {
    setSort(value);
    setPage(1);
  };

  const handleReply = (id: string) => {
    setReplyToId(id);
    setReplyName("");
    setReplyBody("");
    setCommentError(null);
  };

  const trackStoreLink = (
    linkType: "recruitment" | "official" | "line" | "x" | "bsky" | "phone" | "email",
    targetUrl: string,
  ) => {
    trackOutboundClick({
      storeId: store.id,
      storeName: store.storeName,
      linkType,
      targetUrl,
    });
  };

  const handleLineClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!normalizedLineUrl) return;
    if (!lineAppUrl) {
      trackStoreLink("line", normalizedLineUrl);
      return;
    }

    event.preventDefault();
    trackStoreLink("line", normalizedLineUrl);

    let appOpened = false;
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        appOpened = true;
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.location.href = lineAppUrl;

    window.setTimeout(() => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (!appOpened) {
        window.location.href = normalizedLineUrl;
      }
    }, 900);
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
          {normalizedRecruitmentUrl ? (
            <a
              href={normalizedRecruitmentUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackStoreLink("recruitment", normalizedRecruitmentUrl)}
              className="mb-3 block overflow-hidden rounded-xl border border-pink-100/80 bg-white/80"
            >
              <div className="relative aspect-[16/9]">
                {hasLinkPreviewImage ? (
                  <img
                    src={linkPreview?.image ?? ""}
                    alt={`${store.storeName} 公式HPのプレビュー画像`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                    onError={() => setIsLinkPreviewImageError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-200 to-slate-300">
                    <ImageIcon className="h-7 w-7 text-slate-500" />
                    <span className="text-sm font-semibold tracking-[0.2em] text-slate-600">
                      NO IMAGE
                    </span>
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-black/0 p-3 text-white">
                  <p className="text-[11px] font-medium text-white/85">
                    {linkPreview?.siteName ?? "公式サイト"}
                  </p>
                  <p className="mt-0.5 text-sm font-semibold leading-snug">
                    {linkPreview?.title ?? "採用ページを見る"}
                  </p>
                </div>
              </div>
            </a>
          ) : null}

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
              <Link
                to={`/new?${new URLSearchParams({
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
              </Link>
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
                  ? store.businessHours.close
                    ? `${store.businessHours.open} - ${store.businessHours.close}`
                    : store.businessHours.open
                  : "-"
              }
            />
            <InfoRow
              icon={<Phone className="h-5 w-5" />}
              label="TEL"
              value={
                store.phoneNumber ? (
                  <a
                    href={`tel:${store.phoneNumber}`}
                    onClick={() => trackStoreLink("phone", `tel:${store.phoneNumber}`)}
                    className="text-pink-600 underline underline-offset-2 hover:text-pink-700"
                  >
                    {store.phoneNumber}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              icon={<Mail className="h-5 w-5" />}
              label="Email"
              value={
                store.email ? (
                  <a
                    href={`mailto:${store.email}`}
                    onClick={() => trackStoreLink("email", `mailto:${store.email}`)}
                    className="break-all text-pink-600 underline underline-offset-2 hover:text-pink-700"
                  >
                    {store.email}
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              icon={<LineBrandIcon className="h-5 w-5" />}
              label="LINE"
              value={
                normalizedLineUrl ? (
                  <a
                    href={normalizedLineUrl}
                    onClick={handleLineClick}
                    className="break-all text-pink-600 underline underline-offset-2 hover:text-pink-700"
                  >
                    連絡する
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              icon={<XIcon className="h-5 w-5" />}
              label="X"
              value={
                normalizedTwitterUrl ? (
                  <a
                    href={normalizedTwitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackStoreLink("x", normalizedTwitterUrl)}
                    className="text-pink-600 underline underline-offset-2 hover:text-pink-700"
                  >
                    Xを見る
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              icon={<BlueskyIcon className="h-5 w-5" />}
              label="Bsky"
              value={
                normalizedBskyUrl ? (
                  <a
                    href={normalizedBskyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackStoreLink("bsky", normalizedBskyUrl)}
                    className="text-pink-600 underline underline-offset-2 hover:text-pink-700"
                  >
                    Bskyを見る
                  </a>
                ) : (
                  "-"
                )
              }
            />
            <InfoRow
              icon={<Globe className="h-5 w-5" />}
              label="公式HP"
              value={
                recruitmentUrl ? (
                  <a
                    href={normalizeExternalUrl(recruitmentUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackStoreLink("official", normalizeExternalUrl(recruitmentUrl))}
                    className="break-all text-pink-600 underline underline-offset-2 hover:text-pink-700"
                  >
                    {recruitmentUrl}
                  </a>
                ) : (
                  "-"
                )
              }
            />
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
            {LIST_SORT_OPTIONS.map((opt) => (
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
                <Link to="/new">アンケートを追加する</Link>
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
            {commentTotal.toLocaleString("ja-JP")}件
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
              comments={orderedComments}
              commentNumberById={commentNumberById}
              replyCountById={replyCountById}
              activeReplyId={replyToId}
              onReply={handleReply}
              renderReplyForm={renderReplyForm}
            />
            <Pagination
              currentPage={currentCommentPage}
              totalPages={totalCommentPages}
              onPageChange={(nextPage) => {
                const params = new URLSearchParams(location.search);
                params.set("commentPage", String(nextPage));
                navigate(`${location.pathname}?${params.toString()}`, { replace: false });
              }}
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

function LineBrandIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="10 11 28 26" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M37.113 22.417c0-5.865-5.88-10.637-13.107-10.637-7.227 0-13.108 4.772-13.108 10.637 0 5.258 4.663 9.662 10.962 10.495.427.092 1.008.282 1.155.646.132.331.086.85.042 1.185 0 0-.153.925-.187 1.122-.057.331-.263 1.296 1.135.707 1.399-.589 7.548-4.445 10.298-7.611h-.001c1.901-2.082 2.811-4.197 2.811-6.544zM18.875 25.907h-2.604a.688.688 0 0 1-.687-.688V20.01a.687.687 0 1 1 1.374 0v4.521h1.917a.688.688 0 1 1 0 1.376zM21.568 25.219a.688.688 0 1 1-1.374 0V20.01a.687.687 0 1 1 1.374 0zM27.838 25.219a.688.688 0 0 1-1.237.413l-2.669-3.635v3.222a.688.688 0 1 1-1.376 0V20.01a.688.688 0 0 1 1.237-.412l2.67 3.635V20.01a.687.687 0 1 1 1.375 0zM32.052 21.927a.688.688 0 1 1 0 1.375h-1.917v1.23h1.917a.687.687 0 1 1 0 1.375h-2.604a.688.688 0 0 1-.687-.688v-5.21a.687.687 0 0 1 .687-.686h2.604a.687.687 0 1 1 0 1.374h-1.917v1.23z"
      />
    </svg>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
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
