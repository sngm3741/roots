import { PagesFunction } from "./types";
import { SurveyInputSchema } from "@makotoclub/shared";
import { mapSurvey } from "./lib/mapper";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status")?.toLowerCase();

  // Drafts
  const draftRows =
    status === "published"
      ? []
      : (
          await env.DB.prepare(
            `SELECT *, 'draft' as status FROM survey_drafts ORDER BY created_at DESC`,
          ).all()
        ).results ?? [];

  // Published
  const pubRows =
    status === "draft"
      ? []
      : (
          await env.DB.prepare(
            `SELECT *, 'published' as status FROM surveys WHERE deleted_at IS NULL ORDER BY created_at DESC`,
          ).all()
        ).results ?? [];

  const items = [...pubRows, ...draftRows].map(mapSurvey);
  return json({ items, total: items.length });
};

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const payloadRaw = (await request.json()) as unknown;
  const parseResult = SurveyInputSchema.safeParse(payloadRaw);
  if (!parseResult.success) {
    return json({ message: "必須項目が不足、または不正です", issues: parseResult.error.issues }, { status: 400 });
  }
  const payload = parseResult.data;

  // store 存在チェック
  const storeExists = await env.DB.prepare("SELECT id, name, branch_name, prefecture, area, industry, genre FROM stores WHERE id = ? AND deleted_at IS NULL")
    .bind(payload.storeId)
    .first();
  if (!storeExists) {
    return json({ message: "店舗が存在しません。storeId を確認してください。" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await env.DB.prepare(
    `INSERT INTO surveys
     (id, store_id, store_name, store_branch, store_prefecture, store_area, store_industry, store_genre,
      visited_period, work_type, age, spec_score, wait_time_hours, average_earning, rating,
      customer_comment, staff_comment, work_environment_comment, etc_comment, cast_back, email_address,
      image_urls, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      payload.storeId,
      storeExists.name ?? payload.storeName,
      storeExists.branch_name ?? payload.branchName ?? null,
      storeExists.prefecture ?? payload.prefecture,
      storeExists.area ?? null,
      storeExists.industry ?? payload.industry,
      storeExists.genre ?? payload.genre ?? null,
      payload.visitedPeriod,
      payload.workType,
      payload.age,
      payload.specScore,
      payload.waitTimeHours,
      payload.averageEarning,
      payload.rating,
      payload.customerComment ?? null,
      payload.staffComment ?? null,
      payload.workEnvironmentComment ?? null,
      payload.etcComment ?? null,
      payload.castBack != null ? String(payload.castBack) : null,
      payload.emailAddress ?? null,
      Array.isArray(payload.imageUrls) ? JSON.stringify(payload.imageUrls) : null,
      now,
      now,
    )
    .run();

  const row = await env.DB.prepare("SELECT *, 'published' as status FROM surveys WHERE id = ?")
    .bind(id)
    .first();
  return json(mapSurvey(row as any), { status: 201 });
};

export const onRequestPut: PagesFunction = async ({ request, env }) => {
  const payload = (await request.json()) as Partial<ReturnType<typeof mapSurvey>> & { id?: string };
  if (!payload.id) return json({ message: "idが必要です" }, { status: 400 });
  if (!payload.storeId) return json({ message: "storeIdが必要です" }, { status: 400 });

  const now = new Date().toISOString();

  // store 存在チェック
  const storeRow = await env.DB.prepare(
    "SELECT id, name, branch_name, prefecture, area, industry, genre FROM stores WHERE id = ? AND deleted_at IS NULL"
  )
    .bind(payload.storeId)
    .first();
  if (!storeRow) return json({ message: "店舗が存在しません。storeId を確認してください。" }, { status: 400 });

  // 更新対象を published -> drafts の順に探す
  const existing =
    (await env.DB.prepare("SELECT *, 'published' as status FROM surveys WHERE id = ? AND deleted_at IS NULL")
      .bind(payload.id)
      .first()) ||
    (await env.DB.prepare("SELECT *, 'draft' as status FROM survey_drafts WHERE id = ?")
      .bind(payload.id)
      .first());

  if (!existing) return json({ message: "アンケートが見つかりません" }, { status: 404 });

  const table = (existing as any).status === "draft" ? "survey_drafts" : "surveys";
  await env.DB.prepare(
    `UPDATE ${table} SET
      store_name = COALESCE(?, store_name),
      store_branch = COALESCE(?, store_branch),
      store_prefecture = COALESCE(?, store_prefecture),
      store_area = COALESCE(?, store_area),
      store_industry = COALESCE(?, store_industry),
      store_genre = COALESCE(?, store_genre),
      visited_period = COALESCE(?, visited_period),
      work_type = COALESCE(?, work_type),
      age = COALESCE(?, age),
      spec_score = COALESCE(?, spec_score),
      wait_time_hours = COALESCE(?, wait_time_hours),
      average_earning = COALESCE(?, average_earning),
      rating = COALESCE(?, rating),
      customer_comment = COALESCE(?, customer_comment),
      staff_comment = COALESCE(?, staff_comment),
      work_environment_comment = COALESCE(?, work_environment_comment),
      etc_comment = COALESCE(?, etc_comment),
      cast_back = COALESCE(?, cast_back),
      email_address = COALESCE(?, email_address),
      image_urls = COALESCE(?, image_urls),
      updated_at = ?
    WHERE id = ?`
  )
    .bind(
      payload.storeName ?? null,
      payload.branchName ?? (storeRow as any).branch_name ?? null,
      payload.prefecture ?? (storeRow as any).prefecture ?? null,
      payload.area ?? (storeRow as any).area ?? null,
      payload.industry ?? (storeRow as any).industry ?? null,
      payload.genre ?? (storeRow as any).genre ?? null,
      payload.visitedPeriod ?? null,
      payload.workType ?? null,
      typeof payload.age === "number" ? payload.age : null,
      typeof payload.specScore === "number" ? payload.specScore : null,
      typeof payload.waitTimeHours === "number" ? payload.waitTimeHours : null,
      typeof payload.averageEarning === "number" ? payload.averageEarning : null,
      typeof payload.rating === "number" ? payload.rating : null,
      payload.customerComment ?? null,
      payload.staffComment ?? null,
      payload.workEnvironmentComment ?? null,
      payload.etcComment ?? null,
      payload.castBack != null ? String(payload.castBack) : null,
      payload.emailAddress ?? null,
      Array.isArray(payload.imageUrls) ? JSON.stringify(payload.imageUrls) : payload.imageUrls ?? null,
      now,
      payload.id,
    )
    .run();

  const row = await env.DB.prepare(
    `SELECT *, '${(existing as any).status}' as status FROM ${table} WHERE id = ?`,
  )
    .bind(payload.id)
    .first();
  return json(mapSurvey(row as any));
};

export const onRequestDelete: PagesFunction = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return json({ message: "idが必要です" }, { status: 400 });

  // published はソフトデリート、draft は物理削除
  const published = await env.DB.prepare("SELECT id FROM surveys WHERE id = ? AND deleted_at IS NULL")
    .bind(id)
    .first();
  if (published) {
    await env.DB.prepare("UPDATE surveys SET deleted_at = ?, updated_at = ? WHERE id = ?")
      .bind(new Date().toISOString(), new Date().toISOString(), id)
      .run();
    return json({ success: true });
  }

  await env.DB.prepare("DELETE FROM survey_drafts WHERE id = ?").bind(id).run();
  return json({ success: true });
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "PUT") return onRequestPut(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return json({ message: "Method not allowed" }, { status: 405 });
};
