import type { StoreComment } from "../../types/comment";
import { CommentCard } from "./comment-card";

type Props = {
  comments: StoreComment[];
  commentNumberById: Map<string, number>;
  replyCountById: Map<string, number>;
  activeReplyId: string | null;
  onReply: (id: string, displayNumber?: number) => void;
  renderReplyForm: (comment: StoreComment) => React.ReactNode;
};

export function CommentList({
  comments,
  commentNumberById,
  replyCountById,
  activeReplyId,
  onReply,
  renderReplyForm,
}: Props) {
  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const displayNumber = commentNumberById.get(comment.id);
        const parentDisplayNumber = comment.parentId
          ? commentNumberById.get(comment.parentId)
          : undefined;
        return (
          <CommentCard
            key={comment.id}
            comment={comment}
            displayNumber={displayNumber}
            parentDisplayNumber={parentDisplayNumber}
            replyCount={replyCountById.get(comment.id) ?? 0}
            onReply={() => onReply(comment.id, displayNumber)}
            replyForm={activeReplyId === comment.id ? renderReplyForm(comment) : null}
          />
        );
      })}
    </div>
  );
}
