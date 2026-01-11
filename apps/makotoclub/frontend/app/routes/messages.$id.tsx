import { type LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router";
import { useMemo, useState } from "react";
import { getApiBaseUrl } from "../config.server";
import { fetchStoreCommentDetail } from "../lib/comments.server";
import { fetchStoreDetail } from "../lib/stores.server";
import type { StoreCommentDetail } from "../types/comment";
import type { StoreDetail } from "../types/store";
import { CommentCard } from "../components/comments/comment-card";
import { BreadcrumbLabelSetter } from "../components/common/breadcrumb-label-setter";
import { CommentComposer } from "../components/comments/comment-composer";
import { StoreCard } from "../components/cards/store-card";

type LoaderData = {
  detail: StoreCommentDetail | null;
  storeDetail: StoreDetail | null;
};

const buildDescription = (body: string) => {
  const trimmed = body.replace(/\s+/g, " ").trim();
  if (!trimmed) return "みんなのコメント";
  return trimmed.length > 120 ? `${trimmed.slice(0, 120)}...` : trimmed;
};

export const meta = ({
  data,
  params,
}: {
  data?: LoaderData;
  params: { id?: string };
}) => {
  const comment = data?.detail?.comment;
  const title = "みんなのコメント";
  const description = comment ? buildDescription(comment.body) : "みんなのコメント";
  const image = `https://makoto-club.com/api/og/comments/${params.id ?? ""}`;
  const url = `https://makoto-club.com/messages/${params.id ?? ""}`;

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

  let detail: StoreCommentDetail | null = null;
  let storeDetail: StoreDetail | null = null;
  try {
    detail = await fetchStoreCommentDetail({ API_BASE_URL: apiBaseUrl }, id);
    if (detail?.store?.id) {
      storeDetail = await fetchStoreDetail({ API_BASE_URL: apiBaseUrl }, detail.store.id);
    }
  } catch (error) {
    console.error("コメント詳細の取得に失敗しました", error);
  }

  return Response.json({ detail, storeDetail });
}

export default function MessageDetailPage() {
  const { detail, storeDetail } = useLoaderData() as LoaderData;
  const navigate = useNavigate();
  const [replyName, setReplyName] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [isReplySubmitting, setIsReplySubmitting] = useState(false);

  if (!detail) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <p className="text-slate-600">コメントが見つかりませんでした。</p>
      </main>
    );
  }

  const { comment, store } = detail;
  const parent = detail.parent ?? null;
  const replies = detail.replies ?? [];
  const replyCounts = detail.replyCounts ?? {};
  const rootComment = comment;
  const sortedReplies = useMemo(() => {
    const list = [...replies];
    list.sort((a, b) => {
      const aTime = Date.parse(a.createdAt) || 0;
      const bTime = Date.parse(b.createdAt) || 0;
      return aTime - bTime;
    });
    return list;
  }, [replies]);
  const hasReplies = sortedReplies.length > 0;
  const storeName = storeDetail?.storeName ?? store.storeName;
  const storeBranch = storeDetail?.branchName ?? store.storeBranch ?? undefined;

  const threadComments = useMemo(() => {
    const list = [rootComment, ...sortedReplies];
    if (parent) {
      list.push(parent);
    }
    list.sort((a, b) => {
      const aTime = Date.parse(a.createdAt) || 0;
      const bTime = Date.parse(b.createdAt) || 0;
      return aTime - bTime;
    });
    return list;
  }, [rootComment, sortedReplies, parent]);

  const commentNumberByIdFallback = useMemo(() => {
    const map = new Map<string, number>();
    threadComments.forEach((item, index) => {
      if (typeof item.seq === "number") {
        map.set(item.id, item.seq);
      } else {
        map.set(item.id, index + 1);
      }
    });
    return map;
  }, [threadComments]);
  const commentNumberById = commentNumberByIdFallback;
  const commentNumberLabel = commentNumberById.get(comment.id);

  const renderReplies = () => {
    if (sortedReplies.length === 0) return null;
    return (
      <div className="space-y-4">
        {sortedReplies.map((child) => (
          <div key={child.id}>
            <CommentCard
              comment={child}
              displayNumber={commentNumberById.get(child.id)}
              parentDisplayNumber={
                child.parentId ? commentNumberById.get(child.parentId) : undefined
              }
              replyCount={replyCounts[child.id] ?? 0}
              onReply={() => handleReply(child.id)}
              replyForm={replyToId === child.id ? renderReplyForm(child.id) : null}
            />
          </div>
        ))}
      </div>
    );
  };

  const handleReply = (id: string) => {
    setReplyToId(id);
    setReplyName("");
    setReplyBody("");
    setReplyError(null);
  };

  const submitReply = async (parentId: string) => {
    const body = replyBody.trim();
    const authorName = replyName.trim();
    if (!body) {
      setReplyError("返信本文が必要です。");
      return;
    }
    if (body.length > 1000) {
      setReplyError("返信は1000文字以内で入力してください。");
      return;
    }
    if (authorName.length > 40) {
      setReplyError("ハンドルネームは40文字以内で入力してください。");
      return;
    }
    setReplyError(null);
    setIsReplySubmitting(true);
    try {
      const res = await fetch(`/api/stores/${store.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          body,
          authorName: authorName || undefined,
          parentId,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setReplyError(msg || "返信に失敗しました。");
        setIsReplySubmitting(false);
        return;
      }
      setReplyBody("");
      setReplyName("");
      setReplyToId(null);
      navigate(`/stores/${store.id}`);
    } catch {
      setReplyError("返信に失敗しました。");
    } finally {
      setIsReplySubmitting(false);
    }
  };

  const renderReplyForm = (parentId: string) => (
    <div className="mt-3 space-y-2">
      <div className="text-xs font-semibold text-slate-600">返信</div>
      <CommentComposer
        variant="reply"
        name={replyName}
        body={replyBody}
        onNameChange={setReplyName}
        onBodyChange={setReplyBody}
        onSubmit={() => submitReply(parentId)}
        isSubmitting={isReplySubmitting}
        submitLabel="返信投稿"
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-rose-50 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <BreadcrumbLabelSetter
          label={storeName}
          branchName={storeBranch}
          storeId={store.id}
          detailLabel={commentNumberLabel ? `>>${commentNumberLabel}` : ">>"}
        />
        <div className="rounded-3xl border border-pink-200 bg-white p-6 shadow-xl">
          <div className="flex flex-col gap-4">

            {storeDetail ? (
              <StoreCard store={storeDetail} />
            ) : (
              <div className="rounded-2xl border border-pink-100 bg-white/95 p-4 text-sm text-slate-600">
                店舗情報を取得できませんでした。
              </div>
            )}

            <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
              {replyError ? (
                <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                  {replyError}
                </div>
              ) : null}
              <div className="bg-gradient-to-br from-pink-50 to-rose-50 px-6 py-6 space-y-4">
                <CommentCard
                  comment={rootComment}
                  displayNumber={commentNumberById.get(rootComment.id)}
                  showReplySource={false}
                  replyCount={0}
                  onReply={() => handleReply(rootComment.id)}
                  replyForm={
                    replyToId === rootComment.id ? renderReplyForm(rootComment.id) : null
                  }
                />
                {hasReplies ? renderReplies() : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
