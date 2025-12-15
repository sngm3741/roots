import { db, findStore, Store } from "../data";
import { PagesFunction } from "../types";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequest: PagesFunction = async ({ params, request }) => {
  const id = params?.id;
  if (!id) return json({ message: "idが必要です" }, { status: 400 });
  const current = findStore(id);
  if (!current) return json({ message: "店舗が見つかりません" }, { status: 404 });

  if (request.method === "GET") {
    return json(current);
  }

  if (request.method === "PUT") {
    const payload = (await request.json()) as Partial<Store>;
    const updated: Store = {
      ...current,
      ...payload,
      updatedAt: new Date().toISOString(),
    };
    const index = db.stores.findIndex((store) => store.id === id);
    db.stores[index] = updated;
    return json(updated);
  }

  if (request.method === "DELETE") {
    const index = db.stores.findIndex((store) => store.id === id);
    db.stores.splice(index, 1);
    return json({ success: true });
  }

  return json({ message: "Method not allowed" }, { status: 405 });
};
