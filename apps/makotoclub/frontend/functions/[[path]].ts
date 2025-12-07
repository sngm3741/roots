import { createPagesFunctionHandler } from "@react-router/cloudflare";
import type { ServerBuild } from "react-router";
import * as buildModule from "../build/server/index.js";

type Env = {
  DB: D1Database;
};

async function handleApi(request: Request, env: Env): Promise<Response | null> {
  const url = new URL(request.url);
  const { pathname } = url;

  // GET /api/surveys
  if (pathname === "/api/surveys" && request.method === "GET") {
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");
    const sort = url.searchParams.get("sort") || "newest";
    const offset = Math.max(0, (page - 1) * limit);
    const orderBy = sort === "oldest" ? "created_at ASC" : "created_at DESC";

    const totalRes = await env.DB.prepare(
      "SELECT COUNT(*) as c FROM surveys WHERE deleted_at IS NULL",
    ).first<{ c: number }>();
    const rows = await env.DB.prepare(
      `SELECT * FROM surveys WHERE deleted_at IS NULL ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all<unknown>();

    return Response.json({
      items: rows.results ?? [],
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
      .first<unknown>();
    if (!row) return new Response("Not Found", { status: 404 });
    return Response.json(row);
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

    const surveyStoreId = storeId || crypto.randomUUID();

    await env.DB.batch([
      env.DB.prepare(
        `INSERT OR IGNORE INTO stores
        (id, name, branch_name, prefecture, area, industry, genre, unit_price, business_hours_open, business_hours_close, average_rating, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, NULL, NULL, NULL, NULL, ?, ?)`
      ).bind(
        surveyStoreId,
        storeName,
        branchName ?? null,
        prefecture,
        area ?? null,
        industry,
        genre ?? null,
        now,
        now,
      ),
      env.DB.prepare(
        `INSERT INTO surveys
        (id, store_id, store_name, store_branch, store_prefecture, store_area, store_industry, store_genre,
         visited_period, work_type, age, spec_score, wait_time_hours, average_earning, rating,
         customer_comment, staff_comment, work_environment_comment, etc_comment, cast_back, email_address,
         image_urls, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        surveyStoreId,
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
      ),
    ]);

    return new Response(null, { status: 201, headers: { Location: `/api/surveys/${id}` } });
  }

  // GET /api/stores
  if (pathname === "/api/stores" && request.method === "GET") {
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "10");
    const offset = Math.max(0, (page - 1) * limit);

    const totalRes = await env.DB.prepare(
      "SELECT COUNT(*) as c FROM stores WHERE deleted_at IS NULL",
    ).first<{ c: number }>();
    const rows = await env.DB.prepare(
      `SELECT * FROM stores WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    )
      .bind(limit, offset)
      .all<unknown>();

    return Response.json({
      items: rows.results ?? [],
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
      .first<any>();
    if (!store) return new Response("Not Found", { status: 404 });

    const surveys = await env.DB.prepare(
      "SELECT * FROM surveys WHERE store_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 50",
    )
      .bind(id)
      .all<unknown>();

    return Response.json({
      ...store,
      surveys: surveys.results ?? [],
    });
  }

  // GET /api/stores/:id/surveys
  if (pathname.match(/^\/api\/stores\/[^/]+\/surveys$/) && request.method === "GET") {
    const storeId = pathname.split("/")[3];
    const rows = await env.DB.prepare(
      "SELECT * FROM surveys WHERE store_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT 50",
    )
      .bind(storeId)
      .all<unknown>();
    return Response.json(rows.results ?? []);
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
      unitPrice,
      businessHoursOpen,
      businessHoursClose,
      averageRating,
    } = payload || {};

    if (!name || !prefecture || !industry) {
      return new Response("Missing required fields", { status: 400 });
    }

    await env.DB.prepare(
      `INSERT OR REPLACE INTO stores
      (id, name, branch_name, prefecture, area, industry, genre, unit_price, business_hours_open, business_hours_close, average_rating, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM stores WHERE id = ?), ?), ?)`
    )
      .bind(
        id,
        name,
        branchName ?? null,
        prefecture,
        area ?? null,
        industry,
        genre ?? null,
        unitPrice ?? null,
        businessHoursOpen ?? null,
        businessHoursClose ?? null,
        typeof averageRating === "number" ? averageRating : null,
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
    ).all<unknown>();
    return Response.json({ items: rows.results ?? [] });
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
        unit_price = COALESCE(?, unit_price),
        business_hours_open = COALESCE(?, business_hours_open),
        business_hours_close = COALESCE(?, business_hours_close),
        average_rating = COALESCE(?, average_rating),
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
        payload.unitPrice ?? null,
        payload.businessHoursOpen ?? null,
        payload.businessHoursClose ?? null,
        typeof payload.averageRating === "number" ? payload.averageRating : null,
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
