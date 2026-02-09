import type { SurveyInput, StoreInput } from "@makotoclub/shared";

export type BusinessHours = {
  open: string;
  close?: string;
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

export type AccessLogEntry = {
  ipMasked: string;
  path: string;
  method: string;
  status: number;
  createdAt: string;
};

export type AnalyticsSummary = {
  totalPageViews: number;
  todayPageViews: number;
  rangePageViews: number;
  todayUniqueVisitors: number;
  averageStaySeconds: number;
  bounceRate: number;
  totalOutboundClicks: number;
  todayOutboundClicks: number;
};

export type AnalyticsDailyPoint = {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  averageStaySeconds: number;
};

export type AnalyticsPathPoint = {
  path: string;
  pageViews: number;
  averageStaySeconds: number;
  sharePercent: number;
};

export type AnalyticsReferrerPoint = {
  referrer: string;
  pageViews: number;
};

export type AnalyticsUtmPoint = {
  source: string;
  medium: string;
  campaign: string;
  pageViews: number;
};

export type AnalyticsOutboundStorePoint = {
  storeId: string;
  storeName: string;
  clicks: number;
  recruitmentClicks: number;
  lineClicks: number;
  xClicks: number;
  bskyClicks: number;
  lastClickedAt: string | null;
};

export type AnalyticsOutboundRecentPoint = {
  occurredAt: string;
  storeId: string;
  storeName: string;
  linkType: string;
  sourcePath: string;
  targetUrl: string;
  inflowSource: string;
};

export type AnalyticsSnapshot = {
  generatedAt: string;
  rangeDays: number;
  summary: AnalyticsSummary;
  daily: AnalyticsDailyPoint[];
  paths: AnalyticsPathPoint[];
  referrers?: AnalyticsReferrerPoint[];
  landingReferrers: AnalyticsReferrerPoint[];
  internalReferrers: AnalyticsReferrerPoint[];
  utmCampaigns: AnalyticsUtmPoint[];
  outboundTopStores: AnalyticsOutboundStorePoint[];
  outboundRecentClicks: AnalyticsOutboundRecentPoint[];
  coverage: {
    hasAccessHits: boolean;
    hasPageViews: boolean;
    hasSessionAttribution: boolean;
    hasLinkClicks: boolean;
    note: string | null;
  };
};
