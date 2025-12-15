import { Send, Upload, X, ZoomIn } from 'lucide-react';
import { useState, useRef } from 'react';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Button } from '../ui/Button';
import { RatingStars } from '../ui/RatingStars';

interface SurveyNewPageProps {
  onNavigate: (route: any) => void;
}

export function SurveyNewPage({ onNavigate }: SurveyNewPageProps) {
  const [storeName, setStoreName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [prefecture, setPrefecture] = useState('');
  const [category, setCategory] = useState('');
  const [visitedPeriod, setVisitedPeriod] = useState('');
  const [workType, setWorkType] = useState<'regular' | 'dispatch'>('regular');
  const [age, setAge] = useState(25);
  const [specScore, setSpecScore] = useState(80);
  const [waitTime, setWaitTime] = useState('');
  const [earning, setEarning] = useState('');
  const [castBack, setCastBack] = useState('');
  const [commentCustomer, setCommentCustomer] = useState('');
  const [commentStaff, setCommentStaff] = useState('');
  const [commentWorkEnv, setCommentWorkEnv] = useState('');
  const [commentEtc, setCommentEtc] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(3.0);
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < Math.min(files.length, 5 - images.length); i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        alert('ファイルサイズは5MB以下にしてください');
        continue;
      }
      if (!file.type.startsWith('image/')) {
        alert('画像ファイルのみアップロード可能です');
        continue;
      }
      const url = URL.createObjectURL(file);
      newImages.push(url);
    }
    setImages([...images, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Validation
    if (!storeName || !prefecture || !category || !visitedPeriod || !workType) {
      alert('必須項目を入力してください');
      setSubmitting(false);
      return;
    }

    if (!waitTime || !earning || !castBack) {
      alert('待機時間、平均稼ぎ、キャストバックを入力してください');
      setSubmitting(false);
      return;
    }

    // Success
    setTimeout(() => {
      setSubmitting(false);
      alert('アンケートを投稿しました！ご協力ありがとうございました。');
      onNavigate({ page: 'surveys' });
    }, 1000);
  };

  return (
    <div className="py-16">
      <div className="max-w-3xl mx-auto px-4">
        <Breadcrumbs
          items={[
            { label: 'ホーム', onClick: () => onNavigate({ page: 'top' }) },
            { label: 'アンケート投稿' }
          ]}
        />

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
          <h1 className="text-gray-900 mb-4">アンケート投稿</h1>
          
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200 mb-6">
            <p className="text-sm text-gray-700">
              <span className="text-pink-600">キャンペーン実施中！</span>
              アンケートにご協力いただいた方全員に、メールでPayPay 1,000円分をお送りします。
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Store Info */}
            <div className="space-y-4">
              <h3 className="text-gray-900">店舗情報</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    働いた時期 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="month"
                    value={visitedPeriod}
                    onChange={(e) => setVisitedPeriod(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    勤務形態 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value as 'regular' | 'dispatch')}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="regular">在籍</option>
                    <option value="dispatch">出稼ぎ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="space-y-4">
              <h3 className="text-gray-900">あなたの情報</h3>
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  年齢 <span className="text-red-500">*</span>
                </label>
                <input
                  type="range"
                  min="18"
                  max="50"
                  step="1"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>18歳</span>
                  <span className="text-pink-600">{age}歳</span>
                  <span>50歳</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  スペック（自己評価） <span className="text-red-500">*</span>
                </label>
                <input
                  type="range"
                  min="60"
                  max="140"
                  step="1"
                  value={specScore}
                  onChange={(e) => setSpecScore(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>60</span>
                  <span className="text-purple-600">{specScore}</span>
                  <span>140</span>
                </div>
              </div>
            </div>

            {/* Work Details */}
            <div className="space-y-4">
              <h3 className="text-gray-900">勤務詳細</h3>
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  待機時間 <span className="text-red-500">*</span>
                </label>
                <select
                  value={waitTime}
                  onChange={(e) => setWaitTime(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="0">0時間（待機なし）</option>
                  <option value="1">1時間</option>
                  <option value="2">2時間</option>
                  <option value="3">3時間</option>
                  <option value="4">4時間</option>
                  <option value="5">5時間以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  平均稼ぎ（月） <span className="text-red-500">*</span>
                </label>
                <select
                  value={earning}
                  onChange={(e) => setEarning(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  required
                >
                  <option value="">選択してください</option>
                  <option value="50000">5万円未満</option>
                  <option value="100000">5〜10万円</option>
                  <option value="150000">10〜15万円</option>
                  <option value="200000">15〜20万円</option>
                  <option value="250000">20〜30万円</option>
                  <option value="300000">30万円以上</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  キャストバック（60分単価） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={castBack}
                  onChange={(e) => setCastBack(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                  placeholder="例: 18000"
                  required
                />
              </div>
            </div>

            {/* Comments */}
            <div className="space-y-4">
              <h3 className="text-gray-900">コメント</h3>
              
              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  お客さんについて
                </label>
                <textarea
                  value={commentCustomer}
                  onChange={(e) => setCommentCustomer(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="客層、年齢層、マナーなどについて"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  スタッフについて
                </label>
                <textarea
                  value={commentStaff}
                  onChange={(e) => setCommentStaff(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="対応、サポート体制などについて"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  職場環境について
                </label>
                <textarea
                  value={commentWorkEnv}
                  onChange={(e) => setCommentWorkEnv(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="待機室、設備、清潔さなどについて"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">
                  その他
                </label>
                <textarea
                  value={commentEtc}
                  onChange={(e) => setCommentEtc(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none resize-none"
                  rows={4}
                  placeholder="その他気になったことなど"
                />
              </div>
            </div>

            {/* Images */}
            <div className="space-y-4">
              <h3 className="text-gray-900">画像（任意）</h3>
              <p className="text-sm text-gray-600">最大5枚、各5MBまで</p>
              
              {images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                  {images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img
                        src={img}
                        alt={`Upload ${i + 1}`}
                        className="w-full aspect-square object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviewImage(img)}
                        className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center"
                      >
                        <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-pink-400 hover:bg-pink-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">クリックして画像をアップロード</p>
                </button>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                メールアドレス（PayPay送付用）
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                placeholder="example@email.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                キャンペーンのPayPayを受け取る場合は入力してください
              </p>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                総合満足度 <span className="text-red-500">*</span>
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full mb-3"
              />
              <div className="flex items-center justify-center">
                <RatingStars rating={rating} size="lg" />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={submitting}
                className="w-full gap-2"
                size="lg"
              >
                <Send className="w-5 h-5" />
                {submitting ? '送信中...' : 'アンケートを投稿する'}
              </Button>
            </div>
          </form>
        </div>

        {/* Image Preview Modal */}
        {previewImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh]">
              <img
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
              />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}