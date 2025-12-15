import { Search, Send, TrendingUp, Star, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { StoreCard } from '../cards/StoreCard';
import { Pagination } from '../ui/Pagination';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { mockStores } from '../../data/mockData';
import { StoreSummary } from '../../types';

interface StoresListPageProps {
  params?: URLSearchParams;
  onNavigate: (route: any) => void;
}

export function StoresListPage({ params, onNavigate }: StoresListPageProps) {
  const [keyword, setKeyword] = useState(params?.get('keyword') || '');
  const [prefecture, setPrefecture] = useState(params?.get('prefecture') || '');
  const [category, setCategory] = useState(params?.get('category') || '');
  const [sortBy, setSortBy] = useState<'new' | 'earning' | 'rating'>('new');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    if (params) {
      setKeyword(params.get('keyword') || '');
      setPrefecture(params.get('prefecture') || '');
      setCategory(params.get('category') || '');
    }
  }, [params]);

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    if (keyword) newParams.set('keyword', keyword);
    if (prefecture) newParams.set('prefecture', prefecture);
    if (category) newParams.set('category', category);
    onNavigate({ page: 'stores', params: newParams });
    setCurrentPage(1);
  };

  // Filter stores
  let filteredStores = [...mockStores];
  
  if (keyword) {
    filteredStores = filteredStores.filter(store =>
      store.storeName.includes(keyword) || 
      (store.branchName && store.branchName.includes(keyword))
    );
  }
  
  if (prefecture) {
    filteredStores = filteredStores.filter(store => store.prefecture === prefecture);
  }
  
  if (category) {
    filteredStores = filteredStores.filter(store => store.category === category);
  }

  // Sort stores
  const sortedStores = [...filteredStores].sort((a, b) => {
    switch (sortBy) {
      case 'earning':
        return b.averageEarning - a.averageEarning;
      case 'rating':
        return b.averageRating - a.averageRating;
      case 'new':
      default:
        return 0; // Already in new order
    }
  });

  // Paginate
  const totalPages = Math.ceil(sortedStores.length / itemsPerPage);
  const paginatedStores = sortedStores.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'ホーム', onClick: () => onNavigate({ page: 'top' }) },
            { label: '店舗一覧' }
          ]}
        />

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-gray-900 mb-2">店舗一覧</h1>
              <p className="text-gray-600">実際に働いた女の子の声から、あなたに合うお店を見つけよう</p>
            </div>
            <Button
              variant="outline"
              onClick={() => onNavigate({ page: 'survey-new' })}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              アンケートを投稿
            </Button>
          </div>
        </div>

        {/* Search Form */}
        <div className="bg-gradient-to-br from-white to-pink-50/30 rounded-2xl p-8 shadow-lg border border-pink-100/50 mb-8 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-pink-600" />
            <h2 className="text-gray-900">店舗を探す</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative group">
              <input
                type="text"
                placeholder="店舗名やエリアを入力"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 outline-none transition-all bg-white/80 backdrop-blur-sm hover:border-pink-300 shadow-sm"
              />
            </div>
            
            <div className="relative">
              <select
                value={prefecture}
                onChange={(e) => setPrefecture(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 outline-none transition-all bg-white/80 backdrop-blur-sm hover:border-pink-300 appearance-none cursor-pointer shadow-sm"
              >
                <option value="">都道府県を選択</option>
                <option value="東京都">東京都</option>
                <option value="大阪府">大阪府</option>
                <option value="神奈川県">神奈川県</option>
                <option value="愛知県">愛知県</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 outline-none transition-all bg-white/80 backdrop-blur-sm hover:border-pink-300 appearance-none cursor-pointer shadow-sm"
              >
                <option value="">業種を選択</option>
                <option value="ソープランド">ソープランド</option>
                <option value="ヘルス">ヘルス</option>
                <option value="デリヘル">デリヘル</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            {(keyword || prefecture || category) && (
              <button
                onClick={() => {
                  setKeyword('');
                  setPrefecture('');
                  setCategory('');
                  onNavigate({ page: 'stores' });
                }}
                className="text-sm text-gray-600 hover:text-pink-600 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                条件をクリア
              </button>
            )}
            <Button 
              onClick={handleSearch} 
              className="gap-2 ml-auto shadow-md hover:shadow-lg transition-shadow"
            >
              <Search className="w-4 h-4" />
              検索する
            </Button>
          </div>
        </div>

        {/* Sort Bar */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-600 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              並び替え
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSortBy('new')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                  sortBy === 'new'
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                新着順
              </button>
              <button
                onClick={() => setSortBy('earning')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                  sortBy === 'earning'
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                稼ぎ順
              </button>
              <button
                onClick={() => setSortBy('rating')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-all ${
                  sortBy === 'rating'
                    ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Star className="w-4 h-4" />
                評価順
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {paginatedStores.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200">
            <p className="text-gray-500">条件に一致する店舗が見つかりませんでした</p>
            <p className="text-sm text-gray-400 mt-2">検索条件を変更してお試しください</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedStores.map((store) => (
                <StoreCard
                  key={store.id}
                  store={store}
                  onClick={() => onNavigate({ page: 'store-detail', id: store.id })}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}