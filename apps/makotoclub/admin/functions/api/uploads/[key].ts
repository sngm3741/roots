import { PagesFunction } from "../types";

export const onRequestGet: PagesFunction = async ({ params, env }) => {
  const bucket = env.makotoclub_assets;
  if (!bucket) return new Response("R2 bucket not configured", { status: 500 });

  const key = params?.key;
  if (!key) return new Response("Not Found", { status: 404 });

  const obj = await bucket.get(key);
  if (!obj) return new Response("Not Found", { status: 404 });

  const body = obj.body ?? obj;
  const headers = new Headers();
  headers.set("Content-Type", obj.httpMetadata?.contentType ?? "application/octet-stream");
  return new Response(body, { headers });
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  return new Response("Method not allowed", { status: 405 });
};
