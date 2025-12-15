import { MapPin, Clock, Calendar } from 'lucide-react';
import { SurveySummary } from '../../types';
import { Badge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';

interface SurveyCardProps {
  survey: SurveySummary;
  onClick: () => void;
}

export function SurveyCard({ survey, onClick }: SurveyCardProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getCommentExcerpt = () => {
    const comments = [
      survey.comments.customer,
      survey.comments.staff,
      survey.comments.workEnvironment,
      survey.comments.etc
    ].filter(Boolean);
    
    if (comments.length === 0) return 'コメントなし';
    return comments[0]!.slice(0, 60) + (comments[0]!.length > 60 ? '...' : '');
  };

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg hover:border-pink-200 transition-all duration-200 text-left"
    >
      {/* Store Info */}
      <div className="mb-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4" />
          <span>{survey.storePrefecture}</span>
          {survey.storeArea && <span className="text-gray-400">・</span>}
          {survey.storeArea && <span>{survey.storeArea}</span>}
        </div>
        <h3 className="text-gray-900 mb-1">
          {survey.storeName}
          {survey.branchName && <span className="text-gray-600 ml-1">{survey.branchName}</span>}
        </h3>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <Badge variant="default">{survey.visitedPeriod}</Badge>
        <Badge variant="gray">{survey.age}歳</Badge>
        <Badge variant="purple">スペック {survey.specScore}</Badge>
      </div>

      {/* Stats */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">満足度</span>
          <RatingStars rating={survey.rating} size="sm" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span className="flex items-center justify-center w-4 h-4 text-base">¥</span>
            <span>稼ぎ</span>
          </div>
          <span className="text-sm text-gray-900">
            {(survey.averageEarning / 10000).toFixed(0)}万円
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>待機時間</span>
          </div>
          <span className="text-sm text-gray-900">{survey.waitTimeHours}時間</span>
        </div>
      </div>

      {/* Comment Excerpt */}
      <div className="pt-3 border-t border-gray-100 mb-3">
        <p className="text-sm text-gray-600 line-clamp-2">{getCommentExcerpt()}</p>
      </div>

      {/* Date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <Calendar className="w-3 h-3" />
        <span>{formatDate(survey.createdAt)}</span>
      </div>
    </button>
  );
}