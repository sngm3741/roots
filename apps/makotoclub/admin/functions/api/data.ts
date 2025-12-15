export type BusinessHours = {
  open: string;
  close: string;
};

export type Store = {
  id: string;
  storeName: string;
  branchName?: string | null;
  prefecture: string;
  area?: string | null;
  category: string;
  genre?: string | null;
  unitPrice?: string | null;
  businessHours?: BusinessHours | null;
  averageRating: number;
  averageEarning: number;
  averageEarningLabel?: string | null;
  waitTimeHours?: number | null;
  waitTimeLabel?: string | null;
  surveyCount: number;
  helpfulCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type SurveyStatus = "draft" | "published";

export type Survey = {
  id: string;
  storeId: string;
  storeName: string;
  storeBranch?: string | null;
  storePrefecture: string;
  storeArea?: string | null;
  storeIndustry: string;
  storeGenre?: string | null;
  visitedPeriod: string;
  workType: string;
  age: number;
  specScore: number;
  waitTimeHours: number;
  averageEarning: number;
  rating: number;
  status: SurveyStatus;
  customerComment?: string | null;
  createdAt: string;
  updatedAt: string;
};

const nowIso = () => new Date().toISOString();

export const db = {
  stores: [
    {
      id: "store-1",
      storeName: "スナック桜",
      branchName: "新宿店",
      prefecture: "東京都",
      area: "新宿",
      category: "スナック",
      genre: "カジュアル",
      unitPrice: "6000",
      businessHours: { open: "18:00", close: "25:00" },
      averageRating: 4.2,
      averageEarning: 15,
      averageEarningLabel: "15万円",
      waitTimeHours: 2,
      waitTimeLabel: "2時間",
      surveyCount: 12,
      helpfulCount: 30,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "store-2",
      storeName: "バー橘",
      prefecture: "大阪府",
      area: "北新地",
      category: "バー",
      averageRating: 4.6,
      averageEarning: 18,
      averageEarningLabel: "18万円",
      waitTimeHours: 1,
      waitTimeLabel: "1時間",
      surveyCount: 20,
      helpfulCount: 54,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ] as Store[],
  surveys: [
    {
      id: "survey-1",
      storeId: "store-1",
      storeName: "スナック桜",
      storeBranch: "新宿店",
      storePrefecture: "東京都",
      storeArea: "新宿",
      storeIndustry: "スナック",
      storeGenre: "カジュアル",
      visitedPeriod: "2024-12",
      workType: "アルバイト",
      age: 24,
      specScore: 4,
      waitTimeHours: 2,
      averageEarning: 16,
      rating: 4,
      status: "published",
      customerComment: "常連さんが多く落ち着いた雰囲気",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "survey-2",
      storeId: "store-2",
      storeName: "バー橘",
      storePrefecture: "大阪府",
      storeArea: "北新地",
      storeIndustry: "バー",
      visitedPeriod: "2025-01",
      workType: "レギュラー",
      age: 28,
      specScore: 5,
      waitTimeHours: 1,
      averageEarning: 20,
      rating: 5,
      status: "draft",
      customerComment: "静かな時間帯が多い", 
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ] as Survey[],
};

export const findStore = (id: string) => db.stores.find((store) => store.id === id);

export const findSurvey = (id: string) => db.surveys.find((survey) => survey.id === id);
