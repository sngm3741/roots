import React, { useState } from "react";
import { 
  CornerDownRight, 
  Share2, 
  Link2, 
  Clock,
  ArrowUpRight
} from "lucide-react";

interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  avatar: string;
}

interface MessageDetailCardProps {
  originalMessage: Message;
  replyMessage: Message;
}

export function MessageDetailCard({ originalMessage, replyMessage }: MessageDetailCardProps) {
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(replyMessage.content);
    
    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      line: `https://social-plugins.line.me/lineit/share?url=${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  return (
    <div className="w-full">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-gray-900 mb-2">返信の詳細</h1>
        <p className="text-gray-600">元のコメントとその返信を表示しています</p>
      </div>

      {/* メッセージカード */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* 返信元のメッセージ */}
        <div className="relative">
          {/* ラベル */}
          <div className="absolute top-0 left-0 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-4 py-2 rounded-br-2xl text-sm flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            返信元のコメント
          </div>

          {/* コンテンツ */}
          <div className="pt-16 px-6 pb-6">
            <div className="flex items-start gap-4">
              {/* メッセージ内容 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-900">{originalMessage.author}</span>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 text-sm flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {originalMessage.timestamp}
                  </span>
                </div>
                <p className="text-gray-800 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
                  {originalMessage.content}
                </p>
              </div>
            </div>

            {/* 元のコメントへのリンク */}
            <button className="mt-4 text-pink-600 hover:text-pink-700 text-sm flex items-center gap-1 transition-colors">
              元のコメントへ
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 返信の接続線 */}
        <div className="relative h-12 bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-pink-400 to-pink-500"></div>
          <div className="absolute left-6 bottom-2 -translate-x-1/2">
            <div className="bg-white rounded-full p-2 shadow-md border-2 border-pink-500">
              <CornerDownRight className="w-4 h-4 text-pink-500" />
            </div>
          </div>
        </div>

        {/* 返信メッセージ */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-50 px-6 py-6">
          <div className="flex items-start gap-4">
            {/* メッセージ内容 */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-pink-900">{replyMessage.author}</span>
                <span className="text-pink-400">•</span>
                <span className="text-pink-600 text-sm flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {replyMessage.timestamp}
                </span>
              </div>
              <p className="text-gray-900 bg-white rounded-lg px-4 py-3 shadow-sm border border-pink-100">
                {replyMessage.content}
              </p>
            </div>
          </div>
        </div>

        {/* シェアボタン */}
        <div className="bg-white px-6 py-5 border-t border-gray-100">
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => handleShare('twitter')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-black hover:text-white text-gray-700 rounded-lg transition-all duration-200 text-sm border border-gray-200 hover:border-black"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Xで共有
            </button>

            <button
              onClick={() => handleShare('line')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-[#00B900] hover:text-white text-gray-700 rounded-lg transition-all duration-200 text-sm border border-gray-200 hover:border-[#00B900]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
              LINEで共有
            </button>

            <button
              onClick={() => handleShare('facebook')}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-[#1877F2] hover:text-white text-gray-700 rounded-lg transition-all duration-200 text-sm border border-gray-200 hover:border-[#1877F2]"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Facebookで共有
            </button>

            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm border ${
                copiedLink
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-gray-50 hover:bg-gray-700 hover:text-white text-gray-700 border-gray-200 hover:border-gray-700'
              }`}
            >
              {copiedLink ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  コピーしました
                </>
              ) : (
                <>
                  <Link2 className="w-4 h-4" />
                  リンクをコピー
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* フッター情報 */}
      <div className="mt-6 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
        <Share2 className="w-4 h-4" />
        このページを共有して意見を聞いてみましょう
      </div>
    </div>
  );
}