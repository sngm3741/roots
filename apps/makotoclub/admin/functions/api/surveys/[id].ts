import { mapSurvey } from "../lib/mapper";
import { PagesFunction } from "../types";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequest: PagesFunction = async ({ request, params, env }) => {
  const id = params?.id;
  if (!id) return json({ message: "idが必要です" }, { status: 400 });

  // Helper to load a single survey (published or draft)
  const loadSurvey = async () => {
    const published = await env.DB.prepare(
      "SELECT *, 'published' as status FROM surveys WHERE id = ? AND deleted_at IS NULL"
    )
      .bind(id)
      .first();
    if (published) return mapSurvey(published as any);

    const draft = await env.DB.prepare(
      "SELECT *, 'draft' as status FROM survey_drafts WHERE id = ?"
    )
      .bind(id)
      .first();
    if (draft) return mapSurvey(draft as any);

    return null;
  };

  if (request.method === "GET") {
    const survey = await loadSurvey();
    if (!survey) return json({ message: "アンケートが見つかりません" }, { status: 404 });
    return json(survey);
  }

  if (request.method === "PUT") {
    const payload = (await request.json()) as Record<string, any>;
    const now = new Date().toISOString();

    // Determine current table
    const existsInPublished = await env.DB.prepare(
      "SELECT id FROM surveys WHERE id = ? AND deleted_at IS NULL"
    )
      .bind(id)
      .first();
    const table = existsInPublished ? "surveys" : "survey_drafts";

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
        payload.branchName ?? null,
        payload.prefecture ?? null,
        payload.area ?? null,
        payload.industry ?? null,
        payload.genre ?? null,
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
        id,
      )
      .run();

    const updated = await loadSurvey();
    if (!updated) return json({ message: "アンケートが見つかりません" }, { status: 404 });
    return json(updated);
  }

  if (request.method === "DELETE") {
    const published = await env.DB.prepare(
      "SELECT id FROM surveys WHERE id = ? AND deleted_at IS NULL"
    )
      .bind(id)
      .first();

    if (published) {
      await env.DB.prepare("UPDATE surveys SET deleted_at = ?, updated_at = ? WHERE id = ?")
        .bind(new Date().toISOString(), new Date().toISOString(), id)
        .run();
    } else {
      await env.DB.prepare("DELETE FROM survey_drafts WHERE id = ?").bind(id).run();
    }

    return json({ success: true });
  }

  return json({ message: "Method not allowed" }, { status: 405 });
};
