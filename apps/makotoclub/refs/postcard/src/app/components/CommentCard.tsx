import { MessageCircle, Clock, Send } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";

export function CommentCard() {
  const [handle, setHandle] = useState("");
  const [comment, setComment] = useState("");
  const [charCount, setCharCount] = useState(0);
  const maxChars = 1000;

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setComment(text);
      setCharCount(text.length);
    }
  };

  const handleSubmit = () => {
    // ここで送信処理を実装
    console.log("Submitted:", { handle, comment });
    // フォームをリセット
    setHandle("");
    setComment("");
    setCharCount(0);
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
            <MessageCircle className="size-5 text-white" />
          </div>
          <h2 className="text-2xl">みんなのコメント</h2>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
          <span className="text-sm text-gray-600">8件</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-white rounded-lg shadow-sm">
                <MessageCircle className="size-4 text-pink-600" />
              </div>
              <span className="text-sm">コメントを書く</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white px-3 py-1.5 rounded-full shadow-sm">
              <Clock className="size-3" />
              <span>1時間10件まで</span>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-5">
          {/* Handle Name Input */}
          <div className="space-y-2">
            <label htmlFor="handle" className="text-sm text-gray-600">
              ハンドルネーム（任意）
            </label>
            <Input
              id="handle"
              placeholder="お名前を入力"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              className="border-gray-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl"
            />
            <p className="text-xs text-gray-500">
              返信は2階層以上で折りたたみます。
            </p>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-2">
            <label htmlFor="comment" className="text-sm text-gray-600">
              アンケート内容へのコメント
            </label>
            <Textarea
              id="comment"
              placeholder="コメントを入力してください..."
              value={comment}
              onChange={handleCommentChange}
              className="min-h-[160px] border-gray-200 focus:border-pink-400 focus:ring-pink-400 rounded-xl resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                あなたの意見をお聞かせください
              </p>
              <span
                className={`text-xs ${
                  charCount > maxChars * 0.9
                    ? "text-pink-600"
                    : "text-gray-500"
                }`}
              >
                {charCount} / {maxChars}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSubmit}
              disabled={!comment.trim()}
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white px-8 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="size-4 mr-2" />
              コメント送信
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
