import { useEffect, useState } from "react";
import { Flag } from "lucide-react";
import { Link } from "react-router";
import type { StoreComment } from "../../types/comment";
import { formatCommentTime } from "../../lib/date-format";
import { CommentActions } from "./comment-actions";

type Props = {
  comment: StoreComment;
  displayNumber?: number;
  parentDisplayNumber?: number;
  replyCount?: number;
  onReply?: () => void;
  replyForm?: React.ReactNode;
  showActions?: boolean;
  showReplySource?: boolean;
};

export function CommentCard({
  comment,
  displayNumber,
  parentDisplayNumber,
  replyCount = 0,
  onReply,
  replyForm,
  showActions = true,
  showReplySource = true,
}: Props) {
  const author = comment.authorName?.trim() ? comment.authorName : "名無しさん";
  const [isReported, setIsReported] = useState(false);
  const reportKey = `comment-report:${comment.id}`;

  useEffect(() => {
    try {
      const reported = window.localStorage.getItem(reportKey);
      if (reported === "1") {
        setIsReported(true);
      }
    } catch {
      // localStorage が使えない環境では無視
    }
  }, [reportKey]);

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

  const replySourceLabel = parentDisplayNumber ? `>>${parentDisplayNumber}` : ">>";

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-white p-4 shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-pink-600">
              {displayNumber ? `${displayNumber}. ` : ""}
              {author}
            </h3>
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

        {showReplySource && comment.parentId ? (
          <div className="mb-2">
            <Link
              to={`/messages/${comment.parentId}`}
              className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-600 hover:bg-pink-100"
            >
              {replySourceLabel}
            </Link>
          </div>
        ) : null}

        <div className="mb-2 min-h-[60px]">
          <Link
            to={`/messages/${comment.id}`}
            className="block text-gray-700 leading-relaxed whitespace-pre-wrap break-all"
          >
            {comment.body}
          </Link>
        </div>

        {replyCount > 0 ? (
          <div className="mb-2">
            <Link
              to={`/messages/${comment.id}`}
              className="inline-flex items-center rounded-full border border-pink-200 bg-pink-50 px-2 py-0.5 text-[11px] font-semibold text-pink-600 hover:bg-pink-100"
            >
              {`${replyCount}件の返信`}
            </Link>
          </div>
        ) : null}

        {showActions ? <CommentActions comment={comment} onReply={onReply} /> : null}
        {showActions ? replyForm : null}
      </div>
    </div>
  );
}
