// @ts-ignore build types are emitted JS only
import { createPagesFunctionHandler } from "@react-router/cloudflare";
import type { ServerBuild } from "react-router";
// @ts-ignore generated at build time
import * as buildModule from "../build/server/index.js";

// Minimal types for typecheck
type D1Database = any;
type R2Bucket = any;

type Env = {
  DB: D1Database;
  makotoclub_assets?: R2Bucket;
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
  created_at: string;
  updated_at: string;
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
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

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

async function handleApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;
  const bucket = env.makotoclub_assets;

  // Allow Chrome devtools request to fail fast with 204 to avoid router error
  if (pathname === "/.well-known/appspecific/com.chrome.devtools.json") {
    return new Response(null, { status: 204 });
  }

  // POST /api/uploads (multipart, single file)
  if (pathname === "/api/uploads" && request.method === "POST") {
    if (!bucket) return new Response("R2 bucket not configured", { status: 500 });
    const form = await request.formData();
    const file = form.get("file");
    if (!file || !(file instanceof File)) return new Response("file is required", { status: 400 });
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) return new Response("file too large", { status: 413 });
    if (!file.type?.startsWith("image/")) return new Response("only image/* allowed", { status: 400 });

    const cleanName = file.name.replace(/[^\w.\-]/g, "_").slice(-80);
    const key = `${Date.now()}-${crypto.randomUUID()}-${cleanName}`;
    await bucket.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type,
      },
    });

    return Response.json({
      key,
      url: `${url.origin}/api/uploads/${key}`,
      contentType: file.type,
      size: file.size,
    });
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
    const whereClause = where.join(" AND ");

    const totalRes = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM surveys WHERE ${whereClause}`,
    )
      .bind(...params)
      .first();
    const rows = await env.DB.prepare(
      `SELECT * FROM surveys WHERE ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
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
      "SELECT * FROM surveys WHERE id = ? AND deleted_at IS NULL",
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
      return new Response("Invalid JSON", { status: 400 });
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const {
      storeName,
      branchName,
      prefecture,
      industry,
      visitedPeriod,
      workType,
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
      return new Response("Missing required fields", { status: 400 });
    }
    await env.DB.prepare(
      `INSERT INTO survey_drafts
      (id, store_id, store_name, store_branch, store_prefecture, store_area, store_industry, store_genre,
       visited_period, work_type, age, spec_score, wait_time_hours, average_earning, rating,
       customer_comment, staff_comment, work_environment_comment, etc_comment, cast_back, email_address,
       image_urls, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        id,
        storeId || null,
        storeName,
        branchName ?? null,
        prefecture,
        area ?? null,
        industry,
        genre ?? null,
        visitedPeriod,
        workType,
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

    return new Response(null, { status: 201, headers: { Location: `/api/surveys/${id}` } });
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

    let orderBy = "s.created_at DESC";
    if (sort === "oldest") orderBy = "s.created_at ASC";
    if (sort === "earning") orderBy = "avg_earning DESC";
    if (sort === "rating") orderBy = "avg_rating DESC";

    const where: string[] = ["s.deleted_at IS NULL"];
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

    const whereClause = where.join(" AND ");

    const totalRes = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM stores s WHERE ${whereClause}`,
    )
      .bind(...params)
      .first();
    const rows = await env.DB.prepare(
      `SELECT
        s.*,
        COALESCE((SELECT COUNT(*) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS survey_count,
        COALESCE((SELECT SUM(helpful_count) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS helpful_count,
        COALESCE((SELECT AVG(average_earning) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_earning,
        COALESCE((SELECT AVG(rating) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_rating,
        COALESCE((SELECT AVG(wait_time_hours) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_wait
       FROM stores s
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
      "SELECT * FROM surveys WHERE store_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 10",
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
      "SELECT * FROM surveys WHERE store_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ?",
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
