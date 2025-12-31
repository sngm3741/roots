import { PagesFunction } from "./types";

type AccessLogRow = {
  ip: string | null;
  path: string;
  method: string;
  status: number;
  created_at: string;
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

const maskIp = (value?: string | null) => {
  if (!value) return "不明";
  if (value.includes(".")) {
    const parts = value.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.xxx`;
    }
  }
  if (value.includes(":")) {
    const parts = value.split(":").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts.slice(0, 3).join(":")}:****`;
    }
  }
  return "不明";
};

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") || "50")));
  const offset = (page - 1) * limit;

  const whereClause = "datetime(created_at) >= datetime('now', '-365 days')";

  const totalRow = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM access_logs WHERE ${whereClause}`,
  )
    .first();

  const rows = await env.DB.prepare(
    `SELECT ip, path, method, status, created_at
     FROM access_logs
     WHERE ${whereClause}
     ORDER BY created_at DESC
     LIMIT ? OFFSET ?`,
  )
    .bind(limit, offset)
    .all();

  const items = (rows.results ?? []).map((row) => {
    const r = row as AccessLogRow;
    return {
      ipMasked: maskIp(r.ip),
      path: r.path,
      method: r.method,
      status: r.status,
      createdAt: r.created_at,
    };
  });

  return json({ items, total: totalRow?.count ?? 0, page, limit });
};
