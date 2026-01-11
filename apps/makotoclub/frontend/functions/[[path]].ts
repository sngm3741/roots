// @ts-ignore build types are emitted JS only
import { createPagesFunctionHandler } from "@react-router/cloudflare";
import type { ServerBuild } from "react-router";
// @ts-ignore generated at build time
import * as buildModule from "../build/server/index.js";
import { createElement } from "react";
import satori from "satori";
import { Resvg, initWasm } from "@resvg/resvg-wasm";
// @ts-ignore resvgのwasmは型が無いので明示的に無視する
import resvgWasm from "@resvg/resvg-wasm/index_bg.wasm";

// Minimal types for typecheck
type D1Database = any;
type R2Bucket = any;

type Env = {
  DB: D1Database;
  makotoclub_assets?: R2Bucket;
  ASSETS?: { fetch: (input: Request | string | URL) => Promise<Response> };
};

type StoreRow = {
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

type SurveyRow = {
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

type StoreCommentRow = {
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

type StoreCommentDetailRow = StoreCommentRow & {
  store_name: string;
  store_branch?: string | null;
  store_prefecture: string;
  store_area?: string | null;
};

type StoreCommentParentRow = StoreCommentRow;
type StoreCommentWithCountRow = StoreCommentRow & {
  reply_count?: number | null;
};

type StoreStats = {
  averageRating?: number | null;
  averageEarning?: number | null;
  waitTimeHours?: number | null;
  surveyCount?: number | null;
  helpfulCount?: number | null;
  averageEarningLabel?: string | null;
  waitTimeLabel?: string | null;
};

let resvgReady: Promise<void> | null = null;
const ensureResvg = () => {
  if (!resvgReady) {
    resvgReady = initWasm(resvgWasm);
  }
  return resvgReady;
};

let ogpFontDataPromise: Promise<ArrayBuffer> | null = null;
const loadOgFontData = (env: Env, origin: string) => {
  if (!ogpFontDataPromise) {
    const fontUrl = new URL("/fonts/NotoSansJP-Regular.ttf", origin);
    ogpFontDataPromise = (async () => {
      const res = env.ASSETS ? await env.ASSETS.fetch(fontUrl) : await fetch(fontUrl);
      if (!res.ok) {
        throw new Error("OGPフォントの取得に失敗しました。");
      }
      const contentType = res.headers.get("content-type") ?? "";
      if (contentType.includes("text/html")) {
        throw new Error("OGPフォントの取得に失敗しました。");
      }
      return res.arrayBuffer();
    })().catch((error) => {
      ogpFontDataPromise = null;
      throw error;
    });
  }
  return ogpFontDataPromise;
};

const truncateText = (text: string, limit: number) => {
  if (text.length <= limit) return text;
  return text.slice(0, limit);
};

const buildStarFillPercent = (rating: number) => {
  const safe = Math.max(0, Math.min(5, rating));
  return `${(safe / 5) * 100}%`;
};

const buildOgpComment = (
  survey: {
    customer_comment?: string | null;
    staff_comment?: string | null;
    work_environment_comment?: string | null;
    etc_comment?: string | null;
  },
  limit: number,
  maxLines: number,
) => {
  const parts = [
    { label: "客層", text: survey.customer_comment },
    { label: "スタッフ対応", text: survey.staff_comment },
    { label: "環境", text: survey.work_environment_comment },
    { label: "その他", text: survey.etc_comment },
  ]
    .map((item) => {
      const body = (item.text ?? "").trim();
      if (!body) return "";
      return `【${item.label}】\n${body}`;
    })
    .filter((text) => text.length > 0);

  const combined = parts.join("\n\n");
  const trimmed = truncateText(combined || "コメントなし", limit);
  const lines = trimmed.split("\n");
  if (lines.length <= maxLines) return trimmed;
  const sliced = lines.slice(0, maxLines);
  const last = sliced[sliced.length - 1] ?? "";
  sliced[sliced.length - 1] = last.endsWith("...") ? last : `${last}...`;
  return sliced.join("\n");
};

const buildOgpMessage = (body: string, limit: number, maxLines: number) => {
  const base = (body ?? "").trim() || "コメントなし";
  const trimmed = truncateText(base, limit);
  const lines = trimmed.split("\n");
  if (lines.length <= maxLines) return trimmed;
  const sliced = lines.slice(0, maxLines);
  const last = sliced[sliced.length - 1] ?? "";
  sliced[sliced.length - 1] = last.endsWith("...") ? last : `${last}...`;
  return sliced.join("\n");
};

const mapStore = (row: StoreRow, stats?: StoreStats) => {
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
    businessHours: row.business_hours_open
      ? { open: row.business_hours_open, close: row.business_hours_close ?? "" }
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

const mapSurvey = (row: SurveyRow) => {
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

const mapStoreComment = (row: StoreCommentRow) => ({
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

const computeSurveyStats = (surveys: ReturnType<typeof mapSurvey>[]) => {
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

const parseNumberParam = (value: string | null) => {
  if (value === null) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : null;
};

const hashText = async (value: string) => {
  const data = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const buildVoterHash = async (request: Request) => {
  const ip =
    request.headers.get("CF-Connecting-IP") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "";
  const ua = request.headers.get("user-agent") ?? "";
  const raw = `${ip}|${ua}`.trim();
  if (!raw) return null;
  return await hashText(raw);
};

const isBotUserAgent = (userAgent: string | null) => {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return /bot|crawler|spider|headless|preview|fetch|scrape|monitor|httpclient|wget|curl|postman|axios|python|go-http-client|okhttp|java/.test(
    ua,
  );
};

const extractClientIp = (request: Request) => {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;
  return forwarded.split(",")[0]?.trim() ?? null;
};

const writeAccessLog = async (request: Request, env: Env, status: number) => {
  if (!env.DB) return;
  const now = new Date().toISOString();
  const ip = extractClientIp(request);
  const userAgent = request.headers.get("user-agent");
  const path = new URL(request.url).pathname;
  const method = request.method;
  try {
    await env.DB.prepare(
      `INSERT INTO access_logs (id, ip, user_agent, path, method, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        ip,
        userAgent ?? null,
        path,
        method,
        status,
        now,
      )
      .run();
  } catch (error) {
    console.error("アクセスログの保存に失敗しました", error);
  }
};

async function handleApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;
  const bucket = env.makotoclub_assets;
  const respondWithLog = async (response: Response) => {
    await writeAccessLog(request, env, response.status || 200);
    return response;
  };

  // Allow Chrome devtools request to fail fast with 204 to avoid router error
  if (pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
    return new Response(null, { status: 204 });
  }

  // GET /api/og/surveys/:id -> OGP画像生成
  if (pathname.startsWith("/api/og/surveys/") && request.method === "GET") {
    try {
      if (!env.DB) {
        return new Response("DBが設定されていません。", { status: 500 });
      }
      if (!bucket) {
        return new Response("R2が設定されていません。", { status: 500 });
      }
      const id = pathname.replace("/api/og/surveys/", "").trim();
      if (!id) {
        return new Response("アンケートIDが指定されていません。", { status: 400 });
      }

      const cacheKey = `ogp/surveys/${id}.png`;
      const cached = await bucket.get(cacheKey);
      if (cached) {
        const headers = new Headers();
        headers.set("Content-Type", cached.httpMetadata?.contentType ?? "image/png");
        headers.set("Cache-Control", "public, max-age=86400");
        return new Response(cached.body ?? cached, { headers });
      }

      const row = await env.DB.prepare(
        `SELECT store_name, store_branch, rating, customer_comment, staff_comment, work_environment_comment, etc_comment
         FROM surveys WHERE id = ? AND deleted_at IS NULL`,
      )
        .bind(id)
        .first();

      if (!row) {
        return new Response("アンケートが見つかりませんでした。", { status: 404 });
      }

      const storeName = row.store_name as string;
      const storeBranch = row.store_branch as string | null;
      const rating = Number(row.rating ?? 0);
      const starFill = buildStarFillPercent(rating);
      const commentText = buildOgpComment(row, 200, 9);
      const fontData = await loadOgFontData(env, new URL(request.url).origin);
      await ensureResvg();

      const svg = await satori(
        createElement(
          "div",
          {
            style: {
              width: "1200px",
              height: "630px",
              display: "flex",
              background: "#fdf2f8",
              padding: "32px",
              fontFamily: "Noto Sans JP",
            },
          },
          createElement(
            "div",
            {
              style: {
                width: "100%",
                height: "100%",
                background: "#ffffff",
                borderRadius: "28px",
                border: "2px solid #f9a8d4",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
              },
            },
            createElement(
              "div",
              {
                style: {
                  fontSize: "24px",
                  color: "#db2777",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                },
              },
              "#匿名店舗アンケート",
            ),
            createElement(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                },
              },
              createElement(
                "div",
                {
                  style: {
                    position: "relative",
                    display: "flex",
                    width: "340px",
                    height: "64px",
                  },
                },
                createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      fontSize: "56px",
                      color: "#fbcfe8",
                      letterSpacing: "0.08em",
                      lineHeight: 1,
                    },
                  },
                  "★★★★★",
                ),
                createElement(
                  "div",
                  {
                    style: {
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: starFill,
                      overflow: "hidden",
                      fontSize: "56px",
                      color: "#db2777",
                      letterSpacing: "0.08em",
                      lineHeight: 1,
                    },
                  },
                  "★★★★★",
                ),
              ),
              createElement(
                "div",
                {
                  style: {
                    fontSize: "52px",
                    fontWeight: 700,
                    color: "#db2777",
                  },
                },
                rating.toFixed(1),
              ),
            ),
            createElement(
              "div",
              {
                style: {
                  fontSize: "22px",
                  color: "#334155",
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.5,
                },
              },
              commentText,
            ),
          ),
        ),
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: "Noto Sans JP",
              data: fontData,
              weight: 400,
              style: "normal",
            },
          ],
        },
      );

      const resvg = new Resvg(svg);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      const arrayBuffer = new ArrayBuffer(pngBuffer.length);
      new Uint8Array(arrayBuffer).set(pngBuffer);
      const pngBlob = new Blob([arrayBuffer], { type: "image/png" });

      await bucket.put(cacheKey, pngBlob, {
        httpMetadata: { contentType: "image/png" },
      });

      return new Response(pngBlob, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (error) {
      console.error("OGP画像の生成に失敗しました", error);
      const message =
        error instanceof Error ? error.message : "原因不明のエラーが発生しました。";
      const debug = new URL(request.url).searchParams.get("debug");
      if (debug === "1") {
        return new Response(`OGP画像の生成に失敗しました。詳細: ${message}`, {
          status: 500,
        });
      }
      return new Response("OGP画像の生成に失敗しました。", { status: 500 });
    }
  }

  // GET /api/og/comments/:id -> OGP画像生成
  if (pathname.startsWith("/api/og/comments/") && request.method === "GET") {
    try {
      if (!env.DB) {
        return new Response("DBが設定されていません。", { status: 500 });
      }
      if (!bucket) {
        return new Response("R2が設定されていません。", { status: 500 });
      }
      const id = pathname.replace("/api/og/comments/", "").trim();
      if (!id) {
        return new Response("コメントIDが指定されていません。", { status: 400 });
      }

      const cacheKey = `ogp/comments/${id}.png`;
      const cached = await bucket.get(cacheKey);
      if (cached) {
        const headers = new Headers();
        headers.set("Content-Type", cached.httpMetadata?.contentType ?? "image/png");
        headers.set("Cache-Control", "public, max-age=86400");
        return new Response(cached.body ?? cached, { headers });
      }

      const row = await env.DB.prepare(
        `SELECT sc.body, s.name AS store_name, s.branch_name AS store_branch
           FROM store_comments sc
           JOIN stores s ON sc.store_id = s.id
          WHERE sc.id = ? AND sc.deleted_at IS NULL AND s.deleted_at IS NULL`,
      )
        .bind(id)
        .first();

      if (!row) {
        return new Response("コメントが見つかりませんでした。", { status: 404 });
      }

      const storeName = row.store_name as string;
      const storeBranch = row.store_branch as string | null;
      const commentText = buildOgpMessage(String(row.body ?? ""), 220, 8);
      const fontData = await loadOgFontData(env, new URL(request.url).origin);
      await ensureResvg();

      const svg = await satori(
        createElement(
          "div",
          {
            style: {
              width: "1200px",
              height: "630px",
              display: "flex",
              background: "#fdf2f8",
              padding: "32px",
              fontFamily: "Noto Sans JP",
            },
          },
          createElement(
            "div",
            {
              style: {
                width: "100%",
                height: "100%",
                background: "#ffffff",
                borderRadius: "28px",
                border: "2px solid #f9a8d4",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              },
            },
            createElement(
              "div",
              {
                style: {
                  fontSize: "24px",
                  color: "#db2777",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                },
              },
              "#みんなのコメント",
            ),
            createElement(
              "div",
              {
                style: {
                  fontSize: "22px",
                  color: "#475569",
                },
              },
              `${storeName}${storeBranch ? ` ${storeBranch}` : ""}`,
            ),
            createElement(
              "div",
              {
                style: {
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  color: "#334155",
                  fontSize: "30px",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                },
              },
              commentText,
            ),
          ),
        ),
        {
          width: 1200,
          height: 630,
          fonts: [
            {
              name: "Noto Sans JP",
              data: fontData,
              weight: 400,
              style: "normal",
            },
          ],
        },
      );

      const resvg = new Resvg(svg);
      const pngData = resvg.render();
      const pngBuffer = pngData.asPng();
      const arrayBuffer = new ArrayBuffer(pngBuffer.length);
      new Uint8Array(arrayBuffer).set(pngBuffer);
      const pngBlob = new Blob([arrayBuffer], { type: "image/png" });

      await bucket.put(cacheKey, pngBlob, {
        httpMetadata: { contentType: "image/png" },
      });

      return new Response(pngBlob, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=86400",
        },
      });
    } catch (error) {
      console.error("OGP画像の生成に失敗しました", error);
      const message =
        error instanceof Error ? error.message : "原因不明のエラーが発生しました。";
      const debug = new URL(request.url).searchParams.get("debug");
      if (debug === "1") {
        return new Response(`OGP画像の生成に失敗しました。詳細: ${message}`, {
          status: 500,
        });
      }
      return new Response("OGP画像の生成に失敗しました。", { status: 500 });
    }
  }

  // POST /api/uploads (multipart, single file)
  if (pathname === "/api/uploads" && request.method === "POST") {
    if (!bucket) {
      return await respondWithLog(new Response("R2 bucket not configured", { status: 500 }));
    }
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) {
      return await respondWithLog(new Response("file is required", { status: 400 }));
    }
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return await respondWithLog(new Response("file too large", { status: 413 }));
    }
    if (!file.type?.startsWith("image/")) {
      return await respondWithLog(new Response("only image/* allowed", { status: 400 }));
    }

    const cleanName = file.name.replace(/[^\w.\-]/g, "_").slice(-80);
    const key = `${Date.now()}-${crypto.randomUUID()}-${cleanName}`;
    await bucket.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    return await respondWithLog(
      Response.json({
        key,
        url: `${url.origin}/api/uploads/${key}`,
        contentType: file.type,
        size: file.size,
      }),
    );
  }

  // GET /api/uploads/:key -> stream from R2
  if (pathname.startsWith("/api/uploads/") && request.method === "GET") {
    if (!bucket) return new Response("R2 bucket not configured", { status: 500 });
    const key = pathname.replace("/api/uploads/", "");
    const obj = await bucket.get(key);
    if (!obj) return new Response("Not Found", { status: 404 });
    const body = obj.body ?? obj;
    const headers = new Headers();
    const ctype = obj.httpMetadata?.contentType ?? "application/octet-stream";
    headers.set("Content-Type", ctype);
    return new Response(body, { headers });
  }

  // GET /api/metrics/pv（累計PVの取得）
  if (pathname === "/api/metrics/pv" && request.method === "GET") {
    const pathParam = url.searchParams.get("path");
    const path = pathParam && pathParam.startsWith("/") ? pathParam : "/";
    const now = new Date();
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    const row = await env.DB.prepare("SELECT count FROM page_view_counts WHERE path = ?")
      .bind(path)
      .first();
    const dailyRow = await env.DB.prepare(
      "SELECT count FROM page_view_counts_daily WHERE path = ? AND date = ?",
    )
      .bind(path, today)
      .first();

    return Response.json({
      path,
      count: row?.count ?? 0,
      todayCount: dailyRow?.count ?? 0,
      date: today,
    });
  }

  // POST /api/surveys/:id/helpful（役に立ったを加算）
  const helpfulMatch = pathname.match(/^\/api\/surveys\/([^/]+)\/helpful$/);
  if (helpfulMatch && request.method === "POST") {
    const surveyId = helpfulMatch[1];
    const surveyRow = await env.DB.prepare("SELECT id FROM surveys WHERE id = ?")
      .bind(surveyId)
      .first();
    if (!surveyRow) {
      return new Response("アンケートが見つかりません。", { status: 404 });
    }

    const voterHash = await buildVoterHash(request);
    if (!voterHash) {
      return new Response("クライアント情報が取得できません。", { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const insertRes = await env.DB.prepare(
      `INSERT INTO survey_helpful_votes (survey_id, voter_hash, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(survey_id, voter_hash) DO NOTHING`,
    )
      .bind(surveyId, voterHash, nowIso)
      .run();

    const didInsert = (insertRes.meta?.changes ?? 0) > 0;
    if (didInsert) {
      await env.DB.prepare(
        `UPDATE surveys
         SET helpful_count = COALESCE(helpful_count, 0) + 1, updated_at = ?
         WHERE id = ?`,
      )
        .bind(nowIso, surveyId)
        .run();
      await env.DB.prepare(
        `UPDATE store_stats
         SET helpful_count = COALESCE(helpful_count, 0) + 1, updated_at = ?
         WHERE store_id = (SELECT store_id FROM surveys WHERE id = ?)`,
      )
        .bind(nowIso, surveyId)
        .run();
    }

    const countRow = await env.DB.prepare("SELECT helpful_count FROM surveys WHERE id = ?")
      .bind(surveyId)
      .first();

    return Response.json({
      count: countRow?.helpful_count ?? 0,
      already: !didInsert,
    });
  }

  // GET/POST /api/stores/:id/comments（SNSコメント）
  const commentMatch = pathname.match(/^\/api\/stores\/([^/]+)\/comments$/);
  if (commentMatch) {
    const storeId = commentMatch[1];
    if (request.method === "GET") {
      const rows = await env.DB.prepare(
        `SELECT *
         FROM store_comments
         WHERE store_id = ? AND deleted_at IS NULL
         ORDER BY seq ASC`,
      )
        .bind(storeId)
        .all();
      return Response.json((rows.results ?? []).map(mapStoreComment));
    }

    if (request.method === "POST") {
      let payload: any;
      try {
        payload = await request.json();
      } catch {
        return new Response("無効なJSONです。", { status: 400 });
      }

      const body = typeof payload?.body === "string" ? payload.body.trim() : "";
      const authorName =
        typeof payload?.authorName === "string" ? payload.authorName.trim() : "";
      const parentId = typeof payload?.parentId === "string" ? payload.parentId.trim() : "";

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
      const seqRow = await env.DB.prepare(
        "SELECT COALESCE(MAX(seq), 0) AS max_seq FROM store_comments WHERE store_id = ?",
      )
        .bind(storeId)
        .first();
      const maxSeq = typeof seqRow?.max_seq === "number" ? seqRow.max_seq : 0;
      const nextSeq = maxSeq + 1;
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
    }
  }

  // GET /api/comments/:id（コメント詳細）
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

  // POST /api/comments/:id/vote（コメントのグッド/バッド）
  const commentVoteMatch = pathname.match(/^\/api\/comments\/([^/]+)\/vote$/);
  if (commentVoteMatch && request.method === "POST") {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return new Response("無効なJSONです。", { status: 400 });
    }

    const commentId = commentVoteMatch[1];
    const voteType = payload?.voteType === "good" || payload?.voteType === "bad" ? payload.voteType : "";
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
  }

  // POST /api/metrics/pv（累計PVの記録）
  if (pathname === "/api/metrics/pv" && request.method === "POST") {
    const userAgent = request.headers.get("user-agent");
    if (isBotUserAgent(userAgent)) {
      return Response.json({ ignored: true });
    }
    let body: { path?: string } | null = null;
    try {
      body = (await request.json()) as { path?: string };
    } catch {
      body = null;
    }
    const path = body?.path && body.path.startsWith("/") ? body.path : "/";
    const now = new Date();
    const nowIso = now.toISOString();
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Tokyo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(now);

    await env.DB.prepare(
      `INSERT INTO page_view_counts (path, count, updated_at)
       VALUES (?, 1, ?)
       ON CONFLICT(path) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`,
    )
      .bind(path, nowIso)
      .run();

    await env.DB.prepare(
      `INSERT INTO page_view_counts_daily (path, date, count, updated_at)
       VALUES (?, ?, 1, ?)
       ON CONFLICT(path, date) DO UPDATE SET count = count + 1, updated_at = excluded.updated_at`,
    )
      .bind(path, today, nowIso)
      .run();

    const row = await env.DB.prepare("SELECT count FROM page_view_counts WHERE path = ?")
      .bind(path)
      .first();
    const dailyRow = await env.DB.prepare(
      "SELECT count FROM page_view_counts_daily WHERE path = ? AND date = ?",
    )
      .bind(path, today)
      .first();

    return Response.json({
      path,
      count: row?.count ?? 0,
      todayCount: dailyRow?.count ?? 0,
      date: today,
    });
  }

  // GET /api/surveys
  if (pathname === "/api/surveys" && request.method === "GET") {
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");
    const sort = url.searchParams.get("sort") || "newest";
    const offset = Math.max(0, (page - 1) * limit);
    let orderBy = "COALESCE(visited_period, '') DESC, created_at DESC";
    if (sort === "oldest") orderBy = "COALESCE(visited_period, '') ASC, created_at DESC";
    if (sort === "earning") orderBy = "COALESCE(average_earning, 0) DESC, created_at DESC";
    if (sort === "rating") orderBy = "COALESCE(rating, 0) DESC, created_at DESC";
    const name = url.searchParams.get("name")?.trim();
    const prefecture = url.searchParams.get("prefecture")?.trim();
    const industry = url.searchParams.get("industry")?.trim();
    const genre = url.searchParams.get("genre")?.trim();
    const spec = parseNumberParam(url.searchParams.get("spec"));
    const age = parseNumberParam(url.searchParams.get("age"));

    const where: string[] = ["deleted_at IS NULL"];
    const params: (string | number)[] = [];
    if (name) {
      const like = `%${name}%`;
      where.push(
        "(store_name LIKE ? OR store_branch LIKE ? OR store_area LIKE ? OR store_industry LIKE ? OR store_genre LIKE ?)",
      );
      params.push(like, like, like, like, like);
    }
    if (prefecture) {
      where.push("store_prefecture = ?");
      params.push(prefecture);
    }
    if (industry) {
      where.push("store_industry = ?");
      params.push(industry);
    }
    if (genre) {
      where.push("store_genre = ?");
      params.push(genre);
    }
    if (spec !== null) {
      where.push("spec_score BETWEEN ? AND ?");
      params.push(spec - 5, spec + 5);
    }
    if (age !== null) {
      where.push("age BETWEEN ? AND ?");
      params.push(age - 5, age + 5);
    }
    const whereClause = where.join(" AND ");

    const totalRes = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM surveys WHERE ${whereClause}`,
    )
      .bind(...params)
      .first();
    const rows = await env.DB.prepare(
      `SELECT
        s.*,
        (SELECT COUNT(*) FROM store_comments sc WHERE sc.store_id = s.store_id AND sc.deleted_at IS NULL) AS comment_count
       FROM surveys s
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all();

    return Response.json({
      items: (rows.results ?? []).map(mapSurvey),
      page,
      limit,
      total: totalRes?.c ?? 0,
    });
  }

  // GET /api/surveys/:id
  if (pathname.startsWith("/api/surveys/") && request.method === "GET") {
    const id = pathname.replace("/api/surveys/", "");
    const row = await env.DB.prepare(
      `SELECT
        s.*,
        (SELECT COUNT(*) FROM store_comments sc WHERE sc.store_id = s.store_id AND sc.deleted_at IS NULL) AS comment_count
       FROM surveys s
       WHERE s.id = ? AND s.deleted_at IS NULL`,
    )
      .bind(id)
      .first();
    if (!row) return new Response("Not Found", { status: 404 });
    return Response.json(mapSurvey(row));
  }

  // POST /api/surveys
  if (pathname === "/api/surveys" && request.method === "POST") {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return await respondWithLog(new Response("Invalid JSON", { status: 400 }));
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const {
      storeName,
      branchName,
      prefecture,
      industry,
      industryOther,
      visitedPeriod,
      workType,
      workTypeOther,
      age,
      specScore,
      waitTimeHours,
      averageEarning,
      castBack,
      customerComment,
      staffComment,
      workEnvironmentComment,
      etcComment,
      emailAddress,
      rating,
      storeId,
      area,
      genre,
      imageUrls,
    } = payload || {};

    if (!storeName || !prefecture || !industry || !visitedPeriod || !workType) {
      return await respondWithLog(new Response("Missing required fields", { status: 400 }));
    }
    await env.DB.prepare(
      `INSERT INTO survey_drafts
      (id, store_id, store_name, store_branch, store_prefecture, store_area, store_industry, industry_other, store_genre,
       visited_period, work_type, work_type_other, age, spec_score, wait_time_hours, average_earning, rating,
       customer_comment, staff_comment, work_environment_comment, etc_comment, cast_back, email_address,
       image_urls, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        storeId || null,
        storeName,
        branchName ?? null,
        prefecture,
        area ?? null,
        industry,
        industryOther ?? null,
        genre ?? null,
        visitedPeriod,
        workType,
        workTypeOther ?? null,
        Number(age) || 0,
        Number(specScore) || 0,
        Number(waitTimeHours) || 0,
        Number(averageEarning) || 0,
        Number(rating) || 0,
        customerComment ?? null,
        staffComment ?? null,
        workEnvironmentComment ?? null,
        etcComment ?? null,
        castBack ?? null,
        emailAddress ?? null,
        Array.isArray(imageUrls) ? JSON.stringify(imageUrls) : null,
        now,
        now,
      )
      .run();

    return await respondWithLog(
      new Response(null, { status: 201, headers: { Location: `/api/surveys/${id}` } }),
    );
  }

  // GET /api/stores
  if (pathname === "/api/stores" && request.method === "GET") {
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");
    const offset = Math.max(0, (page - 1) * limit);
    const name = url.searchParams.get("name")?.trim();
    const prefecture = url.searchParams.get("prefecture")?.trim();
    const area = url.searchParams.get("area")?.trim();
    const industry = url.searchParams.get("industry")?.trim();
    const genre = url.searchParams.get("genre")?.trim();
    const sort = url.searchParams.get("sort") || "";
    const spec = parseNumberParam(url.searchParams.get("spec"));
    const age = parseNumberParam(url.searchParams.get("age"));

    let orderBy = "s.created_at DESC";
    if (sort === "oldest") orderBy = "s.created_at ASC";
    if (sort === "earning") orderBy = "ss.avg_earning DESC";
    if (sort === "rating") orderBy = "ss.avg_rating DESC";

    const where: string[] = ["s.deleted_at IS NULL", "ss.survey_count > 0"];
    const params: (string | number)[] = [];

    if (name) {
      const like = `%${name}%`;
      where.push(
        "(s.name LIKE ? OR s.branch_name LIKE ? OR s.area LIKE ? OR s.industry LIKE ? OR s.genre LIKE ?)",
      );
      params.push(like, like, like, like, like);
    }
    if (prefecture) {
      where.push("s.prefecture = ?");
      params.push(prefecture);
    }
    if (area) {
      where.push("s.area = ?");
      params.push(area);
    }
    if (industry) {
      where.push("s.industry = ?");
      params.push(industry);
    }
    if (genre) {
      where.push("s.genre = ?");
      params.push(genre);
    }
    if (spec !== null) {
      where.push("? BETWEEN ss.min_spec - 5 AND ss.max_spec + 5");
      params.push(spec);
    }
    if (age !== null) {
      where.push("? BETWEEN ss.min_age - 5 AND ss.max_age + 5");
      params.push(age);
    }

    const whereClause = where.join(" AND ");

    const totalRes = await env.DB.prepare(
      `SELECT COUNT(*) as c
       FROM stores s
       JOIN store_stats ss ON ss.store_id = s.id
       WHERE ${whereClause}`,
    )
      .bind(...params)
      .first();
    const rows = await env.DB.prepare(
      `SELECT
        s.*,
        ss.survey_count,
        ss.helpful_count,
        ss.avg_earning,
        ss.avg_rating,
        ss.avg_wait,
        ss.min_spec,
        ss.max_spec,
        ss.median_spec,
        ss.min_age,
        ss.max_age,
        ss.median_age
       FROM stores s
       JOIN store_stats ss ON ss.store_id = s.id
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
    )
      .bind(...params, limit, offset)
      .all();

    return Response.json({
      items: (rows.results ?? []).map(mapStore),
      page,
      limit,
      total: totalRes?.c ?? 0,
    });
  }

  // GET /api/stores/:id
  if (pathname.startsWith("/api/stores/") && request.method === "GET") {
    const id = pathname.replace("/api/stores/", "");
    const store = await env.DB.prepare(
      "SELECT * FROM stores WHERE id = ? AND deleted_at IS NULL",
    )
      .bind(id)
      .first();
    if (!store) return new Response("Not Found", { status: 404 });

    const surveys = await env.DB.prepare(
      `SELECT
        s.*,
        (SELECT COUNT(*) FROM store_comments sc WHERE sc.store_id = s.store_id AND sc.deleted_at IS NULL) AS comment_count
       FROM surveys s
       WHERE s.store_id = ? AND s.deleted_at IS NULL
       ORDER BY s.created_at DESC
       LIMIT 10`,
    )
      .bind(id)
      .all();
    const mappedSurveys = (surveys.results ?? []).map(mapSurvey);
    const stats = computeSurveyStats(mappedSurveys);

    return Response.json({
      ...mapStore(store, {
        averageRating: stats.averageRating,
        averageEarning: stats.averageEarning,
        waitTimeHours: stats.waitTimeHours,
        averageEarningLabel: stats.averageEarningLabel,
        waitTimeLabel: stats.waitTimeLabel,
        surveyCount: stats.count,
        helpfulCount: stats.helpfulCount,
      }),
      surveys: mappedSurveys,
    });
  }

  // GET /api/stores/:id/surveys
  if (pathname.match(/^\/api\/stores\/[^/]+\/surveys$/) && request.method === "GET") {
    const storeId = pathname.split("/")[3];
    const limit = Number(url.searchParams.get("limit") || "50");
    const rows = await env.DB.prepare(
      `SELECT
        s.*,
        (SELECT COUNT(*) FROM store_comments sc WHERE sc.store_id = s.id AND sc.deleted_at IS NULL) AS comment_count
       FROM surveys s
       WHERE s.store_id = ? AND s.deleted_at IS NULL
       ORDER BY s.created_at DESC
       LIMIT ?`,
    )
      .bind(storeId, limit)
      .all();
    return Response.json((rows.results ?? []).map(mapSurvey));
  }

  // ADMIN: POST /api/admin/stores (create)
  if (pathname === "/api/admin/stores" && request.method === "POST") {
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }
    const id = payload.id || crypto.randomUUID();
    const now = new Date().toISOString();

    const {
      name,
      branchName,
      prefecture,
      area,
      industry,
      genre,
      businessHoursOpen,
      businessHoursClose,
    } = payload || {};

    if (!name || !prefecture || !industry) {
      return new Response("Missing required fields", { status: 400 });
    }

    await env.DB.prepare(
      `INSERT OR REPLACE INTO stores
      (id, name, branch_name, prefecture, area, industry, genre, business_hours_open, business_hours_close, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM stores WHERE id = ?), ?), ?)`
    )
      .bind(
        id,
        name,
        branchName ?? null,
        prefecture,
        area ?? null,
        industry,
        genre ?? null,
        businessHoursOpen ?? null,
        businessHoursClose ?? null,
        id,
        now,
        now,
      )
      .run();

    return new Response(null, { status: 201, headers: { Location: `/api/stores/${id}` } });
  }

  // ADMIN: GET /api/admin/stores
  if (pathname === "/api/admin/stores" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT * FROM stores WHERE deleted_at IS NULL ORDER BY created_at DESC",
    ).all();
    return Response.json({ items: (rows.results ?? []).map(mapStore) });
  }

  // ADMIN: PUT /api/admin/stores/:id
  if (pathname.startsWith("/api/admin/stores/") && request.method === "PUT") {
    const id = pathname.replace("/api/admin/stores/", "");
    let payload: any;
    try {
      payload = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const now = new Date().toISOString();
    await env.DB.prepare(
      `UPDATE stores SET
        name = COALESCE(?, name),
        branch_name = COALESCE(?, branch_name),
        prefecture = COALESCE(?, prefecture),
        area = COALESCE(?, area),
        industry = COALESCE(?, industry),
        genre = COALESCE(?, genre),
        business_hours_open = COALESCE(?, business_hours_open),
        business_hours_close = COALESCE(?, business_hours_close),
        updated_at = ?
      WHERE id = ?`
    )
      .bind(
        payload.name ?? null,
        payload.branchName ?? null,
        payload.prefecture ?? null,
        payload.area ?? null,
        payload.industry ?? null,
        payload.genre ?? null,
        payload.businessHoursOpen ?? null,
        payload.businessHoursClose ?? null,
        now,
        id,
      )
      .run();

    return new Response(null, { status: 204 });
  }

  return null;
}

export const onRequest = async (context: any) => {
  const apiResponse = await handleApi(context.request, context.env as Env);
  if (apiResponse) return apiResponse;

  return createPagesFunctionHandler({
    build: buildModule as ServerBuild,
    getLoadContext({ context: ctx }) {
      return {
        cloudflare: ctx.cloudflare,
      };
    },
  })(context);
};
