import { MapPin, Clock, MessageSquare } from 'lucide-react';
import { StoreSummary } from '../../types';
import { Badge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';

interface StoreCardProps {
  store: StoreSummary;
  onClick: () => void;
}

export function StoreCard({ store, onClick }: StoreCardProps) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-pink-200 transition-all duration-200 text-left"
    >
      {/* Location & Name */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{store.prefecture}</span>
          {store.area && <span className="text-gray-400">・</span>}
          {store.area && <span>{store.area}</span>}
        </div>
        <h3 className="text-gray-900 mb-1">
          {store.storeName}
          {store.branchName && <span className="text-gray-600 ml-1">{store.branchName}</span>}
        </h3>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="pink">{store.category}</Badge>
        {store.genre && <Badge variant="purple">{store.genre}</Badge>}
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">評価</span>
          <RatingStars rating={store.averageRating} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className="flex items-center justify-center w-4 h-4 text-base">¥</span>
            <span>平均稼ぎ</span>
          </div>
          <span className="text-sm text-gray-900">
            {store.averageEarningLabel || `${(store.averageEarning / 10000).toFixed(0)}万円`}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>平均待機</span>
          </div>
          <span className="text-sm text-gray-900">
            {store.waitTimeLabel || `${store.waitTimeHours || 0}時間`}
          </span>
        </div>
      </div>

      {/* Survey Count */}
      <div className="pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MessageSquare className="w-4 h-4" />
          <span>{store.surveyCount}件のアンケート</span>
        </div>
      </div>
    </button>
  );
}