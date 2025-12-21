import { mapStore } from "../lib/mapper";
import { PagesFunction } from "../types";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

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
      WHERE id = ? AND deleted_at IS NULL`
    )
      .bind(
        payload.storeName ?? null,
        payload.branchName ?? null,
        payload.prefecture ?? null,
        payload.area ?? null,
        payload.category ?? null,
        payload.genre ?? null,
        (payload as any).businessHours?.open ?? null,
        (payload as any).businessHours?.close ?? null,
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
