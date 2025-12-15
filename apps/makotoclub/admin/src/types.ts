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

export type StorePayload = Omit<Store, "createdAt" | "updatedAt"> & { id?: string };

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

export type SurveyPayload = Omit<Survey, "createdAt" | "updatedAt"> & { id?: string };
