import type { SurveyInput, StoreInput } from "@makotoclub/shared";

export type BusinessHours = {
  open: string;
  close: string;
};

export type Store = StoreInput & {
  id: string;
  averageRating: number;
  waitTimeHours: number;
  surveyCount: number;
  helpfulCount?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type StorePayload = StoreInput & { id?: string };

export type Survey = SurveyInput & {
  id: string;
  createdAt: string;
  updatedAt: string;
  helpfulCount?: number;
  status?: "draft" | "published";
  area?: string;
};

export type SurveyPayload = SurveyInput & { id?: string };
