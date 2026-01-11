import { useEffect, useState } from "react";
import { MessageSquare, Share2, ThumbsDown, ThumbsUp } from "lucide-react";
import type { StoreComment } from "../../types/comment";

type Props = {
  comment: StoreComment;
  onReply?: () => void;
};

export function CommentActions({ comment, onReply }: Props) {
  const [goodCount, setGoodCount] = useState(comment.goodCount ?? 0);
  const [badCount, setBadCount] = useState(comment.badCount ?? 0);
  const [userVote, setUserVote] = useState<"good" | "bad" | null>(null);
  const [isVoteSubmitting, setIsVoteSubmitting] = useState(false);
  const voteKey = `comment-vote:${comment.id}`;

  const handleShare = async () => {
    const url =
      typeof window === "undefined"
        ? `https://makoto-club.com/messages/${comment.id}`
        : `${window.location.origin}/messages/${comment.id}`;
    const data = {
      title: "みんなのコメント",
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
    } catch {
      // localStorage が使えない環境では無視
    }
  }, [voteKey]);

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
    <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-sm text-gray-600">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => submitVote("good")}
          disabled={Boolean(userVote) || isVoteSubmitting}
          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium transition ${
            userVote === "good"
              ? "text-red-600 bg-red-50"
              : "text-gray-600 hover:text-red-600 hover:bg-red-50"
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
              ? "text-gray-700 bg-gray-100"
              : "text-gray-600 hover:text-gray-700 hover:bg-gray-100"
          } ${userVote ? "opacity-60" : ""}`}
          aria-pressed={userVote === "bad"}
        >
          <ThumbsDown className={`h-4 w-4 ${userVote === "bad" ? "fill-current" : ""}`} />
          <span className="text-sm font-medium">{badCount > 0 ? badCount : ""}</span>
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-gray-600 transition hover:bg-purple-50 hover:text-purple-600 disabled:opacity-40 disabled:cursor-not-allowed"
          onClick={onReply}
          aria-label="返信"
          disabled={!onReply}
        >
          <MessageSquare className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 font-medium text-gray-600 transition hover:bg-green-50 hover:text-green-600"
          aria-label="共有"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
