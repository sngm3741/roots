import { db, findStore, Store } from "./data";
import { PagesFunction } from "./types";

type StorePayload = Omit<Store, "id" | "averageRating" | "averageEarning" | "averageEarningLabel" | "waitTimeHours" | "waitTimeLabel" | "surveyCount" | "helpfulCount" | "createdAt" | "updatedAt"> & {
  averageRating?: number;
  averageEarning?: number;
  averageEarningLabel?: string | null;
  waitTimeHours?: number | null;
  waitTimeLabel?: string | null;
  surveyCount?: number;
  helpfulCount?: number;
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequestGet: PagesFunction = async () => {
  return json({ items: db.stores, total: db.stores.length });
};

export const onRequestPost: PagesFunction = async ({ request }) => {
  const payload = (await request.json()) as Partial<StorePayload>;
  if (!payload.storeName || !payload.prefecture || !payload.category) {
    return json({ message: "必須項目が不足しています" }, { status: 400 });
  }
  const now = new Date().toISOString();
  const store: Store = {
    id: crypto.randomUUID(),
    storeName: payload.storeName,
    branchName: payload.branchName ?? null,
    prefecture: payload.prefecture,
    area: payload.area ?? null,
    category: payload.category,
    genre: payload.genre ?? null,
    unitPrice: payload.unitPrice ?? null,
    businessHours: payload.businessHours ?? null,
    averageRating: payload.averageRating ?? 0,
    averageEarning: payload.averageEarning ?? 0,
    averageEarningLabel: payload.averageEarningLabel ?? null,
    waitTimeHours: payload.waitTimeHours ?? null,
    waitTimeLabel: payload.waitTimeLabel ?? null,
    surveyCount: payload.surveyCount ?? 0,
    helpfulCount: payload.helpfulCount ?? 0,
    createdAt: now,
    updatedAt: now,
  };
  db.stores.unshift(store);
  return json(store, { status: 201 });
};

export const onRequestPut: PagesFunction = async ({ request }) => {
  const payload = (await request.json()) as Partial<Store> & { id?: string };
  if (!payload.id) return json({ message: "idが必要です" }, { status: 400 });
  const current = findStore(payload.id);
  if (!current) return json({ message: "店舗が見つかりません" }, { status: 404 });
  const updated: Store = {
    ...current,
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const index = db.stores.findIndex((s) => s.id === current.id);
  db.stores[index] = updated;
  return json(updated);
};

export const onRequestDelete: PagesFunction = async ({ request }) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return json({ message: "idが必要です" }, { status: 400 });
  const index = db.stores.findIndex((store) => store.id === id);
  if (index === -1) return json({ message: "店舗が見つかりません" }, { status: 404 });
  db.stores.splice(index, 1);
  return json({ success: true });
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  if (context.request.method === "POST") return onRequestPost(context);
  if (context.request.method === "PUT") return onRequestPut(context);
  if (context.request.method === "DELETE") return onRequestDelete(context);
  return json({ message: "Method not allowed" }, { status: 405 });
};
