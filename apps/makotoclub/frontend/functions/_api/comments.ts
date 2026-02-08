import {
  COMMENT_PAGE_DEFAULT,
  COMMENT_PAGE_LIMIT_DEFAULT,
  COMMENT_PAGE_LIMIT_MAX,
} from "../_shared/constants";
import { allocateStoreCommentSeq } from "../_shared/db-helpers";
import { mapStoreComment } from "../_shared/mappers";
import { parseJsonObject, parsePositiveIntParam } from "../_shared/parsers";
import { buildVoterHash } from "../_shared/security";
import type {
  Env,
  StoreCommentDetailRow,
  StoreCommentParentRow,
  StoreCommentRow,
  StoreCommentWithCountRow,
} from "../_shared/types";

const handleStoreCommentsApi = async (
  request: Request,
  url: URL,
  env: Env,
  storeId: string,
): Promise<Response | null> => {
  if (request.method === "GET") {
    const page = parsePositiveIntParam(url.searchParams.get("page"), {
      fallback: COMMENT_PAGE_DEFAULT,
      min: 1,
      max: 100000,
    });
    const limit = parsePositiveIntParam(url.searchParams.get("limit"), {
      fallback: COMMENT_PAGE_LIMIT_DEFAULT,
      min: 1,
      max: COMMENT_PAGE_LIMIT_MAX,
    });
    const offset = (page - 1) * limit;
    const totalRes = await env.DB.prepare(
      `SELECT COUNT(*) AS c
       FROM store_comments
       WHERE store_id = ? AND deleted_at IS NULL`,
    )
      .bind(storeId)
      .first();
    const rows = await env.DB.prepare(
      `SELECT *
       FROM store_comments
       WHERE store_id = ? AND deleted_at IS NULL
       ORDER BY seq ASC
       LIMIT ? OFFSET ?`,
    )
      .bind(storeId, limit, offset)
      .all();
    return Response.json({
      items: (rows.results ?? []).map(mapStoreComment),
      total: Number(totalRes?.c ?? 0),
      page,
      limit,
    });
  }

  if (request.method !== "POST") {
    return null;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("無効なJSONです。", { status: 400 });
  }

  const payloadObject = parseJsonObject(payload);
  const body = typeof payloadObject?.body === "string" ? payloadObject.body.trim() : "";
  const authorName =
    typeof payloadObject?.authorName === "string" ? payloadObject.authorName.trim() : "";
  const parentId = typeof payloadObject?.parentId === "string" ? payloadObject.parentId.trim() : "";

  if (!body) {
    return new Response("コメント本文が必要です。", { status: 400 });
  }
  if (body.length > 1000) {
    return new Response("コメントは1000文字以内で入力してください。", { status: 400 });
  }
  if (authorName.length > 40) {
    return new Response("ハンドルネームは40文字以内で入力してください。", { status: 400 });
  }

  const storeRow = await env.DB.prepare("SELECT id FROM stores WHERE id = ? AND deleted_at IS NULL")
    .bind(storeId)
    .first();
  if (!storeRow) {
    return new Response("店舗が見つかりません。", { status: 404 });
  }

  if (parentId) {
    const parentRow = await env.DB.prepare(
      "SELECT id FROM store_comments WHERE id = ? AND store_id = ? AND deleted_at IS NULL",
    )
      .bind(parentId, storeId)
      .first();
    if (!parentRow) {
      return new Response("返信先のコメントが見つかりません。", { status: 400 });
    }
  }

  const voterHash = await buildVoterHash(request);
  if (!voterHash) {
    return new Response("クライアント情報が取得できません。", { status: 400 });
  }

  const id = crypto.randomUUID();
  const nextSeq = await allocateStoreCommentSeq(env, storeId);
  const nowIso = new Date().toISOString();
  await env.DB.prepare(
    `INSERT INTO store_comments (id, store_id, seq, parent_id, author_name, body, voter_hash, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      id,
      storeId,
      nextSeq,
      parentId || null,
      authorName || null,
      body,
      voterHash,
      nowIso,
    )
    .run();

  return Response.json(
    mapStoreComment({
      id,
      store_id: storeId,
      seq: nextSeq,
      parent_id: parentId || null,
      author_name: authorName || null,
      body,
      good_count: 0,
      bad_count: 0,
      created_at: nowIso,
      deleted_at: null,
    } as StoreCommentRow),
  );
};

const handleCommentVoteApi = async (
  request: Request,
  env: Env,
  commentId: string,
): Promise<Response | null> => {
  if (request.method !== "POST") {
    return null;
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("無効なJSONです。", { status: 400 });
  }

  const payloadObject = parseJsonObject(payload);
  const voteType =
    payloadObject?.voteType === "good" || payloadObject?.voteType === "bad"
      ? payloadObject.voteType
      : "";
  if (!voteType) {
    return new Response("投票種別が不正です。", { status: 400 });
  }

  const commentRow = await env.DB.prepare(
    "SELECT id FROM store_comments WHERE id = ? AND deleted_at IS NULL",
  )
    .bind(commentId)
    .first();
  if (!commentRow) {
    return new Response("コメントが見つかりません。", { status: 404 });
  }

  const voterHash = await buildVoterHash(request);
  if (!voterHash) {
    return new Response("クライアント情報が取得できません。", { status: 400 });
  }

  const nowIso = new Date().toISOString();
  const insertRes = await env.DB.prepare(
    `INSERT INTO store_comment_votes (comment_id, voter_hash, vote_type, created_at)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(comment_id, voter_hash) DO NOTHING`,
  )
    .bind(commentId, voterHash, voteType, nowIso)
    .run();

  const didInsert = (insertRes.meta?.changes ?? 0) > 0;
  if (didInsert) {
    const column = voteType === "good" ? "good_count" : "bad_count";
    await env.DB.prepare(
      `UPDATE store_comments
       SET ${column} = COALESCE(${column}, 0) + 1
       WHERE id = ?`,
    )
      .bind(commentId)
      .run();
  }

  const countRow = await env.DB.prepare(
    "SELECT good_count, bad_count FROM store_comments WHERE id = ?",
  )
    .bind(commentId)
    .first();

  return Response.json({
    goodCount: countRow?.good_count ?? 0,
    badCount: countRow?.bad_count ?? 0,
    already: !didInsert,
  });
};

export const handleCommentRoutes = async (
  request: Request,
  url: URL,
  pathname: string,
  env: Env,
): Promise<Response | null> => {
  const commentMatch = pathname.match(/^\/api\/stores\/([^/]+)\/comments$/);
  if (commentMatch) {
    const commentResponse = await handleStoreCommentsApi(request, url, env, commentMatch[1]);
    if (commentResponse) return commentResponse;
  }

  const commentDetailMatch = pathname.match(/^\/api\/comments\/([^/]+)$/);
  if (commentDetailMatch && request.method === "GET") {
    if (!env.DB) {
      return new Response("DBが設定されていません。", { status: 500 });
    }
    const id = commentDetailMatch[1] ?? "";
    if (!id) {
      return new Response("コメントIDが指定されていません。", { status: 400 });
    }
    const row = (await env.DB.prepare(
      `SELECT sc.id, sc.store_id, sc.seq, sc.parent_id, sc.author_name, sc.body, sc.good_count, sc.bad_count,
              sc.created_at, sc.deleted_at,
              s.name AS store_name, s.branch_name AS store_branch, s.prefecture AS store_prefecture, s.area AS store_area
         FROM store_comments sc
         JOIN stores s ON sc.store_id = s.id
        WHERE sc.id = ? AND sc.deleted_at IS NULL AND s.deleted_at IS NULL`,
    )
      .bind(id)
      .first()) as StoreCommentDetailRow | null;
    if (!row) {
      return new Response("コメントが見つかりませんでした。", { status: 404 });
    }

    let parent: StoreCommentParentRow | null = null;
    if (row.parent_id) {
      parent = (await env.DB.prepare(
        `SELECT id, store_id, seq, parent_id, author_name, body, good_count, bad_count, created_at, deleted_at
           FROM store_comments
          WHERE id = ? AND deleted_at IS NULL`,
      )
        .bind(row.parent_id)
        .first()) as StoreCommentParentRow | null;
    }

    const repliesRes = await env.DB.prepare(
      `SELECT sc.id, sc.store_id, sc.seq, sc.parent_id, sc.author_name, sc.body, sc.good_count, sc.bad_count, sc.created_at, sc.deleted_at,
              (SELECT COUNT(*) FROM store_comments sc2 WHERE sc2.parent_id = sc.id AND sc2.deleted_at IS NULL) AS reply_count
         FROM store_comments sc
        WHERE sc.parent_id = ? AND sc.deleted_at IS NULL
        ORDER BY sc.created_at ASC`,
    )
      .bind(row.id)
      .all();

    const replyCounts: Record<string, number> = {};
    const repliesWithCounts = (repliesRes.results ?? []) as StoreCommentWithCountRow[];
    for (const reply of repliesWithCounts) {
      if (reply.reply_count) {
        replyCounts[reply.id] = reply.reply_count;
      }
    }

    return Response.json({
      comment: mapStoreComment(row),
      parent: parent ? mapStoreComment(parent) : null,
      replies: repliesWithCounts.map(mapStoreComment),
      replyCounts,
      store: {
        id: row.store_id,
        storeName: row.store_name,
        storeBranch: row.store_branch ?? null,
        storePrefecture: row.store_prefecture,
        storeArea: row.store_area ?? null,
      },
    });
  }

  const commentVoteMatch = pathname.match(/^\/api\/comments\/([^/]+)\/vote$/);
  if (commentVoteMatch) {
    const voteResponse = await handleCommentVoteApi(request, env, commentVoteMatch[1]);
    if (voteResponse) return voteResponse;
  }

  return null;
};
