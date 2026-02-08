import { getRequestClientKey, hashText } from "./security";
import type { Env } from "./types";

let rateLimitTableReady = false;
let commentSeqTableReady = false;

const ensureRateLimitTable = async (env: Env) => {
  if (rateLimitTableReady) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS api_rate_limits (
      key TEXT NOT NULL,
      window_start INTEGER NOT NULL,
      count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL,
      PRIMARY KEY (key, window_start)
    )`,
  ).run();
  rateLimitTableReady = true;
};

export const applyRateLimit = async (
  env: Env,
  request: Request,
  scope: string,
  maxCount: number,
  windowSec: number,
) => {
  await ensureRateLimitTable(env);
  const clientKey = await hashText(getRequestClientKey(request));
  const nowEpoch = Math.floor(Date.now() / 1000);
  const windowStart = Math.floor(nowEpoch / windowSec) * windowSec;
  const nowIso = new Date().toISOString();
  const key = `${scope}:${clientKey}`;

  const row = await env.DB.prepare(
    `INSERT INTO api_rate_limits (key, window_start, count, updated_at)
     VALUES (?, ?, 1, ?)
     ON CONFLICT(key, window_start)
     DO UPDATE SET count = count + 1, updated_at = excluded.updated_at
     RETURNING count`,
  )
    .bind(key, windowStart, nowIso)
    .first();

  const current = Number(row?.count ?? 0);
  const retryAfter = Math.max(0, windowStart + windowSec - nowEpoch);
  return {
    allowed: current <= maxCount,
    retryAfter,
  };
};

const ensureCommentSeqTable = async (env: Env) => {
  if (commentSeqTableReady) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS store_comment_seq (
      store_id TEXT PRIMARY KEY,
      next_seq INTEGER NOT NULL,
      updated_at TEXT NOT NULL
    )`,
  ).run();
  commentSeqTableReady = true;
};

export const allocateStoreCommentSeq = async (env: Env, storeId: string) => {
  await ensureCommentSeqTable(env);
  const nowIso = new Date().toISOString();
  const row = await env.DB.prepare(
    `INSERT INTO store_comment_seq (store_id, next_seq, updated_at)
     VALUES (?, 1, ?)
     ON CONFLICT(store_id)
     DO UPDATE SET next_seq = store_comment_seq.next_seq + 1, updated_at = excluded.updated_at
     RETURNING next_seq`,
  )
    .bind(storeId, nowIso)
    .first();
  return Number(row?.next_seq ?? 1);
};
