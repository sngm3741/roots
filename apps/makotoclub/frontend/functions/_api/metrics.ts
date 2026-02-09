import { parseJsonObject } from "../_shared/parsers";
import { getRequestClientKey, hashText, isBotUserAgent } from "../_shared/security";
import type { Env } from "../_shared/types";

const TRACK_SKIP_PATH_PREFIXES = ["/api/", "/build/", "/assets/", "/fonts/", "/.well-known/"];
const TRACK_SKIP_EXACT_PATHS = ["/favicon.ico", "/favicon.png", "/robots.txt", "/sitemap.xml"];
const TRACK_SKIP_EXT_RE =
  /\.(?:css|js|mjs|map|png|jpg|jpeg|gif|webp|svg|ico|woff|woff2|ttf|otf|txt|xml|json)$/i;
const SESSION_COOKIE_NAME = "mc_sid";
const MAX_ACTIVE_MS_PER_EVENT = 120000;
const HEARTBEAT_INTERVAL_MS = 30000;
const INTERNAL_REFERRER_HOSTS = new Set([
  "makoto-club.com",
  "www.makoto-club.com",
  "makotoclub-frontend.pages.dev",
  "localhost",
  "127.0.0.1",
]);
const OUTBOUND_LINK_TYPES = new Set([
  "recruitment",
  "official",
  "line",
  "x",
  "bsky",
  "phone",
  "email",
]);

let analyticsTableReady = false;

const ensureAnalyticsTables = async (env: Env) => {
  if (analyticsTableReady) return;
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS analytics_access_hits (
      id TEXT PRIMARY KEY,
      occurred_at TEXT NOT NULL,
      path TEXT NOT NULL,
      method TEXT NOT NULL,
      status INTEGER NOT NULL,
      is_html INTEGER NOT NULL,
      is_bot INTEGER NOT NULL,
      referrer_host TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT,
      session_id TEXT,
      visitor_hash TEXT
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_access_hits_occurred_at
     ON analytics_access_hits(occurred_at)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_access_hits_path
     ON analytics_access_hits(path)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_access_hits_bot_html
     ON analytics_access_hits(is_bot, is_html)`,
  ).run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS analytics_page_views (
      page_view_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      path TEXT NOT NULL,
      started_at TEXT NOT NULL,
      last_seen_at TEXT NOT NULL,
      ended_at TEXT,
      active_ms INTEGER NOT NULL DEFAULT 0,
      heartbeat_count INTEGER NOT NULL DEFAULT 0,
      exit_type TEXT,
      referrer_host TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_page_views_started_at
     ON analytics_page_views(started_at)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_page_views_path
     ON analytics_page_views(path)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_page_views_session
     ON analytics_page_views(session_id)`,
  ).run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS analytics_session_attribution (
      session_id TEXT PRIMARY KEY,
      attributed_at TEXT NOT NULL,
      attribution_source TEXT NOT NULL,
      attribution_type TEXT NOT NULL,
      referrer_host TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_session_attribution_attributed_at
     ON analytics_session_attribution(attributed_at)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_session_attribution_source
     ON analytics_session_attribution(attribution_source)`,
  ).run();

  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS analytics_link_clicks (
      id TEXT PRIMARY KEY,
      occurred_at TEXT NOT NULL,
      session_id TEXT,
      visitor_hash TEXT,
      source_path TEXT NOT NULL,
      store_id TEXT NOT NULL,
      store_name TEXT,
      link_type TEXT NOT NULL,
      target_url TEXT NOT NULL,
      referrer_host TEXT,
      utm_source TEXT,
      utm_medium TEXT,
      utm_campaign TEXT
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_link_clicks_occurred_at
     ON analytics_link_clicks(occurred_at)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_link_clicks_store
     ON analytics_link_clicks(store_id)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_analytics_link_clicks_link_type
     ON analytics_link_clicks(link_type)`,
  ).run();

  analyticsTableReady = true;
};

const toTokyoDate = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const normalizePath = (value: string | null | undefined): string | null => {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed.startsWith("/")) return null;
  return trimmed;
};

const parseCookie = (cookieHeader: string | null, name: string) => {
  if (!cookieHeader) return null;
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]+)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
};

const extractReferrerHost = (referrerValue: string | null | undefined) => {
  if (!referrerValue) return null;
  try {
    const parsed = new URL(referrerValue);
    const host = parsed.host?.trim().toLowerCase();
    return host || null;
  } catch {
    return null;
  }
};

const sanitizeOptionalText = (value: unknown, maxLen: number) => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
};

const isTrackTargetRequest = (request: Request, response: Response, url: URL) => {
  if (request.method !== "GET") return false;
  const path = url.pathname;
  if (TRACK_SKIP_EXACT_PATHS.includes(path)) return false;
  if (TRACK_SKIP_PATH_PREFIXES.some((prefix) => path.startsWith(prefix))) return false;
  if (TRACK_SKIP_EXT_RE.test(path)) return false;
  const contentType = response.headers.get("content-type") ?? "";
  return /text\/html|application\/xhtml\+xml/.test(contentType);
};

const isInternalReferrerHost = (rawHost: string) => {
  const host = rawHost.trim().toLowerCase();
  if (!host || host === "(direct)") return false;
  if (INTERNAL_REFERRER_HOSTS.has(host)) return true;
  return host.endsWith(".makoto-club.com") || host.endsWith(".pages.dev");
};

type AttributionSeed = {
  source: string;
  type: "utm" | "referrer";
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

const buildAttributionSeed = (input: {
  referrerHost: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
}): AttributionSeed | null => {
  const normalizedReferrer = input.referrerHost?.trim().toLowerCase() ?? null;
  if (input.utmSource) {
    return {
      source: `utm:${input.utmSource.toLowerCase()}`,
      type: "utm",
      referrerHost: normalizedReferrer,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
    };
  }
  if (normalizedReferrer && !isInternalReferrerHost(normalizedReferrer)) {
    return {
      source: normalizedReferrer,
      type: "referrer",
      referrerHost: normalizedReferrer,
      utmSource: input.utmSource,
      utmMedium: input.utmMedium,
      utmCampaign: input.utmCampaign,
    };
  }
  return null;
};

const upsertSessionAttribution = async (
  env: Env,
  input: {
    sessionId: string | null;
    occurredAt: string;
    referrerHost: string | null;
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
  },
) => {
  const sessionId = sanitizeOptionalText(input.sessionId, 120);
  if (!sessionId || sessionId === "unknown") return;
  const seed = buildAttributionSeed(input);
  if (!seed) return;

  await env.DB.prepare(
    `INSERT INTO analytics_session_attribution (
      session_id, attributed_at, attribution_source, attribution_type,
      referrer_host, utm_source, utm_medium, utm_campaign
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(session_id) DO NOTHING`,
  )
    .bind(
      sessionId,
      input.occurredAt,
      seed.source,
      seed.type,
      seed.referrerHost,
      seed.utmSource,
      seed.utmMedium,
      seed.utmCampaign,
    )
    .run();
};

const querySummary = async (env: Env, opts: { scope: "site" | "path"; path?: string | null }) => {
  const today = toTokyoDate(new Date());
  const conditions = ["is_html = 1", "is_bot = 0"];
  const binds: (string | number)[] = [];
  if (opts.scope === "path" && opts.path) {
    conditions.push("path = ?");
    binds.push(opts.path);
  }
  const where = conditions.join(" AND ");

  const totalRow = await env.DB.prepare(
    `SELECT COUNT(*) as c
     FROM analytics_access_hits
     WHERE ${where}`,
  )
    .bind(...binds)
    .first();

  const todayRow = await env.DB.prepare(
    `SELECT COUNT(*) as c
     FROM analytics_access_hits
     WHERE ${where}
       AND strftime('%Y-%m-%d', datetime(occurred_at, '+9 hours')) = ?`,
  )
    .bind(...binds, today)
    .first();

  return {
    count: Number(totalRow?.c ?? 0),
    todayCount: Number(todayRow?.c ?? 0),
    date: today,
  };
};

export const recordAccessHit = async (
  request: Request,
  response: Response,
  env: Env,
): Promise<void> => {
  try {
    if (!env.DB) return;
    const url = new URL(request.url);
    if (!isTrackTargetRequest(request, response, url)) return;
    await ensureAnalyticsTables(env);

    const ua = request.headers.get("user-agent");
    const isBot = isBotUserAgent(ua) ? 1 : 0;
    const referrerHost = extractReferrerHost(request.headers.get("referer"));
    const sessionId = sanitizeOptionalText(
      parseCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME),
      120,
    );
    const utmSource = sanitizeOptionalText(url.searchParams.get("utm_source"), 120);
    const utmMedium = sanitizeOptionalText(url.searchParams.get("utm_medium"), 120);
    const utmCampaign = sanitizeOptionalText(url.searchParams.get("utm_campaign"), 200);
    const visitorHash = await hashText(getRequestClientKey(request));
    const occurredAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO analytics_access_hits (
        id, occurred_at, path, method, status, is_html, is_bot,
        referrer_host, utm_source, utm_medium, utm_campaign, session_id, visitor_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        occurredAt,
        url.pathname,
        request.method,
        response.status,
        1,
        isBot,
        referrerHost,
        utmSource,
        utmMedium,
        utmCampaign,
        sessionId,
        visitorHash,
      )
      .run();

    await upsertSessionAttribution(env, {
      sessionId,
      occurredAt,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
    });
  } catch (error) {
    console.error("アクセス解析ヒットの保存に失敗しました", error);
  }
};

export const handleMetricRoutes = async (
  request: Request,
  url: URL,
  pathname: string,
  env: Env,
): Promise<Response | null> => {
  if (pathname === "/api/metrics/v2/summary" && request.method === "GET") {
    if (!env.DB) return new Response("DBが設定されていません。", { status: 500 });
    await ensureAnalyticsTables(env);
    const scopeRaw = url.searchParams.get("scope");
    const scope = scopeRaw === "site" ? "site" : "path";
    const path = normalizePath(url.searchParams.get("path")) ?? "/";
    const summary = await querySummary(env, { scope, path });

    return Response.json({
      scope,
      path: scope === "path" ? path : undefined,
      count: summary.count,
      todayCount: summary.todayCount,
      date: summary.date,
    });
  }

  if (pathname === "/api/metrics/v2/events" && request.method === "POST") {
    if (!env.DB) return new Response("DBが設定されていません。", { status: 500 });
    await ensureAnalyticsTables(env);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("JSONが不正です。", { status: 400 });
    }

    const payload = parseJsonObject(body);
    const type = sanitizeOptionalText(payload?.type, 32);
    if (!type || !["start", "heartbeat", "end"].includes(type)) {
      return new Response("イベント種別が不正です。", { status: 400 });
    }

    const pageViewId = sanitizeOptionalText(payload?.pageViewId, 80);
    if (!pageViewId) {
      return new Response("ページビューIDが必要です。", { status: 400 });
    }

    const path = normalizePath(typeof payload?.path === "string" ? payload.path : null) ?? "/";
    const cookieSessionId = parseCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME);
    const sessionId =
      sanitizeOptionalText(payload?.sessionId, 120) ??
      sanitizeOptionalText(cookieSessionId, 120) ??
      "unknown";
    const referrerHost = extractReferrerHost(
      typeof payload?.referrer === "string" ? payload.referrer : null,
    );
    const utmSource = sanitizeOptionalText(payload?.utmSource, 120);
    const utmMedium = sanitizeOptionalText(payload?.utmMedium, 120);
    const utmCampaign = sanitizeOptionalText(payload?.utmCampaign, 200);
    const exitType = sanitizeOptionalText(payload?.exitType, 32);
    const rawActiveMs = Number(payload?.activeMs ?? 0);
    const activeMs = Number.isFinite(rawActiveMs)
      ? Math.max(0, Math.min(Math.floor(rawActiveMs), MAX_ACTIVE_MS_PER_EVENT))
      : 0;
    const nowIso = new Date().toISOString();

    if (type === "start") {
      await env.DB.prepare(
        `INSERT INTO analytics_page_views (
          page_view_id, session_id, path, started_at, last_seen_at, ended_at, active_ms, heartbeat_count,
          exit_type, referrer_host, utm_source, utm_medium, utm_campaign
        ) VALUES (?, ?, ?, ?, ?, NULL, 0, 0, NULL, ?, ?, ?, ?)
        ON CONFLICT(page_view_id) DO NOTHING`,
      )
        .bind(
          pageViewId,
          sessionId,
          path,
          nowIso,
          nowIso,
          referrerHost,
          utmSource,
          utmMedium,
          utmCampaign,
        )
        .run();
      await upsertSessionAttribution(env, {
        sessionId,
        occurredAt: nowIso,
        referrerHost,
        utmSource,
        utmMedium,
        utmCampaign,
      });
      return Response.json({ ok: true });
    }

    if (type === "heartbeat") {
      await env.DB.prepare(
        `INSERT INTO analytics_page_views (
          page_view_id, session_id, path, started_at, last_seen_at, ended_at, active_ms, heartbeat_count,
          exit_type, referrer_host, utm_source, utm_medium, utm_campaign
        ) VALUES (?, ?, ?, ?, ?, NULL, ?, 1, NULL, ?, ?, ?, ?)
        ON CONFLICT(page_view_id) DO UPDATE SET
          last_seen_at = excluded.last_seen_at,
          active_ms = analytics_page_views.active_ms + excluded.active_ms,
          heartbeat_count = analytics_page_views.heartbeat_count + 1`,
      )
        .bind(
          pageViewId,
          sessionId,
          path,
          nowIso,
          nowIso,
          activeMs || HEARTBEAT_INTERVAL_MS,
          referrerHost,
          utmSource,
          utmMedium,
          utmCampaign,
        )
        .run();
      return Response.json({ ok: true });
    }

    await env.DB.prepare(
      `INSERT INTO analytics_page_views (
        page_view_id, session_id, path, started_at, last_seen_at, ended_at, active_ms, heartbeat_count,
        exit_type, referrer_host, utm_source, utm_medium, utm_campaign
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
      ON CONFLICT(page_view_id) DO UPDATE SET
        last_seen_at = excluded.last_seen_at,
        ended_at = excluded.ended_at,
        active_ms = analytics_page_views.active_ms + excluded.active_ms,
        exit_type = COALESCE(excluded.exit_type, analytics_page_views.exit_type)`,
    )
      .bind(
        pageViewId,
        sessionId,
        path,
        nowIso,
        nowIso,
        nowIso,
        activeMs,
        exitType ?? "end",
        referrerHost,
        utmSource,
        utmMedium,
        utmCampaign,
      )
      .run();

    return Response.json({ ok: true });
  }

  if (pathname === "/api/metrics/v2/outbound-click" && request.method === "POST") {
    if (!env.DB) return new Response("DBが設定されていません。", { status: 500 });
    await ensureAnalyticsTables(env);

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response("JSONが不正です。", { status: 400 });
    }

    const payload = parseJsonObject(body);
    const storeId = sanitizeOptionalText(payload?.storeId, 120);
    const storeName = sanitizeOptionalText(payload?.storeName, 240);
    const linkType = sanitizeOptionalText(payload?.linkType, 32);
    const targetUrl = sanitizeOptionalText(payload?.targetUrl, 2000);
    const sourcePath = normalizePath(
      typeof payload?.path === "string" ? payload.path : null,
    ) ?? "/";
    if (!storeId) return new Response("storeIdが必要です。", { status: 400 });
    if (!linkType || !OUTBOUND_LINK_TYPES.has(linkType)) {
      return new Response("linkTypeが不正です。", { status: 400 });
    }
    if (!targetUrl) return new Response("targetUrlが必要です。", { status: 400 });

    const cookieSessionId = parseCookie(request.headers.get("cookie"), SESSION_COOKIE_NAME);
    const sessionId =
      sanitizeOptionalText(payload?.sessionId, 120) ??
      sanitizeOptionalText(cookieSessionId, 120) ??
      "unknown";
    const referrerHost =
      extractReferrerHost(typeof payload?.referrer === "string" ? payload.referrer : null) ??
      extractReferrerHost(request.headers.get("referer"));
    const utmSource = sanitizeOptionalText(payload?.utmSource, 120);
    const utmMedium = sanitizeOptionalText(payload?.utmMedium, 120);
    const utmCampaign = sanitizeOptionalText(payload?.utmCampaign, 200);
    const visitorHash = await hashText(getRequestClientKey(request));
    const occurredAt = new Date().toISOString();

    await env.DB.prepare(
      `INSERT INTO analytics_link_clicks (
        id, occurred_at, session_id, visitor_hash, source_path,
        store_id, store_name, link_type, target_url,
        referrer_host, utm_source, utm_medium, utm_campaign
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        crypto.randomUUID(),
        occurredAt,
        sessionId,
        visitorHash,
        sourcePath,
        storeId,
        storeName,
        linkType,
        targetUrl,
        referrerHost,
        utmSource,
        utmMedium,
        utmCampaign,
      )
      .run();

    await upsertSessionAttribution(env, {
      sessionId,
      occurredAt,
      referrerHost,
      utmSource,
      utmMedium,
      utmCampaign,
    });

    return Response.json({ ok: true });
  }

  // 互換用: 既存のPV API
  if (pathname === "/api/metrics/pv" && request.method === "GET") {
    if (!env.DB) return new Response("DBが設定されていません。", { status: 500 });
    await ensureAnalyticsTables(env);
    const path = normalizePath(url.searchParams.get("path")) ?? "/";
    const summary = await querySummary(env, { scope: "path", path });
    return Response.json({
      path,
      count: summary.count,
      todayCount: summary.todayCount,
      date: summary.date,
    });
  }

  if (pathname === "/api/metrics/pv" && request.method === "POST") {
    // 互換維持のため 200 を返す（v2へ移行済み）
    return Response.json({ ok: true, migrated: true });
  }

  return null;
};
