import type { SurveySummary } from "./survey";

export interface StoreSummary {
  id: string;
  storeName: string;
  branchName?: string;
  prefecture: string;
  area?: string;
  category: string;
  genre?: string;
  phoneNumber?: string;
  email?: string;
  lineUrl?: string;
  twitterUrl?: string;
  bskyUrl?: string;
  recruitmentUrls?: string[];
  createdAt?: string;
  updatedAt?: string;
  averageRating: number;
  averageEarning: number;
  averageEarningLabel?: string;
  waitTimeHours: number;
  waitTimeLabel?: string;
  surveyCount: number;
  helpfulCount?: number;
  reviewCount?: number; // 互換用
}

export interface StoreDetail extends StoreSummary {
  businessHours?: {
    open: string;
    close?: string;
  };
  surveys: SurveySummary[];
}

export interface StoreListResponse {
  items: StoreSummary[];
  page: number;
  limit: number;
  total: number;
}
