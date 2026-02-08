import { PagesFunction } from "./types";

type Summary = {
  totalPageViews: number;
  todayPageViews: number;
  rangePageViews: number;
  todayUniqueVisitors: number;
  averageStaySeconds: number;
  bounceRate: number;
};

type DailyPoint = {
  date: string;
  pageViews: number;
  uniqueVisitors: number;
  averageStaySeconds: number;
};

type PathPoint = {
  path: string;
  pageViews: number;
  averageStaySeconds: number;
  sharePercent: number;
};

type LandingReferrerPoint = {
  referrer: string;
  pageViews: number;
};

type InternalReferrerPoint = {
  referrer: string;
  pageViews: number;
};

type UtmPoint = {
  source: string;
  medium: string;
  campaign: string;
  pageViews: number;
};

type AnalyticsResponse = {
  generatedAt: string;
  rangeDays: number;
  summary: Summary;
  daily: DailyPoint[];
  paths: PathPoint[];
  // 旧フロント互換用（段階移行のため残す）
  referrers: LandingReferrerPoint[];
  landingReferrers: LandingReferrerPoint[];
  internalReferrers: InternalReferrerPoint[];
  utmCampaigns: UtmPoint[];
  coverage: {
    hasAccessHits: boolean;
    hasPageViews: boolean;
    hasSessionAttribution: boolean;
    note: string | null;
  };
};

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

const toJstDate = (date: Date) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);

const parsePositiveInt = (value: string | null, fallback: number, min: number, max: number) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
};

const toNumber = (value: unknown) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const toRounded = (value: number, digits = 1) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};

const emptyResponse = (rangeDays: number, note: string | null): AnalyticsResponse => ({
  generatedAt: new Date().toISOString(),
  rangeDays,
  summary: {
    totalPageViews: 0,
    todayPageViews: 0,
    rangePageViews: 0,
    todayUniqueVisitors: 0,
    averageStaySeconds: 0,
    bounceRate: 0,
  },
  daily: [],
  paths: [],
  referrers: [],
  landingReferrers: [],
  internalReferrers: [],
  utmCampaigns: [],
  coverage: {
    hasAccessHits: false,
    hasPageViews: false,
    hasSessionAttribution: false,
    note,
  },
});

const hasTable = async (env: { DB: D1Database }, tableName: string) => {
  const row = await env.DB.prepare(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
  )
    .bind(tableName)
    .first();
  return Boolean(row?.name);
};

const isInternalHost = (rawHost: string) => {
  const host = rawHost.trim().toLowerCase();
  if (!host) return false;
  if (host === "(direct)") return false;
  if (
    host === "makoto-club.com" ||
    host === "www.makoto-club.com" ||
    host === "makotoclub-frontend.pages.dev" ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return true;
  }
  return host.endsWith(".makoto-club.com") || host.endsWith(".pages.dev");
};

export const onRequestGet: PagesFunction = async ({ request, env }) => {
  const { searchParams } = new URL(request.url);
  const rangeDays = parsePositiveInt(searchParams.get("days"), 7, 1, 90);
  const limit = parsePositiveInt(searchParams.get("limit"), 20, 5, 100);
  const today = toJstDate(new Date());
  const lookbackDays = Math.max(0, rangeDays - 1);
  const sinceModifier = `-${lookbackDays} days`;

  const hasAccessHits = await hasTable(env, "analytics_access_hits");
  const hasPageViews = await hasTable(env, "analytics_page_views");
  const hasSessionAttribution = await hasTable(env, "analytics_session_attribution");

  if (!hasAccessHits && !hasPageViews) {
    return json(emptyResponse(rangeDays, "解析テーブルがまだ作成されていません。"));
  }

  const result = emptyResponse(rangeDays, null);
  result.coverage.hasAccessHits = hasAccessHits;
  result.coverage.hasPageViews = hasPageViews;
  result.coverage.hasSessionAttribution = hasSessionAttribution;
  const coverageNotes: string[] = [];
  if (!hasAccessHits || !hasPageViews) {
    coverageNotes.push(
      "一部の集計はデータ不足です。全ページ解析の詳細値は解析v2の導入後データのみ反映されます。",
    );
  }
  if (!hasSessionAttribution) {
    coverageNotes.push(
      "first-touch補完テーブルが未作成のため、流入元のdirect補完は無効です。",
    );
  }
  result.coverage.note = coverageNotes.length ? coverageNotes.join(" ") : null;

  if (hasAccessHits) {
    const totalRow = await env.DB.prepare(
      `SELECT COUNT(*) AS c
       FROM analytics_access_hits
       WHERE is_html = 1 AND is_bot = 0`,
    ).first();
    const todayRow = await env.DB.prepare(
      `SELECT COUNT(*) AS c
       FROM analytics_access_hits
       WHERE is_html = 1
         AND is_bot = 0
         AND strftime('%Y-%m-%d', datetime(occurred_at, '+9 hours')) = ?`,
    )
      .bind(today)
      .first();
    const rangeRow = await env.DB.prepare(
      `SELECT COUNT(*) AS c
       FROM analytics_access_hits
       WHERE is_html = 1
         AND is_bot = 0
         AND datetime(occurred_at) >= datetime('now', ?)`,
    )
      .bind(sinceModifier)
      .first();
    const todayUniqueRow = await env.DB.prepare(
      `SELECT COUNT(DISTINCT visitor_hash) AS c
       FROM analytics_access_hits
       WHERE is_html = 1
         AND is_bot = 0
         AND strftime('%Y-%m-%d', datetime(occurred_at, '+9 hours')) = ?`,
    )
      .bind(today)
      .first();

    result.summary.totalPageViews += toNumber(totalRow?.c);
    result.summary.todayPageViews += toNumber(todayRow?.c);
    result.summary.rangePageViews += toNumber(rangeRow?.c);
    result.summary.todayUniqueVisitors = toNumber(todayUniqueRow?.c);

    const dailyRows = await env.DB.prepare(
      `SELECT
         strftime('%Y-%m-%d', datetime(occurred_at, '+9 hours')) AS day,
         COUNT(*) AS page_views,
         COUNT(DISTINCT visitor_hash) AS unique_visitors
       FROM analytics_access_hits
       WHERE is_html = 1
         AND is_bot = 0
         AND datetime(occurred_at) >= datetime('now', ?)
       GROUP BY day
       ORDER BY day ASC`,
    )
      .bind(sinceModifier)
      .all();
    const dailyMap = new Map(
      (dailyRows.results ?? []).map((row) => [
        String((row as Record<string, unknown>).day ?? ""),
        {
          pageViews: toNumber((row as Record<string, unknown>).page_views),
          uniqueVisitors: toNumber((row as Record<string, unknown>).unique_visitors),
        },
      ]),
    );

    const referrerRows = hasSessionAttribution
      ? await env.DB.prepare(
          `SELECT
             COALESCE(
               NULLIF(LOWER(analytics_access_hits.referrer_host), ''),
               NULLIF(LOWER(analytics_session_attribution.attribution_source), ''),
               '(direct)'
             ) AS referrer,
             COUNT(*) AS page_views
           FROM analytics_access_hits
           LEFT JOIN analytics_session_attribution
             ON analytics_session_attribution.session_id = analytics_access_hits.session_id
           WHERE analytics_access_hits.is_html = 1
             AND analytics_access_hits.is_bot = 0
             AND datetime(analytics_access_hits.occurred_at) >= datetime('now', ?)
           GROUP BY COALESCE(
             NULLIF(LOWER(analytics_access_hits.referrer_host), ''),
             NULLIF(LOWER(analytics_session_attribution.attribution_source), ''),
             '(direct)'
           )
           ORDER BY page_views DESC
           LIMIT ?`,
        )
          .bind(sinceModifier, limit)
          .all()
      : await env.DB.prepare(
          `SELECT
             COALESCE(NULLIF(LOWER(referrer_host), ''), '(direct)') AS referrer,
             COUNT(*) AS page_views
           FROM analytics_access_hits
           WHERE is_html = 1
             AND is_bot = 0
             AND datetime(occurred_at) >= datetime('now', ?)
           GROUP BY COALESCE(NULLIF(LOWER(referrer_host), ''), '(direct)')
           ORDER BY page_views DESC
           LIMIT ?`,
        )
          .bind(sinceModifier, limit)
          .all();
    const allReferrers = (referrerRows.results ?? []).map((row) => ({
      referrer: String((row as Record<string, unknown>).referrer ?? "(direct)"),
      pageViews: toNumber((row as Record<string, unknown>).page_views),
    }));
    result.referrers = allReferrers.slice(0, limit);
    result.landingReferrers = allReferrers
      .filter((row) => !isInternalHost(row.referrer))
      .slice(0, limit);
    result.internalReferrers = allReferrers
      .filter((row) => isInternalHost(row.referrer))
      .slice(0, limit);

    const utmRows = await env.DB.prepare(
      `SELECT
         COALESCE(NULLIF(utm_source, ''), '(none)') AS source,
         COALESCE(NULLIF(utm_medium, ''), '(none)') AS medium,
         COALESCE(NULLIF(utm_campaign, ''), '(none)') AS campaign,
         COUNT(*) AS page_views
       FROM analytics_access_hits
       WHERE is_html = 1
         AND is_bot = 0
         AND datetime(occurred_at) >= datetime('now', ?)
         AND (utm_source IS NOT NULL OR utm_medium IS NOT NULL OR utm_campaign IS NOT NULL)
       GROUP BY source, medium, campaign
       ORDER BY page_views DESC
       LIMIT ?`,
    )
      .bind(sinceModifier, limit)
      .all();
    result.utmCampaigns = (utmRows.results ?? []).map((row) => ({
      source: String((row as Record<string, unknown>).source ?? "(none)"),
      medium: String((row as Record<string, unknown>).medium ?? "(none)"),
      campaign: String((row as Record<string, unknown>).campaign ?? "(none)"),
      pageViews: toNumber((row as Record<string, unknown>).page_views),
    }));

    const pathRows = await env.DB.prepare(
      `SELECT path, COUNT(*) AS page_views
       FROM analytics_access_hits
       WHERE is_html = 1
         AND is_bot = 0
         AND datetime(occurred_at) >= datetime('now', ?)
       GROUP BY path
       ORDER BY page_views DESC
       LIMIT ?`,
    )
      .bind(sinceModifier, limit)
      .all();
    const rangePv = Math.max(1, result.summary.rangePageViews);
    const pathBase = (pathRows.results ?? []).map((row) => ({
      path: String((row as Record<string, unknown>).path ?? "/"),
      pageViews: toNumber((row as Record<string, unknown>).page_views),
    }));
    result.paths = pathBase.map((item) => ({
      ...item,
      averageStaySeconds: 0,
      sharePercent: toRounded((item.pageViews / rangePv) * 100, 1),
    }));

    const orderedDates = Array.from({ length: rangeDays }, (_, i) =>
      toJstDate(new Date(Date.now() - (lookbackDays - i) * 24 * 60 * 60 * 1000)),
    );
    result.daily = orderedDates.map((date) => ({
      date,
      pageViews: dailyMap.get(date)?.pageViews ?? 0,
      uniqueVisitors: dailyMap.get(date)?.uniqueVisitors ?? 0,
      averageStaySeconds: 0,
    }));
  }

  if (hasPageViews) {
    const avgStayRow = await env.DB.prepare(
      `SELECT COALESCE(AVG(active_ms), 0) AS avg_active_ms
       FROM analytics_page_views
       WHERE datetime(started_at) >= datetime('now', ?)`,
    )
      .bind(sinceModifier)
      .first();
    result.summary.averageStaySeconds = toRounded(toNumber(avgStayRow?.avg_active_ms) / 1000, 1);

    const bounceRows = await env.DB.prepare(
      `SELECT
         COUNT(*) AS total_views,
         SUM(CASE WHEN heartbeat_count = 0 AND active_ms < 15000 THEN 1 ELSE 0 END) AS bounce_views
       FROM analytics_page_views
       WHERE datetime(started_at) >= datetime('now', ?)`,
    )
      .bind(sinceModifier)
      .first();
    const totalViews = toNumber(bounceRows?.total_views);
    const bounceViews = toNumber(bounceRows?.bounce_views);
    result.summary.bounceRate = totalViews > 0 ? toRounded((bounceViews / totalViews) * 100, 1) : 0;

    const dailyStayRows = await env.DB.prepare(
      `SELECT
         strftime('%Y-%m-%d', datetime(started_at, '+9 hours')) AS day,
         COALESCE(AVG(active_ms), 0) AS avg_active_ms
       FROM analytics_page_views
       WHERE datetime(started_at) >= datetime('now', ?)
       GROUP BY day`,
    )
      .bind(sinceModifier)
      .all();
    const stayMap = new Map(
      (dailyStayRows.results ?? []).map((row) => [
        String((row as Record<string, unknown>).day ?? ""),
        toRounded(toNumber((row as Record<string, unknown>).avg_active_ms) / 1000, 1),
      ]),
    );
    result.daily = result.daily.map((point) => ({
      ...point,
      averageStaySeconds: stayMap.get(point.date) ?? 0,
    }));

    const pathStayRows = await env.DB.prepare(
      `SELECT path, COALESCE(AVG(active_ms), 0) AS avg_active_ms
       FROM analytics_page_views
       WHERE datetime(started_at) >= datetime('now', ?)
       GROUP BY path`,
    )
      .bind(sinceModifier)
      .all();
    const pathStayMap = new Map(
      (pathStayRows.results ?? []).map((row) => [
        String((row as Record<string, unknown>).path ?? "/"),
        toRounded(toNumber((row as Record<string, unknown>).avg_active_ms) / 1000, 1),
      ]),
    );
    result.paths = result.paths.map((path) => ({
      ...path,
      averageStaySeconds: pathStayMap.get(path.path) ?? 0,
    }));
  }

  result.generatedAt = new Date().toISOString();
  return json(result);
};

export const onRequest: PagesFunction = async (context) => {
  if (context.request.method === "GET") return onRequestGet(context);
  return json({ message: "許可されていないHTTPメソッドです" }, { status: 405 });
};
