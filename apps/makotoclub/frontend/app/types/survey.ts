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

export type SurveyDetail = SurveySummary;

export interface SurveyListResponse {
  items: SurveySummary[];
  page: number;
  limit: number;
  total: number;
}
