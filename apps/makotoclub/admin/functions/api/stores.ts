import { PagesFunction } from "./types";
import { StoreInputSchema } from "@makotoclub/shared";
import { mapStore } from "./lib/mapper";

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

export const onRequestGet: PagesFunction = async ({ env }) => {
  const rows = await env.DB.prepare(
    `SELECT
      s.*,
      COALESCE((SELECT COUNT(*) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS survey_count,
      COALESCE((SELECT SUM(helpful_count) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS helpful_count,
      COALESCE((SELECT AVG(average_earning) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_earning,
      COALESCE((SELECT AVG(rating) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_rating,
      COALESCE((SELECT AVG(wait_time_hours) FROM surveys WHERE store_id = s.id AND deleted_at IS NULL), 0) AS avg_wait
    FROM stores s
    WHERE s.deleted_at IS NULL
    ORDER BY s.created_at DESC`
  ).all();
  const items = (rows.results ?? []).map(mapStore);
  return json({ items, total: items.length });
};

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const payloadRaw = (await request.json()) as unknown;
  const parseResult = StoreInputSchema.safeParse(payloadRaw);
  if (!parseResult.success) {
    return json({ message: "必須項目が不足しています", issues: parseResult.error.issues }, { status: 400 });
  }
  const payload = parseResult.data;
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const normalizedPhoneNumber = normalizeOptionalText(payload.phoneNumber);
  const normalizedEmail = normalizeOptionalEmail(payload.email);
  if (!normalizedEmail.ok) {
    return json({ message: "Emailの形式が不正です。" }, { status: 400 });
  }
  const normalizedLineUrl = normalizeOptionalHttpsUrl(payload.lineUrl);
  if (!normalizedLineUrl.ok) {
    return json({ message: "LINE URLは https のURLのみ登録できます。" }, { status: 400 });
  }
  const normalizedTwitterUrl = normalizeOptionalHttpsUrl(payload.twitterUrl);
  if (!normalizedTwitterUrl.ok) {
    return json({ message: "X(Twitter) URLは https のURLのみ登録できます。" }, { status: 400 });
  }
  const normalizedBskyUrl = normalizeOptionalHttpsUrl(payload.bskyUrl);
  if (!normalizedBskyUrl.ok) {
    return json({ message: "Bsky URLは https のURLのみ登録できます。" }, { status: 400 });
  }

  await env.DB.prepare(
    `INSERT INTO stores
      (
        id,
        name,
        branch_name,
        prefecture,
        area,
        industry,
        genre,
        cast_back,
        phone_number,
        email,
        line_url,
        twitter_url,
        bsky_url,
        women_recruitment_page_missing,
        recruitment_urls,
        business_hours_open,
        business_hours_close,
        created_at,
        updated_at
      )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      payload.storeName,
      payload.branchName ?? null,
      payload.prefecture,
      payload.area ?? null,
      payload.category,
      payload.genre ?? null,
      typeof payload.castBack === "number" ? payload.castBack : null,
      normalizedPhoneNumber,
      normalizedEmail.value,
      normalizedLineUrl.value,
      normalizedTwitterUrl.value,
      normalizedBskyUrl.value,
      payload.womenRecruitmentPageMissing ? 1 : 0,
      JSON.stringify(payload.recruitmentUrls ?? []),
      payload.businessHours?.open ?? null,
      payload.businessHours?.close ?? null,
      now,
      now,
    )
    .run();

  const row = await env.DB.prepare(`SELECT * FROM stores WHERE id = ?`).bind(id).first();
  return json(mapStore(row as any), { status: 201 });
};

export const onRequestPut: PagesFunction = async ({ request, env }) => {
  const payload = (await request.json()) as Partial<ReturnType<typeof mapStore>> & { id?: string };
  if (!payload.id) return json({ message: "idが必要です" }, { status: 400 });

  const now = new Date().toISOString();
  const hasPhoneNumber = hasOwn(payload, "phoneNumber");
  const hasEmail = hasOwn(payload, "email");
  const hasLineUrl = hasOwn(payload, "lineUrl");
  const hasTwitterUrl = hasOwn(payload, "twitterUrl");
  const hasBskyUrl = hasOwn(payload, "bskyUrl");
  const hasWomenRecruitmentPageMissing = hasOwn(payload, "womenRecruitmentPageMissing");
  const normalizedPhoneNumber = normalizeOptionalText(payload.phoneNumber);
  const normalizedEmail = normalizeOptionalEmail(payload.email);
  if (hasEmail && !normalizedEmail.ok) {
    return json({ message: "Emailの形式が不正です。" }, { status: 400 });
  }
  const normalizedLineUrl = normalizeOptionalHttpsUrl(payload.lineUrl);
  if (hasLineUrl && !normalizedLineUrl.ok) {
    return json({ message: "LINE URLは https のURLのみ登録できます。" }, { status: 400 });
  }
  const normalizedTwitterUrl = normalizeOptionalHttpsUrl(payload.twitterUrl);
  if (hasTwitterUrl && !normalizedTwitterUrl.ok) {
    return json({ message: "X(Twitter) URLは https のURLのみ登録できます。" }, { status: 400 });
  }
  const normalizedBskyUrl = normalizeOptionalHttpsUrl(payload.bskyUrl);
  if (hasBskyUrl && !normalizedBskyUrl.ok) {
    return json({ message: "Bsky URLは https のURLのみ登録できます。" }, { status: 400 });
  }
  const hasBusinessHours = hasOwn(payload, "businessHours");
  const normalizedBusinessHoursOpen = normalizeOptionalText(payload.businessHours?.open);
  const normalizedBusinessHoursClose = normalizeOptionalText(payload.businessHours?.close);

  await env.DB.prepare(
    `UPDATE stores SET
      name = COALESCE(?, name),
      branch_name = COALESCE(?, branch_name),
      prefecture = COALESCE(?, prefecture),
      area = COALESCE(?, area),
      industry = COALESCE(?, industry),
      genre = COALESCE(?, genre),
      cast_back = COALESCE(?, cast_back),
      phone_number = CASE WHEN ? = 1 THEN ? ELSE phone_number END,
      email = CASE WHEN ? = 1 THEN ? ELSE email END,
      line_url = CASE WHEN ? = 1 THEN ? ELSE line_url END,
      twitter_url = CASE WHEN ? = 1 THEN ? ELSE twitter_url END,
      bsky_url = CASE WHEN ? = 1 THEN ? ELSE bsky_url END,
      women_recruitment_page_missing = CASE WHEN ? = 1 THEN ? ELSE women_recruitment_page_missing END,
      recruitment_urls = COALESCE(?, recruitment_urls),
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
      typeof payload.castBack === "number" ? payload.castBack : null,
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
      Array.isArray((payload as any).recruitmentUrls)
        ? JSON.stringify((payload as any).recruitmentUrls)
        : null,
      hasBusinessHours ? 1 : 0,
      normalizedBusinessHoursOpen,
      normalizedBusinessHoursOpen,
      hasBusinessHours ? 1 : 0,
      normalizedBusinessHoursClose,
      normalizedBusinessHoursClose,
      now,
      payload.id,
    )
    .run();

  const row = await env.DB.prepare(`SELECT * FROM stores WHERE id = ? AND deleted_at IS NULL`)
    .bind(payload.id)
    .first();
  if (!row) return json({ message: "店舗が見つかりません" }, { status: 404 });
  return json(mapStore(row as any));
};

export const onRequestDelete: PagesFunction = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return json({ message: "idが必要です" }, { status: 400 });

  const res = await env.DB.prepare(
    "UPDATE stores SET deleted_at = ? WHERE id = ? AND deleted_at IS NULL",
  )
    .bind(new Date().toISOString(), id)
    .run();
  if (!res.success) return json({ message: "更新に失敗しました" }, { status: 500 });

  return json({ success: true });
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "PUT") return onRequestPut(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return json({ message: "Method not allowed" }, { status: 405 });
};
