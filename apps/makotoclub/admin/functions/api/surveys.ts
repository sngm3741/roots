import { db, Survey } from "./data";
import { PagesFunction } from "./types";

type SurveyPayload = Omit<Survey, "id" | "createdAt" | "updatedAt" | "status"> & {
  status?: Survey["status"];
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequestGet: PagesFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const filtered = status ? db.surveys.filter((s) => s.status === status) : db.surveys;
  return json({ items: filtered, total: filtered.length });
};

export const onRequestPost: PagesFunction = async ({ request }) => {
  const payload = (await request.json()) as Partial<SurveyPayload>;
  if (!payload.storeId || !payload.storeName || !payload.storePrefecture || !payload.visitedPeriod) {
    return json({ message: "必須項目が不足しています" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const survey: Survey = {
    id: crypto.randomUUID(),
    storeId: payload.storeId,
    storeName: payload.storeName,
    storeBranch: payload.storeBranch ?? null,
    storePrefecture: payload.storePrefecture,
    storeArea: payload.storeArea ?? null,
    storeIndustry: payload.storeIndustry ?? "",
    storeGenre: payload.storeGenre ?? null,
    visitedPeriod: payload.visitedPeriod,
    workType: payload.workType ?? "",
    age: payload.age ?? 0,
    specScore: payload.specScore ?? 0,
    waitTimeHours: payload.waitTimeHours ?? 0,
    averageEarning: payload.averageEarning ?? 0,
    rating: payload.rating ?? 0,
    status: payload.status ?? "draft",
    customerComment: payload.customerComment ?? null,
    createdAt: now,
    updatedAt: now,
  };
  db.surveys.unshift(survey);
  return json(survey, { status: 201 });
};

export const onRequestPut: PagesFunction = async ({ request }) => {
  const payload = (await request.json()) as Partial<Survey> & { id?: string };
  if (!payload.id) return json({ message: "idが必要です" }, { status: 400 });
  const index = db.surveys.findIndex((s) => s.id === payload.id);
  if (index === -1) return json({ message: "アンケートが見つかりません" }, { status: 404 });
  const current = db.surveys[index];
  const updated: Survey = {
    ...current,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  db.surveys[index] = updated;
  return json(updated);
};

export const onRequestDelete: PagesFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return json({ message: "idが必要です" }, { status: 400 });
  const index = db.surveys.findIndex((survey) => survey.id === id);
  if (index === -1) return json({ message: "アンケートが見つかりません" }, { status: 404 });
  db.surveys.splice(index, 1);
  return json({ success: true });
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "PUT") return onRequestPut(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return json({ message: "Method not allowed" }, { status: 405 });
};
