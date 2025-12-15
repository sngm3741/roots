import { MapPin, TrendingUp, Clock, Calendar, User, Activity } from 'lucide-react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Badge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';
import { getSurveyById } from '../../data/mockData';

interface SurveyDetailPageProps {
  id: string;
  onNavigate: (route: any) => void;
}

export function SurveyDetailPage({ id, onNavigate }: SurveyDetailPageProps) {
  const survey = getSurveyById(id);

  if (!survey) {
    return (
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">アンケートが見つかりませんでした</p>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'ホーム', onClick: () => onNavigate({ page: 'top' }) },
            { label: 'アンケート一覧', onClick: () => onNavigate({ page: 'surveys' }) },
            { label: survey.storeName + (survey.branchName ? ` ${survey.branchName}` : '') }
          ]}
        />

        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
            <MapPin className="w-4 h-4" />
            <span>{survey.storePrefecture}</span>
            {survey.storeArea && <span className="text-gray-400">・</span>}
            {survey.storeArea && <span>{survey.storeArea}</span>}
          </div>
          
          <h1 className="text-gray-900 mb-4">
            {survey.storeName}
            {survey.branchName && <span className="text-gray-600 ml-2">{survey.branchName}</span>}
          </h1>

          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="pink">{survey.storeIndustry}</Badge>
            {survey.storeGenre && <Badge variant="purple">{survey.storeGenre}</Badge>}
            <Badge variant="default">{survey.visitedPeriod}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">満足度</div>
              <RatingStars rating={survey.rating} size="md" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>平均稼ぎ</span>
              </div>
              <div className="text-gray-900">
                {(survey.averageEarning / 10000).toFixed(0)}万円
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span>待機時間</span>
              </div>
              <div className="text-gray-900">{survey.waitTimeHours}時間</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                <User className="w-4 h-4" />
                <span>年齢</span>
              </div>
              <div className="text-gray-900">{survey.age}歳</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                <Activity className="w-4 h-4" />
                <span>スペック</span>
              </div>
              <div className="text-gray-900">{survey.specScore}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-1">
                <Calendar className="w-4 h-4" />
                <span>投稿日</span>
              </div>
              <div className="text-sm text-gray-900">{formatDate(survey.createdAt)}</div>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-6">
          {survey.comments.customer && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-gray-900 mb-4">お客さんについて</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {survey.comments.customer}
              </p>
            </div>
          )}

          {survey.comments.staff && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-gray-900 mb-4">スタッフについて</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {survey.comments.staff}
              </p>
            </div>
          )}

          {survey.comments.workEnvironment && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-gray-900 mb-4">職場環境について</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {survey.comments.workEnvironment}
              </p>
            </div>
          )}

          {survey.comments.etc && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h3 className="text-gray-900 mb-4">その他</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {survey.comments.etc}
              </p>
            </div>
          )}

          {!survey.comments.customer && !survey.comments.staff && !survey.comments.workEnvironment && !survey.comments.etc && (
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 text-center">
              <p className="text-gray-500">コメントはありません</p>
            </div>
          )}
        </div>

        {/* Store Link */}
        <div className="mt-8 bg-gradient-to-r from-pink-50 to-purple-50 rounded-2xl p-6 border border-pink-200">
          <p className="text-sm text-gray-600 mb-3">この店舗の詳細を見る</p>
          <button
            onClick={() => onNavigate({ page: 'store-detail', id: survey.storeId })}
            className="text-pink-600 hover:text-pink-700 transition-colors"
          >
            {survey.storeName}
            {survey.branchName && ` ${survey.branchName}`} →
          </button>
        </div>
      </div>
    </div>
  );
}