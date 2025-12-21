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
  storeName: string;
  branchName?: string | null;
  prefecture: string;
  industry: string;
  visitedPeriod: string;
  workType: string;
  age: number;
  specScore: number;
  waitTimeHours: number;
  averageEarning: number;
  castBack: number;
  rating: number;
  customerComment?: string | null;
  staffComment?: string | null;
  workEnvironmentComment?: string | null;
  etcComment?: string | null;
  emailAddress?: string | null;
  imageUrls?: string[] | null;
  status: SurveyStatus;
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
      storeName: "スナック桜",
      branchName: "新宿店",
      prefecture: "東京都",
      industry: "スナック",
      visitedPeriod: "2024-12",
      workType: "在籍",
      age: 24,
      specScore: 100,
      waitTimeHours: 2,
      averageEarning: 16,
      castBack: 12000,
      rating: 4,
      customerComment: "常連さんが多く落ち着いた雰囲気",
      staffComment: "優しい",
      workEnvironmentComment: "清潔感あり",
      etcComment: "",
      emailAddress: "sample@example.com",
      imageUrls: [],
      status: "published",
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
    {
      id: "survey-2",
      storeName: "バー橘",
      prefecture: "大阪府",
      industry: "バー",
      visitedPeriod: "2025-01",
      workType: "出稼ぎ",
      age: 28,
      specScore: 110,
      waitTimeHours: 1,
      averageEarning: 20,
      castBack: 8000,
      rating: 5,
      status: "draft",
      customerComment: "静かな時間帯が多い",
      staffComment: null,
      workEnvironmentComment: null,
      etcComment: null,
      emailAddress: null,
      imageUrls: [],
      createdAt: nowIso(),
      updatedAt: nowIso(),
    },
  ] as Survey[],
};

export const findStore = (id: string) => db.stores.find((store) => store.id === id);

export const findSurvey = (id: string) => db.surveys.find((survey) => survey.id === id);
