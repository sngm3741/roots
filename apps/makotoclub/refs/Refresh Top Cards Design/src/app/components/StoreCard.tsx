import { MapPin, Star, Clock, FileText, Coins, Store } from 'lucide-react';

interface StoreCardProps {
  storeName: string;
  branchName?: string;
  prefecture: string;
  category: string;
  rating: number;
  avgEarnings: string;
  avgWaitTime: string;
  surveyCount: number;
}

export function StoreCard({
  storeName,
  branchName,
  prefecture,
  category,
  rating,
  avgEarnings,
  avgWaitTime,
  surveyCount,
}: StoreCardProps) {
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

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 shadow-sm border border-blue-100/50 hover:shadow-md transition-shadow cursor-pointer">
      {/* ヘッダー：店舗バッジ + 業種 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="bg-blue-500 text-white p-1.5 rounded-lg">
            <Store className="size-4" strokeWidth={2.5} />
          </div>
          <span className="text-blue-700 font-bold text-xs">店舗</span>
        </div>
        <span className="bg-blue-500 text-white px-2.5 py-1 rounded-full text-xs font-bold">
          {category}
        </span>
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

      {/* アンケート数 */}
      <div className="flex items-center justify-center gap-1.5 pt-2.5 border-t border-blue-200/50">
        <FileText className="size-4 text-blue-500" />
        <span className="text-xs text-gray-700">アンケート</span>
        <span className="text-sm font-bold text-blue-600">{surveyCount}件</span>
      </div>
    </div>
  );
}