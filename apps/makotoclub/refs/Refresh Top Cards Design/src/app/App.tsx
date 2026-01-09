import { useState } from 'react';
import { StoreCard } from './components/StoreCard';
import { SurveyCard } from './components/SurveyCard';

// モックデータ
const storeData = [
  {
    id: 1,
    storeName: 'バルコ',
    branchName: undefined,
    prefecture: '茨城県',
    category: 'ソープ',
    rating: 4.2,
    avgEarnings: '8万円',
    avgWaitTime: '12.8時間',
    surveyCount: 9,
  },
  {
    id: 2,
    storeName: 'ディアラ',
    branchName: '西川口',
    prefecture: '埼玉県',
    category: 'ソープ',
    rating: 4.5,
    avgEarnings: '6万円',
    avgWaitTime: '8時間',
    surveyCount: 15,
  },
  {
    id: 3,
    storeName: 'クラブルージュ',
    branchName: '吉原',
    prefecture: '東京都',
    category: 'ソープ',
    rating: 4.3,
    avgEarnings: '10万円',
    avgWaitTime: '10時間',
    surveyCount: 23,
  },
];

const surveyData = [
  {
    id: 1,
    visitDate: '2025年12月',
    storeName: 'ディアラ',
    branchName: '西川口',
    prefecture: '埼玉県',
    rating: 4.5,
    avgEarnings: '6万円',
    avgWaitTime: '8時間',
    age: 25,
    spec: '116',
    comment:
      '西川口のNS◯◯なので、最高ですね。歯なし、チンカスまみれ、風呂拒否、歯磨き拒否、明らかに性病のなにスキン...',
    helpfulCount: 12,
  },
  {
    id: 2,
    visitDate: '2025年11月',
    storeName: 'バルコ',
    branchName: undefined,
    prefecture: '茨城県',
    rating: 4.0,
    avgEarnings: '7.5万円',
    avgWaitTime: '11時間',
    age: 23,
    spec: '105',
    comment:
      '茨城県内では有名な店舗です。待機時間は長めですが、その分しっかり稼げます。スタッフの対応も丁寧で働きやすい環境だと思います。',
    helpfulCount: 8,
  },
  {
    id: 3,
    visitDate: '2025年10月',
    storeName: 'クラブルージュ',
    branchName: '吉原',
    prefecture: '東京都',
    rating: 4.5,
    avgEarnings: '12万円',
    avgWaitTime: '9時間',
    age: 27,
    spec: '120',
    comment:
      '吉原の老舗店舗ということもあり、客層が良いです。高級店なので稼ぎも良く、待機時間も比較的短めです。ただし、ルールが厳しいので初心者には少し大変かもしれません。',
    helpfulCount: 24,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'store' | 'survey'>('store');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            マコトクラブ
          </h1>

          {/* タブ */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('store')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                activeTab === 'store'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">店舗</span>
            </button>
            <button
              onClick={() => setActiveTab('survey')}
              className={`flex-1 py-3 px-4 rounded-xl transition-all ${
                activeTab === 'survey'
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="font-bold">アンケート</span>
            </button>
          </div>
        </div>
      </div>

      {/* カードリスト */}
      <div className="max-w-2xl mx-auto px-4 mt-6">
        <div className="space-y-4">
          {activeTab === 'store' &&
            storeData.map((store) => (
              <StoreCard
                key={store.id}
                storeName={store.storeName}
                branchName={store.branchName}
                prefecture={store.prefecture}
                category={store.category}
                rating={store.rating}
                avgEarnings={store.avgEarnings}
                avgWaitTime={store.avgWaitTime}
                surveyCount={store.surveyCount}
              />
            ))}
          {activeTab === 'survey' &&
            surveyData.map((survey) => (
              <SurveyCard
                key={survey.id}
                visitDate={survey.visitDate}
                storeName={survey.storeName}
                branchName={survey.branchName}
                prefecture={survey.prefecture}
                rating={survey.rating}
                avgEarnings={survey.avgEarnings}
                avgWaitTime={survey.avgWaitTime}
                age={survey.age}
                spec={survey.spec}
                comment={survey.comment}
                helpfulCount={survey.helpfulCount}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
