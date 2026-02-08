import { computeSurveyStats, mapStore, mapSurvey } from "../_shared/mappers";
import { parseNumberParam } from "../_shared/parsers";
import type { Env } from "../_shared/types";

export const handleStoreRoutes = async (
  request: Request,
  url: URL,
  pathname: string,
  env: Env,
): Promise<Response | null> => {
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

    const where: string[] = ["deleted_at IS NULL"];
    const params: (string | number)[] = [];
    if (name) {
      const like = `%${name}%`;
      where.push("(name LIKE ? OR branch_name LIKE ? OR area LIKE ? OR industry LIKE ? OR genre LIKE ?)");
      params.push(like, like, like, like, like);
    }
    if (prefecture) {
      where.push("prefecture = ?");
      params.push(prefecture);
    }
    if (area) {
      where.push("area = ?");
      params.push(area);
    }
    if (industry) {
      where.push("industry = ?");
      params.push(industry);
    }
    if (genre) {
      where.push("genre = ?");
      params.push(genre);
    }

    const whereClause = where.join(" AND ");
    const orderBy =
      sort === "rating"
        ? "avg_rating DESC, updated_at DESC"
        : sort === "earning"
          ? "avg_earning DESC, updated_at DESC"
          : sort === "wait"
            ? "avg_wait ASC, updated_at DESC"
            : "updated_at DESC";

    const baseSql = `FROM (
      SELECT
        s.*,
        st.survey_count AS survey_count,
        st.helpful_count AS helpful_count,
        st.avg_earning AS avg_earning,
        st.avg_rating AS avg_rating,
        st.avg_wait AS avg_wait
      FROM stores s
      LEFT JOIN store_stats st ON st.store_id = s.id
    )`;

    const profileWhere: string[] = [];
    if (spec !== null) {
      profileWhere.push("(min_spec IS NULL OR min_spec <= ?)");
      profileWhere.push("(max_spec IS NULL OR max_spec >= ?)");
      params.push(spec, spec);
    }
    if (age !== null) {
      profileWhere.push("(min_age IS NULL OR min_age <= ?)");
      profileWhere.push("(max_age IS NULL OR max_age >= ?)");
      params.push(age, age);
    }

    const finalWhere =
      whereClause + (profileWhere.length ? ` AND ${profileWhere.join(" AND ")}` : "");

    const totalRes = await env.DB.prepare(`SELECT COUNT(*) as c ${baseSql} WHERE ${finalWhere}`)
      .bind(...params)
      .first();

    const rows = await env.DB.prepare(
      `SELECT * ${baseSql}
       WHERE ${finalWhere}
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

  if (pathname.match(/^\/api\/stores\/[^/]+$/) && request.method === "GET") {
    const id = pathname.split("/").pop() || "";
    if (!id) return new Response("店舗IDが指定されていません。", { status: 400 });

    const store = await env.DB.prepare(
      `SELECT
        s.*,
        st.survey_count AS survey_count,
        st.helpful_count AS helpful_count,
        st.avg_earning AS avg_earning,
        st.avg_rating AS avg_rating,
        st.avg_wait AS avg_wait
       FROM stores s
       LEFT JOIN store_stats st ON st.store_id = s.id
       WHERE s.id = ? AND s.deleted_at IS NULL`,
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
       ORDER BY COALESCE(s.visited_period, '') DESC, s.created_at DESC
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

  if (pathname.match(/^\/api\/stores\/[^/]+\/surveys$/) && request.method === "GET") {
    const storeId = pathname.split("/")[3];
    const limit = Number(url.searchParams.get("limit") || "50");
    const rows = await env.DB.prepare(
      `SELECT
        s.*,
        (SELECT COUNT(*) FROM store_comments sc WHERE sc.store_id = s.store_id AND sc.deleted_at IS NULL) AS comment_count
       FROM surveys s
       WHERE s.store_id = ? AND s.deleted_at IS NULL
       ORDER BY s.created_at DESC
       LIMIT ?`,
    )
      .bind(storeId, limit)
      .all();
    return Response.json((rows.results ?? []).map(mapSurvey));
  }

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
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM stores WHERE id = ?), ?), ?)`,
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

  if (pathname === "/api/admin/stores" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT * FROM stores WHERE deleted_at IS NULL ORDER BY created_at DESC",
    ).all();
    return Response.json({ items: (rows.results ?? []).map(mapStore) });
  }

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
      WHERE id = ?`,
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
};
