export interface StoreSummary {
  id: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  area?: string;
  category: string; // industry
  genre?: string;
  unitPrice?: number;
  businessHours?: { open: string; close: string };
  averageRating: number;
  averageEarning: number;
  averageEarningLabel?: string;
  waitTimeHours?: number;
  waitTimeLabel?: string;
  surveyCount: number;
  helpfulCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface StoreDetail extends StoreSummary {
  surveys: SurveySummary[];
}

export interface SurveySummary {
  id: string;
  storeId: string;
  storeName: string;
  branchName?: string;
  storePrefecture: string;
  storeArea?: string;
  storeIndustry: string;
  storeGenre?: string;
  visitedPeriod: string; // YYYY-MM
  workType: 'regular' | 'dispatch';
  age: number;
  specScore: number;
  waitTimeHours: number;
  averageEarning: number;
  rating: number;
  comments: {
    customer?: string;
    staff?: string;
    workEnvironment?: string;
    etc?: string;
  };
  castBack?: number;
  emailAddress?: string;
  imageUrls?: string[];
  helpfulCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface SurveyDetail extends SurveySummary {}

export interface ListResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}
