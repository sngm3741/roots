import { mapSurvey } from "../_shared/mappers";
import { parseJsonObject, parseNumberParam, parseRequiredNumber } from "../_shared/parsers";
import { buildVoterHash } from "../_shared/security";
import type { Env } from "../_shared/types";

export const handleSurveyRoutes = async (
  request: Request,
  url: URL,
  pathname: string,
  env: Env,
  respondWithLog: (response: Response) => Promise<Response>,
): Promise<Response | null> => {
  const helpfulMatch = pathname.match(/^\/api\/surveys\/([^/]+)\/helpful$/);
  if (helpfulMatch && request.method === "POST") {
    const surveyId = helpfulMatch[1];
    const surveyRow = await env.DB.prepare("SELECT id FROM surveys WHERE id = ?")
      .bind(surveyId)
      .first();
    if (!surveyRow) {
      return new Response("アンケートが見つかりません。", { status: 404 });
    }

    const voterHash = await buildVoterHash(request);
    if (!voterHash) {
      return new Response("クライアント情報が取得できません。", { status: 400 });
    }

    const nowIso = new Date().toISOString();
    const insertRes = await env.DB.prepare(
      `INSERT INTO survey_helpful_votes (survey_id, voter_hash, created_at)
       VALUES (?, ?, ?)
       ON CONFLICT(survey_id, voter_hash) DO NOTHING`,
    )
      .bind(surveyId, voterHash, nowIso)
      .run();

    const didInsert = (insertRes.meta?.changes ?? 0) > 0;
    if (didInsert) {
      await env.DB.prepare(
        `UPDATE surveys
         SET helpful_count = COALESCE(helpful_count, 0) + 1, updated_at = ?
         WHERE id = ?`,
      )
        .bind(nowIso, surveyId)
        .run();
      await env.DB.prepare(
        `UPDATE store_stats
         SET helpful_count = COALESCE(helpful_count, 0) + 1, updated_at = ?
         WHERE store_id = (SELECT store_id FROM surveys WHERE id = ?)`,
      )
        .bind(nowIso, surveyId)
        .run();
    }

    const countRow = await env.DB.prepare("SELECT helpful_count FROM surveys WHERE id = ?")
      .bind(surveyId)
      .first();

    return Response.json({
      count: countRow?.helpful_count ?? 0,
      already: !didInsert,
    });
  }

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
    const visitedPeriod = url.searchParams.get("visitedPeriod")?.trim();
    const spec = parseNumberParam(url.searchParams.get("spec"));
    const age = parseNumberParam(url.searchParams.get("age"));

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
    if (visitedPeriod) {
      where.push("visited_period = ?");
      params.push(visitedPeriod);
    }
    if (spec !== null) {
      where.push("spec_score BETWEEN ? AND ?");
      params.push(spec - 5, spec + 5);
    }
    if (age !== null) {
      where.push("age BETWEEN ? AND ?");
      params.push(age - 5, age + 5);
    }
    const whereClause = where.join(" AND ");

    const totalRes = await env.DB.prepare(
      `SELECT COUNT(*) as c FROM surveys WHERE ${whereClause}`,
    )
      .bind(...params)
      .first();
    const rows = await env.DB.prepare(
      `SELECT
        s.*,
        (SELECT COUNT(*) FROM store_comments sc WHERE sc.store_id = s.store_id AND sc.deleted_at IS NULL) AS comment_count
       FROM surveys s
       WHERE ${whereClause}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
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

  if (pathname.startsWith("/api/surveys/") && request.method === "GET") {
    const id = pathname.replace("/api/surveys/", "");
    const row = await env.DB.prepare(
      `SELECT
        s.*,
        (SELECT COUNT(*) FROM store_comments sc WHERE sc.store_id = s.store_id AND sc.deleted_at IS NULL) AS comment_count
       FROM surveys s
       WHERE s.id = ? AND s.deleted_at IS NULL`,
    )
      .bind(id)
      .first();
    if (!row) return new Response("Not Found", { status: 404 });
    return Response.json(mapSurvey(row));
  }

  if (pathname === "/api/surveys" && request.method === "POST") {
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return await respondWithLog(new Response("JSONが不正です。", { status: 400 }));
    }
    const payloadObject = parseJsonObject(payload) ?? {};

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const {
      storeName,
      branchName,
      prefecture,
      industry,
      industryOther,
      visitedPeriod,
      workType,
      workTypeOther,
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
    } = payloadObject;

    const storeNameText = typeof storeName === "string" ? storeName.trim() : "";
    const branchNameText = typeof branchName === "string" ? branchName.trim() : "";
    const prefectureText = typeof prefecture === "string" ? prefecture.trim() : "";
    const industryText = typeof industry === "string" ? industry.trim() : "";
    const industryOtherText = typeof industryOther === "string" ? industryOther.trim() : "";
    const visitedPeriodText = typeof visitedPeriod === "string" ? visitedPeriod.trim() : "";
    const workTypeText = typeof workType === "string" ? workType.trim() : "";
    const workTypeOtherText = typeof workTypeOther === "string" ? workTypeOther.trim() : "";
    const areaText = typeof area === "string" ? area.trim() : "";
    const genreText = typeof genre === "string" ? genre.trim() : "";
    const customerCommentText =
      typeof customerComment === "string" ? customerComment.trim() : "";
    const staffCommentText = typeof staffComment === "string" ? staffComment.trim() : "";
    const workEnvironmentCommentText =
      typeof workEnvironmentComment === "string" ? workEnvironmentComment.trim() : "";
    const etcCommentText = typeof etcComment === "string" ? etcComment.trim() : "";
    const emailAddressText = typeof emailAddress === "string" ? emailAddress.trim() : "";

    const ageNum = parseRequiredNumber(age, { min: 18, max: 50 });
    const specScoreNum = parseRequiredNumber(specScore, { min: 50, max: 140 });
    const waitTimeHoursNum = parseRequiredNumber(waitTimeHours, { min: 0, max: 24 });
    const averageEarningNum = parseRequiredNumber(averageEarning, { min: 0, max: 30 });
    const ratingNum = parseRequiredNumber(rating, { min: 0, max: 5 });
    const castBackProvided = !(castBack === null || castBack === undefined || castBack === "");
    const castBackNum = castBackProvided
      ? parseRequiredNumber(castBack, { min: 0, max: 30000 })
      : null;

    const validImageUrls = Array.isArray(imageUrls)
      ? imageUrls
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter((item) => /^https?:\/\//.test(item))
      : [];

    const emailOk = !emailAddressText || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddressText);

    if (
      !storeNameText ||
      !prefectureText ||
      !industryText ||
      !visitedPeriodText ||
      !workTypeText ||
      !/^\d{4}-\d{2}$/.test(visitedPeriodText) ||
      ageNum === null ||
      specScoreNum === null ||
      waitTimeHoursNum === null ||
      averageEarningNum === null ||
      ratingNum === null ||
      (castBackProvided && castBackNum === null) ||
      !emailOk ||
      (industryText === "その他" && !industryOtherText) ||
      (workTypeText === "その他" && !workTypeOtherText)
    ) {
      return await respondWithLog(
        new Response("入力値が不正です。必須項目と数値範囲を確認してください。", { status: 400 }),
      );
    }

    await env.DB.prepare(
      `INSERT INTO survey_drafts
      (id, store_id, store_name, store_branch, store_prefecture, store_area, store_industry, industry_other, store_genre,
       visited_period, work_type, work_type_other, age, spec_score, wait_time_hours, average_earning, rating,
       customer_comment, staff_comment, work_environment_comment, etc_comment, cast_back, email_address,
       image_urls, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        id,
        typeof storeId === "string" && storeId.trim() ? storeId.trim() : null,
        storeNameText,
        branchNameText || null,
        prefectureText,
        areaText || null,
        industryText,
        industryOtherText || null,
        genreText || null,
        visitedPeriodText,
        workTypeText,
        workTypeOtherText || null,
        ageNum,
        specScoreNum,
        waitTimeHoursNum,
        averageEarningNum,
        ratingNum,
        customerCommentText || null,
        staffCommentText || null,
        workEnvironmentCommentText || null,
        etcCommentText || null,
        castBackNum,
        emailAddressText || null,
        validImageUrls.length > 0 ? JSON.stringify(validImageUrls) : null,
        now,
        now,
      )
      .run();

    return await respondWithLog(
      new Response(null, { status: 201, headers: { Location: `/api/surveys/${id}` } }),
    );
  }

  return null;
};
