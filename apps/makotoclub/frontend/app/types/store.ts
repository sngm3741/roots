export interface StoreSummary {
  id: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  area?: string;
  category: string;
  genre?: string;
  createdAt?: string;
  updatedAt?: string;
  averageRating: number;
  averageEarning: number;
  averageEarningLabel?: string;
  waitTimeHours: number;
  waitTimeLabel?: string;
  unitPrice?: string | null;
  surveyCount: number;
  helpfulCount?: number;
  reviewCount?: number; // 互換用
}

export interface StoreDetail extends StoreSummary {
  businessHours?: {
    open: string;
    close: string;
  };
  surveys: SurveySummary[];
}

// 循環参照を避けるため一部を再宣言
export interface SurveySummary {
  id: string;
  storeId: string;
  storeName: string;
  storeBranch?: string;
  storePrefecture: string;
  storeArea?: string;
  storeIndustry: string;
  storeGenre?: string;
  visitedPeriod: string;
  workType: string;
  age: number;
  specScore: number;
  waitTimeHours: number;
  averageEarning: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
  helpfulCount?: number;
  customerComment?: string;
  staffComment?: string;
  workEnvironmentComment?: string;
  castBack?: string;
  etcComment?: string;
  emailAddress?: string;
  imageUrls?: string[];
}

export interface StoreListResponse {
  items: StoreSummary[];
  page: number;
  limit: number;
  total: number;
}
