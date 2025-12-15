import { Save, MapPin, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { RatingStars } from '../ui/RatingStars';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { mockStores } from '../../data/mockData';
import { StoreSummary } from '../../types';

interface AdminStoresPageProps {
  onNavigate: (route: any) => void;
}

export function AdminStoresPage({ onNavigate }: AdminStoresPageProps) {
  const [storeId, setStoreId] = useState('');
  const [storeName, setStoreName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [prefecture, setPrefecture] = useState('');
  const [area, setArea] = useState('');
  const [category, setCategory] = useState('');
  const [genre, setGenre] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [openTime, setOpenTime] = useState('');
  const [closeTime, setCloseTime] = useState('');
  const [averageRating, setAverageRating] = useState('4.0');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (!storeName || !prefecture || !category) {
      alert('必須項目を入力してください');
      setSubmitting(false);
      return;
    }

    setTimeout(() => {
      setSubmitting(false);
      alert('店舗を登録しました');
      // Reset form
      setStoreId('');
      setStoreName('');
      setBranchName('');
      setPrefecture('');
      setArea('');
      setCategory('');
      setGenre('');
      setUnitPrice('');
      setOpenTime('');
      setCloseTime('');
      setAverageRating('4.0');
    }, 500);
  };

  return (
    <div className="py-16">
      <div className="max-w-5xl mx-auto px-4">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: 'ホーム', onClick: () => onNavigate({ page: 'top' }) },
            { label: '管理画面 - 店舗登録' }
          ]}
        />

        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">管理画面 - 店舗登録</h1>
          <p className="text-gray-600">新しい店舗を登録または既存店舗を編集します</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-gray-900 mb-6">店舗情報入力</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  店舗ID（空白で自動生成）
                </label>
                <input
                  type="text"
                  value={storeId}
                  onChange={(e) => setStoreId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  placeholder="自動生成"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  店舗名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  支店名
                </label>
                <input
                  type="text"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  都道府県 <span className="text-red-500">*</span>
                </label>
                <select
                  value={prefecture}
                  onChange={(e) => setPrefecture(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="東京都">東京都</option>
                  <option value="大阪府">大阪府</option>
                  <option value="神奈川県">神奈川県</option>
                  <option value="愛知県">愛知県</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  エリア
                </label>
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  placeholder="新宿、渋谷など"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  業種 <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="ソープランド">ソープランド</option>
                  <option value="ヘルス">ヘルス</option>
                  <option value="デリヘル">デリヘル</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  ジャンル
                </label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                >
                  <option value="">選択してください</option>
                  <option value="高級店">高級店</option>
                  <option value="大衆店">大衆店</option>
                  <option value="人妻・熟女">人妻・熟女</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  キャストバック（60分）
                </label>
                <input
                  type="number"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  placeholder="円"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  営業時間（開始）
                </label>
                <input
                  type="time"
                  value={openTime}
                  onChange={(e) => setOpenTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  営業時間（終了）
                </label>
                <input
                  type="time"
                  value={closeTime}
                  onChange={(e) => setCloseTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  平均総合評価（0-5、0.1刻み）
                </label>
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={averageRating}
                  onChange={(e) => setAverageRating(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full gap-2"
              size="lg"
            >
              <Save className="w-5 h-5" />
              {submitting ? '保存中...' : '店舗を保存'}
            </Button>
          </form>
        </div>

        {/* Registered Stores */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-gray-900 mb-6">登録済み店舗一覧</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockStores.map((store) => (
              <div
                key={store.id}
                className="border border-gray-200 rounded-xl p-6 hover:border-pink-200 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{store.prefecture}</span>
                      {store.area && <span>・{store.area}</span>}
                    </div>
                    <h3 className="text-gray-900 mb-1">
                      {store.storeName}
                      {store.branchName && <span className="text-sm text-gray-600 ml-1">{store.branchName}</span>}
                    </h3>
                  </div>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    ID: {store.id}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="pink">{store.category}</Badge>
                  {store.genre && <Badge variant="purple">{store.genre}</Badge>}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">評価</span>
                    <RatingStars rating={store.averageRating} size="sm" showNumber={false} />
                  </div>
                  {store.unitPrice && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <TrendingUp className="w-3 h-3" />
                        <span>バック</span>
                      </div>
                      <span className="text-gray-900">{store.unitPrice.toLocaleString()}円</span>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => onNavigate({ page: 'store-detail', id: store.id })}
                  className="w-full text-center text-sm text-pink-500 hover:text-pink-600 transition-colors"
                >
                  詳細を見る →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}