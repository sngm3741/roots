export type D1Database = any;
export type R2Bucket = any;

export type Env = {
  DB: D1Database;
  makotoclub_assets?: R2Bucket;
  ASSETS?: { fetch: (input: Request | string | URL) => Promise<Response> };
  AI?: { run: (model: string, input: any) => Promise<any> };
  AI_MODEL?: string;
};

export type StoreRow = {
  id: string;
  name: string;
  branch_name?: string | null;
  prefecture: string;
  area?: string | null;
  industry: string;
  genre?: string | null;
  business_hours_open?: string | null;
  business_hours_close?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  survey_count?: number;
  helpful_count?: number;
  avg_earning?: number;
  avg_rating?: number;
  avg_wait?: number;
  min_spec?: number;
  max_spec?: number;
  median_spec?: number;
  min_age?: number;
  max_age?: number;
  median_age?: number;
};

export type SurveyRow = {
  id: string;
  store_id: string;
  store_name: string;
  store_branch?: string | null;
  store_prefecture: string;
  store_area?: string | null;
  store_industry: string;
  store_genre?: string | null;
  visited_period: string;
  work_type: string;
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
  comment_count?: number | null;
  created_at: string;
  updated_at: string;
};

export type StoreCommentRow = {
  id: string;
  store_id: string;
  seq?: number | null;
  parent_id?: string | null;
  author_name?: string | null;
  body: string;
  good_count?: number | null;
  bad_count?: number | null;
  created_at: string;
  deleted_at?: string | null;
};

export type StoreCommentDetailRow = StoreCommentRow & {
  store_name: string;
  store_branch?: string | null;
  store_prefecture: string;
  store_area?: string | null;
};

export type StoreCommentParentRow = StoreCommentRow;
export type StoreCommentWithCountRow = StoreCommentRow & {
  reply_count?: number | null;
};

export type StoreStats = {
  averageRating?: number | null;
  averageEarning?: number | null;
  waitTimeHours?: number | null;
  surveyCount?: number | null;
  helpfulCount?: number | null;
  averageEarningLabel?: string | null;
  waitTimeLabel?: string | null;
};
