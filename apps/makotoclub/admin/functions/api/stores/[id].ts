import { mapStore } from "../lib/mapper";
import { PagesFunction } from "../types";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

const hasOwn = (value: unknown, key: string) =>
  !!value && typeof value === "object" && Object.prototype.hasOwnProperty.call(value, key);

const normalizeOptionalText = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const normalizeOptionalEmail = (value: unknown): { ok: boolean; value: string | null } => {
  if (value === undefined || value === null || value === "") return { ok: true, value: null };
  if (typeof value !== "string") return { ok: false, value: null };
  const trimmed = value.trim();
  if (!trimmed) return { ok: true, value: null };
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  return valid ? { ok: true, value: trimmed } : { ok: false, value: null };
};

const normalizeOptionalHttpsUrl = (value: unknown): { ok: boolean; value: string | null } => {
  if (value === undefined || value === null || value === "") return { ok: true, value: null };
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

export const onRequest: PagesFunction = async ({ request, params, env }) => {
  const id = params?.id;
  if (!id) return json({ message: "idが必要です" }, { status: 400 });

  // GET /api/stores/:id
  if (request.method === "GET") {
    const row = await env.DB.prepare(
      `SELECT
         s.*,
         COALESCE((SELECT COUNT(*) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS survey_count,
         COALESCE((SELECT SUM(helpful_count) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS helpful_count,
         COALESCE((SELECT AVG(average_earning) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_earning,
         COALESCE((SELECT AVG(rating) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_rating,
         COALESCE((SELECT AVG(wait_time_hours) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_wait
       FROM stores s
       WHERE s.id = ? AND s.deleted_at IS NULL`
    )
      .bind(id)
      .first();

    if (!row) return json({ message: "店舗が見つかりません" }, { status: 404 });
    return json(mapStore(row as any));
  }

  // PUT /api/stores/:id
  if (request.method === "PUT") {
    const payload = (await request.json()) as Record<string, unknown>;
    const now = new Date().toISOString();
    const hasRecruitmentUrls = hasOwn(payload, "recruitmentUrls");
    const recruitmentUrls =
      hasRecruitmentUrls && Array.isArray(payload.recruitmentUrls)
        ? payload.recruitmentUrls
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean)
        : [];
    const serializedRecruitmentUrls = JSON.stringify(recruitmentUrls);
    const hasCastBack = hasOwn(payload, "castBack");
    const rawCastBack =
      typeof payload.castBack === "number"
        ? payload.castBack
        : typeof payload.castBack === "string" && payload.castBack.trim() !== ""
          ? Number(payload.castBack)
          : null;
    const castBack = typeof rawCastBack === "number" && Number.isFinite(rawCastBack) ? rawCastBack : null;
    const hasPhoneNumber = hasOwn(payload, "phoneNumber");
    const hasEmail = hasOwn(payload, "email");
    const hasLineUrl = hasOwn(payload, "lineUrl");
    const hasTwitterUrl = hasOwn(payload, "twitterUrl");
    const hasBskyUrl = hasOwn(payload, "bskyUrl");
    const hasWomenRecruitmentPageMissing = hasOwn(payload, "womenRecruitmentPageMissing");
    const normalizedPhoneNumber = normalizeOptionalText(payload.phoneNumber);
    const normalizedEmail = normalizeOptionalEmail(payload.email);
    if (hasEmail && !normalizedEmail.ok) {
      return json({ message: "Emailの形式が不正です" }, { status: 400 });
    }
    const normalizedLineUrl = normalizeOptionalHttpsUrl(payload.lineUrl);
    if (hasLineUrl && !normalizedLineUrl.ok) {
      return json({ message: "LINE URLは https のURLのみ登録できます" }, { status: 400 });
    }
    const normalizedTwitterUrl = normalizeOptionalHttpsUrl(payload.twitterUrl);
    if (hasTwitterUrl && !normalizedTwitterUrl.ok) {
      return json({ message: "X(Twitter) URLは https のURLのみ登録できます" }, { status: 400 });
    }
    const normalizedBskyUrl = normalizeOptionalHttpsUrl(payload.bskyUrl);
    if (hasBskyUrl && !normalizedBskyUrl.ok) {
      return json({ message: "Bsky URLは https のURLのみ登録できます" }, { status: 400 });
    }
    const hasBusinessHours = hasOwn(payload, "businessHours");
    const normalizedBusinessHoursOpen = normalizeOptionalText((payload as any).businessHours?.open);
    const normalizedBusinessHoursClose = normalizeOptionalText((payload as any).businessHours?.close);

    await env.DB.prepare(
      `UPDATE stores SET
        name = COALESCE(?, name),
        branch_name = COALESCE(?, branch_name),
        prefecture = COALESCE(?, prefecture),
        area = COALESCE(?, area),
        industry = COALESCE(?, industry),
        genre = COALESCE(?, genre),
        cast_back = CASE WHEN ? = 1 THEN ? ELSE cast_back END,
        phone_number = CASE WHEN ? = 1 THEN ? ELSE phone_number END,
        email = CASE WHEN ? = 1 THEN ? ELSE email END,
        line_url = CASE WHEN ? = 1 THEN ? ELSE line_url END,
        twitter_url = CASE WHEN ? = 1 THEN ? ELSE twitter_url END,
        bsky_url = CASE WHEN ? = 1 THEN ? ELSE bsky_url END,
        women_recruitment_page_missing = CASE WHEN ? = 1 THEN ? ELSE women_recruitment_page_missing END,
        recruitment_urls = CASE WHEN ? = 1 THEN ? ELSE recruitment_urls END,
        business_hours_open = CASE WHEN ? = 1 THEN ? ELSE COALESCE(?, business_hours_open) END,
        business_hours_close = CASE WHEN ? = 1 THEN ? ELSE COALESCE(?, business_hours_close) END,
        updated_at = ?
      WHERE id = ? AND deleted_at IS NULL`
    )
      .bind(
        payload.storeName ?? null,
        payload.branchName ?? null,
        payload.prefecture ?? null,
        payload.area ?? null,
        payload.category ?? null,
        payload.genre ?? null,
        hasCastBack ? 1 : 0,
        castBack,
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
        hasWomenRecruitmentPageMissing ? 1 : 0,
        payload.womenRecruitmentPageMissing ? 1 : 0,
        hasRecruitmentUrls ? 1 : 0,
        serializedRecruitmentUrls,
        hasBusinessHours ? 1 : 0,
        normalizedBusinessHoursOpen,
        normalizedBusinessHoursOpen,
        hasBusinessHours ? 1 : 0,
        normalizedBusinessHoursClose,
        normalizedBusinessHoursClose,
        now,
        id,
      )
      .run();

    const row = await env.DB.prepare(
      `SELECT
         s.*,
         COALESCE((SELECT COUNT(*) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS survey_count,
         COALESCE((SELECT SUM(helpful_count) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS helpful_count,
         COALESCE((SELECT AVG(average_earning) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_earning,
         COALESCE((SELECT AVG(rating) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_rating,
         COALESCE((SELECT AVG(wait_time_hours) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_wait
       FROM stores s
       WHERE s.id = ? AND s.deleted_at IS NULL`
    )
      .bind(id)
      .first();

    if (!row) return json({ message: "店舗が見つかりません" }, { status: 404 });
    return json(mapStore(row as any));
  }

  // DELETE /api/stores/:id
  if (request.method === "DELETE") {
    const res = await env.DB.prepare(
      "UPDATE stores SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL"
    )
      .bind(new Date().toISOString(), id)
      .run();

    if (!res.success) return json({ message: "削除に失敗しました" }, { status: 500 });
    return json({ success: true });
  }

  return json({ message: "Method not allowed" }, { status: 405 });
};
