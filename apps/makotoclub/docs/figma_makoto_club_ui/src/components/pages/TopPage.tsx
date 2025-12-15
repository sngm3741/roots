import { Search, Send, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { StoreCard } from '../cards/StoreCard';
import { SurveyCard } from '../cards/SurveyCard';
import { mockStores, mockSurveys } from '../../data/mockData';

interface TopPageProps {
  onNavigate: (route: any) => void;
}

export function TopPage({ onNavigate }: TopPageProps) {
  const [keyword, setKeyword] = useState('');
  const [prefecture, setPrefecture] = useState('');
  const [category, setCategory] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (prefecture) params.set('prefecture', prefecture);
    if (category) params.set('category', category);
    onNavigate({ page: 'stores', params });
  };

  const recentSurveys = mockSurveys.slice(0, 3);
  const recentStores = mockStores.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-pink-400 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <h1 className="text-gray-900 mb-4">
              みんなのリアルな声で、<br />お店探しをアップデート。
            </h1>
            <p className="text-gray-600 text-lg">
              実際に働いた女の子のアンケートから、本当に良いお店を見つけよう
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button
              size="lg"
              onClick={() => onNavigate({ page: 'stores' })}
              className="gap-2"
            >
              <Search className="w-5 h-5" />
              店舗を探す
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => onNavigate({ page: 'survey-new' })}
              className="gap-2"
            >
              <Send className="w-5 h-5" />
              アンケートを投稿
            </Button>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <h2 className="mb-6 text-gray-900">お店を探す</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <input
                type="text"
                placeholder="キーワード"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              />
              
              <select
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              >
                <option value="">都道府県</option>
                <option value="東京都">東京都</option>
                <option value="大阪府">大阪府</option>
                <option value="神奈川県">神奈川県</option>
                <option value="愛知県">愛知県</option>
              </select>
              
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
              >
                <option value="">業種</option>
                <option value="ソープランド">ソープランド</option>
                <option value="ヘルス">ヘルス</option>
                <option value="デリヘル">デリヘル</option>
              </select>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={handleSearch} className="gap-2">
                <Search className="w-4 h-4" />
                検索する
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Surveys */}
      <section className="py-16 bg-white/50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-gray-900">新着アンケート</h2>
            <button
              onClick={() => onNavigate({ page: 'surveys' })}
              className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
            >
              もっと見る →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentSurveys.map((survey) => (
              <SurveyCard
                key={survey.id}
                survey={survey}
                onClick={() => onNavigate({ page: 'survey-detail', id: survey.id })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Stores */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-gray-900">新着店舗</h2>
            <button
              onClick={() => onNavigate({ page: 'stores' })}
              className="text-sm text-pink-500 hover:text-pink-600 transition-colors"
            >
              もっと見る →
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onClick={() => onNavigate({ page: 'store-detail', id: store.id })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Section */}
      <section className="py-16 bg-gradient-to-r from-pink-50 to-purple-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-pink-200">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm mb-4">
                  キャンペーン実施中
                </div>
                <h3 className="text-gray-900 mb-2">
                  アンケート投稿でPayPay 1,000円プレゼント！
                </h3>
                <p className="text-gray-600 mb-6">
                  あなたの体験を共有して、他の女の子の役に立ちませんか？
                  投稿いただいた方全員にPayPay 1,000円分をプレゼントします。
                </p>
                <Button
                  onClick={() => onNavigate({ page: 'survey-new' })}
                  className="gap-2"
                >
                  <Send className="w-4 h-4" />
                  アンケートを投稿する
                </Button>
              </div>
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
