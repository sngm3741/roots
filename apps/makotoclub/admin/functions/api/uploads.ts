import { PagesFunction } from "./types";

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const onRequestPost: PagesFunction = async ({ request, env }) => {
  const bucket = env.makotoclub_assets;
  if (!bucket) return json({ message: "R2 bucket not configured" }, { status: 500 });

  const form = await request.formData();
  const file = form.get("file");
  if (!file || !(file instanceof File)) {
    return json({ message: "file is required" }, { status: 400 });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) return json({ message: "file too large" }, { status: 413 });
  if (!file.type?.startsWith("image/")) {
    return json({ message: "only image/* allowed" }, { status: 400 });
  }

  const cleanName = file.name.replace(/[^\w.\-]/g, "_").slice(-80);
  const key = `${Date.now()}-${crypto.randomUUID()}-${cleanName}`;

  await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: file.type,
    },
  });

  const url = new URL(request.url);
  return json({
    key,
    url: `${url.origin}/api/uploads/${key}`,
    contentType: file.type,
    size: file.size,
  });
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ message: "Method not allowed" }, { status: 405 });
};
