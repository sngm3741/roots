import { db } from "../data";
import { PagesFunction } from "../types";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequest: PagesFunction = async () => {
  const drafts = db.surveys.filter((survey) => survey.status === "draft");
  return json({ items: drafts, total: drafts.length });
};
