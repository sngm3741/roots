import type { StoreCommentRow, StoreRow, StoreStats, SurveyRow } from "./types";

const parseRecruitmentUrls = (value: string | null | undefined): string[] => {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);
  } catch {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
};

export const mapStore = (row: StoreRow, stats?: StoreStats) => {
  const averageEarning = stats?.averageEarning ?? row.avg_earning ?? 0;
  const averageRating = stats?.averageRating ?? row.avg_rating ?? 0;
  const waitTimeHours = stats?.waitTimeHours ?? row.avg_wait ?? 0;
  const surveyCount = stats?.surveyCount ?? row.survey_count ?? 0;
  const helpfulCount = stats?.helpfulCount ?? row.helpful_count ?? 0;
  return {
    id: row.id,
    storeName: row.name,
    branchName: row.branch_name ?? undefined,
    prefecture: row.prefecture,
    area: row.area ?? undefined,
    category: row.industry,
    genre: row.genre ?? undefined,
    phoneNumber: row.phone_number ?? undefined,
    email: row.email ?? undefined,
    lineUrl: row.line_url ?? undefined,
    twitterUrl: row.twitter_url ?? undefined,
    bskyUrl: row.bsky_url ?? undefined,
    recruitmentUrls: parseRecruitmentUrls(row.recruitment_urls),
    businessHours: row.business_hours_open
      ? { open: row.business_hours_open, close: row.business_hours_close ?? undefined }
      : undefined,
    averageRating,
    averageEarning,
    averageEarningLabel:
      stats?.averageEarningLabel ??
      (averageEarning ? `${Math.round(averageEarning)}万円` : "-"),
    waitTimeHours,
    waitTimeLabel: stats?.waitTimeLabel ?? (waitTimeHours ? `${waitTimeHours}時間` : "-"),
    surveyCount,
    helpfulCount,
    createdAt: row.created_at ?? undefined,
    updatedAt: row.updated_at ?? undefined,
  };
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
    storeId: row.store_id,
    storeName: row.store_name,
    storeBranch: row.store_branch ?? undefined,
    storePrefecture: row.store_prefecture,
    storeArea: row.store_area ?? undefined,
    storeIndustry: row.store_industry,
    storeGenre: row.store_genre ?? undefined,
    visitedPeriod: row.visited_period,
    workType: row.work_type,
    age: row.age,
    specScore: row.spec_score,
    waitTimeHours: row.wait_time_hours,
    averageEarning: row.average_earning,
    rating: row.rating,
    customerComment: row.customer_comment ?? undefined,
    staffComment: row.staff_comment ?? undefined,
    workEnvironmentComment: row.work_environment_comment ?? undefined,
    etcComment: row.etc_comment ?? undefined,
    castBack: row.cast_back ?? undefined,
    emailAddress: row.email_address ?? undefined,
    imageUrls,
    helpfulCount: row.helpful_count ?? undefined,
    commentCount: row.comment_count ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const mapStoreComment = (row: StoreCommentRow) => ({
  id: row.id,
  storeId: row.store_id,
  seq: row.seq ?? undefined,
  parentId: row.parent_id ?? null,
  authorName: row.author_name ?? null,
  body: row.body,
  goodCount: row.good_count ?? 0,
  badCount: row.bad_count ?? 0,
  createdAt: row.created_at,
  deletedAt: row.deleted_at ?? null,
});

export const computeSurveyStats = (surveys: ReturnType<typeof mapSurvey>[]) => {
  const count = surveys.length;
  const totalRating = surveys.reduce((sum, s) => sum + (s.rating ?? 0), 0);
  const totalEarning = surveys.reduce((sum, s) => sum + (s.averageEarning ?? 0), 0);
  const totalWait = surveys.reduce((sum, s) => sum + (s.waitTimeHours ?? 0), 0);
  const helpfulCount = surveys.reduce((sum, s) => sum + (s.helpfulCount ?? 0), 0);

  const averageRating = count ? Number((totalRating / count).toFixed(1)) : 0;
  const averageEarning = count ? Number((totalEarning / count).toFixed(1)) : 0;
  const waitTimeHours = count ? Number((totalWait / count).toFixed(1)) : 0;

  return {
    count,
    averageRating,
    averageEarning,
    waitTimeHours,
    averageEarningLabel: averageEarning ? `${Math.round(averageEarning)}万円` : "-",
    waitTimeLabel: waitTimeHours ? `${waitTimeHours}時間` : "-",
    helpfulCount,
  };
};
