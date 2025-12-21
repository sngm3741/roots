import { z } from "zod";

export const WORK_TYPES = ["在籍", "出稼ぎ"] as const;

// フロント（draft投稿）用：店舗紐付け不要
export const SurveyDraftInputSchema = z.object({
  storeName: z.string().min(1),
  branchName: z.string().optional(),
  prefecture: z.string().min(1),
  industry: z.string().min(1),
  genre: z.string().optional(),
  visitedPeriod: z.string().min(1), // YYYY-MM 前提
  workType: z.enum(WORK_TYPES),
  age: z.number().min(18).max(50),
  specScore: z.number().min(60).max(140),
  waitTimeHours: z.number().min(0).max(24),
  averageEarning: z.number().min(0).max(30),
  castBack: z.number().min(0).max(30000).optional(),
  rating: z.number().min(0).max(5),
  customerComment: z.string().optional(),
  staffComment: z.string().optional(),
  workEnvironmentComment: z.string().optional(),
  etcComment: z.string().optional(),
  emailAddress: z.string().email().optional(),
  imageUrls: z.array(z.string()).optional(),
});

// 管理 (確定) 用：storeId 必須
export const SurveyInputSchema = SurveyDraftInputSchema.extend({
  storeId: z.string().min(1),
});

export type SurveyDraftInput = z.infer<typeof SurveyDraftInputSchema>;
export type SurveyInput = z.infer<typeof SurveyInputSchema>;
