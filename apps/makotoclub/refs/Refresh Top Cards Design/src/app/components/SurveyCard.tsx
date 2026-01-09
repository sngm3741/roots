import { MapPin, Star, Clock, User, ThumbsUp, Coins } from 'lucide-react';
import { useState } from 'react';

interface SurveyCardProps {
  visitDate: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  rating: number;
  avgEarnings: string;
  avgWaitTime: string;
  age: number;
  spec: string;
  comment: string;
  helpfulCount: number;
}

export function SurveyCard({
  visitDate,
  storeName,
  branchName,
  prefecture,
  rating,
  avgEarnings,
  avgWaitTime,
  age,
  spec,
  comment,
  helpfulCount,
}: SurveyCardProps) {
  const [isHelpful, setIsHelpful] = useState(false);
  const [currentHelpfulCount, setCurrentHelpfulCount] = useState(helpfulCount);

  const handleHelpfulClick = () => {
    if (!isHelpful) {
      setCurrentHelpfulCount(currentHelpfulCount + 1);
      setIsHelpful(true);
    } else {
      setCurrentHelpfulCount(currentHelpfulCount - 1);
      setIsHelpful(false);
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="size-5 fill-pink-500 text-pink-500 shrink-0" />
      );
    }
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative size-5 shrink-0 inline-flex">
          <Star className="absolute inset-0 size-5 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
            <Star className="size-5 fill-pink-500 text-pink-500" />
          </div>
        </div>
      );
    }
    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="size-5 text-gray-300 shrink-0" />
      );
    }
    return stars;
  };

  const truncateComment = (text: string) => {
    if (text.length <= 200) return text;
    return text.substring(0, 200) + '...';
  };

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl p-4 shadow-sm border border-pink-100/50 hover:shadow-md transition-shadow cursor-pointer">
      {/* ヘッダー：アンケートバッジ + 訪問時期 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="bg-pink-500 text-white p-1.5 rounded-lg">
            <svg
              className="size-4"
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
          <span className="text-pink-700 font-bold text-xs">アンケート</span>
        </div>
        <span className="text-xs text-gray-600 font-medium">{visitDate}</span>
      </div>

      {/* 店名 */}
      <h2 className="text-xl font-bold text-gray-900 mb-1.5 leading-tight">
        {storeName}
      </h2>

      {/* 所在地 */}
      <div className="flex items-center gap-1 text-xs text-gray-600 mb-4">
        <MapPin className="size-3.5" />
        <span>{prefecture}</span>
        {branchName && (
          <>
            <span className="text-gray-400">・</span>
            <span>{branchName}</span>
          </>
        )}
      </div>

      {/* 評価（横長バー） */}
      <div className="bg-white/70 rounded-xl p-3 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderStars(rating)}
          </div>
          <span className="text-2xl font-bold text-pink-500">{rating}</span>
        </div>
      </div>

      {/* 稼ぎ・待機（2列グリッド） */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-white/70 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Coins className="size-4 text-pink-500" />
            <span className="text-xs text-gray-600">平均稼ぎ</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{avgEarnings}</div>
        </div>
        <div className="bg-white/70 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Clock className="size-4 text-pink-500" />
            <span className="text-xs text-gray-600">平均待機</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{avgWaitTime}</div>
        </div>
      </div>

      {/* 投稿者情報（2列グリッド） */}
      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div className="bg-white/70 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <User className="size-4 text-pink-500" />
            <span className="text-xs text-gray-600">年齢</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{age}歳</div>
        </div>
        <div className="bg-white/70 rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg
              className="size-4 text-pink-500"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs text-gray-600">スペック</span>
          </div>
          <div className="text-lg font-bold text-gray-900">{spec}</div>
        </div>
      </div>

      {/* コメント */}
      <div className="bg-white/70 rounded-xl p-3 mb-3">
        <p className="text-sm text-gray-700 leading-relaxed">
          {truncateComment(comment)}
        </p>
      </div>

      {/* 役に立ったボタン */}
      <button
        onClick={handleHelpfulClick}
        className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl transition-all ${
          isHelpful
            ? 'bg-pink-500 text-white'
            : 'bg-white/70 text-gray-700 hover:bg-white'
        }`}
      >
        <ThumbsUp className={`size-4 ${isHelpful ? 'fill-white' : ''}`} />
        <span className="text-sm font-medium">
          役に立った ({currentHelpfulCount})
        </span>
      </button>
    </div>
  );
}