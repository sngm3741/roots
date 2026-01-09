import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { getApiBaseUrl } from "../config.server";
import { fetchSurveyComments, fetchSurveyDetail } from "../lib/surveys.server";
import type { SurveyComment, SurveyDetail } from "../types/survey";
import { RatingStars } from "../components/ui/rating-stars";
import { HelpIcon } from "../components/ui/help-icon";
import { BreadcrumbLabelSetter } from "../components/common/breadcrumb-label-setter";
import { ImageGallery } from "../components/ui/image-gallery";
import type { ImageGalleryItem } from "../components/ui/image-gallery";
import { formatDecimal1 } from "../lib/number-format";
import {
  BarChart3,
  CircleDollarSign,
  Clock,
  MapPin,
  MessageCircle,
  Share2,
  User,
  ThumbsUp,
  ThumbsDown,
  Flag,
  MessageSquare,
} from "lucide-react";

type LoaderData = {
  survey: SurveyDetail | null;
  comments: SurveyComment[];
};

export const meta = ({
  data,
  params,
}: {
  data?: LoaderData;
  params: { id?: string };
}) => {
  const survey = data?.survey ?? null;
  const titleBase = survey
    ? `${survey.storeName}${survey.storeBranch ? ` ${survey.storeBranch}` : ""}${
        survey.storePrefecture
          ? ` (${survey.storePrefecture}${survey.storeArea ? ` ${survey.storeArea}` : ""})`
          : ""
      }`
    : "アンケート";
  const title = `${titleBase}`;
  const description = survey && "アンケートの投稿でPayPay最大500円プレゼント中🎁";
  const image = `https://makoto-club.com/api/og/surveys/${params.id ?? ""}`;
  const url = `https://makoto-club.com/surveys/${params.id ?? ""}`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: image },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "マコトクラブ" },
    { property: "og:type", content: "article" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export async function loader({ params, context, request }: LoaderFunctionArgs) {
  const apiBaseUrl = getApiBaseUrl(context.cloudflare?.env ?? {}, new URL(request.url).origin);
  const id = params.id!;

  let survey: SurveyDetail | null = null;
  let comments: SurveyComment[] = [];
  try {
    [survey, comments] = await Promise.all([
      fetchSurveyDetail({ API_BASE_URL: apiBaseUrl }, id),
      fetchSurveyComments({ API_BASE_URL: apiBaseUrl }, id),
    ]);
  } catch (error) {
    console.error("Failed to load survey detail", error);
  }

  return Response.json({ survey, comments });
}

export default function SurveyDetailPage() {
  const { survey, comments: initialComments } = useLoaderData() as LoaderData;

  if (!survey) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">アンケート情報を取得できませんでした。</p>
      </main>
    );
  }

  const comment = buildLimitedComment(
    [
      survey.customerComment,
      survey.staffComment,
      survey.workEnvironmentComment,
      survey.etcComment,
    ],
    60,
  );
  const galleryItems: ImageGalleryItem[] = (survey.imageUrls ?? []).map((url) => ({
    url,
    surveyId: survey.id,
    comment,
  }));
  const visitedPeriodLabel = formatVisitedPeriod(survey.visitedPeriod);
  const shareTitle = `${survey.storeName}${survey.storeBranch ? ` ${survey.storeBranch}` : ""}`;
  const [isHelpful, setIsHelpful] = useState(false);
  const [helpfulCount, setHelpfulCount] = useState(survey.helpfulCount ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const helpfulKey = `survey-helpful:${survey.id}`;
  const [comments, setComments] = useState<SurveyComment[]>(initialComments);
  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [replyName, setReplyName] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [commentError, setCommentError] = useState<string | null>(null);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
  const commentMaxChars = 1000;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(helpfulKey);
      if (stored === "1") {
        setIsHelpful(true);
      }
    } catch {
      // localStorage が使えない環境では無視
    }
  }, [helpfulKey]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  const handleShare = async () => {
    const url = window.location.href;
    const data = {
      title: `${shareTitle}のアンケート`,
      text: "#マコトクラブ",
      url,
    };

    if (navigator.share) {
      try {
        await navigator.share(data);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      window.alert("リンクをコピーしました。");
    } catch {
      window.alert("共有に失敗しました。");
    }
  };

  const handleHelpfulClick = async () => {
    if (isHelpful || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/surveys/${survey.id}/helpful`, { method: "POST" });
      if (!res.ok) {
        setIsSubmitting(false);
        return;
      }
      const data = (await res.json()) as { count?: number };
      if (typeof data.count === "number") {
        setHelpfulCount(data.count);
      }
      setIsHelpful(true);
      try {
        window.localStorage.setItem(helpfulKey, "1");
      } catch {
        // localStorage が使えない環境では無視
      }
    } catch {
      // 表示用なので失敗は無視
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentsByParent = useMemo(() => {
    const map = new Map<string | null, SurveyComment[]>();
    for (const comment of comments) {
      const key = comment.parentId ?? null;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(comment);
    }
    for (const [key, list] of map.entries()) {
      list.sort((a, b) => {
        const aTime = Date.parse(a.createdAt) || 0;
        const bTime = Date.parse(b.createdAt) || 0;
        if (key === null) {
          return bTime - aTime;
        }
        return aTime - bTime;
      });
    }
    return map;
  }, [comments]);

  const toggleReplies = (id: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
      const res = await fetch(`/api/surveys/${survey.id}/comments`, {
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
      const data = (await res.json()) as SurveyComment;
      setComments((prev) => [...prev, data]);
      if (params.parentId) {
        setExpandedReplies((prev) => new Set(prev).add(params.parentId!));
      }
      setCommentBody("");
      setCommentName("");
      setReplyBody("");
      setReplyName("");
      setReplyToId(null);
    } catch {
      setCommentError("投稿に失敗しました。");
    } finally {
      setIsCommentSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 space-y-8">
      <BreadcrumbLabelSetter
        label={survey.storeName}
        branchName={survey.storeBranch}
        storeId={survey.storeId}
      />
      <div className="space-y-6">
        <section className="rounded-2xl border border-pink-100/50 bg-gradient-to-br from-pink-50 to-rose-50 p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="rounded-lg bg-pink-500 p-1.5 text-white">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-xs font-bold text-pink-700">アンケート</span>
            </div>
            <span className="text-xs font-medium text-gray-600">{visitedPeriodLabel}</span>
          </div>

          <a
            href={`/stores/${survey.storeId}`}
            className="mb-1.5 block text-xl font-bold leading-tight text-gray-900 transition hover:text-pink-600"
          >
            {survey.storeName}
            {survey.storeBranch ? ` ${survey.storeBranch}` : ""}
          </a>

          <div className="mb-4 flex items-center gap-1 text-xs text-gray-600">
            <MapPin className="h-3.5 w-3.5" />
            <span>{survey.storePrefecture}</span>
          </div>

          <div className="rounded-xl bg-white/70 p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RatingStars value={survey.rating ?? 0} size="lg" />
              </div>
              <span className="text-2xl font-bold text-pink-500">
                {(survey.rating ?? 0).toFixed(1)}
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
                {Number.isFinite(survey.averageEarning) ? `${survey.averageEarning}万円` : "-"}
              </div>
            </div>
            <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <Clock className="h-4 w-4 -translate-y-px text-pink-500" />
                <span className="text-xs text-gray-600">平均待機</span>
              </div>
              <div className="text-lg font-bold text-gray-900">
                {formatDecimal1(survey.waitTimeHours)}時間
              </div>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="flex flex-col items-start rounded-xl bg-white/70 p-3">
              <div className="mb-1.5 flex items-center gap-1.5">
                <User className="h-4 w-4 text-pink-500" />
                <span className="text-xs text-gray-600">年齢</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{survey.age}歳</div>
            </div>
            <div className="relative flex flex-col items-start rounded-xl bg-white/70 p-3">
              <HelpIcon
                containerClassName="absolute right-2 top-2"
                label={`「スペック」の略。\n身長cm - 体重kg の数値を指す業界用語。\n\n例)\n155cm / 49kg の場合\n155 - 49 = スペ106`}
              />
              <div className="mb-1.5 flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-pink-500" />
                <span className="text-xs text-gray-600">スペック</span>
              </div>
              <div className="text-lg font-bold text-gray-900">{survey.specScore}</div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleHelpfulClick}
              disabled={isHelpful || isSubmitting}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition ${
                isHelpful
                  ? "border-pink-100 bg-pink-100 text-pink-600"
                  : "border-pink-100 bg-white/70 text-pink-700 hover:bg-white"
              }`}
            >
              <ThumbsUp className="h-4 w-4" />
              役に立った ({helpfulCount})
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/70 px-3 py-1 text-xs font-semibold text-pink-700 shadow-sm transition hover:bg-white"
            >
              <Share2 className="h-4 w-4" />
              共有
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          {renderCommentCards({
            customer: survey.customerComment,
            staff: survey.staffComment,
            environment: survey.workEnvironmentComment,
            etc: survey.etcComment,
          })}
        </section>

        {galleryItems.length > 0 && (
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">投稿画像</h2>
              <p className="text-xs text-slate-500">左右にスワイプできます</p>
            </div>
            <ImageGallery items={galleryItems} hideCaption hideModalDetails />
          </section>
        )}

        <section className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-white shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-white p-1.5 shadow-sm">
                    <MessageCircle className="h-4 w-4 text-pink-600" />
                  </div>
                  <span className="text-sm text-slate-700">コメント</span>
                </div>
              </div>
            </div>

            <div className="space-y-5 px-6 py-5">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">ハンドルネーム（任意）</label>
                <input
                  type="text"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
                  placeholder="お名前を入力"
                  maxLength={40}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">内容</label>
                <textarea
                  value={commentBody}
                  onChange={(e) => setCommentBody(e.target.value)}
                  className="w-full min-h-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-pink-400 focus:outline-none resize-none"
                  placeholder="コメントを入力してください..."
                  maxLength={commentMaxChars}
                />
                <div className="flex items-center justify-between text-xs">
                  <span
                    className={
                      commentBody.length > commentMaxChars * 0.9
                        ? "text-pink-600"
                        : "text-slate-500"
                    }
                  >
                    {commentBody.length} / {commentMaxChars}
                  </span>
                </div>
              </div>
              {commentError && <p className="text-xs text-red-500">{commentError}</p>}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => submitComment({ body: commentBody, authorName: commentName })}
                  disabled={isCommentSubmitting || !commentBody.trim()}
                  className="rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
                >
                  送信
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {(commentsByParent.get(null) ?? []).map((comment) => (
              <CommentThread
                key={comment.id}
                comment={comment}
                depth={0}
                childrenMap={commentsByParent}
                expandedReplies={expandedReplies}
                onToggleReplies={toggleReplies}
                onReply={(id) => setReplyToId(id)}
                activeReplyId={replyToId}
                replyName={replyName}
                replyBody={replyBody}
                onReplyNameChange={setReplyName}
                onReplyBodyChange={setReplyBody}
                onSubmitReply={(parentId, body, authorName) =>
                  submitComment({ parentId, body, authorName })
                }
                isSubmitting={isCommentSubmitting}
              />
            ))}
            {comments.length === 0 && (
              <p className="text-sm text-slate-500">まだコメントがありません。</p>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}

function formatVisitedPeriod(value: string) {
  const match = /^(\d{4})-(\d{1,2})$/.exec(value);
  if (!match) return value;
  const month = Number.parseInt(match[2], 10);
  return `${match[1]}年${month}月`;
}

function formatCommentTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(
    date.getDate(),
  ).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function buildLimitedComment(parts: Array<string | null | undefined>, limit: number) {
  const cleaned = parts
    .map((text) => (text ?? "").trim())
    .filter((text) => text.length > 0);
  if (cleaned.length === 0) return "";
  let combined = "";
  for (const text of cleaned) {
    const next = combined ? `${combined}\n${text}` : text;
    if (next.length > limit) {
      return combined || text;
    }
    combined = next;
  }
  return combined;
}

function isCommentAvailable(text?: string | null) {
  return Boolean(text && text.trim().length > 0);
}

function renderCommentCards(comments: {
  customer?: string | null;
  staff?: string | null;
  environment?: string | null;
  etc?: string | null;
}) {
  const entries = [
    { key: "customer", title: "客層について", body: comments.customer },
    { key: "staff", title: "スタッフについて", body: comments.staff },
    { key: "environment", title: "環境について", body: comments.environment },
    { key: "etc", title: "その他", body: comments.etc },
  ].filter((entry) => isCommentAvailable(entry.body));

  if (entries.length === 1) {
    return <CommentCard body={entries[0].body} hideTitle />;
  }

  return entries.map((entry) => (
    <CommentCard key={entry.key} title={entry.title} body={entry.body} />
  ));
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-full bg-pink-50 px-3 py-1 font-semibold text-slate-800 border border-pink-100">
      {label}: {value}
    </span>
  );
}

function CommentCard({
  title,
  body,
  hideTitle = false,
}: {
  title?: string;
  body?: string | null;
  hideTitle?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-pink-100 bg-white/95 p-5 shadow-sm space-y-2">
      {hideTitle ? null : <h2 className="text-lg font-semibold text-slate-900">{title}</h2>}
      <p className="text-sm text-slate-700 whitespace-pre-wrap break-words">{body || "コメントなし"}</p>
    </div>
  );
}

function CommentThread({
  comment,
  depth,
  childrenMap,
  expandedReplies,
  onToggleReplies,
  onReply,
  activeReplyId,
  replyName,
  replyBody,
  onReplyNameChange,
  onReplyBodyChange,
  onSubmitReply,
  isSubmitting,
}: {
  comment: SurveyComment;
  depth: number;
  childrenMap: Map<string | null, SurveyComment[]>;
  expandedReplies: Set<string>;
  onToggleReplies: (id: string) => void;
  onReply: (id: string) => void;
  activeReplyId: string | null;
  replyName: string;
  replyBody: string;
  onReplyNameChange: (value: string) => void;
  onReplyBodyChange: (value: string) => void;
  onSubmitReply: (parentId: string, body: string, authorName: string) => void;
  isSubmitting: boolean;
}) {
  const replies = childrenMap.get(comment.id) ?? [];
  const hasHiddenReplies = depth === 0 && replies.length > 0;
  const showReplies = depth === 0 && expandedReplies.has(comment.id);
  const author = comment.authorName?.trim() ? comment.authorName : "名無しさん";
  const isAnonymous = author === "名無しさん";
  const [goodCount, setGoodCount] = useState(comment.goodCount ?? 0);
  const [badCount, setBadCount] = useState(comment.badCount ?? 0);
  const [userVote, setUserVote] = useState<"good" | "bad" | null>(null);
  const [isVoteSubmitting, setIsVoteSubmitting] = useState(false);
  const voteKey = `comment-vote:${comment.id}`;
  const [isReported, setIsReported] = useState(false);
  const reportKey = `comment-report:${comment.id}`;

  useEffect(() => {
    setGoodCount(comment.goodCount ?? 0);
    setBadCount(comment.badCount ?? 0);
  }, [comment.goodCount, comment.badCount]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(voteKey);
      if (stored === "good" || stored === "bad") {
        setUserVote(stored);
      }
      const reported = window.localStorage.getItem(reportKey);
      if (reported === "1") {
        setIsReported(true);
      }
    } catch {
      // localStorage が使えない環境では無視
    }
  }, [voteKey, reportKey]);

  const handleReport = () => {
    if (isReported) return;
    setIsReported(true);
    try {
      window.localStorage.setItem(reportKey, "1");
    } catch {
      // localStorage が使えない環境では無視
    }
    window.alert("通報しました。");
  };

  const submitVote = async (voteType: "good" | "bad") => {
    if (userVote || isVoteSubmitting) return;
    setIsVoteSubmitting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });
      if (!res.ok) {
        setIsVoteSubmitting(false);
        return;
      }
      const data = (await res.json()) as { goodCount?: number; badCount?: number };
      if (typeof data.goodCount === "number") setGoodCount(data.goodCount);
      if (typeof data.badCount === "number") setBadCount(data.badCount);
      setUserVote(voteType);
      try {
        window.localStorage.setItem(voteKey, voteType);
      } catch {
        // localStorage が使えない環境では無視
      }
    } catch {
      // 表示用なので失敗は無視
    } finally {
      setIsVoteSubmitting(false);
    }
  };

  return (
    <div className={`space-y-3 ${depth > 0 ? "pl-4 border-l border-pink-100" : ""}`}>
      <div className="rounded-2xl bg-white p-4 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-pink-600">{author}</h3>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{formatCommentTime(comment.createdAt)}</span>
            <button
              type="button"
              onClick={handleReport}
              className={`h-8 w-8 rounded-full transition ${
                isReported
                  ? "text-red-300 cursor-not-allowed"
                  : "text-gray-400 hover:bg-red-50 hover:text-red-500"
              }`}
              aria-label="通報"
              disabled={isReported}
            >
              <Flag className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-2 min-h-[60px]">
          <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-all">{comment.body}</p>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => submitVote("good")}
              disabled={Boolean(userVote) || isVoteSubmitting}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium transition ${
                userVote === "good"
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-600 hover:text-blue-600 hover:bg-blue-50"
              } ${userVote ? "opacity-60" : ""}`}
              aria-pressed={userVote === "good"}
            >
              <ThumbsUp className={`h-4 w-4 ${userVote === "good" ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{goodCount > 0 ? goodCount : ""}</span>
            </button>
            <button
              type="button"
              onClick={() => submitVote("bad")}
              disabled={Boolean(userVote) || isVoteSubmitting}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium transition ${
                userVote === "bad"
                  ? "text-red-600 bg-red-50"
                  : "text-gray-600 hover:text-red-600 hover:bg-red-50"
              } ${userVote ? "opacity-60" : ""}`}
              aria-pressed={userVote === "bad"}
            >
              <ThumbsDown className={`h-4 w-4 ${userVote === "bad" ? "fill-current" : ""}`} />
              <span className="text-sm font-medium">{badCount > 0 ? badCount : ""}</span>
            </button>
            {depth === 0 ? (
              <button
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-gray-600 transition hover:bg-purple-50 hover:text-purple-600"
                onClick={() => onReply(comment.id)}
              >
                <MessageSquare className="h-4 w-4" />
                返信
              </button>
            ) : null}
            {hasHiddenReplies && (
              <button
                type="button"
                className="rounded-full px-2 py-1 font-medium text-gray-600 transition hover:bg-pink-50 hover:text-pink-600"
                onClick={() => onToggleReplies(comment.id)}
              >
                {showReplies ? "返信を隠す" : `返信を表示（${replies.length}件）`}
              </button>
            )}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-600"
          >
            <Share2 className="h-4 w-4" />
            共有
          </button>
        </div>
        {activeReplyId === comment.id && (
          <div className="space-y-2 rounded-xl border border-pink-100 bg-pink-50/40 p-3">
            <input
              type="text"
              value={replyName}
              onChange={(e) => onReplyNameChange(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs focus:border-pink-400 focus:outline-none"
              placeholder="ハンドルネーム（任意）"
              maxLength={40}
            />
            <textarea
              value={replyBody}
              onChange={(e) => onReplyBodyChange(e.target.value)}
              className="w-full min-h-[80px] rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-pink-400 focus:outline-none"
              placeholder="返信を書く（1000文字まで）"
              maxLength={1000}
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => onSubmitReply(comment.id, replyBody, replyName)}
                disabled={isSubmitting}
                className="rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:from-pink-600 hover:to-purple-700 disabled:opacity-60"
              >
                返信投稿
              </button>
            </div>
          </div>
        )}
      </div>
      {showReplies &&
        replies.map((reply) => (
          <CommentThread
            key={reply.id}
            comment={reply}
            depth={depth + 1}
            childrenMap={childrenMap}
            expandedReplies={expandedReplies}
            onToggleReplies={onToggleReplies}
            onReply={onReply}
            activeReplyId={activeReplyId}
            replyName={replyName}
            replyBody={replyBody}
            onReplyNameChange={onReplyNameChange}
            onReplyBodyChange={onReplyBodyChange}
            onSubmitReply={onSubmitReply}
            isSubmitting={isSubmitting}
          />
        ))}
    </div>
  );
}
