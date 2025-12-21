import { PagesFunction } from "./types";
import { StoreInputSchema } from "@makotoclub/shared";
import { mapStore } from "./lib/mapper";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

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

  await env.DB.prepare(
    `INSERT INTO stores
      (id, name, branch_name, prefecture, area, industry, genre, cast_back, recruitment_urls, business_hours_open, business_hours_close, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
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
  await env.DB.prepare(
    `UPDATE stores SET
      name = COALESCE(?, name),
      branch_name = COALESCE(?, branch_name),
      prefecture = COALESCE(?, prefecture),
      area = COALESCE(?, area),
      industry = COALESCE(?, industry),
      genre = COALESCE(?, genre),
      cast_back = COALESCE(?, cast_back),
      recruitment_urls = COALESCE(?, recruitment_urls),
      business_hours_open = COALESCE(?, business_hours_open),
      business_hours_close = COALESCE(?, business_hours_close),
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
      Array.isArray((payload as any).recruitmentUrls)
        ? JSON.stringify((payload as any).recruitmentUrls)
        : null,
      payload.businessHours?.open ?? null,
      payload.businessHours?.close ?? null,
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
