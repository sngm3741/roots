import { StoreSummary, StoreDetail, SurveySummary } from '../types';

export const mockStores: StoreSummary[] = [
  {
    id: '1',
    storeName: 'グランドステージ',
    branchName: '新宿店',
    prefecture: '東京都',
    area: '新宿',
    category: 'ソープランド',
    genre: '高級店',
    unitPrice: 25000,
    averageRating: 4.5,
    averageEarning: 180000,
    averageEarningLabel: '15〜20万円',
    waitTimeHours: 2,
    waitTimeLabel: '2時間',
    surveyCount: 24,
    helpfulCount: 120
  },
  {
    id: '2',
    storeName: 'ロイヤルパレス',
    branchName: '池袋店',
    prefecture: '東京都',
    area: '池袋',
    category: 'ヘルス',
    genre: '大衆店',
    unitPrice: 18000,
    averageRating: 4.2,
    averageEarning: 150000,
    averageEarningLabel: '10〜15万円',
    waitTimeHours: 1,
    waitTimeLabel: '1時間',
    surveyCount: 18,
    helpfulCount: 89
  },
  {
    id: '3',
    storeName: 'ピンクキャッスル',
    prefecture: '大阪府',
    area: '梅田',
    category: 'デリヘル',
    genre: '人妻・熟女',
    unitPrice: 15000,
    averageRating: 3.8,
    averageEarning: 120000,
    averageEarningLabel: '10〜15万円',
    waitTimeHours: 3,
    waitTimeLabel: '3時間',
    surveyCount: 12,
    helpfulCount: 45
  },
  {
    id: '4',
    storeName: 'スイートガーデン',
    branchName: '横浜店',
    prefecture: '神奈川県',
    area: '横浜',
    category: 'ソープランド',
    genre: '大衆店',
    unitPrice: 20000,
    averageRating: 4.0,
    averageEarning: 160000,
    averageEarningLabel: '15〜20万円',
    waitTimeHours: 2,
    waitTimeLabel: '2時間',
    surveyCount: 15,
    helpfulCount: 67
  },
  {
    id: '5',
    storeName: 'ラグジュアリー',
    prefecture: '愛知県',
    area: '栄',
    category: 'ヘルス',
    genre: '高級店',
    unitPrice: 22000,
    averageRating: 4.7,
    averageEarning: 200000,
    averageEarningLabel: '20〜30万円',
    waitTimeHours: 1,
    waitTimeLabel: '1時間',
    surveyCount: 30,
    helpfulCount: 156
  },
  {
    id: '6',
    storeName: 'プレミアムラウンジ',
    branchName: '六本木店',
    prefecture: '東京都',
    area: '六本木',
    category: 'デリヘル',
    genre: '高級店',
    unitPrice: 28000,
    averageRating: 4.3,
    averageEarning: 170000,
    averageEarningLabel: '15〜20万円',
    waitTimeHours: 2,
    waitTimeLabel: '2時間',
    surveyCount: 21,
    helpfulCount: 98
  }
];

export const mockSurveys: SurveySummary[] = [
  {
    id: '1',
    storeId: '1',
    storeName: 'グランドステージ',
    branchName: '新宿店',
    storePrefecture: '東京都',
    storeArea: '新宿',
    storeIndustry: 'ソープランド',
    storeGenre: '高級店',
    visitedPeriod: '2024-11',
    workType: 'regular',
    age: 24,
    specScore: 85,
    waitTimeHours: 2,
    averageEarning: 180000,
    rating: 4.5,
    comments: {
      customer: 'お客様層は比較的良く、紳士的な方が多かったです。年齢層は40〜50代が中心で、リピーターさんも多い印象でした。',
      staff: 'スタッフの対応は丁寧で、困ったことがあればすぐに相談できる環境でした。ボーイさんも優しく、安心して働けました。',
      workEnvironment: '待機室は清潔で快適。シャワールームも綺麗に保たれています。衣装やアメニティも充実していて働きやすいです。',
      etc: '全体的に満足度が高いお店です。稼ぎもしっかりあるので、長く続けたいと思っています。'
    },
    castBack: 25000,
    helpfulCount: 45,
    createdAt: '2024-12-10T10:00:00Z'
  },
  {
    id: '2',
    storeId: '1',
    storeName: 'グランドステージ',
    branchName: '新宿店',
    storePrefecture: '東京都',
    storeArea: '新宿',
    storeIndustry: 'ソープランド',
    storeGenre: '高級店',
    visitedPeriod: '2024-10',
    workType: 'dispatch',
    age: 26,
    specScore: 90,
    waitTimeHours: 1,
    averageEarning: 200000,
    rating: 5.0,
    comments: {
      customer: '客層最高！マナーの良いお客様ばかりで、嫌な思いをすることはほとんどありませんでした。',
      staff: 'スタッフさんの対応が素晴らしいです。何かあった時の対応も迅速で、女の子のことを第一に考えてくれます。',
      workEnvironment: '設備が新しく、とても清潔。ロッカーも広くて使いやすいです。',
      etc: '出稼ぎで来ましたが、想像以上に良いお店でした。また機会があれば働きたいです。'
    },
    castBack: 28000,
    helpfulCount: 32,
    createdAt: '2024-12-08T14:30:00Z'
  },
  {
    id: '3',
    storeId: '2',
    storeName: 'ロイヤルパレス',
    branchName: '池袋店',
    storePrefecture: '東京都',
    storeArea: '池袋',
    storeIndustry: 'ヘルス',
    storeGenre: '大衆店',
    visitedPeriod: '2024-12',
    workType: 'regular',
    age: 22,
    specScore: 75,
    waitTimeHours: 1,
    averageEarning: 150000,
    rating: 4.0,
    comments: {
      customer: 'いろんなタイプのお客様がいらっしゃいます。たまに大変な方もいますが、スタッフさんがしっかりフォローしてくれます。',
      staff: 'ボーイさんは基本的に優しいです。新人の時も丁寧に教えてくれました。',
      workEnvironment: '普通のヘルスという感じ。特に不満はありませんが、特別良いわけでもないです。',
      etc: 'バックがもう少し良ければ最高なんですが、それでも働きやすいお店だと思います。'
    },
    castBack: 18000,
    helpfulCount: 21,
    createdAt: '2024-12-07T09:15:00Z'
  },
  {
    id: '4',
    storeId: '5',
    storeName: 'ラグジュアリー',
    storePrefecture: '愛知県',
    storeArea: '栄',
    storeIndustry: 'ヘルス',
    storeGenre: '高級店',
    visitedPeriod: '2024-11',
    workType: 'regular',
    age: 25,
    specScore: 88,
    waitTimeHours: 1,
    averageEarning: 220000,
    rating: 4.8,
    comments: {
      customer: '経営者や会社役員の方が多く、とても紳士的です。チップをくださる方も多いです。',
      staff: 'スタッフの教育が行き届いていて、プロフェッショナルな対応をしてくれます。',
      workEnvironment: '高級感のある内装で、働いていて気分が上がります。アメニティも高級ブランドのものが揃っています。',
      etc: '名古屋で一番稼げるお店だと思います。自分磨きも頑張れる環境です。'
    },
    castBack: 30000,
    helpfulCount: 67,
    createdAt: '2024-12-06T16:45:00Z'
  },
  {
    id: '5',
    storeId: '3',
    storeName: 'ピンクキャッスル',
    storePrefecture: '大阪府',
    storeArea: '梅田',
    storeIndustry: 'デリヘル',
    storeGenre: '人妻・熟女',
    visitedPeriod: '2024-10',
    workType: 'regular',
    age: 32,
    specScore: 70,
    waitTimeHours: 3,
    averageEarning: 120000,
    rating: 3.5,
    comments: {
      customer: '人妻系なので、落ち着いたお客様が多いです。リピーターさんが付きやすい印象。',
      staff: '普通です。可もなく不可もなくという感じ。',
      workEnvironment: '待機時間が長いのがネック。暇な日は本当に暇です。',
      etc: 'もう少し客入りが良ければいいんですが...。'
    },
    castBack: 15000,
    helpfulCount: 12,
    createdAt: '2024-12-05T11:20:00Z'
  },
  {
    id: '6',
    storeId: '4',
    storeName: 'スイートガーデン',
    branchName: '横浜店',
    storePrefecture: '神奈川県',
    storeArea: '横浜',
    storeIndustry: 'ソープランド',
    storeGenre: '大衆店',
    visitedPeriod: '2024-12',
    workType: 'regular',
    age: 23,
    specScore: 78,
    waitTimeHours: 2,
    averageEarning: 160000,
    rating: 4.2,
    comments: {
      customer: '地元の常連さんが多く、アットホームな雰囲気です。優しいお客様が多いです。',
      staff: 'スタッフさんがフレンドリーで話しやすいです。相談もしやすい環境。',
      workEnvironment: '古い建物ですが、清掃はしっかりされています。',
      etc: '初めてのソープでしたが、優しく教えてもらえました。'
    },
    castBack: 20000,
    helpfulCount: 28,
    createdAt: '2024-12-04T13:00:00Z'
  }
];

export function getStoreById(id: string): StoreDetail | null {
  const store = mockStores.find(s => s.id === id);
  if (!store) return null;
  
  const surveys = mockSurveys.filter(s => s.storeId === id);
  return { ...store, surveys };
}

export function getSurveyById(id: string): SurveySummary | null {
  return mockSurveys.find(s => s.id === id) || null;
}
