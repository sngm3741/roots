import { PagesFunction } from "../types";
import { mapSurvey } from "../lib/mapper";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequest: PagesFunction = async ({ env }) => {
  const rows = await env.DB.prepare("SELECT *, 'draft' as status FROM survey_drafts ORDER BY created_at DESC").all();
  const items = (rows.results ?? []).map(mapSurvey);
  return json({ items, total: items.length });
};
