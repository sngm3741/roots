import { computeSurveyStats, mapStore, mapSurvey } from "../_shared/mappers";
import { parseNumberParam } from "../_shared/parsers";
import type { Env } from "../_shared/types";

const normalizeRecruitmentUrls = (input: unknown): string[] => {
  const normalize = (items: unknown[]) =>
    items
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean);

  if (Array.isArray(input)) {
    return normalize(input);
  }
  if (typeof input === "string") {
    const trimmed = input.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? normalize(parsed) : [trimmed];
    } catch {
      return [trimmed];
    }
  }
  return [];
};

const serializeRecruitmentUrls = (input: unknown) =>
  JSON.stringify(normalizeRecruitmentUrls(input));

const hasOwn = (value: unknown, key: string) =>
  !!value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, key);

const normalizeOptionalText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeOptionalEmail = (value: unknown): { ok: boolean; value: string | null } => {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }
  if (typeof value !== "string") return { ok: false, value: null };
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  return valid ? { ok: true, value: trimmed } : { ok: false, value: null };
};

const normalizeOptionalHttpsUrl = (value: unknown): { ok: boolean; value: string | null } => {
  if (value === undefined || value === null || value === "") {
    return { ok: true, value: null };
  }
  if (typeof value !== "string") return { ok: false, value: null };
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:") return { ok: false, value: null };
    return { ok: true, value: parsed.toString() };
  } catch {
    return { ok: false, value: null };
  }
};

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
      return new Response("JSONの形式が不正です。", { status: 400 });
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
      phoneNumber,
      email,
      lineUrl,
      twitterUrl,
      bskyUrl,
      recruitmentUrls,
      businessHoursText,
      businessHoursOpen,
      businessHoursClose,
    } = payload || {};

    if (!name || !prefecture || !industry) {
      return new Response("必須項目が不足しています。", { status: 400 });
    }

    const normalizedPhoneNumber = normalizeOptionalText(phoneNumber);
    const normalizedEmail = normalizeOptionalEmail(email);
    if (!normalizedEmail.ok) {
      return new Response("Emailの形式が不正です。", { status: 400 });
    }
    const normalizedLineUrl = normalizeOptionalHttpsUrl(lineUrl);
    if (!normalizedLineUrl.ok) {
      return new Response("LINE URLは https のURLのみ登録できます。", { status: 400 });
    }
    const normalizedTwitterUrl = normalizeOptionalHttpsUrl(twitterUrl);
    if (!normalizedTwitterUrl.ok) {
      return new Response("X(Twitter) URLは https のURLのみ登録できます。", { status: 400 });
    }
    const normalizedBskyUrl = normalizeOptionalHttpsUrl(bskyUrl);
    if (!normalizedBskyUrl.ok) {
      return new Response("Bsky URLは https のURLのみ登録できます。", { status: 400 });
    }
    const normalizedBusinessHoursText = normalizeOptionalText(businessHoursText);
    const normalizedBusinessHoursOpen = normalizeOptionalText(businessHoursOpen);
    const normalizedBusinessHoursClose = normalizeOptionalText(businessHoursClose);
    const finalBusinessHoursOpen = normalizedBusinessHoursText ?? normalizedBusinessHoursOpen;
    const finalBusinessHoursClose = normalizedBusinessHoursText
      ? null
      : normalizedBusinessHoursClose;

    const serializedRecruitmentUrls = serializeRecruitmentUrls(recruitmentUrls);

    await env.DB.prepare(
      `INSERT OR REPLACE INTO stores
      (
        id,
        name,
        branch_name,
        prefecture,
        area,
        industry,
        genre,
        phone_number,
        email,
        line_url,
        twitter_url,
        bsky_url,
        recruitment_urls,
        business_hours_open,
        business_hours_close,
        created_at,
        updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE((SELECT created_at FROM stores WHERE id = ?), ?), ?)`,
    )
      .bind(
        id,
        name,
        branchName ?? null,
        prefecture,
        area ?? null,
        industry,
        genre ?? null,
        normalizedPhoneNumber,
        normalizedEmail.value,
        normalizedLineUrl.value,
        normalizedTwitterUrl.value,
        normalizedBskyUrl.value,
        serializedRecruitmentUrls,
        finalBusinessHoursOpen,
        finalBusinessHoursClose,
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
      return new Response("JSONの形式が不正です。", { status: 400 });
    }

    const now = new Date().toISOString();
    const hasRecruitmentUrls =
      hasOwn(payload, "recruitmentUrls") ||
      hasOwn(payload, "recruitmentUrl") ||
      hasOwn(payload, "officialUrl") ||
      hasOwn(payload, "officialURL");
    const recruitmentUrlsInput =
      payload?.recruitmentUrls ??
      payload?.recruitmentUrl ??
      payload?.officialUrl ??
      payload?.officialURL;
    const serializedRecruitmentUrls = serializeRecruitmentUrls(recruitmentUrlsInput);
    const hasPhoneNumber = hasOwn(payload, "phoneNumber");
    const hasEmail = hasOwn(payload, "email");
    const hasLineUrl = hasOwn(payload, "lineUrl");
    const hasTwitterUrl = hasOwn(payload, "twitterUrl");
    const hasBskyUrl = hasOwn(payload, "bskyUrl");
    const normalizedPhoneNumber = normalizeOptionalText(payload?.phoneNumber);
    const normalizedEmail = normalizeOptionalEmail(payload?.email);
    if (hasEmail && !normalizedEmail.ok) {
      return new Response("Emailの形式が不正です。", { status: 400 });
    }
    const normalizedLineUrl = normalizeOptionalHttpsUrl(payload?.lineUrl);
    if (hasLineUrl && !normalizedLineUrl.ok) {
      return new Response("LINE URLは https のURLのみ登録できます。", { status: 400 });
    }
    const normalizedTwitterUrl = normalizeOptionalHttpsUrl(payload?.twitterUrl);
    if (hasTwitterUrl && !normalizedTwitterUrl.ok) {
      return new Response("X(Twitter) URLは https のURLのみ登録できます。", { status: 400 });
    }
    const normalizedBskyUrl = normalizeOptionalHttpsUrl(payload?.bskyUrl);
    if (hasBskyUrl && !normalizedBskyUrl.ok) {
      return new Response("Bsky URLは https のURLのみ登録できます。", { status: 400 });
    }
    const hasBusinessHoursText = hasOwn(payload, "businessHoursText");
    const normalizedBusinessHoursText = normalizeOptionalText(payload?.businessHoursText);
    const normalizedBusinessHoursOpen = normalizeOptionalText(payload?.businessHoursOpen);
    const normalizedBusinessHoursClose = normalizeOptionalText(payload?.businessHoursClose);
    const businessHoursOpenForTextMode = normalizedBusinessHoursText;

    await env.DB.prepare(
      `UPDATE stores SET
        name = COALESCE(?, name),
        branch_name = COALESCE(?, branch_name),
        prefecture = COALESCE(?, prefecture),
        area = COALESCE(?, area),
        industry = COALESCE(?, industry),
        genre = COALESCE(?, genre),
        phone_number = CASE WHEN ? = 1 THEN ? ELSE phone_number END,
        email = CASE WHEN ? = 1 THEN ? ELSE email END,
        line_url = CASE WHEN ? = 1 THEN ? ELSE line_url END,
        twitter_url = CASE WHEN ? = 1 THEN ? ELSE twitter_url END,
        bsky_url = CASE WHEN ? = 1 THEN ? ELSE bsky_url END,
        recruitment_urls = CASE WHEN ? = 1 THEN ? ELSE recruitment_urls END,
        business_hours_open = CASE WHEN ? = 1 THEN ? ELSE COALESCE(?, business_hours_open) END,
        business_hours_close = CASE WHEN ? = 1 THEN NULL ELSE COALESCE(?, business_hours_close) END,
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
        hasPhoneNumber ? 1 : 0,
        normalizedPhoneNumber,
        hasEmail ? 1 : 0,
        normalizedEmail.value,
        hasLineUrl ? 1 : 0,
        normalizedLineUrl.value,
        hasTwitterUrl ? 1 : 0,
        normalizedTwitterUrl.value,
        hasBskyUrl ? 1 : 0,
        normalizedBskyUrl.value,
        hasRecruitmentUrls ? 1 : 0,
        serializedRecruitmentUrls,
        hasBusinessHoursText ? 1 : 0,
        businessHoursOpenForTextMode,
        normalizedBusinessHoursOpen,
        hasBusinessHoursText ? 1 : 0,
        normalizedBusinessHoursClose,
        now,
        id,
      )
      .run();

    return new Response(null, { status: 204 });
  }

  return null;
};
