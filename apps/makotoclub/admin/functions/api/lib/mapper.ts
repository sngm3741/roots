import type { SurveyInput, StoreInput } from "@makotoclub/shared";

export type Env = {
  DB: D1Database;
  makotoclub_assets?: R2Bucket;
};

export type StoreRow = {
  id: string;
  name: string;
  branch_name?: string | null;
  prefecture: string;
  area?: string | null;
  industry: string;
  genre?: string | null;
  cast_back?: string | null;
  recruitment_urls?: string | null;
  business_hours_open?: string | null;
  business_hours_close?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  survey_count?: number | null;
  helpful_count?: number | null;
  avg_earning?: number | null;
  avg_rating?: number | null;
  avg_wait?: number | null;
};

export type SurveyRow = {
  id: string;
  store_id?: string | null;
  store_name: string;
  store_branch?: string | null;
  store_prefecture: string;
  store_area?: string | null;
  store_industry: string;
  industry_other?: string | null;
  store_genre?: string | null;
  visited_period: string;
  work_type: string;
  work_type_other?: string | null;
  age: number;
  spec_score: number;
  wait_time_hours: number;
  average_earning: number;
  rating: number;
  customer_comment?: string | null;
  staff_comment?: string | null;
  work_environment_comment?: string | null;
  etc_comment?: string | null;
  cast_back?: string | null;
  email_address?: string | null;
  image_urls?: string | null;
  helpful_count?: number | null;
  created_at: string;
  updated_at: string;
  status?: "draft" | "published";
};

export const mapStore = (row: StoreRow, stats?: Partial<StoreRow>) => {
  const averageEarning = stats?.avg_earning ?? row.avg_earning ?? 0;
  const averageRating = stats?.avg_rating ?? row.avg_rating ?? 0;
  const waitTimeHours = stats?.avg_wait ?? row.avg_wait ?? 0;
  const surveyCount = stats?.survey_count ?? row.survey_count ?? 0;
  const helpfulCount = stats?.helpful_count ?? row.helpful_count ?? 0;
  const recruitmentUrls =
    typeof row.recruitment_urls === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(row.recruitment_urls);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];
  return {
    id: row.id,
    storeName: row.name,
    branchName: row.branch_name ?? undefined,
    prefecture: row.prefecture,
    area: row.area ?? undefined,
    category: row.industry,
    genre: row.genre ?? undefined,
    castBack: row.cast_back ? Number(row.cast_back) : undefined,
    recruitmentUrls,
    businessHours: row.business_hours_open
      ? { open: row.business_hours_open, close: row.business_hours_close ?? "" }
      : undefined,
    averageRating,
    averageEarning,
    averageEarningLabel: averageEarning ? `${Math.round(averageEarning)}万円` : "-",
    waitTimeHours,
    waitTimeLabel: waitTimeHours ? `${waitTimeHours}時間` : "-",
    surveyCount,
    helpfulCount,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  } satisfies StoreInput & { id: string };
};

export const mapSurvey = (row: SurveyRow) => {
  const imageUrls =
    typeof row.image_urls === "string"
      ? (() => {
          try {
            const parsed = JSON.parse(row.image_urls);
            return Array.isArray(parsed) ? parsed : [];
          } catch {
            return [];
          }
        })()
      : [];
  return {
    id: row.id,
    storeId: row.store_id ?? undefined,
    storeName: row.store_name,
    branchName: row.store_branch ?? undefined,
    prefecture: row.store_prefecture,
    area: row.store_area ?? undefined,
    industry: row.store_industry,
    industryOther: row.industry_other ?? undefined,
    genre: row.store_genre ?? undefined,
    visitedPeriod: row.visited_period,
    workType: row.work_type,
    workTypeOther: row.work_type_other ?? undefined,
    age: row.age,
    specScore: row.spec_score,
    waitTimeHours: row.wait_time_hours,
    averageEarning: row.average_earning,
    castBack: row.cast_back ? Number(row.cast_back) : undefined,
    rating: row.rating,
    customerComment: row.customer_comment ?? undefined,
    staffComment: row.staff_comment ?? undefined,
    workEnvironmentComment: row.work_environment_comment ?? undefined,
    etcComment: row.etc_comment ?? undefined,
    emailAddress: row.email_address ?? undefined,
    imageUrls,
    helpfulCount: row.helpful_count ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status ?? "published",
  } satisfies SurveyInput & { id: string; status: "draft" | "published" };
};
