import { db, findSurvey, Survey } from "../data";
import { PagesFunction } from "../types";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequest: PagesFunction = async ({ params, request }) => {
  const id = params?.id;
  if (!id) return json({ message: "idが必要です" }, { status: 400 });
  const current = findSurvey(id);
  if (!current) return json({ message: "アンケートが見つかりません" }, { status: 404 });

  if (request.method === "GET") {
    return json(current);
  }

  if (request.method === "PUT") {
    const payload = (await request.json()) as Partial<Survey>;
    const index = db.surveys.findIndex((s) => s.id === id);
    const updated: Survey = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    db.surveys[index] = updated;
    return json(updated);
  }

  if (request.method === "DELETE") {
    const index = db.surveys.findIndex((survey) => survey.id === id);
    db.surveys.splice(index, 1);
    return json({ success: true });
  }

  return json({ message: "Method not allowed" }, { status: 405 });
};
