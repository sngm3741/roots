import type { Env } from "./mapper";

type SurveyStatRow = {
  age: number;
  spec_score: number;
  average_earning: number;
  rating: number;
  wait_time_hours: number;
  helpful_count?: number | null;
};

const computeMedian = (values: number[]) => {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
};

const computeMinMax = (values: number[]) => {
  let min = values[0];
  let max = values[0];
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return { min, max };
};

export const rebuildStoreStats = async (env: Env, storeId: string) => {
  const rows = await env.DB.prepare(
    "SELECT age, spec_score, average_earning, rating, wait_time_hours, helpful_count FROM surveys WHERE store_id = ? AND deleted_at IS NULL",
  )
    .bind(storeId)
    .all();
  const surveys = (rows.results ?? []) as SurveyStatRow[];
  if (surveys.length === 0) {
    await env.DB.prepare("DELETE FROM store_stats WHERE store_id = ?").bind(storeId).run();
    return;
  }

  const specScores = surveys.map((row) => Number(row.spec_score) || 0);
  const ages = surveys.map((row) => Number(row.age) || 0);
  const totalEarning = surveys.reduce((sum, row) => sum + (Number(row.average_earning) || 0), 0);
  const totalRating = surveys.reduce((sum, row) => sum + (Number(row.rating) || 0), 0);
  const totalWait = surveys.reduce((sum, row) => sum + (Number(row.wait_time_hours) || 0), 0);
  const helpfulCount = surveys.reduce((sum, row) => sum + (Number(row.helpful_count) || 0), 0);

  const specRange = computeMinMax(specScores);
  const ageRange = computeMinMax(ages);
  const count = surveys.length;
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT OR REPLACE INTO store_stats
      (store_id, survey_count, min_spec, max_spec, median_spec, min_age, max_age, median_age,
       avg_earning, avg_rating, avg_wait, helpful_count, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      storeId,
      count,
      specRange.min,
      specRange.max,
      computeMedian(specScores),
      ageRange.min,
      ageRange.max,
      computeMedian(ages),
      Number((totalEarning / count).toFixed(1)),
      Number((totalRating / count).toFixed(1)),
      Number((totalWait / count).toFixed(1)),
      helpfulCount,
      now,
    )
    .run();
};
