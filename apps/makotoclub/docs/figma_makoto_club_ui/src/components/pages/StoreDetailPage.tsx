import { MapPin, TrendingUp, Clock, Send, MessageSquare } from 'lucide-react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { RatingStars } from '../ui/RatingStars';
import { getStoreById } from '../../data/mockData';

interface StoreDetailPageProps {
  id: string;
  onNavigate: (route: any) => void;
}

export function StoreDetailPage({ id, onNavigate }: StoreDetailPageProps) {
  const store = getStoreById(id);

  if (!store) {
    return (
      <div className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">店舗が見つかりませんでした</p>
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
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'ホーム', onClick: () => onNavigate({ page: 'top' }) },
            { label: '店舗一覧', onClick: () => onNavigate({ page: 'stores' }) },
            { label: store.storeName + (store.branchName ? ` ${store.branchName}` : '') }
          ]}
        />

        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <MapPin className="w-4 h-4" />
                <span>{store.prefecture}</span>
                {store.area && <span className="text-gray-400">・</span>}
                {store.area && <span>{store.area}</span>}
              </div>
              
              <h1 className="text-gray-900 mb-3">
                {store.storeName}
                {store.branchName && <span className="text-gray-600 ml-2">{store.branchName}</span>}
              </h1>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="pink">{store.category}</Badge>
                {store.genre && <Badge variant="purple">{store.genre}</Badge>}
              </div>
            </div>

            <Button
              onClick={() => onNavigate({ page: 'survey-new' })}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              アンケートを投稿
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <h2 className="mb-6 text-gray-900">店舗概要</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-2">総合評価</div>
              <RatingStars rating={store.averageRating} size="lg" />
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">平均稼ぎ</div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-500" />
                <span className="text-gray-900">
                  {store.averageEarningLabel || `${(store.averageEarning / 10000).toFixed(0)}万円`}
                </span>
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-2">平均待機時間</div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-500" />
                <span className="text-gray-900">
                  {store.waitTimeLabel || `${store.waitTimeHours || 0}時間`}
                </span>
              </div>
            </div>

            {store.unitPrice && (
              <div>
                <div className="text-sm text-gray-600 mb-2">キャストバック（60分）</div>
                <div className="text-gray-900">
                  {store.unitPrice.toLocaleString()}円
                </div>
              </div>
            )}

            {store.businessHours && (
              <div>
                <div className="text-sm text-gray-600 mb-2">営業時間</div>
                <div className="text-gray-900">
                  {store.businessHours.open} 〜 {store.businessHours.close}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Surveys */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-gray-900">最近のアンケート</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MessageSquare className="w-4 h-4" />
              <span>{store.surveys.length}件</span>
            </div>
          </div>

          {store.surveys.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">まだアンケートがありません</p>
              <Button
                onClick={() => onNavigate({ page: 'survey-new' })}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                最初のアンケートを投稿する
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {store.surveys.map((survey) => (
                <div key={survey.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="default">{survey.visitedPeriod}</Badge>
                    <Badge variant="gray">{survey.age}歳</Badge>
                    <Badge variant="purple">スペック {survey.specScore}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">満足度</div>
                      <RatingStars rating={survey.rating} size="sm" />
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">稼ぎ</div>
                      <div className="text-sm text-gray-900">
                        {(survey.averageEarning / 10000).toFixed(0)}万円
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">待機時間</div>
                      <div className="text-sm text-gray-900">{survey.waitTimeHours}時間</div>
                    </div>
                  </div>

                  {(survey.comments.customer || survey.comments.staff || survey.comments.workEnvironment || survey.comments.etc) && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-3">
                      <p className="text-sm text-gray-700 line-clamp-3">
                        {survey.comments.customer || survey.comments.staff || survey.comments.workEnvironment || survey.comments.etc}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{formatDate(survey.createdAt)}</span>
                    <button
                      onClick={() => onNavigate({ page: 'survey-detail', id: survey.id })}
                      className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
                    >
                      詳しく読む →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}