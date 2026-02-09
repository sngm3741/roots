import type { Env } from "../_shared/types";

type LinkPreview = {
  url: string;
  image: string | null;
  title: string | null;
  siteName: string | null;
};

const REQUEST_TIMEOUT_MS = 4500;
const MAX_HTML_LENGTH = 512_000;

const isBlockedHost = (hostname: string) => {
  const value = hostname.toLowerCase();
  if (value === "localhost" || value === "127.0.0.1" || value === "::1") return true;
  if (value.endsWith(".local")) return true;
  if (value.startsWith("10.") || value.startsWith("192.168.") || value.startsWith("169.254.")) {
    return true;
  }
  return /^172\.(1[6-9]|2\d|3[0-1])\./.test(value);
};

const toAbsoluteUrl = (raw: string | null, baseUrl: string) => {
  if (!raw) return null;
  try {
    return new URL(raw, baseUrl).toString();
  } catch {
    return null;
  }
};

const decodeHtmlEntities = (value: string) =>
  value
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

const findMeta = (html: string, attr: "property" | "name", key: string) => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const contentFirst = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*${attr}=["']${escapedKey}["'][^>]*>`,
    "i",
  );
  const attrFirst = new RegExp(
    `<meta[^>]*${attr}=["']${escapedKey}["'][^>]*content=["']([^"']+)["'][^>]*>`,
    "i",
  );
  const matched = html.match(contentFirst) ?? html.match(attrFirst);
  return matched?.[1] ? decodeHtmlEntities(matched[1].trim()) : null;
};

const findTitle = (html: string) => {
  const matched = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return matched?.[1] ? decodeHtmlEntities(matched[1].trim()) : null;
};

const emptyPreview = (url: string): LinkPreview => ({
  url,
  image: null,
  title: null,
  siteName: null,
});

const buildLinkPreview = async (targetUrl: string): Promise<LinkPreview> => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(targetUrl, {
      method: "GET",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; MakotoClubLinkPreview/1.0; +https://makoto-club.com)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!response.ok) return emptyPreview(targetUrl);

    const contentType = (response.headers.get("content-type") ?? "").toLowerCase();
    if (!contentType.includes("text/html")) return emptyPreview(targetUrl);

    const finalUrl = response.url || targetUrl;
    const htmlRaw = await response.text();
    const html = htmlRaw.slice(0, MAX_HTML_LENGTH);

    const ogImage =
      findMeta(html, "property", "og:image:secure_url") ??
      findMeta(html, "property", "og:image") ??
      findMeta(html, "name", "twitter:image");
    const title =
      findMeta(html, "property", "og:title") ??
      findMeta(html, "name", "twitter:title") ??
      findTitle(html);
    const siteName =
      findMeta(html, "property", "og:site_name") ?? findMeta(html, "name", "twitter:site");

    return {
      url: finalUrl,
      image: toAbsoluteUrl(ogImage, finalUrl),
      title,
      siteName,
    };
  } catch {
    return emptyPreview(targetUrl);
  } finally {
    clearTimeout(timer);
  }
};

export const handleLinkPreviewRoutes = async (
  request: Request,
  url: URL,
  pathname: string,
  _env: Env,
): Promise<Response | null> => {
  if (pathname !== "/api/link-preview" || request.method !== "GET") {
    return null;
  }

  const targetRaw = url.searchParams.get("url")?.trim();
  if (!targetRaw) {
    return new Response("URLクエリが必要です。", { status: 400 });
  }

  let targetUrl: URL;
  try {
    targetUrl = new URL(targetRaw);
  } catch {
    return new Response("URLの形式が不正です。", { status: 400 });
  }

  if (!["http:", "https:"].includes(targetUrl.protocol)) {
    return new Response("http/https のURLのみ指定できます。", { status: 400 });
  }

  if (isBlockedHost(targetUrl.hostname)) {
    return new Response("指定されたホストは利用できません。", { status: 400 });
  }

  const preview = await buildLinkPreview(targetUrl.toString());
  return Response.json(preview, {
    headers: {
      "Cache-Control": "public, s-maxage=21600, max-age=300",
    },
  });
};
